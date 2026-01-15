"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useEffect, useState, useCallback } from "react";

export interface TokenAccount {
    mint: string;
    balance: number;
    pubkey: string;
    decimals: number;
    isNative?: boolean;
}

export function useSolanaWallet() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [tokens, setTokens] = useState<TokenAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAssets = useCallback(async (silent = false) => {
        if (!publicKey) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            // Fetch Native SOL
            const solBalance = await connection.getBalance(publicKey);
            const nativeSol: TokenAccount = {
                mint: "So11111111111111111111111111111111111111112",
                balance: solBalance / 1e9,
                pubkey: publicKey.toBase58(),
                decimals: 9,
                isNative: true
            };

            // Fetch SPL Tokens
            const accounts = await connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: TOKEN_PROGRAM_ID }
            );

            const parsedTokens = accounts.value.map((account) => {
                const parsedInfo = account.account.data.parsed.info;
                return {
                    mint: parsedInfo.mint,
                    balance: parsedInfo.tokenAmount.uiAmount,
                    decimals: parsedInfo.tokenAmount.decimals,
                    pubkey: account.pubkey.toBase58(),
                };
            }).filter(t => t.balance > 0);

            setTokens([nativeSol, ...parsedTokens]);
        } catch (error) {
            console.error("Error fetching solana assets:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [publicKey, connection]);

    useEffect(() => {
        if (connected) {
            fetchAssets();
            const interval = setInterval(() => fetchAssets(true), 15000);
            return () => clearInterval(interval);
        } else {
            setTokens([]);
        }
    }, [connected, fetchAssets]);

    const totalBalanceUSD = tokens.reduce((acc, token) => {
        // Mock price of 1 USD for all tokens for now (matching theme mock)
        return acc + token.balance;
    }, 0);

    return {
        publicKey,
        connected,
        tokens,
        loading,
        refreshing,
        totalBalanceUSD,
        refresh: () => fetchAssets(false),
        refreshSilent: () => fetchAssets(true)
    };
}
