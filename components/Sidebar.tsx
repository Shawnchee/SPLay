"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, Clock, Compass, HelpCircle, Settings, Users, Gamepad2, Zap, ArrowUpRight, TrendingUp } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { usePrices } from "@/lib/PriceProvider";
import { useSolanaWallet } from "@/lib/useSolanaWallet";

const navigation = [
    { name: "Home", href: "/", icon: Home, desc: "Overview of your assets and simulated net worth." },
    { name: "History", href: "/history", icon: Clock, desc: "A ledger of all events linked to your wallet address." },
    { name: "Playground", href: "/playground", icon: Gamepad2, desc: "Interactive drills to learn DeFi protocols risk-free." },
];

const secondaryNavigation: { name: string; href: string; icon: any }[] = [];

export function Sidebar() {
    const pathname = usePathname();
    const { pythPrice, prices } = usePrices();
    const { tokens, connected } = useSolanaWallet();

    const nativeSol = tokens.find(t => t.isNative || t.mint === "So11111111111111111111111111111111111111112");
    const totalBalanceUSD = nativeSol ? (nativeSol.balance * (prices[nativeSol.mint] || 0)) : 0;

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/SPLay-icon.svg" alt="SPLay Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                    <span className="text-lg font-bold tracking-tight text-foreground font-heading">SPLay</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-4 py-4">
                <div className="px-2 mb-6">
                    <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/5 transition-all hover:scale-[1.02]">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                </div>
                                <div className="px-2 py-0.5 bg-white/10 rounded-full">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Native Assets</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-80">Portfolio Value</p>
                            <div className="text-3xl font-black tracking-tighter mb-1 font-sans">
                                ${connected ? totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className="text-lg font-black text-primary tracking-tight">
                                    {connected ? (nativeSol?.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0') : "0"}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">SOL Total</span>
                            </div>
                        </div>
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-primary/40 transition-all duration-500" />
                    </div>
                </div>

                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Tooltip key={item.name} content={item.desc}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 rounded-full px-4 py-2.5 text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-[#f4f7f9] text-primary"
                                        : "text-muted-foreground hover:bg-[#f4f7f9] hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 2} />
                                {item.name}
                            </Link>
                        </Tooltip>
                    );
                })}

                <div className="mt-8 pt-4 border-t border-border">
                    {secondaryNavigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 rounded-full px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-[#f4f7f9] hover:text-foreground transition-all"
                        >
                            <item.icon className="h-5 w-5" strokeWidth={2} />
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="p-4 space-y-4 border-t border-border mt-auto">
                <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/10 rounded-2xl transition-all hover:shadow-md hover:border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Zap className="w-3 h-3 text-primary animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SOL/USD</span>
                        </div>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 rounded-full">
                            <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                            <span className="text-[9px] font-bold text-green-600">LIVE PRICE</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h4 className="text-[11px] font-bold text-foreground/70 leading-none mb-1">
                                Market Price (Unit)
                            </h4>
                            <div className="text-xl font-black text-foreground tracking-tight">
                                {pythPrice ? (
                                    `$${pythPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                ) : (
                                    <span className="text-muted-foreground/30 italic">Loading...</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">PER 1 SOL</span>
                            <span className="text-[9px] font-black text-primary uppercase">PYTH Feed</span>
                        </div>
                    </div>

                    {/* Background Decoration */}
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-[#f4f7f9] rounded-xl border border-border/50">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-40" />
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Solana Devnet
                    </div>
                </div>
            </div>
        </div>
    );
}
