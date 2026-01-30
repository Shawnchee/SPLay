"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3">
                <img src="/SPLay-icon.svg" alt="SPLay Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="text-lg font-bold tracking-tight text-foreground font-heading">SPLay</span>
            </div>
            <button
                onClick={onToggle}
                className="rounded-full p-2 text-muted-foreground hover:bg-[#f4f7f9] hover:text-foreground transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </header>
    );
}
