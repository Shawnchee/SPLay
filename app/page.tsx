import { WalletConnect } from "@/components/WalletConnect";
import { TokenMint } from "@/components/TokenMint";
import { TokenList } from "@/components/TokenList";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Solana devnet assets and experiments.
          </p>
        </div>
        <WalletConnect />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Minting Column */}
        <div className="md:col-span-1 border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Mint New Token</h2>
          <TokenMint />
        </div>

        {/* Token List Column */}
        <div className="md:col-span-1 lg:col-span-2 border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Your Tokens</h2>
          <TokenList />
        </div>
      </div>
    </div>
  );
}
