"use client";

import { Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CoridorInteractiveModal } from "@/components/ramp/coridor-interactive-modal";
import { PageBackground } from "@/components/ramp/page-background";
import { useCoridorRamp, type RampKind } from "@/hooks/useCoridorRamp";
import { CORIDOR_USDC_ISSUER } from "@/lib/coridor/config";

const WALLETS_KIT_URL = "https://stellarwalletskit.dev";

interface RampDemoPageProps {
  kind: RampKind;
}

const COPY = {
  deposit: {
    title: "Buy",
    subtitle: "On-ramp local fiat to USDC on Stellar via Coridor.",
    action: "Buy with Coridor",
    success: "USDC credited to your wallet.",
    steps: [
      "Connect a Stellar wallet (Freighter, xBull, Lobstr, etc.) on testnet",
      "Add USDC trustline for sep.coridor.fun if you have not already",
      "Complete payment in the Coridor widget (VA, QRIS, or e-wallet)",
      "Sandbox: click Simulate after choosing a pay-in method",
    ],
  },
  withdraw: {
    title: "Sell",
    subtitle: "Off-ramp USDC to your local bank account via Coridor.",
    action: "Sell with Coridor",
    success: "IDR payout initiated to your bank.",
    steps: [
      "Connect a Stellar wallet with USDC balance on testnet",
      "Enter bank details in the Coridor widget",
      "Approve the USDC payment when your wallet prompts you",
    ],
  },
} as const;

function truncateKey(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function RampDemoPage({ kind }: RampDemoPageProps) {
  const copy = COPY[kind === "deposit" ? "deposit" : "withdraw"];
  const ramp = useCoridorRamp(kind);
  const [rateHint, setRateHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadRate() {
      try {
        const qs = new URLSearchParams({
          type: "indicative",
          sell_asset: "iso4217:IDR",
          buy_asset: `stellar:USDC:${CORIDOR_USDC_ISSUER}`,
          sell_amount: "100000",
        });
        const res = await fetch(`https://api.coridor.fun/rate?${qs.toString()}`);
        const json = (await res.json()) as {
          total_price?: string;
          price?: string;
        };
        if (!cancelled && json.total_price) {
          setRateHint(`Indicative: Rp100,000 ≈ ${Number(json.total_price).toFixed(2)} USDC`);
        } else if (!cancelled && json.price) {
          setRateHint(`Indicative rate: 1 USDC ≈ Rp${Number(json.price).toLocaleString("id-ID")}`);
        }
      } catch {
        /* optional */
      }
    }
    void loadRate();
    return () => {
      cancelled = true;
    };
  }, []);

  const widgetOpen = Boolean(ramp.interactiveUrl);

  const busy =
    ramp.step === "authenticating" ||
    ramp.step === "starting" ||
    ramp.step === "sending";

  const processingInBackground =
    !widgetOpen &&
    (ramp.step === "polling" || ramp.step === "sending");

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <PageBackground enabled={!widgetOpen} />

      <div
        className={`relative z-10 h-full overflow-y-auto overscroll-none px-5 pb-8 pt-28 text-white transition-opacity duration-200 md:px-10 ${
          widgetOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="mx-auto max-w-xl space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0101FE]">
              Demo · Stellar testnet
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{copy.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-base">
              {copy.subtitle}
            </p>
            {rateHint && <p className="mt-2 text-xs text-zinc-500">{rateHint}</p>}
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-black/40 p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-zinc-200">How this demo works</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-5 rounded-xl border border-zinc-800/80 bg-black/50 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Wallet</p>
                <p className="mt-1 font-mono text-sm text-zinc-200">
                  {ramp.walletChecking
                    ? "Checking wallet…"
                    : ramp.connected && ramp.address
                      ? truncateKey(ramp.address)
                      : "Not connected"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void ramp.connect()}
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-black/30 px-4 py-2 text-sm font-medium text-white transition hover:border-[#0101FE] hover:text-[#0101FE]"
                >
                  <Wallet className="size-4" />
                  {ramp.connected ? "Switch wallet" : "Connect wallet"}
                </button>
                {ramp.connected && (
                  <button
                    type="button"
                    onClick={() => void ramp.openProfile()}
                    className="rounded-md border border-zinc-700 bg-black/30 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500"
                  >
                    Account
                  </button>
                )}
              </div>
            </div>

            {ramp.walletError && (
              <p className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {ramp.walletError}. Supports Freighter, xBull, Lobstr, and more via{" "}
                <a
                  href={WALLETS_KIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Stellar Wallets Kit
                </a>
                .
              </p>
            )}

            {processingInBackground && (
              <div className="flex items-center gap-2 rounded-md border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-zinc-300">
                <Loader2 className="size-4 shrink-0 animate-spin text-[#0101FE]" />
                {ramp.step === "sending"
                  ? "Approve USDC payment in your wallet…"
                  : "Processing transaction… you can stay on this page."}
              </div>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => void ramp.startRamp()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0101FE] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {copy.action}
            </button>

            <p className="text-center text-xs text-zinc-500">
              Anchor: <span className="font-mono">{ramp.coridorDomain}</span>
            </p>

            {ramp.step === "completed" && ramp.transaction && (
              <div className="rounded-md border border-emerald-800/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                <p className="font-medium">Complete</p>
                <p className="mt-1 text-emerald-300/90">
                  {copy.success}{" "}
                  {ramp.transaction.amount_out || ramp.transaction.amount_in
                    ? `(${ramp.transaction.amount_out || ramp.transaction.amount_in})`
                    : ""}
                </p>
              </div>
            )}

            {ramp.step === "error" && ramp.error && (
              <div className="rounded-md border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {ramp.error}
              </div>
            )}

            {(ramp.step === "completed" || ramp.step === "error") && (
              <button
                type="button"
                onClick={ramp.reset}
                className="w-full rounded-md border border-zinc-700 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500"
              >
                Start over
              </button>
            )}
          </div>

          <p className="text-center text-xs text-zinc-600">
            Demo only — production apps integrate via{" "}
            <Link
              href="https://coridor.gitbook.io/"
              className="text-zinc-400 underline"
              target="_blank"
            >
              SEP-24
            </Link>
            . Use{" "}
            <span className="font-mono text-zinc-500">Test SDF Network</span> in your wallet.
          </p>
        </div>
      </div>

      {widgetOpen && ramp.interactiveUrl ? (
        <CoridorInteractiveModal
          open
          url={ramp.interactiveUrl}
          onClose={ramp.dismissInteractive}
        />
      ) : null}
    </main>
  );
}
