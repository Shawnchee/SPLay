"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { TokenActionModal } from "@/components/TokenActionModal";
import { cn } from "@/lib/utils";
import { Send, Settings, RefreshCw } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";

import { useSolanaWallet } from "@/lib/useSolanaWallet";

export function TokenList() {
    const { tokens, loading, refreshing, refresh, refreshSilent, connected, publicKey } = useSolanaWallet();
    const { connection } = useConnection();
    const [selectedToken, setSelectedToken] = useState<any | null>(null);

    if (!connected) {
        return <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl font-medium">Please connect your wallet to view assets.</div>;
    }

    if (loading && tokens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading assets...</p>
            </div>
        );
    }

    if (tokens.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-[#f4f7f9]/30">
                <div className="max-w-xs mx-auto space-y-4">
                    <p className="text-sm font-bold text-muted-foreground">No assets found on Devnet.</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        You're currently connected to <span className="text-primary font-bold">Solana Devnet</span>. Assets from Mainnet will not appear here.
                    </p>
                    <RefreshButton
                        onClick={() => refresh()}
                        isLoading={refreshing}
                        label="Refresh Account"
                        variant="text"
                        className="w-full justify-center py-2.5"
                    />
                    <button
                        onClick={async () => {
                            if (!publicKey) return;
                            try {
                                const tx = await connection.requestAirdrop(publicKey, 2 * 1e9);
                                await connection.confirmTransaction(tx);
                                refresh();
                            } catch (e) {
                                alert("Airdrop failed. Please try again in a minute.");
                            }
                        }}
                        className="w-full py-2.5 border border-primary/20 text-primary text-[13px] font-bold rounded-full hover:bg-primary/5 transition-all"
                    >
                        Request Devnet SOL
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Showing {tokens.length} Assets
                </div>
                <RefreshButton
                    onClick={() => refreshSilent()}
                    isLoading={refreshing}
                    variant="icon"
                />
            </div>

            <div className="divide-y divide-border">
                {tokens.map((token) => (
                    <div
                        key={token.pubkey}
                        className="py-5 flex items-center justify-between hover:bg-[#f4f7f9] transition-all group px-4 -mx-4 rounded-xl cursor-pointer"
                        onClick={() => !token.isNative && setSelectedToken(token)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm",
                                token.isNative ? "bg-black text-white" : "bg-primary/10 text-primary"
                            )}>
                                {token.isNative ? "SOL" : (token.mint?.slice(0, 1).toUpperCase() || "T")}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[15px] text-foreground tracking-tight">
                                    {token.isNative ? "Solana" : `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`}
                                </span>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {token.isNative ? "Native Token" : `${token.decimals} Decimals`}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="hidden md:block text-right">
                                <div className="font-extrabold text-[15px] text-foreground">
                                    {token.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {token.isNative ? "SOL" : "Units"}
                                </div>
                                <div className="text-[11px] font-bold text-green-600 uppercase tracking-wide">
                                    Available
                                </div>
                            </div>
                            {!token.isNative && (
                                <button className="px-5 py-2 bg-primary/5 text-primary text-[13px] font-bold rounded-lg hover:bg-primary/20 cursor-pointer transition-all opacity-80 group-hover:opacity-100 shadow-sm border border-primary/10">
                                    Manage
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedToken && (
                <TokenActionModal
                    isOpen={!!selectedToken}
                    onClose={() => setSelectedToken(null)}
                    tokenMint={selectedToken.mint}
                    tokenBalance={selectedToken.balance}
                    tokenDecimals={selectedToken.decimals}
                />
            )}
        </>
    );
}
