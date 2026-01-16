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
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import { DocBlock } from "@/components/DocBlock";

export function LiquiditySim() {
    const { publicKey } = useSolanaWallet();
    const { state, addLP } = usePlayground();

    const [tokenA, setTokenA] = useState("SOL");
    const [tokenB, setTokenB] = useState("USDC");
    const [amountA, setAmountA] = useState("1.0");
    const [amountB, setAmountB] = useState("150.0");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'error' }[]>([]);
    
    // Pool state for swap simulation
    const [reserveA, setReserveA] = useState(0);
    const [reserveB, setReserveB] = useState(0);
    const [swapAmount, setSwapAmount] = useState("0.1");
    const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
    const [swapping, setSwapping] = useState(false);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ msg, type }, ...prev.slice(0, 4)]);
    };

    // Calculate current pool metrics
    const kValue = reserveA * reserveB;
    const currentPrice = reserveA > 0 ? reserveB / reserveA : 0;
    const hasPool = reserveA > 0 && reserveB > 0;

    const handleDeposit = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            addLog("Calculating LP share based on pool depth...");
            await new Promise(r => setTimeout(r, 1500));

            const lpMinted = Math.sqrt(Number(amountA) * Number(amountB));
            addLP(`${tokenA}/${tokenB}`, Number(amountA), Number(amountB), lpMinted);

            // Initialize or add to pool reserves
            setReserveA(prev => prev + Number(amountA));
            setReserveB(prev => prev + Number(amountB));

            addLog(`Deposited ${amountA} ${tokenA} & ${amountB} ${tokenB}`, "success");
            addLog(`Minted ${lpMinted.toFixed(2)} LP Tokens`, "success");
            addLog(`Pool initialized with k = ${(Number(amountA) * Number(amountB)).toFixed(2)}`, "info");
        } catch (e: any) {
            addLog("Deposit failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = async () => {
        if (!hasPool || swapping) return;
        setSwapping(true);
        try {
            const inputAmount = Number(swapAmount);
            let outputAmount = 0;
            let newReserveA = reserveA;
            let newReserveB = reserveB;
            let priceImpact = 0;

            addLog("Calculating swap using x·y=k formula...", "info");
            await new Promise(r => setTimeout(r, 800));

            if (swapDirection === 'AtoB') {
                // Swapping Token A for Token B
                // (x + Δx) * y_new = k
                // y_new = k / (x + Δx)
                // Δy = y - y_new
                newReserveA = reserveA + inputAmount;
                newReserveB = kValue / newReserveA;
                outputAmount = reserveB - newReserveB;
                
                const oldPrice = reserveB / reserveA;
                const newPrice = newReserveB / newReserveA;
                priceImpact = ((newPrice - oldPrice) / oldPrice) * 100;

                addLog(`Swapped ${inputAmount.toFixed(4)} ${tokenA} → ${outputAmount.toFixed(4)} ${tokenB}`, "success");
            } else {
                // Swapping Token B for Token A
                newReserveB = reserveB + inputAmount;
                newReserveA = kValue / newReserveB;
                outputAmount = reserveA - newReserveA;
                
                const oldPrice = reserveB / reserveA;
                const newPrice = newReserveB / newReserveA;
                priceImpact = ((newPrice - oldPrice) / oldPrice) * 100;

                addLog(`Swapped ${inputAmount.toFixed(4)} ${tokenB} → ${outputAmount.toFixed(4)} ${tokenA}`, "success");
            }

            addLog(`Price Impact: ${Math.abs(priceImpact).toFixed(2)}% ${priceImpact > 0 ? '📈' : '📉'}`, priceImpact > 5 ? "error" : "info");
            addLog(`k remains constant: ${kValue.toFixed(2)}`, "info");

            // Update reserves
            setReserveA(newReserveA);
            setReserveB(newReserveB);

        } catch (e: any) {
            addLog("Swap failed: " + e.message, "error");
        } finally {
            setSwapping(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Tooltip content="Liquidity Pools allow users to trade tokens instantly by using a pool of assets provided by people like you, rather than waiting for a direct buyer/seller.">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center cursor-help">
                                <Droplets className="w-6 h-6 text-blue-600" />
                            </div>
                        </Tooltip>
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

            {/* Market Swap Simulator - Only shown after pool is created */}
            {hasPool && (
                <div className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-500/5 p-6 rounded-3xl border border-blue-200/50 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Tooltip content="Simulate market swaps to see how AMM pricing works in real-time. Watch price impact and the constant product formula in action!">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center cursor-help">
                                    <ArrowDownUp className="w-6 h-6 text-blue-600" />
                                </div>
                            </Tooltip>
                            <div>
                                <h3 className="text-xl font-black">Market Swap Simulator</h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Test Price Impact • See x·y=k Live</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pool Stats */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pool State</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                        <span className="text-[10px] font-bold text-slate-600">Reserve {tokenA}</span>
                                        <span className="text-sm font-black text-slate-900">{reserveA.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                        <span className="text-[10px] font-bold text-slate-600">Reserve {tokenB}</span>
                                        <span className="text-sm font-black text-slate-900">{reserveB.toFixed(4)}</span>
                                    </div>
                                </div>
                                
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200/50">
                                        <span className="text-[10px] font-black text-blue-700 uppercase">k-Value (x·y)</span>
                                        <span className="text-base font-black text-blue-900">{kValue.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-2 font-medium">This constant never changes, even as prices shift!</p>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200/50">
                                        <span className="text-[10px] font-black text-green-700 uppercase">Current Price</span>
                                        <span className="text-sm font-black text-green-900">{currentPrice.toFixed(2)} {tokenB}/{tokenA}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Swap Interface */}
                        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Simulate Market Swap</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSwapDirection('AtoB')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                            swapDirection === 'AtoB' 
                                                ? "bg-primary text-white" 
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {tokenA} → {tokenB}
                                    </button>
                                    <button
                                        onClick={() => setSwapDirection('BtoA')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                            swapDirection === 'BtoA' 
                                                ? "bg-primary text-white" 
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {tokenB} → {tokenA}
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                                    Swap Amount ({swapDirection === 'AtoB' ? tokenA : tokenB})
                                </label>
                                <input
                                    type="number"
                                    value={swapAmount}
                                    onChange={(e) => setSwapAmount(e.target.value)}
                                    step="0.1"
                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-black focus:border-blue-500/20 outline-none transition-all"
                                />
                                
                                {Number(swapAmount) > 0 && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        <p className="text-[10px] text-blue-700 font-medium">
                                            {swapDirection === 'AtoB' 
                                                ? `You'll receive ≈ ${((reserveB - (kValue / (reserveA + Number(swapAmount))))).toFixed(4)} ${tokenB}`
                                                : `You'll receive ≈ ${((reserveA - (kValue / (reserveB + Number(swapAmount))))).toFixed(4)} ${tokenA}`
                                            }
                                        <br />
                                        Price Impact: {Math.abs(((swapDirection === 'AtoB' 
                                                ? ((kValue / (reserveA + Number(swapAmount))) / reserveA) - (reserveB / reserveA)
                                                : ((kValue / (reserveB + Number(swapAmount))) / reserveB) - (reserveA / reserveB)
                                            ) / (swapDirection === 'AtoB' ? reserveB / reserveA : reserveA / reserveB) * 100)).toFixed(2)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSwap}
                                disabled={swapping || Number(swapAmount) <= 0}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {swapping ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownUp className="w-5 h-5" />}
                                Execute Swap
                            </button>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <p className="text-[10px] font-black text-yellow-700 uppercase mb-1">⚠️ Large Swaps</p>
                                    <p className="text-[10px] text-yellow-600 leading-relaxed">
                                        Try swapping 50% of the pool. You'll see massive price impact!
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-[10px] font-black text-blue-700 uppercase mb-1">💡 Deep Liquidity</p>
                                    <p className="text-[10px] text-blue-600 leading-relaxed">
                                        More liquidity = less price impact = better for traders.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-primary">
                        <PieChart className="w-3.5 h-3.5" />
                        What is an AMM?
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Automated Market Makers (AMMs) use the <b>x * y = k</b> formula to ensure that as one token is bought, its price relative to the other increases.
                    </p>
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Boxes className="w-3.5 h-3.5" />
                        LP Tokens
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        When you deposit, you receive LP tokens representing your share of the pool. You can trade these back later to withdraw your capital plus any earned fees.
                    </p>
                </div>
            </div>

            <DocBlock
                title="Automated Market Makers (AMMs)"
                description="AMMs like Orca or Raydium use mathematical formulas to price assets instead of a traditional order book. By providing liquidity, you enable others to swap assets instantly. In return, you usually earn a small fee from every trade that happens in your pool."
                links={[
                    { label: "Solana DeFi Overview", href: "https://solana.com/developers/defi" },
                    { label: "Orca Documentation", href: "https://docs.orca.so/" },
                    { label: "Raydium Protocol", href: "https://raydium.io/docs/" }
                ]}
            />
        </div>
    );
}
