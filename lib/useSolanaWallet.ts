"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
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
            // 1. Fetch Native SOL
            const solBalance = await connection.getBalance(publicKey);
            const nativeSol: TokenAccount = {
                mint: "So11111111111111111111111111111111111111112",
                balance: solBalance / 1e9,
                pubkey: publicKey.toBase58(),
                decimals: 9,
                isNative: true
            };

            // 2. Fetch standard SPL Tokens (Token Program)
            const standardAccounts = await connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: TOKEN_PROGRAM_ID }
            );

            // 3. Fetch Token-2022 Tokens (Token Extensions - used by many new tokens)
            const token2022Accounts = await connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: TOKEN_2022_PROGRAM_ID }
            );

            const allAccounts = [...standardAccounts.value, ...token2022Accounts.value];

            const parsedTokens = allAccounts.map((account) => {
                const parsedInfo = account.account.data.parsed.info;
                return {
                    mint: parsedInfo.mint,
                    balance: parsedInfo.tokenAmount.uiAmount,
                    decimals: parsedInfo.tokenAmount.decimals,
                    pubkey: account.pubkey.toBase58(),
                };
            }).filter(t => t.balance > 0);

            // Combine and sort
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
