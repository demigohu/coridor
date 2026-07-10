# Deposit — Pay IDR, receive USDC

Deposit through your wallet’s SEP-24 flow. Coridor opens an interactive popup to collect IDR via Xendit.

---

## Steps

1. In your wallet, choose **Deposit** for USDC (Coridor anchor)
2. Enter an **IDR** amount (**Rp 50,000+** recommended)
3. In the Coridor popup, pick a payment method:
   - **Virtual Account** — transfer to the VA number shown
   - **QRIS** — scan the QR with an e-wallet or mobile banking app
   - **E-Wallet (OVO)** — enter your phone number and confirm in the app
4. Complete payment
5. After the anchor confirms payment, **USDC is sent to your wallet**

---

## Fees

- Flat **Rp 5,000** + ~**0.5%** spread on the market rate
- See [Getting started — fees](./start.md#fees--limits-staging-defaults)

---

## Sandbox / test mode

When the anchor uses a Xendit **development** API key:

- VA and QRIS **cannot** be paid through real banks or e-wallets
- Use the **Simulate payment** button in the popup
- OVO push notifications often fail in sandbox — simulate or sandbox force-complete applies

---

## Payment methods

| Method | Channel |
|--------|---------|
| Virtual Account | BCA, BNI, Mandiri, BRI |
| QRIS | Scan QR (Payments API v3) |
| E-Wallet | OVO |

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Wallet won’t connect | Use HTTPS; home domain must match `sep.coridor.fun` in [stellar.toml](./developers/stellar.md) |
| Deposit stuck | Sandbox: click **Simulate**; production: confirm payment and Xendit webhook |
| Bad rate on small amount | Expected — flat Rp 5,000 fee dominates |

More: [FAQ](./faq.md)
