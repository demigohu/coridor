import { Horizon } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE =
  "Test SDF Network ; September 2015";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";

export const horizon = new Horizon.Server(HORIZON_URL);

export async function submitSignedTransaction(signedXdr: string): Promise<string> {
  const { Transaction } = await import("@stellar/stellar-sdk");
  const tx = new Transaction(signedXdr, NETWORK_PASSPHRASE);
  const result = await horizon.submitTransaction(tx);
  return result.hash;
}
