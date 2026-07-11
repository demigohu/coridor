"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FAQ_ITEMS = [
  {
    question: "What is Coridor?",
    answer:
      "Coridor is a Stellar anchor for Indonesia. Wallets connect via SEP-10 and SEP-24 to move value between IDR (Rupiah) and USDC on Stellar, using local payments through Xendit.",
  },
  {
    question: "How do I integrate as a developer?",
    answer:
      "Use standard Stellar wallet flows: SEP-10 auth against sep.coridor.fun, then SEP-24 deposit or withdraw. Open the interactive URL from the SEP-24 response — users complete payment in the Coridor widget. See our documentation for step-by-step guides.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "Deposits: virtual account (BCA, BNI, Mandiri, BRI), QRIS, and OVO e-wallet. Withdrawals: IDR bank transfer to the account the user enters in the widget.",
  },
  {
    question: "Which wallets and network?",
    answer:
      "Any SEP-24 compatible Stellar wallet with home domain sep.coridor.fun. Staging runs on Stellar testnet. The fastest way to try it is the Stellar Demo Wallet.",
  },
  {
    question: "What are the fees?",
    answer:
      "Default staging rates: Rp 5,000 flat fee plus approximately 0.5% spread over the market USDC/IDR rate. Use Rp 50,000 or more for deposits to avoid the flat fee dominating small amounts.",
  },
  {
    question: "Is this production / real money?",
    answer:
      "Current public staging uses Stellar testnet and Xendit sandbox. VA and QRIS in sandbox are completed with the Simulate button in the widget — not real bank transfers until go-live.",
  },
];

const SCROLL_TARGETS = [
  { selector: ".faq-header > *", stagger: 0.12 },
  { selector: ".faq-item", stagger: 0.08, trigger: ".faq-list" },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, SCROLL_TARGETS);

  return (
    <section ref={sectionRef} id="faq" className="bg-black px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="faq-header mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Everything you need to know about Coridor.
          </p>
        </div>

        <div className="faq-list space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="faq-item overflow-hidden rounded-md border border-[#1A1A1A] bg-[#0F0F0F]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-semibold text-white">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[#0101FE] transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-all duration-200 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
