import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Mono, Syne } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const body = Syne({ variable: "--font-body", subsets: ["latin"] });
const mono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

// Set NEXT_PUBLIC_SITE_URL to the final domain when it is connected to Perimystic.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theogportfolio.vercel.app";
const SITE_DESC =
  "Perimystic is a creative marketing agency for brands that want to be noticed. Social content, creator campaigns and brand launches with a little extra character.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PERIMYSTIC — Good brands make a scene.", template: "%s · PERIMYSTIC" },
  description: SITE_DESC,
  applicationName: "Perimystic",
  keywords: [
    "Perimystic", "creative marketing agency", "content studio", "creator marketing",
    "influencer campaigns", "social media", "brand launches", "India",
  ],
  authors: [{ name: "Perimystic" }],
  openGraph: {
    type: "website",
    siteName: "Perimystic",
    title: "PERIMYSTIC — Good brands make a scene.",
    description: SITE_DESC,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: "PERIMYSTIC", description: SITE_DESC },
};

export const viewport: Viewport = { themeColor: "#16225A" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
