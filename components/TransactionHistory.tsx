"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { Loader2, ExternalLink, Clock, RefreshCw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefreshButton } from "@/components/RefreshButton";
import { Tooltip } from "@/components/Tooltip";

interface SimplifiedTransaction extends ConfirmedSignatureInfo {
    // No extra fields needed for now
}

export function TransactionHistory() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<SimplifiedTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            // Only fetching signatures - single fast RPC call, prevents 429
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
            setTransactions(signatures);
        } catch (e) {
            console.error("Fetch error:", e);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">Recent Activity</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Direct Signature Feed</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton onClick={fetchTransactions} isLoading={loading} />
                </div>
            </div>

            {loading && transactions.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-[#f4f7f9] animate-pulse rounded-2xl border border-transparent" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-[2.5rem] bg-[#f4f7f9]/20">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                        <Clock className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">No transactions found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.signature} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-border hover:border-primary/20 hover:shadow-lg transition-all group rounded-2xl gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300",
                                    tx.err
                                        ? "bg-destructive/5 border-destructive/10 text-destructive"
                                        : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                )}>
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Tooltip content="The Transaction Signature is a unique ID (hash) that identifies this specific event on the Solana network.">
                                            <span className="font-bold text-sm text-foreground tracking-tight cursor-help border-b border-dotted border-muted-foreground/30">
                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                            </span>
                                        </Tooltip>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => copyToClipboard(tx.signature)}
                                                className="p-1 hover:bg-slate-100 rounded-md text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                            >
                                                {copied === tx.signature ? (
                                                    <div className="text-[10px] font-bold text-green-600 uppercase">Copied</div>
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                            <a
                                                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 hover:bg-slate-100 rounded-md text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {tx.blockTime ? getRelativeTime(tx.blockTime) : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <Tooltip content={tx.err ? "This transaction failed to execute." : "Successfully included in a block and finalized by nodes."}>
                                    <div className={cn(
                                        "text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border cursor-help shadow-sm",
                                        tx.err
                                            ? "bg-destructive/10 text-destructive border-destructive/20"
                                            : "bg-green-500/10 text-green-600 border-green-500/20"
                                    )}>
                                        {tx.err ? "Failed" : "Confirmed"}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
