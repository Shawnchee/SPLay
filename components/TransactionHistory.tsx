"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from "@solana/web3.js";
import { Loader2, ExternalLink, Clock, ArrowUpRight, ArrowDownLeft, PlusCircle, RefreshCw, Copy, Send, Zap, Award, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefreshButton } from "@/components/RefreshButton";

type TransactionCategory = 'all' | 'transfer' | 'mint' | 'defi' | 'interaction';

interface CategorizedTransaction extends ConfirmedSignatureInfo {
    category: TransactionCategory;
    details?: string;
}

export function TransactionHistory() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<CategorizedTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<TransactionCategory>('all');
    const [copied, setCopied] = useState<string | null>(null);

    const categories = [
        { id: 'all', name: 'All', icon: Layers },
        { id: 'transfer', name: 'Transfers', icon: Send },
        { id: 'mint', name: 'Mints', icon: PlusCircle },
        { id: 'defi', name: 'DeFi', icon: Zap },
        { id: 'interaction', name: 'Others', icon: ArrowUpRight },
    ] as const;

    const categorizeTx = (tx: ParsedTransactionWithMeta | null): { category: TransactionCategory, details: string } => {
        if (!tx) return { category: 'interaction', details: 'Unknown Interaction' };

        const instructions = tx.transaction.message.instructions;
        const mainInstruction = instructions[0] as any;
        const programId = mainInstruction.programId?.toString();

        // System Programs
        const SYSTEM_PROGRAMS = [
            '11111111111111111111111111111111', // System Program
            'TokenkegQfeZyiNwAJbVnNoY13Go7pS9X768', // SPL Token Program
            'TokenzQdBNZ9314xeMsSAt59R8Y6XPrL2Rk1zZ9X', // SPL Token 2022 Program
            'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' // Associated Token Account Program
        ];

        // Specific Parsed Types
        if (mainInstruction.parsed?.type === 'transfer' || mainInstruction.parsed?.type === 'transferChecked') {
            return { category: 'transfer', details: 'Token Transfer' };
        }
        if (mainInstruction.parsed?.type === 'mintTo' || mainInstruction.parsed?.type === 'initializeMint') {
            return { category: 'mint', details: 'Token Mint' };
        }

        // If it's not a known system program, it's likely a DeFi/Contract interaction
        if (!SYSTEM_PROGRAMS.includes(programId)) {
            // Check for common names in parsed instructions if available
            const type = mainInstruction.parsed?.type || 'Contract Call';
            return { category: 'defi', details: type.charAt(0).toUpperCase() + type.slice(1) };
        }

        // Generic Interaction
        return { category: 'interaction', details: mainInstruction.parsed?.type || 'Interaction' };
    };

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });

            // Try to get parsed data for each signature to categorize
            const parsedTxs = await connection.getParsedTransactions(
                signatures.map(s => s.signature),
                { maxSupportedTransactionVersion: 0 }
            );

            const categorized = signatures.map((sig, i) => {
                const parsed = parsedTxs[i];
                const { category, details } = categorizeTx(parsed);
                return {
                    ...sig,
                    category,
                    details: sig.err ? 'Failed Transaction' : details
                };
            });

            setTransactions(categorized);
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

    const getCategoryIcon = (category: TransactionCategory) => {
        switch (category) {
            case 'transfer': return Send;
            case 'mint': return PlusCircle;
            case 'defi': return Zap;
            case 'interaction': return ArrowUpRight;
            default: return Clock;
        }
    };

    useEffect(() => {
        if (connected) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
    }, [connected, fetchTransactions]);

    const filteredTransactions = transactions.filter(tx =>
        activeCategory === 'all' ? true : tx.category === activeCategory
    );

    if (!connected) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">Recent Activity</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Solana Devnet Explorer</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton
                        onClick={fetchTransactions}
                        isLoading={loading}
                    />
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex bg-[#f4f7f9] p-1.5 rounded-2xl border w-full overflow-x-auto no-scrollbar">
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setActiveCategory(c.id)}
                        className={cn(
                            "flex items-center gap-2 py-2 px-4 rounded-xl transition-all whitespace-nowrap",
                            activeCategory === c.id
                                ? "bg-white shadow-sm text-primary ring-1 ring-primary/5"
                                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                        )}
                    >
                        <c.icon className={cn("w-4 h-4", activeCategory === c.id ? "text-primary" : "text-muted-foreground/50")} />
                        <span className="text-xs font-bold uppercase tracking-wider">{c.name}</span>
                    </button>
                ))}
            </div>

            {loading && transactions.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-[#f4f7f9] animate-pulse rounded-2xl border border-transparent" />
                    ))}
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-[2.5rem] bg-[#f4f7f9]/20">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                        <Clock className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">No {activeCategory === 'all' ? '' : activeCategory} transactions found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((tx) => {
                        const Icon = getCategoryIcon(tx.category);
                        return (
                            <div key={tx.signature} className="p-4 flex items-center justify-between bg-white border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300",
                                        tx.err
                                            ? "bg-destructive/5 border-destructive/10 text-destructive"
                                            : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-foreground tracking-tight">
                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                            </span>
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
                                                {tx.details} • {tx.blockTime ? getRelativeTime(tx.blockTime) : 'Pending'}
                                            </span>
                                        </div>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}

