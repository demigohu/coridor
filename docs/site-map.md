# Site map — Coridor docs

Suggested routes for the documentation site. Map each route to **one markdown file** (English).

---

## Domains

| Domain | Host | Purpose |
|--------|------|---------|
| `coridor.fun` | Frontend | Docs site |
| `sep.coridor.fun` | Anchor Platform | SEP server, `stellar.toml` |
| `api.coridor.fun` | coridor-server | API, SEP-24 widget, webhooks |

Optional live data on the docs site:

```http
GET https://api.coridor.fun/health
GET https://api.coridor.fun/rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000
```

---

## Routes

```
/docs                              → redirect to /docs/start
/docs/start
/docs/deposit
/docs/withdraw
/docs/faq
/docs/developers
/docs/developers/integrate
/docs/developers/acquire-usdc
/docs/developers/authenticate
/docs/developers/initiate-transaction
/docs/developers/customer-info
/docs/developers/close-interactive
/docs/developers/send-receive-funds
/docs/developers/poll-status
/docs/developers/payout-status
/docs/developers/api
/docs/developers/stellar
```

---

## Content mapping

| Route | Markdown file |
|-------|----------------|
| `/docs/start` | [start.md](./start.md) |
| `/docs/deposit` | [deposit.md](./deposit.md) |
| `/docs/withdraw` | [withdraw.md](./withdraw.md) |
| `/docs/faq` | [faq.md](./faq.md) |
| `/docs/developers` | [developers/index.md](./developers/index.md) |
| `/docs/developers/integrate` | [developers/integrate.md](./developers/integrate.md) |
| `/docs/developers/acquire-usdc` | [developers/acquire-usdc.md](./developers/acquire-usdc.md) |
| `/docs/developers/authenticate` | [developers/authenticate.md](./developers/authenticate.md) |
| `/docs/developers/initiate-transaction` | [developers/initiate-transaction.md](./developers/initiate-transaction.md) |
| `/docs/developers/customer-info` | [developers/customer-info.md](./developers/customer-info.md) |
| `/docs/developers/close-interactive` | [developers/close-interactive.md](./developers/close-interactive.md) |
| `/docs/developers/send-receive-funds` | [developers/send-receive-funds.md](./developers/send-receive-funds.md) |
| `/docs/developers/poll-status` | [developers/poll-status.md](./developers/poll-status.md) |
| `/docs/developers/payout-status` | [developers/payout-status.md](./developers/payout-status.md) |
| `/docs/developers/api` | [developers/api.md](./developers/api.md) |
| `/docs/developers/stellar` | [developers/stellar.md](./developers/stellar.md) |

Import as MDX at build time or copy into the frontend repo.

---

## Sidebar (suggested)

```
Getting started
  └─ Prerequisites & Demo Wallet
  └─ Fees & limits

Users
  └─ Deposit IDR
  └─ Withdraw USDC
  └─ FAQ

Developers
  └─ Wallet integration (overview)
  └─ Integrate Coridor
  └─ Acquire USDC & XLM
  └─ Authenticate (SEP-10)
  └─ Initiate transaction (SEP-24)
  └─ Customer & bank info
  └─ Close interactive flow
  └─ Send / receive USDC
  └─ Poll transaction status
  └─ Withdraw payout & more_info
  └─ stellar.toml & SEP
  └─ HTTP API

Legal
  └─ Testnet disclaimer
```

---

## External links

| Label | URL |
|-------|-----|
| stellar.toml | `https://sep.coridor.fun/.well-known/stellar.toml` |
| Demo Wallet | `https://demo-wallet.stellar.org` |
| Anchor Platform | [developers.stellar.org](https://developers.stellar.org/docs/platforms/anchor-platform) |

---

## Out of scope (docs v1)

- Transaction dashboard (status lives in the wallet)
- VPS deploy guide → [DEPLOY.md](../DEPLOY.md) in the backend repo
