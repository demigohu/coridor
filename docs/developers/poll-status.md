# Poll transaction status

Poll Coridor’s SEP-24 API until the transaction reaches the status you need.

---

## Key statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `incomplete` | User still in widget | Wait |
| `pending_user_transfer_start` | Ready for **USDC send** (withdraw) | Close popup, submit payment |
| `pending_anchor` | USDC received, anchor processing IDR | Wait (withdraw) |
| `pending_external` | External fiat step in progress | Wait |
| `completed` | Done | Show success |
| `error` / `expired` | Failed | Show error, allow retry |

---

## Wallet SDK watcher

```typescript
const watcher = anchor.sep24().watcher();

watcher.watchOneTransaction({
  authToken,
  assetCode: "USDC",
  id: transactionId,
  onMessage: (tx) => {
    console.log(tx.status);
    if (tx.status === "pending_user_transfer_start") {
      // withdraw: send USDC
    }
  },
  onSuccess: (tx) => {
    // completed | refunded | expired
  },
  onError: (tx) => {
    // error | too_small | too_large | ...
  },
});
```

---

## One-shot fetch

```typescript
const tx = await anchor.sep24().getTransactionBy({
  authToken,
  id: transactionId,
});

// After on-chain payment:
const txByStellar = await anchor.sep24().getTransactionBy({
  authToken,
  stellarTransactionId: "abc123...",
});
```

---

## Poll until withdraw ready (Python-style loop)

```python
while status != "pending_user_transfer_start":
    time.sleep(1)
    status = GET /sep24/transaction?id=... with Authorization: Bearer <token>
```

Use the anchor’s SEP-24 base URL from TOML (`https://sep.coridor.fun/sep24`), not `api.coridor.fun`.

---

## Deposit polling

Poll until **`completed`** after user paid IDR (or simulated). Intermediate statuses may include `pending_external` while Xendit/webhook processes.

---

## Next

[Withdraw payout & more_info](./payout-status.md)
