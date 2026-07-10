# Public API

Production base URL: **`https://api.coridor.fun`**

Local dev: `http://localhost:8091`

These endpoints are useful for docs sites, status pages, and debugging. Wallet integration primarily uses SEP on `sep.coridor.fun`, not these REST routes directly.

---

## Health & inventory

```http
GET /health
```

Example response:

```json
{
  "ok": true,
  "name": "coridor-server",
  "idr_per_usdc": 18071.93,
  "usdc_balance": "949.4447978",
  "distribution": "GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS",
  "xendit_configured": true
}
```

---

## Exchange rate (SEP-38 callback + public)

**Indicative** — estimate:

```http
GET /rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000
```

**Firm** — locked quote (used during transactions):

```http
GET /rate?type=firm&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000
```

Fee details are in `rate.fee.details` (flat Coridor fee + spread).

No API key required for `/health` or `/rate` on staging.

---

## SEP-24 interactive (browser only)

Used when Anchor Platform redirects the user to complete deposit/withdraw:

```http
GET  /sep24/interactive?token=<jwt>
POST /sep24/interactive/submit
POST /sep24/interactive/confirm-sandbox-payment   # Xendit sandbox only
GET  /sep24/transaction/more_info?token=<jwt>
```

Static widget assets:

```http
GET /sep24/interactive/static/widget.css
GET /sep24/interactive/static/widget.js
```

---

## Xendit webhook (server-to-server)

```http
POST /xendit/webhook
Header: x-callback-token: <XENDIT_WEBHOOK_TOKEN>
```

Configure in the [Xendit dashboard](https://dashboard.xendit.co). Not called by wallets.

Required for production deposit completion (`payment.capture` via Payments API v3).

---

## Related

- [Wallet integration overview](./index.md)
- [Stellar.toml & SEP](./stellar.md)
