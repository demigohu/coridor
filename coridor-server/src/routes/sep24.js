import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config.js";
import { decodeInteractiveToken, decodeMoreInfoToken, isTokenExpired } from "../util/jwt.js";
import { platform } from "../services/platformClient.js";
import {
  startDepositFlow,
  completeDepositAfterPayment,
} from "../services/depositService.js";
import {
  simulatePayment,
  isSimulateUnsupportedError,
} from "../services/xenditService.js";
import { startWithdrawalFlow, pendingWithdrawals } from "../services/withdrawService.js";
import { fetchMarketIdrPerUsdc } from "../services/marketRate.js";
import { getUsdcBalance, getAccountUsdcBalance } from "../services/stellarService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.use("/sep24/interactive/static", express.static(path.join(__dirname, "../../public")));

router.get("/sep24/interactive", async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send("Missing token");
    }

    const decoded = decodeInteractiveToken(token);
    if (isTokenExpired(decoded.exp)) {
      return res.status(400).send("Token expired — restart from wallet");
    }

    const tx = await platform.getTransaction(decoded.transactionId);
    const market = await fetchMarketIdrPerUsdc().catch(() => null);
    const balance = await getUsdcBalance().catch(() => "?");
    const userUsdcBalance = await getAccountUsdcBalance(decoded.sub).catch(() => null);

    if (tx.status !== "incomplete") {
      const bank = pendingWithdrawals.get(decoded.transactionId);
      return res.type("html").send(renderMoreInfoPage({ tx, bank, market, balance }));
    }

    res.type("html").send(
      renderWidget({ token, tx, decoded, market, balance, userUsdcBalance })
    );
  } catch (e) {
    console.error("[interactive]", e);
    res.status(400).send(`Error: ${e.message}`);
  }
});

router.post("/sep24/interactive/submit", express.json(), async (req, res) => {
  try {
    const {
      token,
      amount,
      paymentMethod,
      mobileNumber,
      bankName,
      bankAccount,
      accountName,
    } = req.body;
    const decoded = decodeInteractiveToken(token);
    const tx = await platform.getTransaction(decoded.transactionId);

    if (tx.kind === "deposit") {
      const result = await startDepositFlow({
        transactionId: decoded.transactionId,
        amountIdr: parseFloat(amount),
        paymentMethod: paymentMethod || "bank_transfer",
        destinationAccount: tx.destination_account || decoded.sub,
        mobileNumber,
      });
      return res.json({
        ok: true,
        kind: "deposit",
        transaction_id: decoded.transactionId,
        sandbox_mode: config.xenditSecretKey.startsWith("xnd_development"),
        ...result,
      });
    }

    if (tx.kind === "withdrawal") {
      const quote = await startWithdrawalFlow({
        transactionId: decoded.transactionId,
        amountUsdc: parseFloat(amount),
        bankName,
        bankAccount,
        accountName,
      });
      return res.json({
        ok: true,
        kind: "withdrawal",
        transaction_id: decoded.transactionId,
        quote,
      });
    }

    res.status(400).json({ error: "Unknown transaction kind" });
  } catch (e) {
    console.error("[submit]", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/sep24/interactive/confirm-sandbox-payment", express.json(), async (req, res) => {
  try {
    if (!config.xenditSecretKey.startsWith("xnd_development")) {
      return res.status(403).json({ error: "Hanya tersedia di Xendit test mode" });
    }
    const { paymentRequestId, transactionId, amountIdr } = req.body;
    if (!paymentRequestId || !transactionId) {
      return res.status(400).json({ error: "Missing paymentRequestId or transactionId" });
    }
    let simulated = false;
    try {
      await simulatePayment(paymentRequestId, amountIdr);
      simulated = true;
    } catch (simErr) {
      if (!isSimulateUnsupportedError(simErr)) {
        throw simErr;
      }
      console.warn(
        `[confirm-sandbox] Xendit simulate tidak support metode ini (${paymentRequestId}), lanjut sandbox force-complete`
      );
    }

    const txHash = await completeDepositAfterPayment(transactionId, paymentRequestId);
    res.json({
      ok: true,
      stellar_transaction_id: txHash,
      simulated,
      note: simulated
        ? undefined
        : "OVO/e-wallet tidak punya simulate API di Xendit — deposit diselesaikan langsung (sandbox only).",
    });
  } catch (e) {
    console.error("[confirm-sandbox]", e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/sep24/transaction/more_info", async (req, res) => {
  try {
    let transactionId = req.query.transaction_id;

    if (req.query.token) {
      const decoded = decodeMoreInfoToken(req.query.token);
      if (isTokenExpired(decoded.exp)) {
        return res.status(400).send("Token expired — refresh dari Demo Wallet");
      }
      transactionId = decoded.transactionId;
    }

    if (!transactionId) {
      return res.status(400).send("Missing token or transaction_id");
    }

    const tx = await platform.getTransaction(transactionId);
    const bank = pendingWithdrawals.get(transactionId);
    const market = await fetchMarketIdrPerUsdc().catch(() => null);
    const balance = await getUsdcBalance().catch(() => "?");

    res.type("html").send(renderMoreInfoPage({ tx, bank, market, balance }));
  } catch (e) {
    console.error("[more_info]", e);
    res.status(400).send(`Error: ${e.message}`);
  }
});

router.get("/sep24/transaction/more_info/status", async (req, res) => {
  try {
    const transactionId = req.query.id;
    if (!transactionId) return res.status(400).json({ error: "Missing id" });
    const tx = await platform.getTransaction(transactionId);
    res.json({ id: tx.id, status: tx.status, message: tx.message });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const WALLET_ICON = `<svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="3" stroke="currentColor" stroke-width="2"/><path d="M3 10h18" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/></svg>`;

const COPY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const INFO_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function formatUsdcDisplay(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

function formatReserveUsdc(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return `${n} USDC`;
  return `${num.toLocaleString("id-ID", { maximumFractionDigits: 3 })} USDC`;
}

function renderWidget({ token, tx, decoded, market, balance, userUsdcBalance }) {
  const isDeposit = tx.kind === "deposit";
  const account = escapeHtml(decoded.sub);
  const rateText = market
    ? `1 USDC ≈ Rp ${Math.round(market).toLocaleString("id-ID")}`
    : "Memuat kurs…";
  const reserveText = formatReserveUsdc(balance);
  const userBalanceLabel =
    userUsdcBalance != null
      ? `Balance: ${formatUsdcDisplay(userUsdcBalance)} USDC`
      : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Coridor — ${isDeposit ? "Deposit" : "Withdraw"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/sep24/interactive/static/widget.css"/>
</head>
<body>
  <div class="widget-wrap">
    <div class="card">
      <header class="widget-header">
        <div class="header-title-row">
          ${WALLET_ICON}
          <h1>${isDeposit ? "Deposit" : "Withdraw"}</h1>
        </div>
        <p class="sub">${isDeposit ? "Bayar IDR, terima USDC" : "Kirim USDC, terima IDR"}</p>
        <div class="network-badge">
          <span class="badge-dot"></span>
          IDR ↔ USDC Blend · Stellar Testnet
        </div>
      </header>

      <div class="rate-card">
        <div class="rate-col">
          <span class="rate-label">Kurs Live</span>
          <strong class="rate-value">${rateText}</strong>
        </div>
        <div class="rate-col rate-col-right">
          <span class="rate-label">Reserve</span>
          <strong class="rate-value rate-value-sm">${reserveText}</strong>
        </div>
      </div>

      <form id="form">
        <input type="hidden" name="token" value="${token}"/>

        <div class="field">
          <label class="account-label">Akun Penerima</label>
          <div class="input-with-copy">
            <input type="text" readonly value="${account}" aria-label="Akun penerima"/>
            <button type="button" class="btn-icon-copy btn-copy-account" data-copy="${account}" aria-label="Salin alamat">${COPY_ICON}</button>
          </div>
        </div>

        <div class="field">
          <div class="field-label-row">
            <label>Jumlah ${isDeposit ? "(IDR)" : "(USDC)"}</label>
            ${!isDeposit && userBalanceLabel ? `<span class="balance-hint">${userBalanceLabel}</span>` : ""}
          </div>
          <div class="amount-input">
            <input type="number" name="amount" min="${isDeposit ? "50000" : "0.5"}" step="${isDeposit ? "1000" : "0.0000001"}" required
              placeholder="${isDeposit ? "100000" : "100"}"/>
            <span class="amount-suffix">${isDeposit ? "IDR" : "USDC"}</span>
          </div>
          <p class="fee-hint">
            ${INFO_ICON}
            ${isDeposit
              ? "Fee flat Rp 5.000 + spread 0,5%. Min Rp 50.000"
              : "Fee flat Rp 5.000 + spread 0,5% (dikurangi dari hasil IDR). Min 0,5 USDC"}
          </p>
        </div>

        ${isDeposit ? `
        <div class="field">
          <label>Metode Pembayaran</label>
          <select name="paymentMethod" id="paymentMethod">
            <option value="va_bca">Virtual Account BCA</option>
            <option value="va_bni">Virtual Account BNI</option>
            <option value="va_mandiri">Virtual Account Mandiri</option>
            <option value="va_bri">Virtual Account BRI</option>
            <option value="qris">QRIS</option>
            <option value="e_wallet">E-Wallet (OVO)</option>
          </select>
          <p class="form-hint" id="paymentMethodHint">VA akan muncul setelah Anda klik tombol di bawah.</p>
        </div>
        <div class="field" id="mobileField" hidden>
          <label>Nomor HP terdaftar OVO</label>
          <input name="mobileNumber" type="tel" placeholder="081234567890"/>
        </div>
        ` : `
        <div class="field">
          <label>Nama Bank</label>
          <select name="bankName" required>
            <option value="BCA">Bank Central Asia (BCA)</option>
            <option value="BNI">Bank Negara Indonesia (BNI)</option>
            <option value="Mandiri">Bank Mandiri</option>
            <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
            <option value="CIMB">CIMB Niaga</option>
            <option value="Permata">Bank Permata</option>
          </select>
        </div>
        <div class="field">
          <label>Nomor Rekening</label>
          <input name="bankAccount" placeholder="Contoh: 1234567890" required/>
        </div>
        <div class="field">
          <label>Nama Pemilik Rekening</label>
          <input name="accountName" placeholder="Sesuai buku tabungan" required/>
        </div>
        `}

        <button type="submit" class="btn-primary">Lanjutkan <span class="arrow" aria-hidden="true">→</span></button>
      </form>

      <div id="payment" hidden></div>
      <pre id="result" hidden></pre>

      <footer class="widget-footer">Secure Transaction Powered by Coridor</footer>
    </div>
  </div>
  <script src="/sep24/interactive/static/widget.js"></script>
</body>
</html>`;
}

export default router;

function formatIdr(n) {
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  const map = {
    incomplete: "Menunggu form",
    pending_user_transfer_start: "Menunggu kirim USDC / bayar IDR",
    pending_anchor: "USDC diterima — proses IDR",
    pending_external: "Transfer IDR diproses",
    pending_stellar: "Memproses on-chain",
    completed: "Selesai",
    error: "Error",
    expired: "Kedaluwarsa",
  };
  return map[status] || status;
}

function renderMoreInfoPage({ tx, bank, market, balance }) {
  const isDeposit = tx.kind === "deposit";
  const isWithdraw = tx.kind === "withdrawal";
  const status = tx.status;
  const amountIn = tx.amount_in;
  const amountOut = tx.amount_out;
  const fee = tx.fee_details?.total;
  const memo = tx.memo;
  const dest = tx.destination_account || config.distributionAccount;
  const stellarTx = tx.stellar_transactions?.[0]?.id;

  let body = "";

  if (isWithdraw) {
    const usdc = amountIn?.amount || tx.amount_expected?.amount || "?";
    const idr = amountOut?.amount ? formatIdr(amountOut.amount) : "—";
    body += `
      <div class="pay-summary">
        <p><strong>Withdraw ${escapeHtml(usdc)} USDC</strong></p>
        ${fee ? `<p class="hint">Fee: ${escapeHtml(fee)} USDC</p>` : ""}
        <p class="hint">Terima <strong>${escapeHtml(idr)}</strong> ke rekening bank</p>
      </div>
    `;
    if (bank) {
      body += `
        <div class="pay-box">
          <span class="pay-label">Rekening tujuan IDR</span>
          <p class="bank-line"><strong>${escapeHtml(bank.bankName)}</strong> · ${escapeHtml(bank.bankAccount)}</p>
          <p class="hint">a.n. ${escapeHtml(bank.accountName)}</p>
        </div>
      `;
    }
    if (status === "pending_user_transfer_start") {
      body += `
        <div class="pay-box">
          <span class="pay-label">Kirim USDC ke</span>
          <div class="pay-value-row"><code>${escapeHtml(dest)}</code></div>
          ${memo ? `
          <span class="pay-label">Memo ID (wajib)</span>
          <div class="pay-value-row"><code>${escapeHtml(memo)}</code></div>
          ` : ""}
          <ol class="steps">
            <li><strong>Tutup popup</strong> ini</li>
            <li>Di Demo Wallet → <strong>Approve &amp; Send ${escapeHtml(usdc)} USDC</strong></li>
            <li>Tunggu status berubah → IDR dikirim via Xendit</li>
          </ol>
        </div>
      `;
    } else if (status === "pending_anchor" || status === "pending_external") {
      body += `<p class="hint">USDC sudah diterima. Coridor sedang transfer IDR ke rekening bank Anda via Xendit.</p>`;
    } else if (status === "completed") {
      body += `<div class="pay-box success"><p><strong>Withdraw selesai!</strong></p><p class="hint">IDR telah dikirim ke rekening bank.</p></div>`;
    }
    if (stellarTx) {
      body += `<p class="hint"><small>Stellar tx: ${escapeHtml(stellarTx)}</small></p>`;
    }
  } else if (isDeposit) {
    const idr = amountIn?.amount ? formatIdr(amountIn.amount) : "—";
    const usdc = amountOut?.amount || "?";
    body += `
      <div class="pay-summary">
        <p><strong>Deposit ${escapeHtml(idr)}</strong></p>
        <p class="hint">Terima <strong>${escapeHtml(usdc)} USDC</strong></p>
      </div>
    `;
    if (status === "pending_user_transfer_start") {
      body += `<p class="hint">${escapeHtml(tx.message || "Selesaikan pembayaran IDR via Xendit.")}</p>`;
    } else if (status === "completed") {
      body += `<div class="pay-box success"><p><strong>Deposit selesai!</strong></p><p class="hint">USDC terkirim ke wallet Anda.</p></div>`;
    }
    if (stellarTx) {
      body += `<p class="hint"><small>Stellar tx: ${escapeHtml(stellarTx)}</small></p>`;
    }
  }

  if (tx.message && status !== "pending_user_transfer_start") {
    body += `<p class="hint">${escapeHtml(tx.message)}</p>`;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Coridor — Detail transaksi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/sep24/interactive/static/widget.css"/>
</head>
<body>
  <div class="widget-wrap">
    <div class="card">
      <header class="widget-header more-info-header">
        <div class="header-title-row">
          ${WALLET_ICON}
          <h1>${isDeposit ? "Deposit" : "Withdraw"}</h1>
        </div>
        <p class="sub">Detail transaksi</p>
        <div class="network-badge">
          <span class="badge-dot"></span>
          IDR ↔ USDC Blend · Stellar Testnet
        </div>
      </header>

      <div class="rate-card">
        <div class="rate-col">
          <span class="rate-label">Kurs Live</span>
          <strong class="rate-value">${market ? `1 USDC ≈ Rp ${Math.round(market).toLocaleString("id-ID")}` : "—"}</strong>
        </div>
        <div class="rate-col rate-col-right">
          <span class="rate-label">Reserve</span>
          <strong class="rate-value rate-value-sm">${formatReserveUsdc(balance)}</strong>
        </div>
      </div>

      <div class="pay-box">
        <span class="pay-label">Status</span>
        <p><strong id="txStatus">${escapeHtml(statusLabel(status))}</strong></p>
        <p class="hint"><small>ID: ${escapeHtml(tx.id)}</small></p>
      </div>

      ${body}

      <p class="hint">Halaman ini auto-refresh setiap 5 detik.</p>

      <footer class="widget-footer">Secure Transaction Powered by Coridor</footer>
    </div>
  </div>
  <script>
    setInterval(async () => {
      try {
        const res = await fetch("/sep24/transaction/more_info/status?id=${escapeHtml(tx.id)}");
        const data = await res.json();
        if (data.status && data.status !== "${escapeHtml(status)}") {
          location.reload();
        }
      } catch (_) {}
    }, 5000);
  </script>
</body>
</html>`;
}
