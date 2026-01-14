"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { TokenActionModal } from "@/components/TokenActionModal";
import { Send, Settings } from "lucide-react";

interface TokenAccount {
    mint: string;
    balance: number;
    pubkey: string;
    decimals: number;
}

export function TokenList() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<TokenAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedToken, setSelectedToken] = useState<TokenAccount | null>(null);

    useEffect(() => {
        if (!publicKey) return;

        const fetchTokens = async () => {
            setLoading(true);
            try {
                const accounts = await connection.getParsedTokenAccountsByOwner(
                    publicKey,
                    { programId: TOKEN_PROGRAM_ID }
                );

                const parsedTokens = accounts.value.map((account) => {
                    const parsedInfo = account.account.data.parsed.info;
                    return {
                        mint: parsedInfo.mint,
                        balance: parsedInfo.tokenAmount.uiAmount,
                        decimals: parsedInfo.tokenAmount.decimals,
                        pubkey: account.pubkey.toBase58(),
                    };
                }).filter(t => t.balance > 0); // Only show tokens with balance

                setTokens(parsedTokens);
            } catch (error) {
                console.error("Error fetching tokens:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
        const interval = setInterval(fetchTokens, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, [publicKey, connection]);

    if (!publicKey) {
        return <div className="text-center py-10 text-muted-foreground">Please connect your wallet to view tokens.</div>;
    }

    if (loading && tokens.length === 0) {
        return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (tokens.length === 0) {
        return (
            <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No tokens found in this wallet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="grid grid-cols-1 divide-y">
                    {tokens.map((token) => (
                        <div key={token.pubkey} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm font-mono text-primary flex items-center gap-2">
                                    {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                                </span>
                                <span className="text-xs text-muted-foreground">Balance</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">
                                    {token.balance}
                                </span>
                                <button
                                    onClick={() => setSelectedToken(token)}
                                    className="p-2 hover:bg-background rounded-full transition-colors opacity-0 group-hover:opacity-100 border border-border"
                                    title="Actions"
                                >
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
