# Withdraw payout & more_info

Fiat completion for Coridor **withdraw** (USDC → IDR bank transfer).

---

## How withdraw completes

| | Coridor withdraw |
|---|------------------|
| User receives | **IDR bank transfer** |
| External ID | Xendit payout ID (internal) |
| User-facing status | Bank credit + **`more_info_url`** |

---

## When IDR is sent

After:

1. User sends USDC with correct **memo**  
2. Observer confirms on-chain payment  
3. coridor-server calls **Xendit payout** to the bank details from the widget  

SEP-24 status progresses toward **`completed`**.

---

## more_info_url

When the wallet redirects or the user opens transaction details:

```typescript
if (transaction.status === "pending_user_transfer_complete" ||
    transaction.status === "pending_anchor" ||
    transaction.status === "completed") {
  window.open(transaction.more_info_url);
}
```

Coridor `more_info` page (production):

```text
https://api.coridor.fun/sep24/transaction/more_info?token=<jwt>
```

Shows status, memo (withdraw), bank details, auto-refresh every 5 seconds.

---

## Deposit completion

Deposit completes when:

- IDR payment succeeds (Xendit webhook or sandbox simulate)  
- Anchor sends USDC to the user  

USDC appears in the wallet — no separate fiat reference step.

---

## external_transaction_id

If present on the SEP-24 transaction object, it may reference Xendit payment/payout IDs for support.

---

## Support debugging

```http
GET https://api.coridor.fun/health
```

Check `xendit_configured` and USDC inventory before large withdraw tests.

---

## Related

- [Poll status](./poll-status.md)
- [User withdraw guide](../withdraw.md)
