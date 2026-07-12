# Coridor — On/Off-Ramp for Stellar

**APAC Stellar Hackathon 2026** · **Track: Local Finance & Real-World Access**

Fiat ↔ crypto bridge for wallets and apps — cash in with local payment rails, cash out to bank, settle on Stellar.

Coridor is a **composable Stellar anchor** — users **on-ramp** (fiat → crypto) and **off-ramp** (crypto → fiat) through standard SEPs, without wallets rebuilding anchor infrastructure.

Built on [Stellar Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform). Any SEP-24 wallet plugs in via `sep.coridor.fun`.

**Hackathon demo:** one live pair on testnet (local fiat ↔ USDC). Post-hackathon: more APAC fiat currencies and more Stellar assets.

---

## Live demo


| Resource                 | URL                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Try it (Demo Wallet)** | [demo-wallet.stellar.org](https://demo-wallet.stellar.org) → add asset **USDC**, home domain `sep.coridor.fun` |
| Anchor (SEP server)      | [https://sep.coridor.fun](https://sep.coridor.fun)                                                             |
| stellar.toml             | [https://sep.coridor.fun/.well-known/stellar.toml](https://sep.coridor.fun/.well-known/stellar.toml)           |
| API / SEP-24 widget      | [https://api.coridor.fun](https://api.coridor.fun)                                                             |
| Health check             | [https://api.coridor.fun/health](https://api.coridor.fun/health)                                               |
| Landing page             | [https://coridor.fun](https://coridor.fun)                                                                     |
| Documentation            | [https://coridor.gitbook.io](https://coridor.gitbook.io)                                                       |


**Network:** Stellar **testnet** · **Xendit sandbox** (use **Simulate** for VA/QRIS in demos)

---



## The problem

Across APAC, people earn, save, and spend in **local fiat** — but more apps pay and settle in **on-chain assets**. Without a simple bridge, everyday users are stuck:

- A **freelancer in Jakarta** gets paid in USDC for remote work but has no easy way to convert it to Rupiah in their bank account without a centralized exchange and multiple apps.
- A **Sanca arisan member** saves USDC in a community pool but wants to **cash out winnings straight to their bank** when their turn comes — without learning crypto plumbing.
- A **student or gig worker** wants to **top up** from QRIS or e-wallet to join a Stellar savings or DeFi app — but the app has no local pay-in path.

These are **real APAC financial access problems**: savings, earnings, and local spending — not abstract infra gaps.

**For builders:** delivering that experience means SEP infrastructure, KYC, payment partners, rates, and settlement. Most wallet and app teams don't want to rebuild an anchor from scratch — they want one they can **compose with**. Coridor is that layer.

---



## Our solution

Coridor handles the full anchor flow:

- **SEP-10** — wallet authentication
- **SEP-12** — KYC
- **SEP-24** — interactive deposit & withdraw
- **SEP-38** — live fiat/crypto quotes

Users complete fiat steps in an **embedded checkout widget** (pay-in and bank payout). Coridor handles payment webhooks, on-chain delivery, and withdraw detection.

Wallets integrate once — same SEP flow regardless of which fiat currency or Stellar asset is supported.

> **One-liner:** Coridor is a composable on/off-ramp for Stellar — cash in with local fiat, cash out to bank, settle on-chain. Plug in via SEP-24.

### What's live vs. what's next

| | Hackathon (now) | Post-hackathon |
|---|-----------------|----------------|
| **Direction** | On-ramp & off-ramp | Same |
| **Fiat** | One corridor (demo) | More APAC currencies — THB, VND, PHP, … |
| **Crypto** | USDC on Stellar testnet | More Stellar assets (stablecoins, tokens, etc.) |
| **Rails** | Local payment partner (Xendit sandbox) | Production keys + partners per market |

The architecture is asset- and corridor-agnostic — new fiats and new on-chain assets are config + partner wiring, not a new SEP stack.

---



## Why this fits APAC Stellar Hackathon

**Track: Local Finance & Real-World Access** — fiat access, localized funding and cash-out, financial tools tied to the local economy.


| Hackathon theme                   | How Coridor addresses it                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **User-facing financial apps**    | Real users on-ramp and off-ramp through familiar local payment rails (QRIS, VA, bank) inside any SEP-24 wallet — not dev tooling |
| **Local anchors & local assets**  | Public anchor connecting **local fiat ↔ Stellar assets**; demo on testnet with one live pair                               |
| **Composability**                 | No proprietary SDK — standard SEPs; live integration with **[Sanca](https://sanca.space)** (community savings on Stellar) |
| **Real utility, not a prototype** | Deployed on VPS with HTTPS, webhooks, docs, landing page, and a working end-to-end wallet flow                            |


---



## How it works



### Deposit (on-ramp): fiat → crypto

```
Wallet → SEP-10 auth → SEP-24 deposit → Coridor widget (local pay-in)
  → User pays fiat → payment webhook → Coridor sends crypto to wallet
```

### Withdraw (off-ramp): crypto → fiat

```
Wallet → SEP-10 auth → SEP-24 withdraw → Widget (bank details)
  → User sends crypto + memo → on-chain observer → fiat bank payout
```

**Demo implementation:** local fiat pay-in/out via Xendit; settlement in USDC on Stellar testnet.



### Architecture

```
┌─────────────────┐     SEP-10/24/38      ┌──────────────────────┐
│  Stellar Wallet │ ◄──────────────────► │  sep.coridor.fun     │
│  (Demo, Sanca…) │                       │  Anchor Platform     │
└────────┬────────┘                       └──────────┬───────────┘
         │ interactive URL                           │ callbacks
         ▼                                           ▼
┌─────────────────┐     webhooks          ┌──────────────────────┐
│  Coridor widget │ ◄──────────────────► │  api.coridor.fun     │
│  (VA/QRIS/bank) │                       │  coridor-server      │
└────────┬────────┘                       └──────────┬───────────┘
         │                                           │
         ▼                                           ▼
    ┌─────────┐                              ┌──────────────┐
    │ Payment │                              │ Horizon      │
    │ partner │                              │ on-chain     │
    └─────────┘                              └──────────────┘
```

Full diagram and component breakdown: [docs/architecture.md](./docs/architecture.md)

---



## Stellar usage


| Standard / tech                                                                  | Role                                                       |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform) | SEP server, transaction state, KYC, quotes                 |
| SEP-1                                                                            | `stellar.toml` discovery                                   |
| SEP-10                                                                           | Wallet auth (JWT challenges)                               |
| SEP-12                                                                           | Customer KYC                                               |
| SEP-24                                                                           | Interactive deposit / withdraw                             |
| SEP-38                                                                           | Indicative & firm fiat/crypto rates                        |
| Classic assets + Horizon                                                         | On-chain payments (deposit send, withdraw observer)        |
| CoinGecko                                                                        | Live market rates + configurable spread & flat fee         |


**Demo asset (testnet):** USDC · issuer `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56`

---



## Use cases

1. **Wallet top-up & cash out** — Any SEP-24 wallet adds on/off-ramp via home domain `sep.coridor.fun`
2. **DeFi / dApp onboarding** — Users on-ramp fiat → crypto, then swap, stake, or join protocols on Stellar
3. **Community savings** — Members fund pools on-chain; cash out to local bank when leaving ([Sanca](https://sanca.space))
4. **Disbursements** — Apps holding Stellar assets pay out to local bank accounts via SEP-24 withdraw

Details: [docs/main-use-cases.md](./docs/main-use-cases.md)

---



## Composability in practice

Coridor is designed to **plug into existing Stellar apps**, not replace them:


| Partner                 | Integration                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Any SEP-24 wallet**   | Point home domain to `sep.coridor.fun`; no Coridor SDK required                     |
| **Sanca**               | Top-up and cash-out via standard SEP-10 + SEP-24 against Coridor |
| **Stellar Demo Wallet** | Fastest way for judges to test end-to-end                                           |


Developer integration guide: [docs/developers/integrate.md](./docs/developers/integrate.md)

---



## Try it yourself (5 minutes)



### Option A — Demo Wallet (recommended for judges)

1. Open [https://demo-wallet.stellar.org](https://demo-wallet.stellar.org) (testnet)
2. Create or import a testnet account
3. **Add asset:** code **USDC**, home domain `sep.coridor.fun`
4. **Deposit:** SEP-24 → enter amount → pay via widget (sandbox: click **Simulate**)
5. **Withdraw:** SEP-24 → enter bank details → send crypto with memo from wallet

*(Current demo: local fiat pay-in/out + USDC on testnet.)*



### Option B — Check the anchor directly

```bash
curl -s https://sep.coridor.fun/.well-known/stellar.toml | head -20
curl -s https://api.coridor.fun/health
curl -s "https://api.coridor.fun/rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000"
```

---



## Tech stack


| Service         | Port (local) | Role                                     |
| --------------- | ------------ | ---------------------------------------- |
| Anchor Platform | 8082 → 8080  | SEP server (wallet-facing)               |
| Platform API    | 8086 → 8085  | JSON-RPC transaction updates             |
| coridor-server  | 8091         | Business logic, Xendit, rates, widget UI |
| PostgreSQL      | 5432         | Anchor transaction & KYC data            |
| Kafka           | 29092        | Platform event callbacks                 |


**Dynamic rates:** Live market data from [CoinGecko](https://www.coingecko.com/) with configurable spread and flat fee.

---



## Project structure

```
coridor/
├── ap_start.sh                 # Local dev: down + build + up
├── docker-compose.yaml
├── docker-compose.prod.yaml    # VPS: bind to 127.0.0.1 (Nginx front)
├── dev.env                     # Environment config
├── config/
│   ├── assets.yaml             # Fiat + crypto asset pairs
│   ├── stellar.localhost.toml  # TOML template (local)
│   └── clients.yaml            # Optional client attribution
├── coridor-server/
│   ├── src/
│   │   ├── routes/sep24.js     # Widget HTML + interactive flow
│   │   └── services/           # Xendit, rates, deposit, withdraw, observer
│   └── public/                 # widget.css, widget.js
├── coridor-fe/                 # Landing page (Next.js)
├── docs/                       # GitBook documentation
├── DEPLOY.md                   # VPS production deploy guide
└── README.md                   # This file
```

---



## Run locally



### Prerequisites

- Docker & Docker Compose
- Xendit sandbox API key
- Distribution account with XLM fees, USDC trustline, and USDC inventory



### Quick start

```bash
git clone https://github.com/demigohu/coridor.git
cd coridor
cp .env.secrets.example .env.secrets
# Edit .env.secrets — SECRET_DISTRIBUTION_SEED, SECRET_SEP10_SIGNING_SEED, XENDIT_SECRET_KEY

chmod +x ap_start.sh
./ap_start.sh
```

Verify:

```bash
curl http://localhost:8082/.well-known/stellar.toml
curl http://localhost:8091/health
```

**Demo Wallet (local):** home domain `localhost:8082`

### Xendit webhook (local)

Expose port 8091 with [ngrok](https://ngrok.com/) and set callback URL in Xendit dashboard:

```
https://xxxx.ngrok.io/xendit/webhook
```

Production deploy: see [DEPLOY.md](./DEPLOY.md)

---



## Roadmap


| Phase | Goal |
|-------|------|
| **Hackathon (now)** | On/off-ramp live on testnet — SEP-24 widget, payment sandbox, docs, Sanca composability |
| **Post-hackathon** | Mainnet, production payment keys, enhanced KYC |
| **Expand fiat** | More APAC local currencies (e.g. THB, VND, PHP) — same SEP stack, local partner per market |
| **Expand crypto** | Support more Stellar assets beyond USDC — stablecoins, issued tokens, etc. |
| **Scale** | Partner wallet integrations, more pay-in/payout channels per market |


---



## How Coridor benefits the Stellar ecosystem

- **Composable on/off-ramp** — wallets integrate via standard SEPs in days, not months
- **Keeps value on Stellar** — users receive on-chain assets ready for DeFi, payments, and savings apps
- **Built on Anchor Platform** — the right foundation to add fiats and assets without reinventing SEP infra
- **Open source** — repeatable pattern for APAC and beyond

---



## Team

| Name | Role | Location | Focus | LinkedIn |
|------|------|----------|-------|----------|
| Tegar Aji Kurniawan | Builder | 🇮🇩 Indonesia | Backend | [linkedin.com/in/tegaraji](https://www.linkedin.com/in/tegaraji/) |
| Muhammad Garry Badruzzaman | Builder | 🇮🇩 Indonesia | Frontend | [linkedin.com/in/muhammad-garry](https://www.linkedin.com/in/muhammad-garry/) |

---



## Submission checklist (APAC Stellar Hackathon)


| Deliverable                 | Status                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Public open-source repo     | [https://github.com/demigohu/coridor](https://github.com/demigohu/coridor)                              |
| Detailed README             | This file                                                                                               |
| Live app (public link)      | [https://sep.coridor.fun](https://sep.coridor.fun) · [https://api.coridor.fun](https://api.coridor.fun) |
| Landing Page     | [https://coridor.fun](https://coridor.fun)  |
| Deployed on Stellar testnet | ✅                                                                                                       |
| Documentation               | [https://coridor.gitbook.io](https://coridor.gitbook.io)                                                |
| Pitch deck                  | *(link TBD)*                                                                                            |
| Demo video (2–3 min)        | *(link TBD)*                                                                                            |


---



## Documentation

Full user and developer guides live in `[docs/](./docs/README.md)` and on GitBook:

- [What is Coridor?](./docs/what-is-coridor.md)
- [How it works](./docs/how-coridor-works.md)
- [Developer integration](./docs/developers/integrate.md)
- [FAQ](./docs/faq.md)

---


## Links

- **Repository:** [https://github.com/demigohu/coridor](https://github.com/demigohu/coridor)
- **Anchor:** [https://sep.coridor.fun](https://sep.coridor.fun)
- **API:** [https://api.coridor.fun](https://api.coridor.fun)
- **Docs:** [https://coridor.gitbook.io](https://coridor.gitbook.io)
- **Landing:** [https://coridor.fun](https://coridor.fun)

