# FAQ

---

## General

### What is Coridor?

Coridor is a **Stellar anchor** for Indonesia: swap **IDR** (Rupiah) for **USDC** on Stellar and back, using local payments (VA, QRIS, e-wallet) via Xendit.

### Is this real money / production?

Hackathon/staging runs on **Stellar testnet** + **Xendit sandbox**. Not mainnet or real IDR unless a go-live is announced.

### Which wallets are supported?

Any wallet with **SEP-24** and home domain **`sep.coridor.fun`**. Easiest: [Stellar Demo Wallet](https://demo-wallet.stellar.org).

---

## Deposit

### Which payment methods are available?

Virtual Account (BCA, BNI, Mandiri, BRI), **QRIS**, and **OVO** (e-wallet).

### Why doesn’t the QR look like Xendit’s hosted page?

Coridor uses **embedded checkout** (Payments API v3): the QR is rendered in the Coridor widget, not on Xendit’s branded page. The QRIS payload is still valid for scanning in production.

### Why is there a “Simulate” button?

Only in **Xendit test mode**. Sandbox VA/QRIS cannot be paid via real banking apps. In production the button is hidden — real payment + webhook completes the flow.

### What are the fees?

Default: **Rp 5,000** flat + **~0.5%** spread on market USDC/IDR (CoinGecko).

---

## Withdraw

### Why did my USDC balance change after withdraw?

Standard **SEP-24**: after closing the popup, the wallet prepares an **on-chain USDC payment**. You must **Approve** in the wallet — it is not a silent auto-debit.

### What is the memo?

A transaction identifier so the anchor matches your USDC payment. It **must** match when you send USDC.

### How long until IDR hits my bank?

After USDC is detected on-chain, Coridor triggers Xendit payout. Timing varies in sandbox; production depends on the bank.

---

## Developers

### Where is stellar.toml?

`https://sep.coridor.fun/.well-known/stellar.toml`

See [Stellar & SEP](./developers/stellar.md).

### Public rate API for the docs site?

```http
GET https://api.coridor.fun/rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000
```

### Do I need an API key for `/rate` or `/health`?

No — these endpoints are public on staging.

---

## Security

### Does Coridor store my wallet seed?

No. Your wallet signs transactions. The anchor only holds a distribution account for USDC inventory.

### KYC data?

Staging: simplified / auto-accept KYC. Production: follow applicable SEP-12 policy.
