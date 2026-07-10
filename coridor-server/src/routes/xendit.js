import express from "express";
import { verifyWebhookToken } from "../services/xenditService.js";
import { completeDepositAfterPayment } from "../services/depositService.js";

const router = express.Router();

router.post("/xendit/webhook", express.json(), async (req, res) => {
  const token = req.headers["x-callback-token"];
  if (!verifyWebhookToken(token)) {
    return res.status(401).json({ error: "Invalid webhook token" });
  }

  const event = req.body;
  const eventName = (event.event || "").toLowerCase();
  console.log("[xendit webhook]", eventName, event.data?.reference_id, event.data?.status);

  try {
    const data = event.data || event;
    const refId = data.reference_id || data.metadata?.coridor_transaction_id;
    const paymentStatus = (data.status || "").toUpperCase();
    const isPaid =
      paymentStatus.includes("SUCCEEDED") ||
      paymentStatus.includes("COMPLETED") ||
      eventName.includes("payment.capture") ||
      eventName.includes("payment.succeeded") ||
      eventName.includes("payment_request.succeeded");

    if (refId && isPaid) {
      await completeDepositAfterPayment(
        refId,
        data.payment_request_id || data.payment_id || data.id
      );
    }
  } catch (e) {
    console.error("[xendit webhook error]", e.message);
  }

  res.sendStatus(200);
});

export default router;
