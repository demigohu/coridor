import { config } from "../config.js";

export async function rpcCall(method, params) {
  const body = [{ jsonrpc: "2.0", id: "1", method, params }];
  const res = await fetch(config.platformApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await res.json();
  const data = Array.isArray(raw) ? raw[0] : raw;

  if (data?.error) {
    throw new Error(
      data.error.message ||
        `Platform RPC ${method}: ${JSON.stringify(data.error)}`
    );
  }
  if (!res.ok) {
    throw new Error(`Platform RPC ${method} HTTP ${res.status}`);
  }

  return data.result?.transaction ?? data.result;
}

export async function getTransaction(transactionId) {
  const res = await fetch(
    `${config.platformApiUrl}/transactions/${transactionId}`
  );
  if (!res.ok) {
    throw new Error(`GET transaction failed: ${res.status}`);
  }
  return res.json();
}

export const platform = {
  getTransaction,
  requestOffchainFunds: (params) => rpcCall("request_offchain_funds", params),
  notifyOffchainFundsReceived: (params) =>
    rpcCall("notify_offchain_funds_received", params),
  notifyOnchainFundsSent: (params) => rpcCall("notify_onchain_funds_sent", params),
  requestOnchainFunds: (params) => rpcCall("request_onchain_funds", params),
  notifyOnchainFundsReceived: (params) =>
    rpcCall("notify_onchain_funds_received", params),
  notifyOffchainFundsPending: (params) =>
    rpcCall("notify_offchain_funds_pending", params),
  notifyOffchainFundsSent: (params) => rpcCall("notify_offchain_funds_sent", params),
  notifyTransactionError: (params) => rpcCall("notify_transaction_error", params),
  notifyInteractiveFlowCompleted: (params) =>
    rpcCall("notify_interactive_flow_completed", params),
};
