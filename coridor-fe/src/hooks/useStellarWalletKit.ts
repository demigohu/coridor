"use client";

import { useCallback, useEffect, useState } from "react";
import { KitEventType } from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE } from "@/lib/stellar";
import { initWalletsKit, StellarWalletsKit } from "@/lib/wallets-kit";

export function useStellarWalletKit() {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initWalletsKit();

    const unsubState = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      const next = event.payload.address ?? null;
      setAddress(next);
      setConnected(Boolean(next));
      setChecking(false);
    });

    const unsubDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      setAddress(null);
      setConnected(false);
      setChecking(false);
    });

    void StellarWalletsKit.getAddress()
      .then(({ address: addr }) => {
        setAddress(addr);
        setConnected(Boolean(addr));
      })
      .catch(() => {
        setAddress(null);
        setConnected(false);
      })
      .finally(() => setChecking(false));

    return () => {
      unsubState();
      unsubDisconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      initWalletsKit();
      const { address: addr } = await StellarWalletsKit.authModal();
      setAddress(addr);
      setConnected(true);
      return addr;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect Stellar wallet";
      setError(message);
      throw err;
    }
  }, []);

  const openProfile = useCallback(async () => {
    initWalletsKit();
    await StellarWalletsKit.profileModal();
  }, []);

  const signTransactionXdr = useCallback(
    async (unsignedXdr: string, publicKey: string): Promise<string> => {
      initWalletsKit();
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (!signedTxXdr) {
        throw new Error("Transaction signing cancelled");
      }
      return signedTxXdr;
    },
    [],
  );

  return {
    address,
    connected,
    checking,
    error,
    connect,
    openProfile,
    signTransactionXdr,
  };
}
