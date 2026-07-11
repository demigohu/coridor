"use client";

import { Blocks, QrCode, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const STEPS: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Connect API",
    description:
      "Integrate our SDK. Users generate a unique QRIS code directly within your platform interface.",
    icon: Blocks,
  },
  {
    step: "02",
    title: "Local Payment",
    description:
      "Users pay via any Indonesian e-wallet or banking app by scanning the instant QRIS code.",
    icon: QrCode,
  },
  {
    step: "03",
    title: "Auto Settle",
    description:
      "Stablecoins are automatically dispatched to the user's on-chain wallet address in real-time.",
    icon: Wallet,
  },
];

const SCROLL_TARGETS = [
  { selector: ".hiw-header > *", stagger: 0.12 },
  { selector: ".hiw-card", stagger: 0.15, trigger: ".hiw-cards" },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, SCROLL_TARGETS);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="bg-black px-5 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="hiw-header mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            How Corridor Works
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Simple, secure, and compliant. Move funds in seconds.
          </p>
        </div>

        <div className="hiw-cards grid gap-6 md:grid-cols-3">
          {STEPS.map(({ step, title, description, icon: Icon }) => (
            <article
              key={step}
              className="hiw-card rounded-md border border-[#1A1A1A] bg-[#0F0F0F] p-8"
            >
              <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-white">
                <Icon className="size-5 text-[#0101FE]" strokeWidth={2} />
              </div>

              <p className="text-xs font-bold tracking-wider text-[#0101FE]">
                STEP {step}
              </p>

              <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
