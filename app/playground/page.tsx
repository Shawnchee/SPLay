"use client";

import { useState } from "react";
import { SubscriptionSim } from "@/components/PlaygroundModules/SubscriptionSim";
import { LiquiditySim } from "@/components/PlaygroundModules/LiquiditySim";
import { StakingSim } from "@/components/PlaygroundModules/StakingSim";
import { SigningSim } from "@/components/PlaygroundModules/SigningSim";
import { PositionDashboard } from "@/components/PlaygroundModules/PositionDashboard";
import { cn } from "@/lib/utils";
import { usePrices } from "@/lib/PriceProvider";
import { Gamepad2, Repeat, Droplets, Trophy, Fingerprint, LayoutDashboard, Zap } from "lucide-react";

type ModuleType = 'dashboard' | 'subscriptions' | 'liquidity' | 'staking' | 'signing';

export default function PlaygroundPage() {
    const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
    const { pythPrice } = usePrices();

    const modules = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & TVL' },
        { id: 'subscriptions', name: 'Subscriptions', icon: Repeat, desc: 'Pull Payments' },
        { id: 'liquidity', name: 'Liquidity', icon: Droplets, desc: 'Yield Pools' },
        { id: 'staking', name: 'Staking', icon: Trophy, desc: 'Token Locking' },
        { id: 'signing', name: 'Signing', icon: Fingerprint, desc: 'Cryptography' },
    ] as const;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight tracking-tight">DeFi Playground</h1>
                        <p className="text-muted-foreground font-medium">Safe simulations to master Solana Web3 concepts.</p>
                    </div>
                </div>

                {pythPrice && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/5 border border-orange-500/10 rounded-2xl animate-in fade-in slide-in-from-right-2">
                        <Zap className="w-4 h-4 text-orange-600 fill-orange-600 animate-pulse" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-orange-700 uppercase leading-none">Pyth Live SOL</span>
                            <span className="text-sm font-black text-orange-600 tracking-tighter">${pythPrice.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex bg-[#f4f7f9] p-1.5 rounded-2xl border w-full max-w-2xl">
                {modules.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setActiveModule(m.id)}
                        className={cn(
                            "flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all",
                            activeModule === m.id
                                ? "bg-white shadow-sm text-primary ring-1 ring-primary/5"
                                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                        )}
                    >
                        <m.icon className={cn("w-5 h-5", activeModule === m.id ? "text-primary" : "text-muted-foreground/50")} />
                        <span className="text-[11px] font-black uppercase tracking-wider">{m.name}</span>
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeModule === 'dashboard' && <PositionDashboard />}
                {activeModule === 'subscriptions' && <SubscriptionSim />}
                {activeModule === 'liquidity' && <LiquiditySim />}
                {activeModule === 'staking' && <StakingSim />}
                {activeModule === 'signing' && <SigningSim />}
            </div>

            <div className="mt-12 p-6 bg-slate-900 text-white rounded-3xl overflow-hidden relative">
                <div className="relative z-10 space-y-2">
                    <h4 className="font-black text-xl">Ready to build?</h4>
                    <p className="text-slate-400 text-sm max-w-md">
                        These simulations use real Solana logic under the hood. You can inspect the source code to see how to implement these in your own production apps.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="flex flex-col">
                            <span className="text-primary font-black text-lg">100%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">On-Chain Logic</span>
                        </div>
                        <div className="w-[1px] bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-primary font-black text-lg">Safe</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Interactive</span>
                        </div>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
            </div>
        </div>
    );
}
