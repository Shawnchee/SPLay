"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
    onClick: () => void;
    isLoading: boolean;
    label?: string;
    variant?: "icon" | "text" | "ghost";
    className?: string;
}

export function RefreshButton({
    onClick,
    isLoading,
    label,
    variant = "ghost",
    className
}: RefreshButtonProps) {
    if (variant === "icon") {
        return (
            <button
                onClick={onClick}
                disabled={isLoading}
                className={cn(
                    "p-2 hover:bg-[#f4f7f9] rounded-full transition-all text-muted-foreground hover:text-primary disabled:opacity-50",
                    className
                )}
                title="Refresh"
            >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
        );
    }

    if (variant === "text") {
        return (
            <button
                onClick={onClick}
                disabled={isLoading}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all shadow-sm disabled:bg-primary/50",
                    className
                )}
            >
                <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                {label || "Refresh"}
            </button>
        );
    }

    // Ghost variant (default for headers)
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-all disabled:opacity-50",
                className
            )}
        >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
            {label || "Refresh"}
        </button>
    );
}
