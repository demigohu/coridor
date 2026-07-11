"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FAQ_ITEMS = [
  {
    question: "What is Corridor?",
    answer:
      "Corridor is a developer-first fiat-to-crypto bridge for Indonesia. It lets your app accept IDR payments via QRIS and automatically settle USDC to a user's on-chain wallet through a single API integration.",
  },
  {
    question: "How fast are settlements?",
    answer:
      "Once a QRIS payment is confirmed, stablecoins are dispatched to the destination wallet in real-time. Most settlements complete within seconds, depending on network conditions.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "Corridor supports QRIS, which means users can pay with major Indonesian e-wallets and banking apps that display a QRIS code at checkout.",
  },
  {
    question: "Do I need a crypto license to integrate?",
    answer:
      "Corridor is built with compliance in mind and handles the regulated fiat on-ramp flow. Your integration requirements may vary based on your product and jurisdiction — contact us for guidance specific to your use case.",
  },
  {
    question: "Which stablecoins and chains are supported?",
    answer:
      "USDC settlement is supported out of the box, with wallet delivery to EVM-compatible addresses. Additional assets and networks can be discussed based on your integration needs.",
  },
  {
    question: "How do I get started?",
    answer:
      "Sign up for API access, grab your test keys from the dashboard, and follow our documentation to create your first QRIS charge. You can go from signup to a test payment in under an hour.",
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
            Everything you need to know about integrating Corridor.
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
