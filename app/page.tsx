"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { TokenMint } from "@/components/TokenMint";
import { TokenList } from "@/components/TokenList";
import { Grid2X2 as GridIcon, Info } from "lucide-react";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import { usePrices } from "@/lib/PriceProvider";
import { Tooltip } from "@/components/Tooltip";
import { DocBlock } from "@/components/DocBlock";

export default function Home() {
  const { tokens, connected } = useSolanaWallet();
  const { prices } = usePrices();

  const nativeSol = tokens.find(t => t.isNative || t.mint === "So11111111111111111111111111111111111111112");
  const totalBalanceUSD = nativeSol ? (nativeSol.balance * (prices[nativeSol.mint] || 0)) : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Search and Wallet  */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <img src="/SPLay-icon.svg" alt="SPLay Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage your Devnet assets and tokens.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="space-y-1">
            <h1 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Home</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold font-sans tracking-tight text-foreground">
                ${connected ? totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">USD (Live Price - Only Native SOL)</span>
            </div>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-border rounded-2xl bg-[#f4f7f9]/30 flex items-center justify-between shadow-sm">
              <div className="flex gap-5 items-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary shadow-inner">
                  <GridIcon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <Tooltip content="This is the estimated value of your Devnet assets based on live Mainnet prices. Since this is Devnet, this value is purely for simulation.">
                    <div className="text-[17px] font-extrabold text-foreground tracking-tight cursor-help border-b border-dotted border-muted-foreground/30 inline-block">Crypto Portfolio</div>
                  </Tooltip>
                  <div className="text-sm font-bold text-muted-foreground">
                    Balance ${connected ? totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-2xl bg-[#f4f7f9]/30 flex items-center justify-between shadow-sm">
              <div className="flex gap-5 items-center">
                <div className="p-4 bg-green-500/10 rounded-full text-green-600 shadow-inner">
                  <GridIcon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <Tooltip content="Solana Devnet is a playground for developers. It uses 'test SOL' which has no real-world value, allowing you to build and test without risk.">
                    <div className="text-[17px] font-extrabold text-foreground tracking-tight cursor-help border-b border-dotted border-muted-foreground/30 inline-block">Devnet Status</div>
                  </Tooltip>
                  <div className="text-sm font-bold text-muted-foreground">Active & Connected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Table */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Assets</h2>
            </div>
            <TokenList />
          </div>

          <DocBlock
            title="Understanding Solana Assets"
            description="Solana uses the SPL (Solana Program Library) standard for all fungible and non-fungible tokens. Unlike other blockchains where each token is a separate smart contract, Solana uses a single, highly optimized Token Program that manages 'Account' data to track balances and permissions."
            links={[
              { label: "Token Program Docs", href: "https://spl.solana.com/token" },
              { label: "Account Model Explained", href: "https://docs.solana.com/developing/programming-model/accounts" },
              { label: "Token-2022 Standard", href: "https://spl.solana.com/token-2022" }
            ]}
          />
        </div>

        {/* Right Sidebar Action Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="border border-border rounded-xl bg-white p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold mb-6 text-foreground text-center uppercase tracking-tighter">Mint New Token</h2>
            <div className="space-y-6">
              <TokenMint />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
