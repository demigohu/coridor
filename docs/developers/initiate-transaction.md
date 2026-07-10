# Initiate transaction (SEP-24)

Start a deposit or withdrawal using **SEP-24**. Coridor returns an **interactive URL** (popup) on `api.coridor.fun`.

---

## Deposit (on-ramp: IDR → USDC)

After SEP-10 auth:

```typescript
const { url, id } = await anchor.sep24().deposit({
  authToken,
  assetCode: "USDC",
  lang: "en",
});
// Open `url` in popup / webview — user pays IDR in Coridor widget
```

**User actions in widget:**

- Enter IDR amount
- Choose VA, QRIS, or OVO
- Complete payment (or Simulate in sandbox)

Anchor sends **USDC to the user** after Xendit confirms IDR payment.

---

## Withdraw (off-ramp: USDC → IDR)

```typescript
const { url, id } = await anchor.sep24().withdraw({
  authToken,
  assetCode: "USDC",
  lang: "en",
  // amount optional for non-custodial; user enters in wallet/widget
});
// Open `url` — user enters bank account details
```

After the widget completes KYC/bank capture, status becomes **`pending_user_transfer_start`** — wallet must send USDC (see [send/receive funds](./send-receive-funds.md)).

---

## Required fields

| Field | Deposit | Withdraw |
|-------|---------|----------|
| `authToken` | ✅ SEP-10 JWT | ✅ |
| `assetCode` | `USDC` | `USDC` |
| `lang` | optional (`en`) | optional |
| Bank details | — | Collected in interactive widget |
| `amount` | User enters IDR in widget | User enters USDC in wallet |

Optional [customer fields](./customer-info.md) are not required on Coridor staging.

---

## Open the interactive URL

Open in **popup, webview, or new tab**:

```javascript
const popup = window.open(url, "coridor-sep24", "width=480,height=720");
```

The URL points to:

```text
https://api.coridor.fun/sep24/interactive?token=<jwt>
```

---

## Save the transaction id

Keep **`id`** from the SEP-24 response for polling ([poll status](./poll-status.md)).

---

## Next

- [Customer / bank info](./customer-info.md)
- [Close interactive flow](./close-interactive.md)
