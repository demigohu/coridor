"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

export type ScrollRevealTarget = {
  selector: string;
  stagger?: number;
  y?: number;
  trigger?: string;
  start?: string;
};

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  targets: ScrollRevealTarget[],
) {
  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      for (const {
        selector,
        stagger = 0,
        y = 32,
        trigger,
        start = "top 85%",
      } of targets) {
        const elements = container.querySelectorAll(selector);
        if (!elements.length) continue;

        const triggerEl = trigger
          ? container.querySelector(trigger) ?? container
          : container;

        gsap.set(elements, { opacity: 0, y });

        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger,
          scrollTrigger: {
            trigger: triggerEl,
            start,
            once: true,
          },
        });
      }
    }, container);

    return () => ctx.revert();
  }, [ref, targets]);
}
