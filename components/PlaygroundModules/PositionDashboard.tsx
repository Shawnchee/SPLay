"use client";

import { usePlayground } from "@/lib/PlaygroundContext";
import { usePrices } from "@/lib/PriceProvider";
import {
    TrendingUp,
    PieChart,
    Layers,
    Wallet,
    ArrowUpRight,
    Activity,
    Milestone,
    Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PositionDashboard() {
    const { state } = usePlayground();
    const { getUSDValue } = usePrices();

    // Mock valuation for LP positions (simplified)
    const lpValuation = state.lpPositions.reduce((acc, pos) => {
        return acc + (pos.amountA * 1) + (pos.amountB * 1); // Mock $1 each for simplicity
    }, 0);

    const totalTVL = state.stakedAmount + lpValuation;

    const stats = [
        { name: 'Total Value Locked', value: `$${totalTVL.toFixed(2)}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Active Positions', value: state.lpPositions.length + (state.stakedAmount > 0 ? 1 : 0), icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'Accrued Rewards', value: state.stakingRewards.toFixed(4), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl border shadow-sm space-y-3 transition-hover hover:shadow-md">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</p>
                            <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Positions List */}
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Live Positions
                        </h4>
                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                            Simulator Assets
                        </div>
                    </div>

                    <div className="space-y-4">
                        {state.stakedAmount > 0 && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:scale-[1.01]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Milestone className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Staking Pool #1</p>
                                        <p className="text-[10px] text-muted-foreground">Earning 10% APY</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black">{state.stakedAmount} SOL</p>
                                    <p className="text-[10px] text-green-600 font-bold">+{state.stakingRewards.toFixed(4)} Rewards</p>
                                </div>
                            </div>
                        )}

                        {state.lpPositions.map((pos, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Boxes className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{pos.pair} LP</p>
                                        <p className="text-[10px] text-muted-foreground">Standard 0.3% Fee Tier</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black">{pos.lpTokens.toFixed(2)} LP</p>
                                    <p className="text-[10px] text-muted-foreground font-bold">In Vault</p>
                                </div>
                            </div>
                        ))}

                        {state.stakedAmount === 0 && state.lpPositions.length === 0 && (
                            <div className="py-12 text-center space-y-3">
                                <PieChart className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                                <p className="text-[11px] text-muted-foreground font-medium italic">No active positions yet. Head to the tabs to start earning.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Educational Summary */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 flex flex-col justify-center">
                    <h4 className="text-2xl font-black">Position Management</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        In professional DeFi, a <b>Position</b> is any capital you've deployed to an on-chain program. Managing them requires tracking three things:
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center mt-0.5"><ArrowUpRight className="w-3 h-3 text-white" /></div>
                            <span className="text-xs leading-tight"><b>Principal</b>: The assets you originally locked away.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center mt-0.5"><TrendingUp className="w-3 h-3 text-white" /></div>
                            <span className="text-xs leading-tight"><b>Yield</b>: The tokens you've earned from fees or inflation.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center mt-0.5"><Activity className="w-3 h-3 text-white" /></div>
                            <span className="text-xs leading-tight"><b>Utilization</b>: How your capital is being used (AMM vs Lending).</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
