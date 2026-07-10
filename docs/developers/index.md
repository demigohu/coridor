# Wallet integration

For wallet teams connecting to Coridor via Stellar anchor standards (SEP-10, SEP-24).

---

## Quick start

Coridor uses standard Stellar anchor flows: SEP-10 auth, SEP-24 interactive UI, poll transaction status, and on-chain USDC. Fiat is settled in **IDR** via bank transfer, QRIS, or e-wallet (Xendit).

**Start here:** [Integrate Coridor](./integrate.md)

---

## Step-by-step guides

| Step | Doc |
|------|-----|
| 1 | [Integrate overview](./integrate.md) |
| 2 | [Acquire USDC & XLM](./acquire-usdc.md) |
| 3 | [Authenticate (SEP-10)](./authenticate.md) |
| 4 | [Initiate transaction (SEP-24)](./initiate-transaction.md) |
| 5 | [Customer & bank info](./customer-info.md) |
| 6 | [Close interactive flow](./close-interactive.md) |
| 7 | [Send / receive USDC](./send-receive-funds.md) |
| 8 | [Poll transaction status](./poll-status.md) |
| 9 | [Withdraw payout & more_info](./payout-status.md) |

---

## Architecture

```
Wallet                    Anchor Platform              coridor-server
  │                              │                            │
  ├── SEP-10 auth ──────────────►│                            │
  ├── POST /sep24/transactions ─►│                            │
  │◄── interactive URL ──────────┤                            │
  ├── open popup ─────────────────────────────────────────────►│ widget
  │                              │◄── callbacks / events ───────┤
  │◄── status updates ───────────┤                            │
```

The wallet does **not** call `POST /sep24/interactive/submit` — the user completes that in the browser popup.

---

## Reference

| Resource | Production |
|----------|------------|
| Home domain | `sep.coridor.fun` |
| stellar.toml & SEP | [stellar.md](./stellar.md) |
| HTTP API | [api.md](./api.md) |
| User flows | [deposit](../deposit.md) · [withdraw](../withdraw.md) |

---

## Local development

| Service | URL |
|---------|-----|
| SEP / TOML | `http://localhost:8082` |
| Platform API | `http://localhost:8086` |
| coridor-server | `http://localhost:8091` |

Run `./ap_start.sh` — see [README.md](../../README.md) and [DEPLOY.md](../../DEPLOY.md).
