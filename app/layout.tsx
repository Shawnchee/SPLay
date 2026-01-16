import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Sidebar } from "@/components/Sidebar";
import { PriceProvider } from "@/lib/PriceProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPLay - Solana Devnet Playground",
  description: "Learn and experiment with SPL tokens safely on Solana devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white selection:bg-primary/10`}
      >
        <SolanaProvider>
          <PriceProvider>
            <div className="flex bg-white text-foreground">
              <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-border bg-white">
                <Sidebar />
              </aside>
              <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="container mx-auto p-8 max-w-6xl">
                  {children}
                </div>
              </main>
            </div>
          </PriceProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
