"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { Loader2, ExternalLink, Clock, ArrowUpRight, ArrowDownLeft, PlusCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefreshButton } from "@/components/RefreshButton";

export function TransactionHistory() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<ConfirmedSignatureInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
            setTransactions(signatures);
        } catch (e) {
            console.error("Failed to fetch transactions:", e);
        } finally {
            setLoading(false);
        }
    }, [publicKey, connection]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const getRelativeTime = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    useEffect(() => {
        if (connected) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
    }, [connected, fetchTransactions]);

    if (!connected) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 20 transactions</p>
                    </div>
                </div>
                <RefreshButton
                    onClick={fetchTransactions}
                    isLoading={loading}
                />
            </div>

            {loading && transactions.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-[#f4f7f9] animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-[2rem] bg-[#f4f7f9]/30">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                        <Clock className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">No recent transactions found on Devnet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.signature} className="p-4 flex items-center justify-between bg-white border border-border hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all group rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors",
                                    tx.err
                                        ? "bg-destructive/5 border-destructive/10 text-destructive"
                                        : "bg-green-500/5 border-green-500/10 text-green-600 group-hover:bg-primary/5 group-hover:border-primary/10 group-hover:text-primary"
                                )}>
                                    {tx.err ? (
                                        <ArrowUpRight className="w-6 h-6 rotate-45" />
                                    ) : (
                                        <PlusCircle className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground tracking-tight">
                                            {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(tx.signature)}
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {copied === tx.signature ? (
                                                <div className="text-[10px] font-bold text-green-600 uppercase">Copied</div>
                                            ) : (
                                                <RefreshCw className="w-3 h-3" />
                                            )}
                                        </button>
                                        <a
                                            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {tx.blockTime ? getRelativeTime(tx.blockTime) : 'Pending'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border",
                                    tx.err
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : "bg-green-500/10 text-green-600 border-green-500/20"
                                )}>
                                    {tx.err ? "Failed" : "Confirmed"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

