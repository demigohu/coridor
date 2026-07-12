"use client";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";

let initialized = false;

export function initWalletsKit() {
  if (typeof window === "undefined" || initialized) return;
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
  });
  initialized = true;
}

export { StellarWalletsKit, Networks };
