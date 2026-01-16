"use client";

import { useState, useEffect } from "react";
import {
    Gem,
    ArrowUpCircle,
    Clock,
    Zap,
    HelpCircle,
    Loader2,
    Gift,
    Lock
} from "lucide-react";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

export function StakingSim() {
    const { tokens } = useSolanaWallet();
    const [stakedAmount, setStakedAmount] = useState<number>(0);
    const [rewards, setRewards] = useState<number>(0);
    const [isStaking, setIsStaking] = useState(false);
    const [loading, setLoading] = useState(false);

    // Simulate rewards accumulation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (stakedAmount > 0) {
            interval = setInterval(() => {
                setRewards(prev => prev + (stakedAmount * 0.0001));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [stakedAmount]);

    const handleStake = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setStakedAmount(100); // Fixed amount for simulation
        setIsStaking(true);
        setLoading(false);
    };

    const handleClaim = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setRewards(0);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Gem className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Staking & Rewards</h3>
                        <p className="text-xs text-muted-foreground">Put your idle assets to work</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[140px]">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staked Balance</span>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div>
                            <span className="text-3xl font-black">{stakedAmount.toLocaleString()}</span>
                            <span className="ml-1.5 text-xs font-bold text-muted-foreground uppercase">Tokens</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between min-h-[140px]">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Unclaimed Rewards</span>
                            <Zap className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <div>
                            <span className="text-3xl font-black text-purple-600">{rewards.toFixed(4)}</span>
                            <span className="ml-1.5 text-xs font-bold text-purple-400 uppercase">Tokens</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {!isStaking ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <HelpCircle className="w-3 h-3" />
                                <span>Why Stake?</span>
                                <p className="font-normal text-[11px] text-muted-foreground leading-tight italic">
                                    "Staking is the act of locking up your tokens to help secure the network. In return, the network (or protocol) rewards you with fresh tokens."
                                </p>
                            </div>
                            <button
                                onClick={handleStake}
                                disabled={loading}
                                className="w-full h-14 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Stake 100 Tokens to Earn 10% APY"}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleClaim}
                                disabled={loading || rewards === 0}
                                className="h-12 bg-white border border-purple-200 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                                Claim Rewards
                            </button>
                            <button
                                onClick={() => { setStakedAmount(0); setIsStaking(false); setRewards(0); }}
                                className="h-12 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                Unstake All
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">How it works on Solana</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 bg-white border rounded-xl flex items-center gap-3">
                            <div className="bg-slate-50 p-2 rounded-lg"><ArrowUpCircle className="w-4 h-4 text-slate-400" /></div>
                            <p className="text-[11px] leading-tight"><span className="font-extrabold uppercase text-[10px] block mb-0.5">Epochs</span> Rewards are usually distributed every "Epoch" (about 2-3 days on Solana).</p>
                        </div>
                        <div className="p-3 bg-white border rounded-xl flex items-center gap-3">
                            <div className="bg-slate-50 p-2 rounded-lg"><Clock className="w-4 h-4 text-slate-400" /></div>
                            <p className="text-[11px] leading-tight"><span className="font-extrabold uppercase text-[10px] block mb-0.5">Warmup</span> Many protocols have a "Warmup" period before you start earning.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
