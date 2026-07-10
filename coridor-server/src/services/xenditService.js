import { config } from "../config.js";

const BASE = "https://api.xendit.co";

const EWALLET_CHANNELS = new Set([
  "OVO",
  "DANA",
  "SHOPEEPAY",
  "LINKAJA",
  "ASTRAPAY",
  "JENIUSPAY",
]);

function formatXenditNetworkError(err) {
  const code = err?.cause?.code;
  if (code === "EAI_AGAIN" || code === "ENOTFOUND") {
    return "Tidak bisa hubungi api.xendit.co (DNS/jaringan Docker). Coba lagi beberapa detik.";
  }
  return err?.message || "Gagal hubungi Xendit";
}

async function xenditFetch(url, options, retries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      const retryable =
        err?.cause?.code === "EAI_AGAIN" ||
        err?.cause?.code === "ENOTFOUND" ||
        err?.message === "fetch failed";
      if (!retryable || attempt === retries - 1) {
        throw new Error(formatXenditNetworkError(err));
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw new Error(formatXenditNetworkError(lastErr));
}

function authHeader() {
  if (!config.xenditSecretKey) {
    throw new Error("XENDIT_SECRET_KEY not configured");
  }
  const encoded = Buffer.from(`${config.xenditSecretKey}:`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
    "api-version": config.xenditApiVersion,
  };
}

/** Normalize Xendit v3 actions for logging / widget */
export function describePaymentActions(paymentRequest) {
  const actions = paymentRequest?.actions || [];
  const present = actions.find((a) => a.type === "PRESENT_TO_CUSTOMER") || null;
  const redirect = actions.find((a) => a.type === "REDIRECT_CUSTOMER") || null;
  return {
    status: paymentRequest?.status,
    channel_code: paymentRequest?.channel_code,
    action_types: actions.map((a) => ({
      type: a.type,
      descriptor: a.descriptor,
    })),
    qr_string: present?.descriptor === "QR_STRING" ? present.value : null,
    va_number:
      present?.descriptor === "VIRTUAL_ACCOUNT_NUMBER" ? present.value : null,
    redirect_url: redirect?.value || redirect?.url || null,
  };
}

export function getRedirectUrl(paymentRequest) {
  const actions = paymentRequest?.actions || [];
  const redirect = actions.find((a) => a.type === "REDIRECT_CUSTOMER");
  return redirect?.value || redirect?.url || null;
}

export function getPresentAction(paymentRequest) {
  const actions = paymentRequest?.actions || [];
  return (
    actions.find((a) => a.type === "PRESENT_TO_CUSTOMER") || actions[0] || null
  );
}

export function getQrString(paymentRequest) {
  const present = getPresentAction(paymentRequest);
  if (!present) return null;
  if (present.descriptor === "QR_STRING") return present.value;
  if (present.qr_string) return present.qr_string;
  return null;
}

/**
 * Create Xendit Payment Request (v3 Payments API)
 * @see https://docs.xendit.co
 */
export async function createPaymentRequest({
  referenceId,
  amountIdr,
  channelCode,
  customer,
}) {
  const body = {
    reference_id: referenceId,
    type: "PAY",
    country: "ID",
    currency: "IDR",
    request_amount: amountIdr,
    capture_method: "AUTOMATIC",
    channel_code: channelCode,
    channel_properties: {
      ...channelPropertiesFor(channelCode, customer),
      success_return_url: `${config.publicBaseUrl}/sep24/interactive?paid=1&ref=${referenceId}`,
      failure_return_url: `${config.publicBaseUrl}/sep24/interactive?paid=0&ref=${referenceId}`,
    },
    metadata: { coridor_transaction_id: referenceId },
  };

  const res = await xenditFetch(`${BASE}/v3/payment_requests`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Xendit payment error: ${JSON.stringify(data)}`);
  }
  console.log(
    "[xendit] payment_request",
    data.payment_request_id,
    channelCode,
    JSON.stringify(describePaymentActions(data))
  );
  return data;
}

function channelPropertiesFor(channelCode, customer) {
  if (channelCode.includes("VIRTUAL_ACCOUNT") || channelCode.includes("VA")) {
    return {
      display_name: "Coridor",
      expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
    };
  }
  if (channelCode === "QRIS") {
    return { expires_at: new Date(Date.now() + 3600 * 1000).toISOString() };
  }
  // E-wallets (OVO, etc.)
  return {
    account_mobile_number: normalizeMobile(
      customer?.mobile_number || "+6281234567890"
    ),
  };
}

function normalizeMobile(num) {
  const s = String(num).replace(/\s/g, "");
  if (s.startsWith("+")) return s;
  if (s.startsWith("0")) return `+62${s.slice(1)}`;
  if (s.startsWith("62")) return `+${s}`;
  return `+62${s}`;
}


/** Map UI payment method to Xendit channel codes (sandbox) */
export const CHANNEL_MAP = {
  bank_transfer: "BCA_VIRTUAL_ACCOUNT",
  va_bca: "BCA_VIRTUAL_ACCOUNT",
  va_bni: "BNI_VIRTUAL_ACCOUNT",
  va_mandiri: "MANDIRI_VIRTUAL_ACCOUNT",
  va_bri: "BRI_VIRTUAL_ACCOUNT",
  qris: "QRIS",
  e_wallet: "OVO",
};

export const CHANNEL_LABELS = {
  BCA_VIRTUAL_ACCOUNT: "BCA",
  BNI_VIRTUAL_ACCOUNT: "BNI",
  MANDIRI_VIRTUAL_ACCOUNT: "Mandiri",
  BRI_VIRTUAL_ACCOUNT: "BRI",
  QRIS: "QRIS",
  OVO: "OVO",
};

export function isEwalletChannel(channelCode) {
  return EWALLET_CHANNELS.has(String(channelCode || "").toUpperCase());
}

export function isSimulateUnsupportedError(err) {
  return err?.xendit?.error_code === "PAYMENT_METHOD_NOT_SUPPORTED";
}

export async function getPaymentRequest(paymentRequestId) {
  const res = await xenditFetch(`${BASE}/v3/payment_requests/${paymentRequestId}`, {
    method: "GET",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Xendit get payment error: ${JSON.stringify(data)}`);
  }
  return data;
}

/** Xendit test mode — VA/QRIS/OTC only; OVO e-wallet does not support simulate API */
export async function simulatePayment(paymentRequestId, amountIdr) {
  const body = amountIdr ? JSON.stringify({ amount: amountIdr }) : undefined;
  const url = `${BASE}/v3/payment_requests/${paymentRequestId}/simulate`;
  const res = await xenditFetch(url, {
    method: "POST",
    headers: authHeader(),
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(`Xendit simulate error: ${JSON.stringify(data)}`);
    err.xendit = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Create payout (withdrawal) to bank account
 */
export async function createPayout({ referenceId, amountIdr, bankCode, accountNumber, accountName }) {
  const body = {
    reference_id: referenceId,
    channel_code: bankCode || "ID_BCA",
    channel_properties: {
      account_number: accountNumber,
      account_holder_name: accountName,
    },
    amount: amountIdr,
    currency: "IDR",
    description: `Coridor withdrawal ${referenceId}`,
  };

  const res = await xenditFetch(`${BASE}/v2/payouts`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Idempotency-key": referenceId,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Xendit payout error: ${JSON.stringify(data)}`);
  }
  return data;
}

export function verifyWebhookToken(headerToken) {
  if (!config.xenditWebhookToken) return true;
  return headerToken === config.xenditWebhookToken;
}
