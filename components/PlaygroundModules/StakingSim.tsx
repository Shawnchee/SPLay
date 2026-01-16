"use client";

import { useState } from "react";
import { usePlayground } from "@/lib/PlaygroundContext";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import {
    Trophy,
    Lock,
    Coins,
    TrendingUp,
    History,
    Loader2,
    Info,
    ArrowRight,
    Gift
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import { DocBlock } from "@/components/DocBlock";

export function StakingSim() {
    const { publicKey } = useSolanaWallet();
    const { state, updateStaked, claimRewards } = usePlayground();

    const [amount, setAmount] = useState<string>("10");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'error' }[]>([]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ msg, type }, ...prev.slice(0, 4)]);
    };

    const handleStake = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            addLog("Executing Stake instruction...");
            await new Promise(r => setTimeout(r, 1500));
            updateStaked(state.stakedAmount + Number(amount));
            addLog(`Successfully staked ${amount} SOL!`, "success");
        } catch (e: any) {
            addLog("Stake failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUnstake = async () => {
        setLoading(true);
        try {
            addLog("Preparing Unstake transaction...");
            await new Promise(r => setTimeout(r, 1500));
            updateStaked(0);
            addLog("Successfully unstaked and claimed principal!", "success");
        } catch (e: any) {
            addLog("Unstake failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        setLoading(true);
        try {
            addLog("Claiming accrued rewards from vault...");
            await new Promise(r => setTimeout(r, 1000));
            claimRewards();
            addLog("Rewards claimed successfully!", "success");
        } catch (e: any) {
            addLog("Claim failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Tooltip content="Staking involves locking your SOL to help validators process transactions. In return, the network gives you inflationary rewards.">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center cursor-help">
                                <Trophy className="w-6 h-6 text-purple-600" />
                            </div>
                        </Tooltip>
                        <div>
                            <h3 className="text-xl font-black">Proof of Stake</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lock Assets • Secure Network • Earn Yield</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yield Earned</p>
                                <p className="text-xl font-black text-green-600">+{state.stakingRewards.toFixed(4)} <span className="text-xs">SOL</span></p>
                            </div>
                            <Tooltip content="Claiming transfers your earned staking rewards from the staking program back into your available wallet balance.">
                                <button
                                    onClick={handleClaim}
                                    disabled={state.stakingRewards === 0 || loading}
                                    className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <Gift className="w-3.5 h-3.5 inline mr-1" />
                                    Claim
                                </button>
                            </Tooltip>
                        </div>

                        {state.stakedAmount === 0 ? (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Stake Amount (SOL)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl px-4 font-black text-lg focus:border-primary/20 outline-none transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">SOL</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStake}
                                    disabled={!publicKey || loading}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                    Stake Solana
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 bg-purple-500/5 border-2 border-purple-500/10 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">{state.stakedAmount} SOL Staked</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Active Validator Support</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUnstake}
                                        disabled={loading}
                                        className="text-xs font-bold text-red-600 hover:underline"
                                    >
                                        Unstake Principal
                                    </button>
                                </div>
                                <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 animate-pulse w-full" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3.5 h-3.5" />
                            Program Logs
                        </h4>
                        <div className="space-y-2">
                            {logs.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-8 text-center">No transactions yet.</p>
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
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        What is APY?
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Annual Percentage Yield (APY) represents the real rate of return earned on an investment, taking into account the effect of compounding interest.
                    </p>
                </div>
                <div className="p-5 bg-white border rounded-2xl space-y-2">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5" />
                        Liquid Staking
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        In a real DeFi app, you might receive a "Receipt Token" (like mSOL or JitoSOL) that you can use in other apps while your SOL stays staked.
                    </p>
                </div>
            </div>

            <DocBlock
                title="Proof of Stake (PoS)"
                description="Solana uses a PoS consensus mechanism where tokens are staked to validators to secure the network. By participating in staking, you help process transactions and maintain the ledger, earning a portion of the network's inflation in return."
                links={[
                    { label: "Staking on Solana", href: "https://docs.solana.com/staking" },
                    { label: "Staking FAQ", href: "https://solana.com/staking" },
                    { label: "Solana Inflation", href: "https://docs.solana.com/developing/runtime-facilities/sysvars#clock" }
                ]}
            />
        </div>
    );
}
