import { randomUUID } from "crypto";
import { config } from "../config.js";
import {
  applySpreadIdrPerUsdc,
  fetchMarketIdrPerUsdc,
  formatAmount,
} from "./marketRate.js";

/** @type {Map<string, object>} */
const firmQuotes = new Map();

/**
 * GET /rate callback for Anchor Platform SEP-38
 * Dynamic pricing via CoinGecko + Coridor spread + flat fee
 */
export async function getRate(query) {
  const type = (query.type || "").toUpperCase();
  const sellAsset = query.sell_asset;
  const buyAsset = query.buy_asset;
  const sellAmount = query.sell_amount ? parseFloat(query.sell_amount) : null;
  const buyAmount = query.buy_amount ? parseFloat(query.buy_amount) : null;

  if (!type || !sellAsset || !buyAsset) {
    throw badRequest("type, sell_asset, buy_asset required");
  }
  if ((sellAmount == null) === (buyAmount == null)) {
    throw badRequest("Provide either sell_amount or buy_amount, not both");
  }

  const sellingIdr = sellAsset === config.idrAsset;
  const buyingIdr = buyAsset === config.idrAsset;
  if (!sellingIdr && !buyingIdr) {
    throw badRequest("One side must be iso4217:IDR");
  }

  const market = await fetchMarketIdrPerUsdc();
  const idrPerUsdc = applySpreadIdrPerUsdc(market, sellingIdr);
  const feeAsset = sellingIdr ? config.idrAsset : config.usdcAsset;
  const feeTotal = sellingIdr ? config.flatFeeIdr : config.flatFeeIdr / idrPerUsdc;

  let finalSell;
  let finalBuy;

  if (sellingIdr && sellAmount != null) {
    finalSell = sellAmount;
    finalBuy = Math.max(0, (sellAmount - config.flatFeeIdr) / idrPerUsdc);
  } else if (sellingIdr && buyAmount != null) {
    finalBuy = buyAmount;
    finalSell = buyAmount * idrPerUsdc + config.flatFeeIdr;
  } else if (buyingIdr && sellAmount != null) {
    finalSell = sellAmount;
    finalBuy = sellAmount * (idrPerUsdc * (1 - config.rateSpread)) - config.flatFeeIdr;
    finalBuy = Math.max(0, finalBuy);
  } else {
    finalBuy = buyAmount;
    finalSell = (buyAmount + config.flatFeeIdr) / (idrPerUsdc * (1 - config.rateSpread));
  }

  if (finalBuy <= 0 || finalSell <= 0) {
    throw badRequest("Amount too small after fees");
  }

  const price = formatAmount(finalSell / finalBuy, 10);
  const sellDecimals = sellingIdr || buyingIdr ? (sellingIdr ? 0 : 7) : 0;
  const buyDecimals = buyingIdr || sellingIdr ? (buyingIdr ? 0 : 7) : 7;

  const fee = {
    total: formatAmount(feeTotal, sellingIdr ? 0 : 7),
    asset: feeAsset,
    details: [
      {
        name: "Coridor fee",
        description: "Flat processing fee + spread over market rate",
        amount: formatAmount(feeTotal, sellingIdr ? 0 : 7),
      },
    ],
  };

  const rate = {
    price,
    sell_amount: formatAmount(finalSell, sellAsset === config.idrAsset ? 0 : 7),
    buy_amount: formatAmount(finalBuy, buyAsset === config.idrAsset ? 0 : 7),
    fee,
  };

  if (type === "FIRM") {
    const id = randomUUID();
    const expiresAt = new Date(
      Date.now() + config.quoteTtlSeconds * 1000
    ).toISOString();
    rate.id = id;
    rate.expires_at = expiresAt;
    firmQuotes.set(id, { ...rate, sellAsset, buyAsset });
  }

  return { rate };
}

export function getStoredQuote(id) {
  return firmQuotes.get(id);
}

function badRequest(msg) {
  const e = new Error(msg);
  e.status = 400;
  return e;
}
