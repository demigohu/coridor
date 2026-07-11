"use client";

import CodePreview from "@/components/code-preview";
import { Braces } from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [".hero-title", ".hero-description", ".hero-cta", ".hero-code"],
        { opacity: 0, y: 32 },
      );

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(".hero-title", { opacity: 1, y: 0, duration: 0.9 })
        .to(".hero-description", { opacity: 1, y: 0, duration: 0.75 }, "-=0.5")
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.65 }, "-=0.45")
        .to(".hero-code", { opacity: 1, y: 0, duration: 0.85 }, "-=0.35");
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen w-full min-w-0 items-center justify-center overflow-x-hidden px-4 py-28 sm:px-5 sm:py-32 md:items-center md:py-20"
    >
      <div className="mx-auto w-full min-w-0 max-w-5xl text-center">
        <h1 className="hero-title text-[1.75rem] font-bold leading-[1.15] tracking-tight text-zinc-100 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          The Instant{" "}
          <span className="font-michroma text-[#0101FE]">Fiat-to-Crypto</span>{" "}
          Bridge for Indonesia
        </h1>

        <p className="hero-description mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mt-6 sm:text-base md:text-lg">
          Developer-first infrastructure for IDR to USDC on-ramps via QRIS.
          Seamlessly integrate compliant fiat rails into your Web3 application
          with a single API call.
        </p>

        <div className="hero-cta mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          <Link
            href="https://coridor.gitbook.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-slate-200"
          >
            <Braces className="size-4" aria-hidden />
            Read API Docs
          </Link>
        </div>

        <div className="hero-code mx-auto mt-6 w-full min-w-0 max-w-full sm:mt-8 sm:max-w-xl">
          <CodePreview />
        </div>
      </div>
      <div id="hero-end" className="absolute bottom-0 h-px w-full" aria-hidden />
    </div>
  );
}
