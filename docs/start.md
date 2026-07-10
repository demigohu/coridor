# Getting Started

Use Coridor to move value between **IDR** (Indonesian Rupiah) and **USDC Blend** on Stellar through any **SEP-24** compatible wallet.

---

## Prerequisites

- A Stellar **testnet** wallet with a trustline to **USDC Blend**
- USDC issuer: `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56`
- Anchor home domain: **`sep.coridor.fun`** (production) or `localhost:8082` (local dev)

---

## Demo Wallet (fastest path)

1. Open [https://demo-wallet.stellar.org](https://demo-wallet.stellar.org)
2. Create or import a **testnet** account
3. **Add asset** → USDC
   - Home domain: `sep.coridor.fun`
   - Issuer: `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56`
4. Use **Deposit** or **Withdraw** for that USDC asset

---

## Fees & limits (staging defaults)

| | Min | Max |
|---|-----|-----|
| Deposit (IDR) | Rp 10,000 (platform) / **Rp 50,000 recommended** | Rp 10,000,000 |
| Withdraw (USDC) | 0.5 USDC | Balance & platform limits |

**Fees:** flat **Rp 5,000** + ~**0.5%** spread over market USDC/IDR (CoinGecko).

Small deposits (e.g. Rp 10,000) lose most of the amount to the flat fee — use Rp 50,000+ for sensible results.

Final limits follow `config/assets.yaml` and product policy.

---

## Next steps

- [Deposit IDR → USDC](./deposit.md)
- [Withdraw USDC → IDR](./withdraw.md)
- [FAQ](./faq.md)
