"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
    Droplet,
    ArrowRight,
    Plus,
    Coins,
    Info,
    Lock,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

export function LiquiditySim() {
    const { tokens, refresh } = useSolanaWallet();
    const [tokenA, setTokenA] = useState("");
    const [tokenB, setTokenB] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // In a real DEX, you'd deposit into a Program-controlled Vault.
    // For this simulation, we'll explain the mechanics.
    const handleAddLiquidity = async () => {
        setLoading(true);
        // Simulate a delay for "on-chain" processing
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
    };

    const selectedA = tokens.find(t => t.mint === tokenA);
    const selectedB = tokens.find(t => t.mint === tokenB);

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Droplet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Yield & LP Simulator</h3>
                        <p className="text-xs text-muted-foreground">Learn how Liquidity Pools (DEXs) work</p>
                    </div>
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-4">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-[12px] leading-relaxed text-blue-700/80">
                        When you add liquidity to a pair like <b>SOL/USDC</b>, you are literally giving your tokens to a smart contract (a "Pool"). In exchange, the protocol gives you <b>LP Tokens</b> which represent your share of the pool.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Token A</label>
                        <select
                            className="w-full p-4 bg-background rounded-2xl border border-input font-bold outline-none appearance-none"
                            value={tokenA}
                            onChange={(e) => setTokenA(e.target.value)}
                        >
                            <option value="">Choose Asset...</option>
                            {tokens.map(t => (
                                <option key={t.mint} value={t.mint}>
                                    {t.name || t.symbol || "Unknown"} ({t.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center md:pt-6">
                        <div className="bg-muted p-2 rounded-full border border-border">
                            <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Token B</label>
                        <select
                            className="w-full p-4 bg-background rounded-2xl border border-input font-bold outline-none appearance-none"
                            value={tokenB}
                            onChange={(e) => setTokenB(e.target.value)}
                        >
                            <option value="">Choose Asset...</option>
                            {tokens.map(t => (
                                <option key={t.mint} value={t.mint}>
                                    {t.name || t.symbol || "Unknown"} ({t.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-border space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase">
                        <span>Projected LP Receipt</span>
                        <Tooltip content="LP (Liquidity Provider) tokens are receipts. You need them to withdraw your original tokens + fees earned.">
                            <Info className="w-3 h-3" />
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black">
                            LP
                        </div>
                        <div className="font-mono text-xs font-bold">
                            {tokenA && tokenB ? `DSWAP-${selectedA?.symbol || "A"}-${selectedB?.symbol || "B"}-LP` : "Waiting for pair..."}
                        </div>
                    </div>
                </div>

                <button
                    disabled={!tokenA || !tokenB || loading}
                    onClick={handleAddLiquidity}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]",
                        isSuccess ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:grayscale"
                    )}
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        isSuccess ? <CheckCircle2 className="w-6 h-6 animate-bounce" /> :
                            "Add Liquidity & Receive LP"}
                </button>

                {isSuccess && (
                    <div className="text-center text-[11px] font-bold text-green-600 uppercase animate-in fade-in slide-in-from-top-1">
                        Success! You moved assets to the vault (Simulator Only)
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "Vault Deposits", desc: "Tokens are moved from your ATA to the Protocol's ATA.", icon: Lock },
                    { title: "Minting LP", desc: "Protocol mints new LP tokens to your wallet address.", icon: Coins },
                    { title: "Swap Fees", desc: "You earn a share of every swap that uses your liquidity.", icon: ArrowRight }
                ].map((step, idx) => (
                    <div key={idx} className="p-4 bg-white border rounded-xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <step.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-xs uppercase tracking-tight">{step.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
