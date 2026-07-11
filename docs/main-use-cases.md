# Main use cases

Coridor is a **fiat bridge** for Stellar apps focused on Indonesia. These are the primary ways teams use it today.

---

## 1. Wallet top-up and cash out

**Who:** Stellar wallets (Demo Wallet, Privy embedded wallets, custodial apps)

**Flow:** User deposits IDR via VA/QRIS/OVO → receives USDC. Or withdraws USDC → receives IDR in their bank account.

**Why Coridor:** Standard SEP-24 — no custom payment API. Home domain `sep.coridor.fun`.

**Example:** A savings app lets users top up before joining an on-chain pool.

---

## 2. dApp / DeFi onboarding (IDR users)

**Who:** Stellar dApps that need users who only hold Rupiah

**Flow:** User on-ramps to USDC in-wallet, then swaps, stakes, or joins protocols on Stellar.

**Why Coridor:** Local payment methods Indonesians already use; USDC lands on Stellar (same network as the dApp).

---

## 3. Community savings & ROSCA (arisan)

**Who:** Apps like pooled savings circles where members contribute USDC each cycle

**Flow:** Members **top up IDR → USDC** through Coridor, contribute on-chain, winners receive payouts; **cash out** to bank when leaving.

**Why Coridor:** IDR in via QRIS/VA; USDC compatible with pool contracts; bank payout for off-ramp.

---

## 4. Remittance-style payout (USDC → bank)

**Who:** Apps that hold USDC on Stellar and need to pay out IDR locally

**Flow:** SEP-24 withdraw → user sends USDC with memo → Coridor triggers Xendit payout to Indonesian bank account.

**Why Coridor:** Handles fiat leg and compliance path via anchor + Xendit instead of building payout rails in-house.

---

## 5. Wallet / anchor integration (B2B)

**Who:** Wallet teams and integrators

**Flow:** Implement SEP-10 + SEP-24 against `sep.coridor.fun`; open interactive URL; poll transaction status.

**Why Coridor:** Composable anchor on [Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform) — no need to rebuild SEP infrastructure for IDR.

See [Integrate Coridor](./developers/integrate.md).

---

## Comparison at a glance

| Use case | Direction | Fiat method | On-chain |
|----------|-----------|-------------|----------|
| Top-up | IDR → USDC | VA, QRIS, OVO | Anchor sends USDC |
| Cash out | USDC → IDR | Bank transfer | User sends USDC + memo |
| dApp funding | IDR → USDC | Same as top-up | User spends USDC in app |
| B2B integration | Both | Via widget | SEP-24 standard |

---

## Not in scope (v1)

- Cross-border remittance outside IDR ↔ USDC on Stellar
- Non-Stellar chains (bridge to Stellar first)
- Cash pickup at agent locations (bank / e-wallet only)

---

## Next

- [Getting started](./start.md)
- [Deposit](./deposit.md) · [Withdraw](./withdraw.md)
- [Developer integration](./developers/index.md)
