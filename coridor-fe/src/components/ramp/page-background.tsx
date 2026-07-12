"use client";

import FaultyTerminal from "@/components/FaultyTerminal";

interface PageBackgroundProps {
  /** When false, WebGL is unmounted — use while checkout modal is open. */
  enabled?: boolean;
}

export function PageBackground({ enabled = true }: PageBackgroundProps) {
  if (!enabled) {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <FaultyTerminal
        scale={1.5}
        gridMul={[2, 1]}
        digitSize={1.2}
        timeScale={0.5}
        pause={false}
        scanlineIntensity={0.5}
        glitchAmount={1}
        flickerAmount={1}
        noiseAmp={1}
        chromaticAberration={0}
        dither={0}
        curvature={0.1}
        tint="#0101FE"
        mouseReact
        mouseStrength={0.5}
        pageLoadAnimation
        brightness={0.3}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
        dpr={undefined}
      />
    </div>
  );
}
