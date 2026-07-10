/** @typedef {'INDICATIVE' | 'FIRM'} RateType */

export const config = {
  port: parseInt(process.env.PORT || "8091", 10),
  platformApiUrl: process.env.PLATFORM_API_URL || "http://localhost:8085",

  distributionAccount:
    process.env.DISTRIBUTION_ACCOUNT ||
    "GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS",
  distributionSeed: process.env.SECRET_DISTRIBUTION_SEED || "",

  usdcAsset:
    process.env.CORIDOR_USDC_ASSET ||
    "stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56",
  idrAsset: process.env.CORIDOR_IDR_ASSET || "iso4217:IDR",

  sep24InteractiveJwtSecret:
    process.env.SECRET_SEP24_INTERACTIVE_URL_JWT_SECRET ||
    "coridor_sep24_interactive_jwt_secret",

  sep24MoreInfoJwtSecret:
    process.env.SECRET_SEP24_MORE_INFO_URL_JWT_SECRET ||
    "coridor_sep24_more_info_jwt_secret",

  xenditSecretKey: process.env.XENDIT_SECRET_KEY || "",
  xenditWebhookToken: process.env.XENDIT_WEBHOOK_TOKEN || "",
  /** Required for POST /v3/payment_requests — see Xendit Payments API docs */
  xenditApiVersion: process.env.XENDIT_API_VERSION || "2024-11-11",

  /** Spread over market rate (0.005 = 0.5%) */
  rateSpread: parseFloat(process.env.CORIDOR_RATE_SPREAD || "0.005"),
  /** Flat fee in IDR */
  flatFeeIdr: parseFloat(process.env.CORIDOR_FLAT_FEE_IDR || "5000"),
  /** CoinGecko cache TTL ms */
  rateCacheTtlMs: parseInt(process.env.CORIDOR_RATE_CACHE_TTL_MS || "60000", 10),
  /** Firm quote validity seconds */
  quoteTtlSeconds: parseInt(process.env.CORIDOR_QUOTE_TTL_SECONDS || "300", 10),

  horizonUrl:
    process.env.HORIZON_URL || "https://horizon-testnet.stellar.org",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
};

export const USDC_ISSUER =
  "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56";
