"use client";

import Marquee from "react-fast-marquee";
import FaultyTerminal from "../components/FaultyTerminal";
import HeroSection from "@/components/hero-section";
import HowItWorksSection from "@/components/how-it-works-section";
import FaqSection from "@/components/faq-section";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black">
      <section id="hero" className="relative mx-auto min-h-screen overflow-x-hidden">
        <div className="absolute inset-0">
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
            style={{ width: "100%", height: "100%" }} dpr={undefined}          />
        </div>

        <HeroSection />
      </section>

      <section id="marquee" className="p-10 space-y-8">
        <h1 className="text-3xl font-semibold text-white text-center">Powered By</h1>
        <Marquee className="gap-10" gradient={true} gradientColor="#000000" gradientWidth={100} pauseOnHover={true}>
          <div className="mx-8 mt-3">
            <Image src="/logo/stellar-logo.svg" alt="Stellar" className="w-[150px] object-cover brightness-0 invert" width={1200} height={334} />
          </div>
          <div className="mx-8">
            <Image src="/logo/xendit-logo.svg" alt="Xendit" className="w-[150px] object-cover mt-3" width={1062} height={164} />
          </div>
          <div className="mx-8">
            <Image src="/logo/qris-logo.svg" alt="Qris" className="w-[150px] object-cover mt-3 brightness-0 invert" width={1062} height={164} />
          </div>
          <div className="mx-8 mt-3">
            <Image src="/logo/stellar-logo.svg" alt="Stellar" className="w-[150px] object-cover brightness-0 invert" width={1200} height={334} />
          </div>
          <div className="mx-8">
            <Image src="/logo/xendit-logo.svg" alt="Xendit" className="w-[150px] object-cover mt-3" width={1062} height={164} />
          </div>
          <div className="mx-8">
            <Image src="/logo/qris-logo.svg" alt="Qris" className="w-[150px] object-cover mt-3 brightness-0 invert" width={1062} height={164} />
          </div><div className="mx-8 mt-3">
            <Image src="/logo/stellar-logo.svg" alt="Stellar" className="w-[150px] object-cover brightness-0 invert" width={1200} height={334} />
          </div>
          <div className="mx-8">
            <Image src="/logo/xendit-logo.svg" alt="Xendit" className="w-[150px] object-cover mt-3" width={1062} height={164} />
          </div>
          <div className="mx-8">
            <Image src="/logo/qris-logo.svg" alt="Qris" className="w-[150px] object-cover mt-3 brightness-0 invert" width={1062} height={164} />
          </div>
          <div className="mx-8 mt-3">
            <Image src="/logo/stellar-logo.svg" alt="Stellar" className="w-[150px] object-cover brightness-0 invert" width={1200} height={334} />
          </div>
          <div className="mx-8">
            <Image src="/logo/xendit-logo.svg" alt="Xendit" className="w-[150px] object-cover mt-3" width={1062} height={164} />
          </div>
          <div className="mx-8">
            <Image src="/logo/qris-logo.svg" alt="Qris" className="w-[150px] object-cover mt-3 brightness-0 invert" width={1062} height={164} />
          </div>
        </Marquee>
      </section>

      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
