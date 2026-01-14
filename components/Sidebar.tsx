"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Coins, CreditCard, ArrowRightLeft, Shield, Snowflake } from "lucide-react";

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "My Assets", href: "/assets", icon: Coins },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
    // { name: "Delegation", href: "/delegation", icon: Shield }, // Can enable later
    // { name: "Freeze Authority", href: "/freeze", icon: Snowflake }, // Can enable later
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    SolPlay
                </span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                    Running on Solana Devnet
                </div>
            </div>
        </div>
    );
}
