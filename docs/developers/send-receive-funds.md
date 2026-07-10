# Send or receive USDC on-chain

On-chain Stellar steps for Coridor deposit and withdraw.

---

## Withdraw — wallet **sends** USDC

When SEP-24 status is **`pending_user_transfer_start`**, the wallet submits a payment:

| From transaction object | Use |
|-------------------------|-----|
| `withdraw_anchor_account` | Destination |
| `withdraw_memo` | **Memo (ID)** — required |
| `amount_in` | USDC amount to send |

```typescript
onMessage: (transaction) => {
  if (transaction.status === "pending_user_transfer_start") {
    const tx = txBuilder
      .transferWithdrawalTransaction(transaction, usdcAsset)
      .build();
    tx.sign(userKeypair);
    await stellar.submitTransaction(tx);
  }
};
```

Distribution account (inventory): `GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS`

**User must approve** the transaction in the wallet (SEP-24 standard).

---

## Withdraw — what happens next

1. Horizon observer detects USDC payment + memo  
2. coridor-server triggers **Xendit IDR payout** to the bank account from the widget  
3. SEP-24 status → **`completed`**

IDR arrives via **bank transfer** to the account the user entered in the widget.

---

## Deposit — wallet **receives** USDC

The wallet does **not** send USDC for deposit.

1. User pays **IDR** in the Coridor widget (Xendit)  
2. Webhook / simulate completes deposit  
3. Anchor sends **USDC to the user’s Stellar account** (from distribution account)

Monitor the user account for incoming USDC or poll SEP-24 until **`completed`**.

---

## Memo & trustline

- User account must have **USDC trustline** to issuer `GATALTGT...`  
- Deposit: no memo required from user for the inbound USDC leg  
- Withdraw: **memo is mandatory** on the outbound USDC payment

---

## Error handling

Use Stellar SDK retry patterns for `tx_bad_seq` and 504 timeouts. See [Stellar error handling](https://developers.stellar.org/docs/learn/encyclopedia/errors-and-debugging/error-handling) and [Horizon result codes](https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors).

---

## Next

[Poll transaction status](./poll-status.md)
