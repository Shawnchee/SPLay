import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Sidebar } from "@/components/Sidebar";
import { BackgroundGradient } from "@/components/BackgroundGradient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolPlay - Solana Devnet Playground",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          <div className="flex min-h-screen bg-background text-foreground relative">
            <BackgroundGradient />
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-8 max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </SolanaProvider>
      </body>
    </html>
  );
}
