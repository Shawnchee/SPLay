"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, Clock, Compass, HelpCircle, Settings, Users, Gamepad2 } from "lucide-react";

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "History", href: "/history", icon: Clock },
    { name: "Playground", href: "/playground", icon: Gamepad2 },
];

const secondaryNavigation: { name: string; href: string; icon: any }[] = [];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-extrabold text-[10px] tracking-tighter">SOL</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">SPLay</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
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

            <div className="p-6 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2 bg-[#f4f7f9] rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Solana Devnet
                    </div>
                </div>
            </div>
        </div>
    );
}
