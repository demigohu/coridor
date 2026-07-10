# Coridor — Local IDR Anchor for APAC Stellar Hackathon

On/off-ramp between **IDR** (via Xendit sandbox) and **USDC Blend** on Stellar testnet, built on [Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform).

**Documentation** (user guide, developers, FAQ): see **[docs/](./docs/README.md)**.

## Stack

| Service | Port | Role |
|---------|------|------|
| Anchor Platform | 8080 | SEP server (wallet-facing) |
| Platform API | 8085 | JSON-RPC transaction updates |
| coridor-server | 8091 | Business logic, Xendit, dynamic rates |

## Dynamic Rate (not fixed)

Coridor fetches live **USDC/IDR** from [CoinGecko](https://www.coingecko.com/) and applies:

- **Spread** (`CORIDOR_RATE_SPREAD`, default 0.5%)
- **Flat fee** (`CORIDOR_FLAT_FEE_IDR`, default Rp 5.000)

Exposed to Anchor Platform via `GET /rate` (SEP-38 callback).

## Prerequisites

- Docker & Docker Compose
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (optional, for key derivation)
- Xendit sandbox API key
- Distribution account `GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS` with:
  - XLM for fees
  - Trustline to USDC Blend (`GATALTGT...`)
  - USDC balance for deposits

## Quick Start

```bash
cd coridor
cp .env.secrets.example .env.secrets
# Edit .env.secrets — add SECRET_DISTRIBUTION_SEED, SECRET_SEP10_SIGNING_SEED, XENDIT_SECRET_KEY

chmod +x ap_start.sh
./ap_start.sh
```

Verify:

```bash
curl http://localhost:8080/.well-known/stellar.toml
curl http://localhost:8091/health
curl "http://localhost:8091/rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000"
```

## Demo Wallet

1. Open https://demo-wallet.stellar.org
2. Create testnet account + add trustline USDC (`GATALTGT...`)
3. Add asset: **USDC** / home domain **localhost:8080**
4. SEP-24 Deposit or Withdraw

## Xendit Webhook (local)

Use [ngrok](https://ngrok.com/) to expose port 8091:

```bash
ngrok http 8091
# Set callback URL in Xendit dashboard: https://xxxx.ngrok.io/xendit/webhook
```

## Project Structure

```
coridor/
├── ap_start.sh
├── docker-compose.yaml
├── dev.env
├── config/
│   ├── assets.yaml          # IDR + USDC Blend
│   ├── stellar.localhost.toml
│   └── clients.yaml
└── coridor-server/
    ├── src/
    │   ├── services/
    │   │   ├── marketRate.js    # CoinGecko
    │   │   ├── rateService.js   # SEP-38 /rate
    │   │   ├── depositService.js
    │   │   ├── withdrawService.js
    │   │   └── xenditService.js
    │   └── routes/
    └── public/                  # SEP-24 widget UI
```

## Hackathon Pitch Angle

> Coridor is Indonesia's composable IDR anchor — wallets plug in via SEP-24, users pay with VA/QRIS/e-wallet through Xendit, rates are live from market. Built on Stellar Anchor Platform so any APAC wallet gets localized on/off-ramp without rebuilding SEP infrastructure.

## License

Same as anchor-platform parent repo.
