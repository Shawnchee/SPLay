import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PriceProvider } from "@/lib/PriceProvider";
import { PlaygroundProvider } from "@/lib/PlaygroundContext";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPLay - Solana Devnet Playground",
  description: "Learn and experiment with SPL tokens safely on Solana devnet.",
  icons: {
    icon: "/SPLay-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-white selection:bg-primary/10`}
      >
        <SolanaProvider>
          <PriceProvider>
            <PlaygroundProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </PlaygroundProvider>
          </PriceProvider>
        </SolanaProvider>
        <Analytics />
      </body>
    </html>
  );
}
