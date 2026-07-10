# Customer & bank info

How Coridor collects user data during deposit and withdraw flows.

---

## Overview

| Concern | Coridor |
|---------|---------|
| KYC | **SEP-12** on anchor (staging: auto-accept) |
| Withdraw destination | **Bank account** in interactive widget |
| Deposit | **IDR amount + payment method** in widget |

Wallets do **not** need to pass customer fields in the initial SEP-24 call for staging demos.

---

## Withdraw — bank details (interactive form)

Collected in the Coridor widget when the user submits:

| Field | Example |
|-------|---------|
| Bank name | `BCA` |
| Account number | `1234567890` |
| Account holder name | `John Doe` |

The wallet opens the interactive URL; **do not** duplicate this form in the wallet unless you have a custom integration.

---

## Deposit — payment method (interactive form)

| UI value | Rail |
|----------|------|
| Virtual Account (BCA/BNI/Mandiri/BRI) | Xendit VA |
| QRIS | Xendit Payments API v3 |
| E-Wallet (OVO) | Mobile number + push notification |

---

## SEP-12 KYC

Production wallets should expect SEP-12 flows per anchor config. On **staging**, KYC is simplified / auto-accepted — focus testing on SEP-24 + payments.

---

## Optional: mobile number for OVO

If building a custom client (not using Coridor widget), deposit e-wallet flows need `account_mobile_number` in Xendit channel properties — the default widget collects this.

---

## Next

[Close interactive flow](./close-interactive.md)
