import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { getRate } from "./rateService.js";
import { platform } from "./platformClient.js";
import { createPayout } from "./xenditService.js";

const STORE_PATH = path.join(
  process.env.DATA_DIR || "/app/data",
  "pending-withdrawals.json"
);

function loadPendingWithdrawals() {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
}

function savePendingWithdrawals(map) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(Object.fromEntries(map)));
}

/** @type {Map<string, object>} */
export const pendingWithdrawals = loadPendingWithdrawals();

export async function startWithdrawalFlow({
  transactionId,
  amountUsdc,
  bankName,
  bankAccount,
  accountName,
}) {
  const rate = await getRate({
    type: "FIRM",
    sell_asset: config.usdcAsset,
    buy_asset: config.idrAsset,
    sell_amount: String(amountUsdc),
  });

  const { rate: q } = rate;

  pendingWithdrawals.set(transactionId, {
    amountIn: q.sell_amount,
    amountOutIdr: q.buy_amount,
    fee: q.fee,
    bankName,
    bankAccount,
    accountName,
  });
  savePendingWithdrawals(pendingWithdrawals);

  const txn = await platform.requestOnchainFunds({
    transaction_id: transactionId,
    message: "Kirim USDC Blend ke akun Coridor",
    amount_in: { amount: q.sell_amount, asset: config.usdcAsset },
    amount_out: { amount: q.buy_amount, asset: config.idrAsset },
    fee_details: q.fee,
    amount_expected: { amount: q.sell_amount },
  });

  return {
    ...q,
    bankName,
    bankAccount,
    accountName,
    distributionAccount: txn?.destination_account || config.distributionAccount,
    memo: txn?.memo,
    memoType: txn?.memo_type,
    status: txn?.status,
  };
}

/** Send IDR via Xendit after USDC received on-chain */
export async function sendWithdrawalIdr(transactionId) {
  const pending = pendingWithdrawals.get(transactionId);
  if (!pending) {
    throw new Error(`No pending withdrawal for ${transactionId}`);
  }

  let payoutId = "sandbox-skip";
  if (config.xenditSecretKey) {
    await platform.notifyOffchainFundsPending({
      transaction_id: transactionId,
      message: "Transfer IDR diproses",
      external_transaction_id: payoutId,
    });

    const payout = await createPayout({
      referenceId: transactionId,
      amountIdr: Math.round(parseFloat(pending.amountOutIdr)),
      bankCode: mapBankCode(pending.bankName),
      accountNumber: pending.bankAccount,
      accountName: pending.accountName || "Coridor User",
    });
    payoutId = payout.id || payout.reference_id || payoutId;
  }

  await platform.notifyOffchainFundsSent({
    transaction_id: transactionId,
    message: "IDR terkirim ke rekening Anda",
    funds_sent_at: new Date().toISOString(),
    external_transaction_id: payoutId,
  });

  pendingWithdrawals.delete(transactionId);
  savePendingWithdrawals(pendingWithdrawals);
  return payoutId;
}

export async function completeWithdrawalAfterOnchain(transactionId, stellarTxId) {
  const pending = pendingWithdrawals.get(transactionId);
  if (!pending) {
    throw new Error(`No pending withdrawal for ${transactionId}`);
  }

  await platform.notifyOnchainFundsReceived({
    transaction_id: transactionId,
    message: "USDC diterima",
    stellar_transaction_id: stellarTxId,
    amount_in: { amount: pending.amountIn },
    amount_out: { amount: pending.amountOutIdr },
    fee_details: pending.fee,
  });

  return sendWithdrawalIdr(transactionId);
}

function mapBankCode(name) {
  const n = (name || "").toUpperCase();
  if (n.includes("BCA")) return "ID_BCA";
  if (n.includes("MANDIRI")) return "ID_MANDIRI";
  if (n.includes("BNI")) return "ID_BNI";
  return "ID_BCA";
}
