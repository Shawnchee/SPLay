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
            <div className="divide-y divide-border">
                {tokens.map((token) => (
                    <div key={token.pubkey} className="py-5 flex items-center justify-between hover:bg-[#f4f7f9] transition-all group px-4 -mx-4 rounded-xl cursor-pointer" onClick={() => setSelectedToken(token)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-extrabold text-sm">
                                {token.mint.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[15px] text-foreground tracking-tight">{token.mint.slice(0, 4)}...{token.mint.slice(-4)}</span>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{token.decimals} Decimals</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="hidden md:block text-right">
                                <div className="font-extrabold text-[15px] text-foreground">S${(token.balance * 1.0).toLocaleString()}</div>
                                <div className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Devnet Asset</div>
                            </div>
                            <button className="px-5 py-2 bg-primary/5 text-primary text-[13px] font-bold rounded-lg hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-primary/10">
                                Manage
                            </button>
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
