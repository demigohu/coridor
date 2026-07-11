"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const SCROLL_TARGETS = [
  { selector: ".cta-text > *", stagger: 0.12 },
  { selector: ".cta-button", y: 24 },
  { selector: ".cta-image", y: 40 },
];

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, SCROLL_TARGETS);

  return (
    <section ref={sectionRef} id="cta" className="bg-black px-5 pb-20 md:px-10 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between overflow-hidden rounded-md bg-[#0101FE] p-8 md:p-12 items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 self-stretch lg:max-w-xl">
            <div className="cta-text flex flex-col gap-4">
              <h2 className="text-left text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ready to bridge IDR to crypto?
              </h2>
              <p className="max-w-xl text-left text-base text-white md:text-lg">
                Start building with Corridor today. Integrate QRIS on-ramps and
                settle USDC to your users in minutes — not months.
              </p>
            </div>

            <div className="cta-button flex flex-wrap items-center gap-3">
              <Link
                href="https://coridor.gitbook.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-sm transition hover:bg-slate-200"
              >
                Start Integration
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="cta-image hidden shrink-0 items-end md:flex">
            <Image
              src="/images/img-1.svg"
              alt=""
              width={687}
              height={363}
              className="h-auto w-full max-w-[520px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
