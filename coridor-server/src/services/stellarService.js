import {
  Asset,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { config, USDC_ISSUER } from "../config.js";

const server = new Horizon.Server(config.horizonUrl);

function hasUsdcTrustline(account) {
  return account.balances.some(
    (b) =>
      b.asset_type !== "native" &&
      b.asset_code === "USDC" &&
      b.asset_issuer === USDC_ISSUER
  );
}

function formatStellarAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid USDC amount: ${amount}`);
  }
  return n.toFixed(7).replace(/\.?0+$/, "") || "0.0000001";
}

function horizonErrorMessage(err) {
  const codes = err?.response?.data?.extras?.result_codes;
  if (codes?.transaction === "tx_failed" && codes?.operations?.includes("op_no_trust")) {
    return (
      "Wallet belum punya trustline USDC Blend. " +
      "Di Demo Wallet: Assets → Add trustline → USDC (issuer GATAL...) → lalu deposit lagi."
    );
  }
  if (codes) {
    return `Stellar payment failed: ${JSON.stringify(codes)}`;
  }
  return err?.response?.data?.detail || err.message || "Stellar payment failed";
}

export async function assertUsdcTrustline(destination) {
  const acct = await server.loadAccount(destination);
  if (!hasUsdcTrustline(acct)) {
    throw new Error(
      "Wallet belum punya trustline USDC Blend. " +
        "Di Demo Wallet buka tab Assets, tambah trustline USDC (Blend testnet), lalu coba deposit lagi."
    );
  }
}

export async function sendUsdc(destination, amount, memo) {
  if (!config.distributionSeed) {
    throw new Error("SECRET_DISTRIBUTION_SEED not configured");
  }

  await assertUsdcTrustline(destination);

  const sourceKeys = Keypair.fromSecret(config.distributionSeed);
  const asset = new Asset("USDC", USDC_ISSUER);
  const stellarAmount = formatStellarAmount(amount);

  const source = await server.loadAccount(sourceKeys.publicKey());
  let tx = new TransactionBuilder(source, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset,
        amount: stellarAmount,
      })
    )
    .setTimeout(180);

  if (memo) {
    tx = tx.addMemo(Memo.id(parseInt(memo, 10)));
  }

  const built = tx.build();
  built.sign(sourceKeys);
  try {
    const result = await server.submitTransaction(built);
    return result.hash;
  } catch (err) {
    throw new Error(horizonErrorMessage(err));
  }
}

export async function getUsdcBalance() {
  if (!config.distributionAccount) return "0";
  const acct = await server.loadAccount(config.distributionAccount);
  const line = acct.balances.find(
    (b) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER
  );
  return line?.balance ?? "0";
}
