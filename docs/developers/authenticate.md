# Authenticate with Coridor (SEP-10)

Authenticate the user with Coridor using **SEP-10** against Coridor’s home domain.

---

## Required information

1. User’s Stellar **account public key** (non-custodial) or your custodial auth pattern
2. Coridor **WEB_AUTH_ENDPOINT** from [stellar.toml](./stellar.md):  
   `https://sep.coridor.fun/auth`
3. Coridor **SIGNING_KEY** from TOML (to verify the challenge)
4. Network passphrase: `Test SDF Network ; September 2015` (testnet)

---

## Non-custodial wallet (typical)

Pass the **user’s keypair** and Coridor **home domain**:

```typescript
import { Wallet } from "@stellar/typescript-wallet-sdk";

const wallet = Wallet.TestNet();
const anchor = wallet.anchor({ homeDomain: "sep.coridor.fun" });
const sep10 = await anchor.sep10();
const authToken = await sep10.authenticate({ clientDomain: "sep.coridor.fun" });
// authToken is a JWT string for SEP-24 calls
```

**Important:** `SEP10_HOME_DOMAINS` on the anchor must include `sep.coridor.fun` (production).

---

## Custodial wallet

If you use a shared Stellar account with per-user **memo**:

- Follow SEP-10 with memo as required by your architecture
- Coridor staging is optimized for **non-custodial** Demo Wallet flows

See [Stellar SEP-10 documentation](https://developers.stellar.org/docs/build/apps/wallet/sep10) for custodial vs non-custodial patterns.

---

## Local development

| Environment | Home domain |
|-------------|-------------|
| Production | `sep.coridor.fun` |
| Local | `localhost:8082` (HTTP only for dev) |

---

## Next

[Initiate transaction (SEP-24)](./initiate-transaction.md)
