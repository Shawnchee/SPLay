"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface PriceData {
    [mint: string]: number;
}

interface PriceContextType {
    prices: PriceData;
    getUSDValue: (mint: string, balance: number) => string;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
    // Initial mock prices
    const [prices, setPrices] = useState<PriceData>({
        "So11111111111111111111111111111111111111112": 150.25, // SOL
        // Other tokens will be given a default price if not found
    });

    // Handle price fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setPrices(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(mint => {
                    const volatility = 0.001; // 0.1% change
                    const change = 1 + (Math.random() * volatility * 2 - volatility);
                    next[mint] = next[mint] * change;
                });
                return next;
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const getUSDValue = (mint: string, balance: number) => {
        const price = prices[mint] || 1.0; // Default to $1 for mock tokens
        return (balance * price).toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <PriceContext.Provider value={{ prices, getUSDValue }}>
            {children}
        </PriceContext.Provider>
    );
}

export function usePrices() {
    const context = useContext(PriceContext);
    if (context === undefined) {
        throw new Error("usePrices must be used within a PriceProvider");
    }
    return context;
}
