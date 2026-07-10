# Withdraw — Send USDC, receive IDR

Withdraw through SEP-24. You send **USDC on-chain**; Coridor sends **IDR to your bank** via Xendit after the payment is detected.

---

## Steps

1. In your wallet, choose **Withdraw** for USDC
2. Enter **USDC** amount (minimum **0.5 USDC**)
3. Enter **bank details** (bank name, account number, account holder name)
4. The popup shows the **distribution address**, **memo**, and instructions
5. **Close the popup** — Demo Wallet (or your wallet) prepares the Stellar transaction
6. In the wallet, tap **Approve & Send USDC** (required — balance is debited here)
7. After the anchor receives USDC on-chain, **IDR is paid out** to your bank account

---

## Important

- Withdraw is **not** a manual bank transfer from you — you send **USDC on Stellar**
- The **memo** must match what the popup shows (the observer uses it to match your payment)
- Track progress in your **wallet’s transaction list**, not only in the popup

---

## SEP-24 behavior (Demo Wallet)

After you close the interactive popup, Demo Wallet **automatically builds** the Stellar payment (address + memo). That is standard SEP-24 — you still must **Approve** before funds move.

---

## Timing

After USDC is detected (Horizon observer), Coridor triggers a Xendit payout. Sandbox timing varies; production depends on the destination bank.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| USDC sent, IDR not received | Wait for observer; verify memo was correct |
| Unexpected USDC deduction | Normal after Approve in wallet — see [SEP-24 behavior](#sep-24-behavior-demo-wallet) |
| Popup shows “coming soon” | Hard refresh; ensure latest `coridor-server` is deployed |

More: [FAQ](./faq.md)
