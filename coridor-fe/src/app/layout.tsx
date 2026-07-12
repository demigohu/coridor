import type { Metadata } from "next";
import { Geist, Geist_Mono, Wallpoet, Inter, Michroma } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: "400",
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
});

const wallpoet = Wallpoet({
  variable: "--font-wallpoet",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Coridor — IDR ↔ USDC on Stellar",
  description:
    "Stellar anchor for Indonesia. IDR on-ramp and off-ramp via SEP-24 — virtual account, QRIS, and e-wallet. Settle USDC on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${wallpoet.variable} ${michroma.className} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
