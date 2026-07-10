import { config } from "../config.js";

let cached = { idrPerUsdc: null, fetchedAt: 0 };

/**
 * Fetch live USDC/IDR from CoinGecko (USDC ≈ USD).
 * @returns {Promise<number>} IDR per 1 USDC
 */
export async function fetchMarketIdrPerUsdc() {
  const now = Date.now();
  if (cached.idrPerUsdc && now - cached.fetchedAt < config.rateCacheTtlMs) {
    return cached.idrPerUsdc;
  }

  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko error: ${res.status}`);
  }
  const data = await res.json();
  const rate = data?.["usd-coin"]?.idr;
  if (!rate || rate <= 0) {
    throw new Error("Invalid rate from CoinGecko");
  }
  cached = { idrPerUsdc: rate, fetchedAt: now };
  return rate;
}

/** Apply Coridor spread — worse rate for user buying USDC (higher IDR per USDC) */
export function applySpreadIdrPerUsdc(marketRate, sellingIdr) {
  const spread = config.rateSpread;
  return sellingIdr ? marketRate * (1 + spread) : marketRate * (1 - spread);
}

export function formatAmount(n, decimals) {
  return Number(n.toFixed(decimals)).toString();
}
