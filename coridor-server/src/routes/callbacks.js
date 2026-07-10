import express from "express";
import { getRate } from "../services/rateService.js";
import { getCustomer, putCustomer } from "../services/customerService.js";
import {
  sendWithdrawalIdr,
  completeWithdrawalAfterOnchain,
} from "../services/withdrawService.js";

const router = express.Router();

router.get("/rate", async (req, res) => {
  try {
    const response = await getRate(req.query);
    res.json(response);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.get("/customer", async (req, res) => {
  try {
    res.json(await getCustomer(req.query));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/customer", express.json(), async (req, res) => {
  try {
    res.json(await putCustomer(req.body));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/event", express.json(), async (req, res) => {
  const { type, payload } = req.body || {};
  console.log("[event]", type, payload?.transaction?.id, payload?.transaction?.status);

  try {
    if (
      type === "transaction_status_changed" &&
      payload?.transaction?.kind === "withdrawal" &&
      payload.transaction.status === "pending_anchor"
    ) {
      console.log("[event] triggering Xendit payout for", payload.transaction.id);
      await sendWithdrawalIdr(payload.transaction.id);
      console.log("[event] payout flow done for", payload.transaction.id);
    }
  } catch (e) {
    console.error("[event handler]", e.message);
  }

  res.sendStatus(200);
});

export default router;
