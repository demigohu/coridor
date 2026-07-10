import { config } from "../config.js";
import { getRate } from "./rateService.js";
import { platform } from "./platformClient.js";
import { createPaymentRequest, CHANNEL_MAP } from "./xenditService.js";
import { sendUsdc } from "./stellarService.js";

/** @type {Map<string, object>} */
export const pendingPayments = new Map();

export async function startDepositFlow({
  transactionId,
  amountIdr,
  paymentMethod,
  destinationAccount,
  mobileNumber,
}) {
  const rate = await getRate({
    type: "FIRM",
    sell_asset: config.idrAsset,
    buy_asset: config.usdcAsset,
    sell_amount: String(Math.round(amountIdr)),
  });

  const { rate: q } = rate;
  const channelCode = CHANNEL_MAP[paymentMethod] || CHANNEL_MAP.va_bca;

  let xenditPayment = null;
  if (config.xenditSecretKey) {
    xenditPayment = await createPaymentRequest({
      referenceId: transactionId,
      amountIdr: Math.round(amountIdr),
      channelCode,
      customer: { mobile_number: mobileNumber },
    });
  }

  pendingPayments.set(transactionId, {
    xenditId: xenditPayment?.payment_request_id,
    amountIn: q.sell_amount,
    amountOut: q.buy_amount,
    fee: q.fee,
    destinationAccount,
    channelCode,
    xenditPayment,
  });

  await platform.requestOffchainFunds({
    transaction_id: transactionId,
    message: "Silakan selesaikan pembayaran IDR via Xendit",
    amount_in: { amount: q.sell_amount, asset: config.idrAsset },
    amount_out: { amount: q.buy_amount, asset: config.usdcAsset },
    fee_details: q.fee,
    amount_expected: { amount: q.sell_amount },
    instructions: buildInstructions(xenditPayment, paymentMethod),
  });

  return { quote: q, xendit: xenditPayment };
}

function buildInstructions(xenditPayment, method) {
  if (!xenditPayment) {
    return {
      organization_message: {
        value: "Xendit sandbox belum dikonfigurasi — set XENDIT_SECRET_KEY",
        description: "Instruksi pembayaran",
      },
    };
  }
  const actions = xenditPayment?.actions || [];
  const payAction =
    actions.find((a) => a.type === "PRESENT_TO_CUSTOMER") || actions[0];
  const channel = xenditPayment?.channel_code || "";
  const isEwallet = ["OVO", "DANA", "SHOPEEPAY", "LINKAJA"].includes(channel);

  if (isEwallet && !actions.length) {
    const mobile =
      xenditPayment?.channel_properties?.account_mobile_number ||
      xenditPayment?.channel_properties?.mobile_number;
    return {
      organization_message: {
        value: mobile
          ? `Buka app ${channel} di ${mobile} dan konfirmasi pembayaran`
          : `Buka app ${channel} dan konfirmasi notifikasi pembayaran`,
        description: `E-Wallet ${channel}`,
      },
    };
  }

  if (payAction?.url) {
    return {
      organization_payment_url: {
        value: payAction.url,
        description: "Link pembayaran Xendit",
      },
    };
  }
  const qrValue =
    payAction?.descriptor === "QR_STRING"
      ? payAction.value
      : payAction?.qr_string;
  if (qrValue) {
    return {
      organization_qr_code: {
        value: qrValue,
        description: "Scan QRIS dengan e-wallet / m-banking",
      },
    };
  }
  if (payAction?.descriptor === "VIRTUAL_ACCOUNT_NUMBER" && payAction.value) {
    return {
      organization_bank_number: {
        value: payAction.value,
        description: "Transfer ke Virtual Account BCA",
      },
      organization_bank_name: {
        value: "BCA Virtual Account",
        description: "Bank",
      },
    };
  }
  return {
    organization_message: {
      value: payAction?.value || "Selesaikan pembayaran via Xendit",
      description: `Metode: ${method}`,
    },
  };
}

export async function completeDepositAfterPayment(transactionId, externalId) {
  const pending = pendingPayments.get(transactionId);
  if (!pending) {
    throw new Error(
      "Deposit tidak ditemukan di memori server. Buat deposit baru (server mungkin baru restart)."
    );
  }

  await platform.notifyOffchainFundsReceived({
    transaction_id: transactionId,
    message: "Pembayaran IDR diterima",
    funds_received_at: new Date().toISOString(),
    external_transaction_id: externalId,
    amount_in: { amount: pending.amountIn },
    amount_out: { amount: pending.amountOut },
    fee_details: pending.fee,
  });

  const txHash = await sendUsdc(
    pending.destinationAccount,
    pending.amountOut,
    null
  );

  await platform.notifyOnchainFundsSent({
    transaction_id: transactionId,
    message: "USDC Blend terkirim",
    stellar_transaction_id: txHash,
  });

  pendingPayments.delete(transactionId);
  return txHash;
}
