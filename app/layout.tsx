import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AnalyticsProvider from "./components/Analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Verified AI Hub | Curated Medical & Life Sciences AI Directory",
  description: "Browse verified, HIPAA, SOC 2, and FDA-compliant AI solutions across healthcare and biotech.",
  keywords: ["Healthcare AI", "Medical AI Directory", "HIPAA Compliant AI", "FDA Cleared AI", "Biotech AI"],
  openGraph: {
    title: "Verified AI Hub | Medical & Life Sciences AI Directory",
    description: "Discover HIPAA, SOC 2, and FDA-compliant AI software for healthcare and life sciences.",
    url: "https://verifiedaihub.com",
    siteName: "Verified AI Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified AI Hub | Medical & Life Sciences AI Directory",
    description: "Browse verified, HIPAA, SOC 2, and FDA-compliant AI solutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
