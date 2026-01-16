"use client";

import { useState } from "react";
import { usePlayground } from "@/lib/PlaygroundContext";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import {
    Droplets,
    Plus,
    ArrowRight,
    History,
    Loader2,
    Info,
    PieChart,
    ArrowDownUp,
    Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LiquiditySim() {
    const { publicKey } = useSolanaWallet();
    const { state, addLP } = usePlayground();

    const [tokenA, setTokenA] = useState("SOL");
    const [tokenB, setTokenB] = useState("USDC");
    const [amountA, setAmountA] = useState("1.0");
    const [amountB, setAmountB] = useState("150.0");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'error' }[]>([]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ msg, type }, ...prev.slice(0, 4)]);
    };

    const handleDeposit = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            addLog("Calculating LP share based on pool depth...");
            await new Promise(r => setTimeout(r, 1500));

            const lpMinted = Math.sqrt(Number(amountA) * Number(amountB));
            addLP(`${tokenA}/${tokenB}`, Number(amountA), Number(amountB), lpMinted);

            addLog(`Deposited ${amountA} ${tokenA} & ${amountB} ${tokenB}`, "success");
            addLog(`Minted ${lpMinted.toFixed(2)} LP Tokens`, "success");
        } catch (e: any) {
            addLog("Deposit failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Liquidity Pools</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Provide Liquidity • Enable Swaps • Earn Fees</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Token A</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amountA}
                                                onChange={(e) => setAmountA(e.target.value)}
                                                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-black focus:border-primary/20 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{tokenA}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 mb-1">
                                        <Plus className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Token B</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amountB}
                                                onChange={(e) => setAmountB(e.target.value)}
                                                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-black focus:border-primary/20 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{tokenB}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <p className="text-[10px] text-blue-700 font-medium">
                                        You are providing {amountA} {tokenA} for {amountB} {tokenB}. This sets the price at {(Number(amountB) / Number(amountA)).toFixed(2)} {tokenB} per {tokenA}.
                                    </p>
                                </div>

                                <button
                                    onClick={handleDeposit}
                                    disabled={!publicKey || loading}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Droplets className="w-5 h-5" />}
                                    Deposit Liquidity
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3.5 h-3.5" />
                            Pool Activity
                        </h4>
                        <div className="space-y-2">
                            {logs.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-8 text-center">Ready to deposit...</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "p-3 rounded-xl border text-[11px] font-bold transition-all animate-in slide-in-from-left-2",
                                        log.type === 'success' ? "bg-green-500/5 border-green-500/10 text-green-700" :
                                            log.type === 'error' ? "bg-red-500/5 border-red-500/10 text-red-700" :
                                                "bg-white border-slate-200 text-slate-600"
                                    )}>
                                        {log.msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border rounded-2xl space-y-2">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-primary">
                        <PieChart className="w-3.5 h-3.5" />
                        What is an AMM?
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Automated Market Makers (AMMs) use the <b>x * y = k</b> formula to ensure that as one token is bought, its price relative to the other increases.
                    </p>
                </div>
                <div className="p-5 bg-white border rounded-2xl space-y-2">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Boxes className="w-3.5 h-3.5" />
                        LP Tokens
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        When you deposit, you receive LP tokens representing your share of the pool. You can trade these back later to withdraw your capital plus any earned fees.
                    </p>
                </div>
            </div>
        </div>
    );
}
