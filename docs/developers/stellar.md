# Stellar.toml & SEP endpoints

---

## Anchor identity

| Field | Production |
|-------|------------|
| Organization | Coridor |
| Home domain | `sep.coridor.fun` |
| Network | Stellar **Test SDF Network** (testnet) |
| Distribution account | `GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS` |
| USDC issuer | `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56` |
| Fiat asset | `iso4217:IDR` |

---

## stellar.toml

```http
GET https://sep.coridor.fun/.well-known/stellar.toml
```

Wallets must fetch TOML over **HTTPS** in production.

---

## SEP endpoints (production)

| SEP | URL |
|-----|-----|
| SEP-10 Web Auth | `https://sep.coridor.fun/auth` |
| SEP-12 KYC | `https://sep.coridor.fun/sep12` |
| SEP-6 | `https://sep.coridor.fun/sep6` |
| SEP-24 | `https://sep.coridor.fun/sep24` |
| SEP-38 Quotes | `https://sep.coridor.fun/sep38` |

Interactive deposit/withdraw UI is served from **`api.coridor.fun`** (see [API](./api.md)), linked from SEP-24 responses.

---

## Implemented SEPs

| SEP | Status | Notes |
|-----|--------|-------|
| SEP-1 | ✅ | `stellar.toml` |
| SEP-10 | ✅ | Web authentication |
| SEP-12 | ✅ | KYC (auto-accept on staging) |
| SEP-24 | ✅ | Interactive deposit / withdraw |
| SEP-38 | ✅ | Rates via coridor-server `/rate` callback |
| SEP-6 / SEP-31 | Partial | Enabled for platform bean requirements |
| SEP-45 | ❌ | Disabled (Horizon observer for classic USDC) |

---

## Wallet checklist

1. Set home domain to **`sep.coridor.fun`**
2. Fetch and validate [stellar.toml](https://sep.coridor.fun/.well-known/stellar.toml)
3. Implement SEP-10 auth against `WEB_AUTH_ENDPOINT`
4. Implement SEP-24 deposit/withdraw for USDC (`GATALTGT...`)
5. Handle interactive URL redirect to `api.coridor.fun`

Reference: [Stellar Anchor Platform docs](https://developers.stellar.org/docs/platforms/anchor-platform)

---

## Related

- [Wallet integration overview](./index.md)
- [Public API](./api.md)
