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
import { getUsdcBalance } from "../services/stellarService.js";

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

    if (tx.status !== "incomplete") {
      const bank = pendingWithdrawals.get(decoded.transactionId);
      return res.type("html").send(renderMoreInfoPage({ tx, bank, market, balance }));
    }

    res.type("html").send(renderWidget({ token, tx, decoded, market, balance }));
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

function renderWidget({ token, tx, decoded, market, balance }) {
  const isDeposit = tx.kind === "deposit";
  const asset = decoded.data?.asset || "USDC";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Coridor — ${isDeposit ? "Deposit" : "Withdraw"}</title>
  <link rel="stylesheet" href="/sep24/interactive/static/widget.css"/>
</head>
<body>
  <div class="card">
    <header>
      <h1>Coridor</h1>
      <p class="sub">IDR ↔ USDC Blend · Stellar Testnet</p>
    </header>

    <div class="rate-box">
      <span>Kurs live</span>
      <strong>${market ? `1 USDC ≈ Rp ${Math.round(market).toLocaleString("id-ID")}` : "loading..."}</strong>
      <small>Reserve: ${balance} USDC</small>
    </div>

    <p class="kind">${isDeposit ? "💰 Deposit — Bayar IDR, terima USDC" : "💸 Withdraw — Kirim USDC, terima IDR"}</p>
    <p class="account">Akun: <code>${decoded.sub}</code></p>

    <form id="form">
      <input type="hidden" name="token" value="${token}"/>

      <label>Jumlah ${isDeposit ? "(IDR)" : "(USDC)"}</label>
      <input type="number" name="amount" min="${isDeposit ? "50000" : "0.5"}" step="${isDeposit ? "1000" : "0.0000001"}" required
        placeholder="${isDeposit ? "100000" : "2"}"/>
      ${isDeposit
        ? `<p class="hint form-hint">Fee flat Rp 5.000 + spread 0,5%. Min disarankan Rp 50.000.</p>`
        : `<p class="hint form-hint">Min 0,5 USDC. Fee flat Rp 5.000 + spread 0,5% (dikurangi dari hasil IDR).</p>`}

      ${isDeposit ? `
      <label>Metode pembayaran</label>
      <select name="paymentMethod" id="paymentMethod">
        <optgroup label="Virtual Account — transfer ke nomor VA (bukan input rekening Anda)">
          <option value="va_bca">Virtual Account BCA</option>
          <option value="va_bni">Virtual Account BNI</option>
          <option value="va_mandiri">Virtual Account Mandiri</option>
          <option value="va_bri">Virtual Account BRI</option>
        </optgroup>
        <option value="qris">QRIS</option>
        <option value="e_wallet">E-Wallet (OVO)</option>
      </select>
      <p class="hint form-hint" id="paymentMethodHint">VA: setelah klik Lanjutkan, muncul nomor rekening virtual untuk ditransfer.</p>
      <div id="mobileField" hidden>
        <label>Nomor HP terdaftar OVO</label>
        <input name="mobileNumber" type="tel" placeholder="081234567890"/>
      </div>
      ` : `
      <label>Nama bank</label>
      <input name="bankName" placeholder="BCA" required/>
      <label>Nomor rekening</label>
      <input name="bankAccount" placeholder="1234567890" required/>
      <label>Nama pemilik rekening</label>
      <input name="accountName" placeholder="John Doe" required/>
      `}

      <button type="submit">Lanjutkan</button>
    </form>

    <div id="payment" hidden></div>
    <pre id="result" hidden></pre>
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
  <link rel="stylesheet" href="/sep24/interactive/static/widget.css"/>
</head>
<body>
  <div class="card">
    <header>
      <h1>Coridor</h1>
      <p class="sub">Detail transaksi · ${isDeposit ? "Deposit" : "Withdraw"}</p>
    </header>

    <div class="rate-box">
      <span>Kurs live</span>
      <strong>${market ? `1 USDC ≈ Rp ${Math.round(market).toLocaleString("id-ID")}` : "—"}</strong>
      <small>Reserve: ${balance} USDC</small>
    </div>

    <div class="pay-box">
      <span class="pay-label">Status</span>
      <p><strong id="txStatus">${escapeHtml(statusLabel(status))}</strong></p>
      <p class="hint"><small>ID: ${escapeHtml(tx.id)}</small></p>
    </div>

    ${body}

    <p class="hint">Halaman ini auto-refresh setiap 5 detik.</p>
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
