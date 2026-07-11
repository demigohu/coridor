"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function CodePreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container) return;

    const floatTween = gsap.to(container, {
      y: -14,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const glowTween = glow
      ? gsap.to(glow, {
          opacity: 0.55,
          scale: 1.08,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      : null;

    return () => {
      floatTween.kill();
      glowTween?.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-full will-change-transform">
      <div
        ref={glowRef}
        className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-[80%] max-w-full -translate-x-1/2 rounded-full bg-[#0101FE]/30 blur-3xl opacity-80"
        aria-hidden
      />
      <div className="relative w-full min-w-0 rounded-md bg-[#171717] p-1.5 shadow-[0_0_40px_rgba(1,1,254,0.2),0_24px_64px_rgba(0,0,0,0.45)] sm:p-2">
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#0101FE]/60 to-transparent"
          aria-hidden
        />
        <div className="w-full min-w-0 overflow-hidden rounded-sm bg-[#0F172A] text-start">
          <div className="flex flex-col gap-2 border-b border-white/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#FF5F57]" />
              <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="size-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="truncate font-mono text-[10px] text-slate-400 sm:text-xs">
              SEP-24 · deposit
            </span>
          </div>
          <pre className="max-w-full overflow-x-auto p-3 font-mono text-[10px] leading-relaxed text-slate-300 sm:p-5 sm:text-[13px]">
            <code className="block min-w-max sm:min-w-0">
              <span className="text-violet-400">const</span>{" "}
              <span className="text-sky-300">{"{ url, id }"}</span>{" "}
              <span className="text-violet-400">=</span>{" "}
              <span className="text-violet-400">await</span> anchor
              .sep24().deposit({"{"}
              {"\n"}  authToken,{" "}
              <span className="text-sky-300">assetCode</span>:{" "}
              <span className="text-emerald-400">&quot;USDC&quot;</span>,
              {"\n"}  lang:{" "}
              <span className="text-emerald-400">&quot;en&quot;</span>,
              {"\n"}
              {"}"});
              {"\n"}
              <span className="text-slate-500">
                {"// Open url → user pays IDR (VA / QRIS / OVO)"}
              </span>
              {"\n"}
              <span className="text-slate-500">
                {"// Anchor sends USDC to G... wallet on completion"}
              </span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
