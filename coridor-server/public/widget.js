const paymentMethod = document.getElementById("paymentMethod");
const mobileField = document.getElementById("mobileField");

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const isIconBtn = btn.classList.contains("btn-icon-copy");
    if (isIconBtn) {
      const prevLabel = btn.getAttribute("aria-label");
      btn.setAttribute("aria-label", "Tersalin!");
      setTimeout(() => btn.setAttribute("aria-label", prevLabel || "Salin"), 1500);
      return;
    }
    const prev = btn.textContent;
    btn.textContent = "Tersalin!";
    setTimeout(() => {
      btn.textContent = prev;
    }, 1500);
  });
}

document.querySelectorAll(".btn-copy-account").forEach((btn) => {
  btn.addEventListener("click", () => copyText(btn.dataset.copy, btn));
});

if (paymentMethod && mobileField) {
  const paymentMethodHint = document.getElementById("paymentMethodHint");
  const updatePaymentMethodUi = () => {
    const method = paymentMethod.value;
    mobileField.hidden = method !== "e_wallet";
    const input = mobileField.querySelector("input");
    if (input) input.required = method === "e_wallet";
    if (paymentMethodHint) {
      if (method === "e_wallet") {
        paymentMethodHint.textContent =
          "Notifikasi push OVO dikirim setelah Anda klik Lanjutkan.";
      } else if (method === "qris") {
        paymentMethodHint.textContent =
          "QR code akan muncul setelah Anda klik tombol di bawah.";
      } else {
        paymentMethodHint.textContent =
          "VA akan muncul setelah Anda klik tombol di bawah.";
      }
    }
  };
  paymentMethod.addEventListener("change", updatePaymentMethodUi);
  updatePaymentMethodUi();
}

function formatIdr(n) {
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isEwalletChannel(channelCode) {
  const code = String(channelCode || "").toUpperCase();
  return ["OVO", "DANA", "SHOPEEPAY", "LINKAJA", "ASTRAPAY", "JENIUSPAY"].includes(code);
}

function getPaymentRequestId(xendit) {
  return xendit?.payment_request_id || xendit?.id || null;
}

/** Parse Xendit v3 actions — PRESENT_TO_CUSTOMER / REDIRECT_CUSTOMER */
function getActionContext(xendit, paymentUi) {
  const actions = xendit?.actions || [];
  const redirect = actions.find((a) => a.type === "REDIRECT_CUSTOMER");
  const present =
    actions.find((a) => a.type === "PRESENT_TO_CUSTOMER") || actions[0] || null;

  return {
    redirectUrl:
      paymentUi?.redirect_url ||
      redirect?.value ||
      redirect?.url ||
      null,
    present,
    qrString:
      paymentUi?.qr_string ||
      (present?.descriptor === "QR_STRING" ? present.value : null) ||
      present?.qr_string ||
      null,
    vaNumber:
      paymentUi?.va_number ||
      (present?.descriptor === "VIRTUAL_ACCOUNT_NUMBER" ? present.value : null),
  };
}

function renderWithdrawal(data) {
  const payment = document.getElementById("payment");
  const form = document.getElementById("form");
  const q = data.quote || {};

  form.hidden = true;
  payment.hidden = false;

  const usdc = q.sell_amount || "?";
  const idr = q.buy_amount ? formatIdr(q.buy_amount) : "?";
  const fee = q.fee?.total;
  const dest = q.distributionAccount || "GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS";
  const bank = q.bankName || "—";
  const account = q.bankAccount || "—";
  const holder = q.accountName || "—";
  const memo = q.memo;

  payment.innerHTML = `
    <div class="pay-summary">
      <p><strong>Kirim ${usdc} USDC</strong></p>
      ${fee ? `<p class="hint">Fee: ${fee} USDC</p>` : ""}
      <p class="hint">Anda akan terima <strong>${idr}</strong> ke rekening bank</p>
      ${q.status ? `<p class="hint">Status: <strong>${q.status}</strong></p>` : ""}
    </div>

    <div class="pay-box">
      <span class="pay-label">Rekening tujuan IDR</span>
      <p class="bank-line"><strong>${bank}</strong> · ${account}</p>
      <p class="hint">a.n. ${holder}</p>
    </div>

    <div class="pay-box">
      <span class="pay-label">Kirim USDC ke</span>
      <div class="pay-value-row">
        <code>${dest}</code>
        <button type="button" class="btn-copy" data-copy="${dest}">Salin</button>
      </div>
      ${memo ? `
      <span class="pay-label">Memo ID (wajib — catat dulu!)</span>
      <div class="pay-value-row">
        <code>${memo}</code>
        <button type="button" class="btn-copy" data-copy="${memo}">Salin</button>
      </div>
      ` : ""}
      <p class="hint">Asset: USDC Blend (GATALTGT...)</p>
    </div>

    <div class="pay-box">
      <span class="pay-label">Cara kerja withdraw (SEP-24)</span>
      <p class="hint">Withdraw <strong>beda</strong> dari deposit VA/QRIS. Ini transaksi Stellar on-chain, bukan transfer bank manual.</p>
      <ol class="steps">
        <li><strong>Catat memo</strong> di atas (observer pakai ini untuk match transaksi)</li>
        <li><strong>Tutup popup</strong> — Demo Wallet otomatis siapkan payment ke alamat + memo di atas</li>
        <li>Di Demo Wallet, klik <strong>Approve &amp; Send ${usdc} USDC</strong> (saldo terpotong di sini — normal)</li>
        <li>Anchor deteksi USDC masuk → Coridor kirim IDR ke rekening bank</li>
      </ol>
      <p class="hint fee-warn">Demo Wallet memang auto-build transaksi setelah popup ditutup — itu standar SEP-24, bukan bug. Kamu tetap harus Approve dulu sebelum saldo terpotong.</p>
    </div>

    <p class="hint">Widget ini tidak auto-update. Progress cek di tab transaksi Demo Wallet.</p>
  `;

  payment.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.dataset.copy, btn));
  });
}

function renderQrisPanel({ amount, qrDataUrl, qrString, redirectUrl, sandboxMode }) {
  const qrImg = qrDataUrl
    ? `<img class="qris-qr" src="${qrDataUrl}" alt="QRIS ${escapeHtml(amount)}"/>`
    : `<p class="hint fee-warn">QR belum tersedia — cek log server atau gunakan simulate.</p>`;

  const redirectLink = redirectUrl
    ? `<a class="qris-hosted-link" href="${escapeHtml(redirectUrl)}" target="_blank" rel="noopener noreferrer">Buka halaman QRIS Xendit</a>`
    : "";

  const rawQr = qrString
    ? `<details class="qr-raw">
        <summary>Salin string QRIS (advanced)</summary>
        <code class="qr-string-code"></code>
        <button type="button" class="btn-copy btn-copy-inline btn-copy-qr">Salin</button>
      </details>`
    : "";

  return `
    <div class="qris-panel">
      <div class="qris-header">
        <div class="qris-brand">
          <span class="qris-badge">QRIS</span>
          <span class="qris-sub">Quick Response Indonesian Standard</span>
        </div>
        <strong class="qris-amount">${escapeHtml(amount)}</strong>
      </div>
      <div class="qris-frame">${qrImg}</div>
      <ol class="steps qris-steps">
        <li>Buka <strong>GoPay / OVO / Dana / m-banking</strong></li>
        <li>Pilih menu <strong>Scan QR</strong></li>
        <li>Arahkan kamera ke kode di atas</li>
        <li>Pastikan nominal <strong>${escapeHtml(amount)}</strong> benar, lalu konfirmasi</li>
      </ol>
      ${redirectLink}
      ${rawQr}
      ${sandboxMode ? `<p class="hint fee-warn">⚠️ Test mode: QR sandbox tidak bisa di-scan app sungguhan. Gunakan tombol <strong>Simulate</strong> di bawah.</p>` : ""}
    </div>
  `;
}

function renderPayment(data) {
  const payment = document.getElementById("payment");
  const form = document.getElementById("form");
  const {
    quote,
    xendit,
    transaction_id: transactionId,
    sandbox_mode: sandboxMode,
    qr_data_url: qrDataUrl,
    payment_ui: paymentUi,
  } = data;

  if (!xendit) {
    payment.hidden = false;
    payment.innerHTML = `<p class="hint">Quote dibuat. Cek instruksi di wallet.</p>`;
    return;
  }

  const paymentRequestId = getPaymentRequestId(xendit);
  const ewalletFlow = isEwalletChannel(xendit.channel_code);
  const { redirectUrl, present, qrString, vaNumber } = getActionContext(
    xendit,
    paymentUi
  );
  const isQris =
    String(xendit.channel_code || "").toUpperCase() === "QRIS" || Boolean(qrString);

  if (!xendit.actions?.length && !ewalletFlow) {
    payment.hidden = false;
    payment.innerHTML = `<p class="hint">Quote dibuat. Cek instruksi di wallet.</p>`;
    return;
  }

  // E-wallet redirect (DANA/ShopeePay) — leave widget for hosted auth page
  if (redirectUrl && !isQris && !vaNumber) {
    window.location.href = redirectUrl;
    return;
  }

  form.hidden = true;
  payment.hidden = false;

  const amount = formatIdr(xendit.request_amount);
  const usdc = quote?.buy_amount || "?";
  const feeIdr = quote?.fee?.total;
  const netIdr =
    feeIdr != null ? Number(xendit.request_amount) - Number(feeIdr) : null;
  const expires = xendit.channel_properties?.expires_at
    ? new Date(xendit.channel_properties.expires_at).toLocaleString("id-ID")
    : null;
  const status = xendit.status || "PENDING";
  const mobile =
    xendit.channel_properties?.account_mobile_number ||
    xendit.channel_properties?.mobile_number ||
    null;
  const walletLabel = xendit.channel_code || "E-Wallet";

  let body = `
    <div class="pay-summary">
      <p><strong>Bayar ${amount}</strong></p>
      ${feeIdr ? `<p class="hint">Fee Coridor: Rp ${Number(feeIdr).toLocaleString("id-ID")}${netIdr != null ? ` · Net: Rp ${netIdr.toLocaleString("id-ID")}` : ""}</p>` : ""}
      <p class="hint">Anda akan menerima <strong>${usdc} USDC</strong></p>
      ${netIdr != null && netIdr < 20000 ? `<p class="hint fee-warn">⚠️ Deposit kecil — fee Rp 5.000 memakan sebagian besar. Coba Rp 100.000+ untuk hasil lebih wajar.</p>` : ""}
      ${expires ? `<p class="hint">Berlaku sampai ${expires}</p>` : ""}
      ${paymentUi?.action_types?.length ? `<p class="hint"><small>Xendit: ${paymentUi.action_types.map((a) => `${a.type}${a.descriptor ? `/${a.descriptor}` : ""}`).join(", ")}</small></p>` : ""}
    </div>
  `;

  if (isQris && qrString) {
    body += renderQrisPanel({
      amount,
      qrDataUrl,
      qrString,
      redirectUrl,
      sandboxMode,
    });
  } else if (ewalletFlow && !xendit.actions?.length) {
    body += `
      <div class="pay-box">
        <span class="pay-label">Bayar via ${walletLabel}</span>
        ${mobile ? `<p class="hint">Notifikasi dikirim ke <strong>${mobile}</strong></p>` : ""}
        <p class="hint">Status Xendit: <strong>${status}</strong></p>
        <ol class="steps">
          <li>Buka aplikasi <strong>${walletLabel}</strong> di HP yang terdaftar</li>
          <li>Cek notifikasi / banner pembayaran sebesar <strong>${amount}</strong></li>
          <li>Konfirmasi dan bayar di aplikasi</li>
        </ol>
        ${sandboxMode ? `<p class="hint fee-warn">⚠️ Test mode: push ${walletLabel} tidak jalan di sandbox. Tombol simulate di bawah akan langsung menyelesaikan deposit + kirim USDC (OVO tidak punya simulate API di Xendit).</p>` : ""}
      </div>
    `;
  } else if (vaNumber || present?.descriptor === "VIRTUAL_ACCOUNT_NUMBER") {
    const va = vaNumber || present.value;
    const bank =
      xendit.channel_code?.replace("_VIRTUAL_ACCOUNT", "").replace("_", " ") ||
      "Virtual Account";
    body += `
      <div class="pay-box">
        <span class="pay-label">Virtual Account ${bank}</span>
        <div class="pay-value-row">
          <code id="payValue">${escapeHtml(va)}</code>
          <button type="button" class="btn-copy" data-copy="${escapeHtml(va)}">Salin</button>
        </div>
        <p class="hint">Transfer tepat <strong>${amount}</strong> ke nomor VA di atas via m-banking / ATM.</p>
        <p class="hint fee-warn">Bukan input rekening Anda — ini nomor tujuan transfer dari Xendit.</p>
        ${sandboxMode ? `<p class="hint fee-warn">⚠️ Test mode: VA tidak bisa dibayar via m-banking sungguhan. Gunakan tombol simulate di bawah.</p>` : ""}
      </div>
    `;
  } else if (redirectUrl) {
    body += `
      <div class="pay-box">
        <span class="pay-label">Lanjutkan pembayaran</span>
        <p class="hint">Xendit memerlukan autentikasi di halaman ${walletLabel || "e-wallet"}.</p>
        <a class="qris-hosted-link" href="${escapeHtml(redirectUrl)}" target="_blank" rel="noopener noreferrer">Buka halaman pembayaran</a>
      </div>
    `;
  } else {
    body += `
      <div class="pay-box">
        <p class="hint">Selesaikan pembayaran di aplikasi ${walletLabel}. Cek notifikasi push di HP.</p>
        ${sandboxMode ? `<p class="hint fee-warn">⚠️ Test mode: push tidak jalan di sandbox. Gunakan tombol simulate di bawah.</p>` : ""}
      </div>
    `;
  }

  if (sandboxMode && paymentRequestId && transactionId) {
    body += `
      <button type="button" id="confirmSandboxBtn" class="btn-sandbox">
        Simulate pembayaran (Xendit Test Mode)
      </button>
      <p class="hint sandbox-hint">Memicu <code>POST /v3/payment_requests/:id/simulate</code> lalu kirim USDC.</p>
    `;
  }

  body += `
    <p class="hint">Setelah bayar, USDC otomatis terkirim ke wallet Anda. Tutup popup dan refresh status di Demo Wallet.</p>
    ${paymentRequestId ? `<p class="hint"><small>Ref Xendit: ${paymentRequestId}</small></p>` : ""}
  `;

  payment.innerHTML = body;

  const qrCodeEl = payment.querySelector(".qr-string-code");
  const qrCopyBtn = payment.querySelector(".btn-copy-qr");
  if (qrCodeEl && qrString) qrCodeEl.textContent = qrString;
  if (qrCopyBtn && qrString) {
    qrCopyBtn.addEventListener("click", () => copyText(qrString, qrCopyBtn));
  }

  payment.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.dataset.copy, btn));
  });

  const confirmBtn = document.getElementById("confirmSandboxBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Memproses...";
      try {
        const res = await fetch("/sep24/interactive/confirm-sandbox-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentRequestId,
            transactionId,
            amountIdr: xendit.request_amount,
          }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || res.statusText);
        payment.innerHTML = `
          <div class="pay-box success">
            <p><strong>Pembayaran berhasil!</strong></p>
            <p class="hint">${usdc} USDC terkirim ke wallet Anda.</p>
            ${out.note ? `<p class="hint fee-warn">${out.note}</p>` : ""}
            ${out.simulated === false ? `<p class="hint"><small>Simulate API tidak support channel ini — force-complete sandbox.</small></p>` : ""}
            <p class="hint"><small>Stellar tx: ${out.stellar_transaction_id || "—"}</small></p>
            <p class="hint">Tutup popup dan refresh transaksi di Demo Wallet.</p>
          </div>
        `;
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Simulate pembayaran (Xendit Test Mode)";
        alert("Gagal: " + err.message);
      }
    });
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  const result = document.getElementById("result");
  const payment = document.getElementById("payment");
  btn.disabled = true;
  result.hidden = true;
  payment.hidden = true;
  payment.innerHTML = "";
  result.hidden = false;
  result.textContent = "Memproses...";

  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());

  try {
    const res = await fetch("/sep24/interactive/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    result.hidden = true;

    if (data.kind === "deposit" && data.xendit) {
      renderPayment(data);
      return;
    }

    if (data.kind === "withdrawal" && data.quote) {
      renderWithdrawal(data);
      return;
    }

    result.hidden = false;
    result.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    result.hidden = false;
    result.textContent = "Error: " + err.message;
  } finally {
    btn.disabled = false;
  }
});
