import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Mono, Syne } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Syne({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://studio-snag.com";
const SITE_DESC =
  "SNAG is a culture-led creative & content studio in Gurgaon — building creator systems, campaigns, and brand momentum. We don't just make content. We make people care.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SNAG™ — We make people care.",
    template: "%s · SNAG™",
  },
  description: SITE_DESC,
  applicationName: "SNAG",
  keywords: [
    "creative agency", "content studio", "creator marketing", "influencer marketing",
    "social media", "branding", "Gurgaon", "SNAG",
  ],
  authors: [{ name: "SNAG" }],
  openGraph: {
    type: "website",
    siteName: "SNAG™",
    title: "SNAG™ — We make people care.",
    description: SITE_DESC,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SNAG™ — We make people care.",
    description: SITE_DESC,
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
