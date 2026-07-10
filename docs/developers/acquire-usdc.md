# Acquire USDC & XLM (testnet)

Before integrating, the wallet (or test account) needs **XLM for fees** and a **USDC Blend trustline** on Stellar testnet.

---

## Asset details (Coridor testnet)

| Field | Value |
|-------|--------|
| Asset code | `USDC` |
| Issuer | `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56` |
| Network | Test SDF Network ; September 2015 |
| Anchor home domain | `sep.coridor.fun` |

---

## Steps

### 1. Create or fund a testnet account

- [Stellar Laboratory — Account Creator](https://laboratory.stellar.org/#account-creator?network=test)
- Or create via [Demo Wallet](https://demo-wallet.stellar.org)

Send **XLM** to the account for transaction fees (withdraw sends USDC + needs ~0.001 XLM fee).

### 2. Add USDC trustline

Use Demo Wallet **Add asset**:

- Home domain: **`sep.coridor.fun`**
- Asset: **USDC** / issuer above

Or via Laboratory / CLI.

### 3. Get test USDC (optional)

For **withdraw** testing you need USDC in the wallet:

- Complete a **deposit** through Coridor (simulate in sandbox), or
- Receive USDC from another testnet wallet

There is no Coridor-specific faucet — use deposit flow or peer transfer.

---

## Verify anchor supports the asset

Fetch TOML and confirm USDC is listed:

```http
GET https://sep.coridor.fun/.well-known/stellar.toml
```

Wallet SDK:

```typescript
const anchor = wallet.anchor({ homeDomain: "sep.coridor.fun" });
const info = await anchor.getInfo();
const usdc = info.currencies.find((c) => c.code === "USDC");
```

---

## Next

[Authenticate with Coridor (SEP-10)](./authenticate.md)
