import { WalletConnect } from "@/components/WalletConnect";
import { TokenMint } from "@/components/TokenMint";
import { TokenList } from "@/components/TokenList";
import { Search, Bell, HelpCircle, Grid2X2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header with Search and Wallet */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for an asset"
            className="w-full bg-[#f4f7f9] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-all">
            <Grid2X2 className="w-5 h-5" />
          </button>
          <WalletConnect />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="space-y-1">
            <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Home</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-sans tracking-tight">S$1.90</span>
              <span className="text-sm font-semibold text-muted-foreground">0% lately</span>
            </div>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-border rounded-xl bg-white hover:bg-[#f4f7f9] transition-all cursor-pointer flex items-center justify-between group">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Grid2X2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Crypto</div>
                  <div className="text-sm text-muted-foreground">Balance S$1.90</div>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-xl bg-white hover:bg-[#f4f7f9] transition-all cursor-pointer flex items-center justify-between group">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-green-500/10 rounded-full text-green-600">
                  <Grid2X2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Cash</div>
                  <div className="text-sm text-muted-foreground">Balance S$0.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Prices</h2>
              <button className="text-sm font-semibold text-primary px-3 py-1 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all">
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
