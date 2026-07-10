# Integrate Coridor (IDR ↔ USDC)

Coridor enables wallets to **on-ramp** (IDR → USDC) and **off-ramp** (USDC → IDR) on Stellar testnet using standard SEPs, with **Indonesian local payments** (VA, QRIS, e-wallet) via Xendit.

---

## Who this is for

- Stellar wallet teams adding IDR on/off-ramp for Indonesia
- Integrators using SEP-10 + SEP-24 (no proprietary Coridor SDK)

Non-Stellar wallets need a bridge to Stellar USDC first (out of scope here).

---

## Integration overview

| Step | What happens |
|------|----------------|
| Onboard | Use public anchor at `sep.coridor.fun` |
| Acquire USDC | Testnet trustline + Demo Wallet / deposit flow |
| Auth | SEP-10 to **`sep.coridor.fun`** |
| Initiate | SEP-24 → **Coridor interactive widget** (`api.coridor.fun`) |
| Customer info | SEP-12 KYC (auto-accept on staging); bank details in widget for withdraw |
| Close UI | Close popup at **`pending_user_transfer_start`** (withdraw); deposit stays until paid |
| On-chain | **Withdraw:** wallet sends USDC. **Deposit:** anchor sends USDC after IDR paid |
| Status | Poll anchor SEP-24 |
| Fiat completion | **Bank transfer IDR** (Xendit payout); `more_info_url` for status |

---

## Integration path (Stellar wallet)

1. [Acquire USDC & trustline](./acquire-usdc.md)
2. [Authenticate (SEP-10)](./authenticate.md)
3. [Initiate transaction (SEP-24)](./initiate-transaction.md)
4. [Customer / bank info](./customer-info.md)
5. [Close interactive flow](./close-interactive.md)
6. [Send or receive USDC on-chain](./send-receive-funds.md)
7. [Poll transaction status](./poll-status.md)
8. [Withdraw payout & more_info](./payout-status.md)

Reference: [stellar.toml & SEP](./stellar.md) · [HTTP API](./api.md)

---

## Production endpoints

| Resource | URL |
|----------|-----|
| Home domain | `sep.coridor.fun` |
| stellar.toml | `https://sep.coridor.fun/.well-known/stellar.toml` |
| SEP-10 | `https://sep.coridor.fun/auth` |
| SEP-24 | `https://sep.coridor.fun/sep24` |
| Interactive widget | `https://api.coridor.fun/sep24/interactive?token=...` |

---

## Transaction flow overview

```
1. SEP-10 authenticate
2. SEP-24 deposit or withdraw → receive interactive URL + transaction id
3. Open interactive URL (popup / webview)
4. User completes widget (pay IDR or enter bank details)
5. Close popup when pending_user_transfer_start (withdraw only)
6. Withdraw: wallet sends USDC with memo | Deposit: wait for anchor to send USDC
7. Poll SEP-24 until completed / error
```

---

## Sandbox (testnet)

- Network: **Test SDF Network**
- USDC issuer: `GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56`
- Xendit: development key → VA/QRIS use **Simulate** in widget
- Easiest wallet: [Stellar Demo Wallet](https://demo-wallet.stellar.org) with home domain `sep.coridor.fun`

---

## SDK

Use the [Stellar TypeScript Wallet SDK](https://developers.stellar.org/docs/build/apps/wallet/intro):

```bash
yarn add @stellar/typescript-wallet-sdk
```

---

## Resources

- [Stellar SEP-1 (TOML)](https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals)
- [SEP-10](https://developers.stellar.org/docs/build/apps/wallet/sep10)
- [SEP-24](https://developers.stellar.org/docs/build/apps/wallet/sep24)
- [Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform)
- Coridor user flows: [deposit](../deposit.md) · [withdraw](../withdraw.md)
