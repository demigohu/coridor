"use client";

import { useCallback, useRef, useState } from "react";
import { getSep10Token } from "@/lib/coridor/sep10";
import {
  getSep24Info,
  getSep24Transaction,
  initiateSep24Interactive,
  submitWithdrawPayment,
} from "@/lib/coridor/sep24";
import { getCoridorDomain } from "@/lib/coridor/config";
import type { Sep24Transaction } from "@/lib/coridor/types";
import { useStellarWalletKit } from "./useStellarWalletKit";

export type RampKind = "deposit" | "withdraw";

export type RampStep =
  | "idle"
  | "authenticating"
  | "starting"
  | "interactive"
  | "polling"
  | "sending"
  | "completed"
  | "error";

function isWithdrawReady(tx: Sep24Transaction) {
  return tx.status === "pending_user_transfer_complete" || tx.status === "completed";
}

export function useCoridorRamp(kind: RampKind) {
  const wallet = useStellarWalletKit();
  const { address, connected, connect, signTransactionXdr, checking, error: walletError } =
    wallet;

  const [step, setStep] = useState<RampStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [interactiveUrl, setInteractiveUrl] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const withdrawSubmittedRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollTransaction = useCallback(
    async (txId: string, token: string) => {
      const domain = getCoridorDomain();
      const tx = await getSep24Transaction({
        coridorDomain: domain,
        authToken: token,
        transactionId: txId,
      });
      setTransaction((prev) => {
        if (prev?.id === tx.id && prev?.status === tx.status && prev?.amount_out === tx.amount_out) {
          return prev;
        }
        return tx;
      });

      if (tx.status === "error" || tx.status === "expired") {
        stopPolling();
        setStep("error");
        setError(tx.message || `Transaction ${tx.status}`);
        setInteractiveUrl(null);
        return;
      }

      if (kind === "withdraw" && tx.status === "pending_user_transfer_start") {
        if (withdrawSubmittedRef.current === tx.id) return;
        if (!address) {
          setStep("error");
          setError("Wallet not connected");
          return;
        }

        withdrawSubmittedRef.current = tx.id;
        stopPolling();
        setStep("sending");
        setInteractiveUrl(null);

        try {
          await submitWithdrawPayment({
            userPublicKey: address,
            transaction: tx,
            signTransactionXdr,
          });
          setStep("polling");
          pollTimerRef.current = setInterval(() => {
            void pollTransaction(txId, token);
          }, 3000);
          void pollTransaction(txId, token);
        } catch (sendErr) {
          withdrawSubmittedRef.current = null;
          setStep("error");
          setError(sendErr instanceof Error ? sendErr.message : "Withdraw payment failed");
        }
        return;
      }

      if (kind === "withdraw" && isWithdrawReady(tx)) {
        stopPolling();
        setStep("completed");
        setInteractiveUrl(null);
        return;
      }

      if (kind === "deposit" && tx.status === "completed") {
        stopPolling();
        setStep("completed");
        setInteractiveUrl(null);
      }
    },
    [address, kind, signTransactionXdr, stopPolling],
  );

  const startRamp = useCallback(async () => {
    setError(null);
    setTransaction(null);
    stopPolling();
    withdrawSubmittedRef.current = null;

    let publicKey = address;
    if (!connected || !publicKey) {
      publicKey = await connect();
    }
    if (!publicKey) {
      setError("Connect a Stellar wallet to continue");
      return;
    }

    try {
      setStep("authenticating");
      const domain = getCoridorDomain();
      await getSep24Info(domain);

      const token = await getSep10Token({
        coridorDomain: domain,
        userPublicKey: publicKey,
        signTransactionXdr,
      });

      setStep("starting");
      const interactive = await initiateSep24Interactive({
        coridorDomain: domain,
        authToken: token,
        kind: kind === "deposit" ? "deposit" : "withdraw",
        account: publicKey,
      });

      setInteractiveUrl(interactive.url);
      setStep("interactive");

      pollTimerRef.current = setInterval(() => {
        void pollTransaction(interactive.id, token);
      }, 4000);
      void pollTransaction(interactive.id, token);
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Coridor ramp failed");
      stopPolling();
    }
  }, [address, connected, connect, kind, pollTransaction, signTransactionXdr, stopPolling]);

  const dismissInteractive = useCallback(() => {
    setInteractiveUrl(null);
    if (step === "interactive") {
      setStep("polling");
    }
  }, [step]);

  const reset = useCallback(() => {
    stopPolling();
    setStep("idle");
    setError(null);
    setInteractiveUrl(null);
    setTransaction(null);
    withdrawSubmittedRef.current = null;
  }, [stopPolling]);

  return {
    step,
    error,
    interactiveUrl,
    transaction,
    startRamp,
    reset,
    dismissInteractive,
    coridorDomain: getCoridorDomain(),
    address,
    connected,
    connect,
    openProfile: wallet.openProfile,
    walletChecking: checking,
    walletError,
  };
}
