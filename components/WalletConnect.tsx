"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC, useEffect, useState } from "react";

export const WalletConnect: FC = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-[48px] w-[150px] bg-secondary animate-pulse rounded-md" />
        );
    }

    return (
        <div className="solana-wallet-wrapper">
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !transition-colors !rounded-lg !h-10 !text-sm !font-medium" />
        </div>
    );
};
