"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { Loader2, ExternalLink, Clock, RefreshCw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefreshButton } from "@/components/RefreshButton";
import { Tooltip } from "@/components/Tooltip";
import {
    getHeliusTransactions,
    categorizeTransaction,
    getTransactionDescription,
    getTransactionEmoji,
    type HeliusTransaction,
    type TransactionCategory,
} from "@/lib/helius";

type Transaction = HeliusTransaction | ConfirmedSignatureInfo;

export function TransactionHistory() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [useHelius, setUseHelius] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            // Try Helius first ( i love the free tier :) )
            if (process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
                try {
                    const heliusTxs = await getHeliusTransactions(publicKey.toBase58(), 20);
                    setTransactions(heliusTxs);
                    setUseHelius(true);
                    return;
                } catch (heliusError) {
                    console.warn("Helius unavailable, falling back to RPC:", heliusError);
                }
            }

            // Fallback to standard RPC
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
            setTransactions(signatures);
            setUseHelius(false);
        } catch (e) {
            console.error("Fetch error:", e);
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
                    {transactions.map((tx) => {
                        const isHelius = useHelius && "type" in tx;
                        const category: TransactionCategory = isHelius
                            ? categorizeTransaction((tx as HeliusTransaction).type)
                            : "other";
                        const emoji = getTransactionEmoji(category);
                        const description = isHelius
                            ? getTransactionDescription(tx as HeliusTransaction)
                            : "Transaction";

                        return (
                            <div
                                key={tx.signature}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-border hover:border-primary/20 hover:shadow-lg transition-all group rounded-2xl gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300 text-lg",
                                            (!isHelius && (tx as ConfirmedSignatureInfo).err) || (isHelius && (tx as HeliusTransaction).status === "failed")
                                                ? "bg-destructive/5 border-destructive/10 text-destructive"
                                                : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                        )}
                                    >
                                        {emoji}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Transaction Signature - unique ID that identifies this transaction on Solana">
                                                <span className="font-bold text-sm text-foreground tracking-tight cursor-help border-b border-dotted border-muted-foreground/30">
                                                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                                </span>
                                            </Tooltip>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(tx.signature);
                                                        setCopied(tx.signature);
                                                        setTimeout(() => setCopied(null), 2000);
                                                    }}
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
                                        <div className="flex flex-col gap-1 mt-0.5">
                                            {isHelius && (
                                                <p className="text-[11px] font-semibold text-foreground/70 line-clamp-1">
                                                    {description}
                                                </p>
                                            )}
                                            <Tooltip content={`Category: ${category}`}>
                                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider cursor-help">
                                                    {new Date(
                                                        (tx as any).blockTime
                                                            ? (tx as any).blockTime * 1000
                                                            : Date.now()
                                                    ).toLocaleDateString()}
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between sm:justify-end">
                                    <Tooltip
                                        content={
                                            (!isHelius && (tx as ConfirmedSignatureInfo).err) || (isHelius && (tx as HeliusTransaction).status === "failed")
                                                ? "This transaction failed to execute."
                                                : "Successfully included in a block and finalized by nodes."
                                        }
                                    >
                                        <div
                                            className={cn(
                                                "text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border cursor-help shadow-sm",
                                                (!isHelius && (tx as ConfirmedSignatureInfo).err) || (isHelius && (tx as HeliusTransaction).status === "failed")
                                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                                    : "bg-green-500/10 text-green-600 border-green-500/20"
                                            )}
                                        >
                                            {(!isHelius && (tx as ConfirmedSignatureInfo).err) || (isHelius && (tx as HeliusTransaction).status === "failed") ? "Failed" : "Success"}
                                        </div>
                                    </Tooltip>
                                    {isHelius && (
                                        <Tooltip content="Transaction fee in SOL">
                                            <span className="text-[10px] font-semibold text-muted-foreground">
                                                {((tx as HeliusTransaction).fee / 1e9).toFixed(5)} ◎
                                            </span>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
