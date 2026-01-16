"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useEffect, useState, useCallback, useRef } from "react";
import { getTokenMetadata, getTokensMetadataBatch } from "./metadata";
import { PublicKey } from "@solana/web3.js";

export interface TokenAccount {
    mint: string;
    balance: number;
    pubkey: string;
    decimals: number;
    isNative?: boolean;
    name?: string;
    symbol?: string;
    image?: string;
    delegate?: string | null;
    delegatedAmount?: number;
}

export function useSolanaWallet() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [tokens, setTokens] = useState<TokenAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const lastFetchTime = useRef<number>(0);

    const fetchAssets = useCallback(async (silent = false) => {
        if (!publicKey) return;

        // Rate limiting: avoid fetching more than once every 5 seconds
        const now = Date.now();
        if (now - lastFetchTime.current < 5000) {
            console.log("Throttling asset fetch (cooldown)...");
            return;
        }
        lastFetchTime.current = now;

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
                const delegateInfo = parsedInfo.delegate;
                const delegatedAmount = parsedInfo.delegatedAmount ? parsedInfo.delegatedAmount.uiAmount : 0;

                return {
                    mint: parsedInfo.mint,
                    balance: parsedInfo.tokenAmount.uiAmount,
                    decimals: parsedInfo.tokenAmount.decimals,
                    pubkey: account.pubkey.toBase58(),
                    delegate: delegateInfo || null,
                    delegatedAmount: delegatedAmount,
                };
            }).filter(t => t.balance > 0);

            // 4. Fetch Metadata in Batch
            const mints = [nativeSol.mint, ...parsedTokens.map(t => t.mint)];
            const metadataMap = await getTokensMetadataBatch(connection, mints);

            const tokensWithMetadata = [
                {
                    ...nativeSol,
                    ...(metadataMap[nativeSol.mint] || {})
                },
                ...parsedTokens.map(token => {
                    const metadata = metadataMap[token.mint];
                    return metadata ? { ...token, ...metadata } : token;
                })
            ];

            // Combine and sort
            setTokens(tokensWithMetadata);
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
            const interval = setInterval(() => fetchAssets(true), 60000);
            return () => clearInterval(interval);
        } else {
            setTokens([]);
        }
    }, [connected, fetchAssets]);

    const nativeSol = tokens.find(t => t.isNative);
    const totalBalanceUSD = nativeSol ? nativeSol.balance : 0; // Base balance, UI will apply live price

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
