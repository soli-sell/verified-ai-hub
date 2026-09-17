import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VerifiedAIHub - Enterprise AI Directory",
  description: "Directory of compliant and verified AI solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-sky-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
