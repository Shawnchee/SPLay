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

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
            setTransactions(signatures);
        } catch (e) {
            console.error("Failed to fetch transactions:", e);
        } finally {
            setLoading(false);
        }
    }, [publicKey, connection]);

    useEffect(() => {
        if (connected) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
    }, [connected, fetchTransactions]);

    if (!connected) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
                </div>
                <RefreshButton
                    onClick={fetchTransactions}
                    isLoading={loading}
                />
            </div>

            {loading && transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="animate-spin text-primary w-6 h-6" />
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Loading history...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-[#f4f7f9]/30">
                    <p className="text-sm font-bold text-muted-foreground">No recent transactions.</p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {transactions.map((tx) => (
                        <div key={tx.signature} className="py-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all group px-4 -mx-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm border border-border group-hover:border-primary/20",
                                    tx.err ? "text-destructive" : "text-primary"
                                )}>
                                    {tx.err ? (
                                        <div className="w-2 h-2 bg-destructive rounded-full" />
                                    ) : (
                                        <PlusCircle className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                        <a
                                            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-3 h-3 text-primary" />
                                        </a>
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block",
                                    tx.err ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
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
