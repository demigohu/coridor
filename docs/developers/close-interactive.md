# Close interactive flow

When to close the Coridor popup / webview during deposit and withdraw.

---

## How Coridor signals progress

Coridor’s interactive widget **does not** emit `postMessage` events. **Poll the anchor SEP-24 transaction** (recommended) or use Demo Wallet’s built-in handling.

| Flow | When to close popup |
|------|---------------------|
| **Withdraw** | Status = **`pending_user_transfer_start`** |
| **Deposit** | Keep open until user finishes IDR payment (or user dismisses) |

---

## Withdraw — close popup at `pending_user_transfer_start`

When status becomes **`pending_user_transfer_start`**:

1. Transaction includes `withdraw_anchor_account`, `withdraw_memo`, `amount_in`
2. **Close** the interactive popup
3. Build and submit the Stellar **USDC payment** in the wallet ([send funds](./send-receive-funds.md))

**Recommended — poll SEP-24:**

```typescript
watcher.watchOneTransaction({
  authToken,
  assetCode: "USDC",
  id: transactionId,
  onMessage: (tx) => {
    if (tx.status === "pending_user_transfer_start") {
      popup?.close();
      // submit USDC payment with tx.withdraw_memo, etc.
    }
  },
});
```

---

## Deposit — do not close early

For **deposit**, the user must **finish IDR payment** in the widget (VA transfer, QR scan, OVO confirm, or Simulate).

Closing early does not complete the deposit. Wait for status **`completed`** (or user dismisses intentionally).

---

## more_info redirect

Some wallets redirect to **`more_info_url`** after submit. Coridor serves status at:

```text
https://api.coridor.fun/sep24/transaction/more_info?token=<jwt>
```

Auto-refreshes every 5s — useful if the popup is closed before completion.

---

## Next

[Send or receive USDC on-chain](./send-receive-funds.md)
