"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { TokenMint } from "@/components/TokenMint";
import { TokenList } from "@/components/TokenList";
import { Search as SearchIcon, Bell as BellIcon, HelpCircle as HelpIcon, Grid2X2 as GridIcon } from "lucide-react";
import { useSolanaWallet } from "@/lib/useSolanaWallet";

export default function Home() {
  const { totalBalanceUSD, connected } = useSolanaWallet();

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Search and Wallet */}
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div className="flex-1 max-w-md relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search for an asset"
            className="w-full bg-[#f4f7f9] border-none rounded-full py-2.5 pl-11 pr-5 text-[15px] font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-[#f4f7f9] rounded-full transition-all">
            <BellIcon className="w-5 h-5" strokeWidth={2} />
          </button>
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-[#f4f7f9] rounded-full transition-all">
            <HelpIcon className="w-5 h-5" strokeWidth={2} />
          </button>
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-[#f4f7f9] rounded-full transition-all">
            <GridIcon className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="ml-4">
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="space-y-1">
            <h1 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Home</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold font-sans tracking-tight text-foreground">
                S${connected ? totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </span>
              <span className="text-sm font-bold text-muted-foreground">0% lately</span>
            </div>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-border rounded-2xl bg-white hover:bg-[#f4f7f9] transition-all cursor-pointer flex items-center justify-between group shadow-sm">
              <div className="flex gap-5 items-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary shadow-inner">
                  <GridIcon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[17px] font-extrabold text-foreground tracking-tight">Crypto</div>
                  <div className="text-sm font-bold text-muted-foreground">
                    Balance S${connected ? totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-2xl bg-white hover:bg-[#f4f7f9] transition-all cursor-pointer flex items-center justify-between group shadow-sm">
              <div className="flex gap-5 items-center">
                <div className="p-4 bg-green-500/10 rounded-full text-green-600 shadow-inner">
                  <GridIcon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[17px] font-extrabold text-foreground tracking-tight">Cash</div>
                  <div className="text-sm font-bold text-muted-foreground">Balance S$0.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Prices</h2>
              <button className="text-[13px] font-bold text-primary px-4 py-1.5 bg-primary/5 rounded-full hover:bg-primary/10 transition-all border border-primary/10">
                Watchlist
              </button>
            </div>
            <TokenList />
          </div>
        </div>

        {/* Right Sidebar Action Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="border border-border rounded-xl bg-white p-6 shadow-sm sticky top-8">
            <div className="flex gap-2 mb-6">
              <button className="flex-1 py-1 px-3 bg-[#f4f7f9] rounded-full text-sm font-bold border border-transparent transition-all">Buy</button>
              <button className="flex-1 py-1 px-3 text-sm font-bold text-muted-foreground hover:bg-[#f4f7f9] transition-all rounded-full">Sell</button>
              <button className="flex-1 py-1 px-3 text-sm font-bold text-muted-foreground hover:bg-[#f4f7f9] transition-all rounded-full">Convert</button>
            </div>

            <div className="space-y-6">
              <TokenMint />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
