import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { PriceProvider } from "@/lib/PriceProvider";
import { PlaygroundProvider } from "@/lib/PlaygroundContext";

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
              <div className="flex flex-col bg-white text-foreground">
                <div className="flex flex-1">
                  <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-border bg-white">
                    <Sidebar />
                  </aside>
                  <main className="flex-1 min-h-screen overflow-x-hidden">
                    <div className="container mx-auto p-8 max-w-6xl">
                      {children}
                    </div>
                  </main>
                </div>
                <Footer />
              </div>
            </PlaygroundProvider>
          </PriceProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
