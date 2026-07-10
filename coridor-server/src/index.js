import express from "express";
import { config } from "./config.js";
import callbacks from "./routes/callbacks.js";
import sep24 from "./routes/sep24.js";
import xendit from "./routes/xendit.js";
import { fetchMarketIdrPerUsdc } from "./services/marketRate.js";
import { getUsdcBalance } from "./services/stellarService.js";

const app = express();

app.get("/health", async (_req, res) => {
  try {
    const rate = await fetchMarketIdrPerUsdc();
    const balance = await getUsdcBalance();
    res.json({
      ok: true,
      name: "coridor-server",
      idr_per_usdc: rate,
      usdc_balance: balance,
      distribution: config.distributionAccount,
      xendit_configured: Boolean(config.xenditSecretKey),
    });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.use(callbacks);
app.use(sep24);
app.use(xendit);

app.listen(config.port, () => {
  console.log(`Coridor server listening on :${config.port}`);
});
