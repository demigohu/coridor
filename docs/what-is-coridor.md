# What is Coridor?

Coridor is a **Stellar anchor** for Indonesia. It lets users and apps move value between **IDR** (Indonesian Rupiah) and **USDC** on Stellar using familiar local payment rails — virtual account, QRIS, and e-wallet — powered by **Xendit**.

Wallets and apps connect through standard Stellar protocols (**SEP-10**, **SEP-24**, **SEP-38**). There is no proprietary Coridor SDK.

---

## The problem

Indonesia runs on local fiat — bank transfers, QRIS, and e-wallets. Most Stellar wallets need a way for users to **cash in** (IDR → USDC) and **cash out** (USDC → IDR) without leaving the apps they already use.

Building that from scratch means SEP infrastructure, KYC flows, payment partners, rate logic, and on-chain settlement. Coridor packages that as a **composable anchor** any SEP-24 wallet can plug into.

---

## What Coridor provides

| Layer | What you get |
|-------|----------------|
| **Anchor (SEP)** | Auth, deposit/withdraw, KYC, quotes at `sep.coridor.fun` |
| **Interactive UI** | Payment widget at `api.coridor.fun` (VA, QRIS, OVO, bank form) |
| **Fiat rails** | Xendit for IDR collection and bank payout |
| **On-chain** | USDC delivery and inventory on Stellar testnet (staging) |
| **Rates** | Live USDC/IDR from market data + configurable spread and flat fee |

---

## Who it is for

- **End users** — top up or cash out through a Stellar wallet (e.g. Demo Wallet, embedded wallets like Privy)
- **Wallet teams** — add Indonesia IDR on/off-ramp via SEP-24
- **App builders** — embed fiat rails in dApps, savings products, or remittance flows on Stellar

---

## Current status

| | Staging (today) |
|---|-----------------|
| Network | Stellar **testnet** |
| Fiat | Xendit **sandbox** (Simulate for VA/QRIS demos) |
| Home domain | `sep.coridor.fun` |
| Asset | USDC (`GATALTGT...` on testnet) |

Not mainnet or live IDR unless a production go-live is announced.

---

## Next

- [How Coridor works](./how-coridor-works.md)
- [Main use cases](./main-use-cases.md)
- [Architecture](./architecture.md)
- [Getting started](./start.md)
