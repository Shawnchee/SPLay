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
            <div className="h-[42px] w-[140px] bg-secondary animate-pulse rounded-full" />
        );
    }

    return (
        <div className="solana-wallet-wrapper">
            <WalletMultiButton />
        </div>
    );
};
