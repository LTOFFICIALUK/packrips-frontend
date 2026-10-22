import type { Metadata } from "next";
import { Bricolage_Grotesque, Bungee, JetBrains_Mono } from "next/font/google";
import { Shell } from "@/components/shell";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const display = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const body = Bricolage_Grotesque({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-code" });

const description = "Every coin is a pack. Its fees buy real graded cards, and holders get drawn to pull them.";
const social = "/packrips-social-20261022.png?v=20261022";

export const metadata: Metadata = {
  metadataBase: new URL("https://packrips.fun"),
  title: { default: "Pack Rips · Every coin is a pack.", template: "%s · Pack Rips" },
  description,
  icons: { icon: "/mark-white.svg" },
  openGraph: {
    title: "Pack Rips",
    description,
    url: "https://packrips.fun",
    siteName: "Pack Rips",
    images: [{ url: social, width: 1200, height: 630, alt: "Pack Rips" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@packripsfun",
    title: "Pack Rips",
    description,
    images: [social],
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
    <body>
      <WalletProvider>
        <Shell ca={process.env.NEXT_PUBLIC_RIPS_CA || ""}>{children}</Shell>
      </WalletProvider>
    </body>
  </html>
);

export default RootLayout;
