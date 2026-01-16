"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface PriceData {
    [mint: string]: number;
}

interface PriceContextType {
    prices: PriceData;
    pythPrice: number | null;
    getUSDValue: (mint: string, balance: number) => string;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<PriceData>({
        "So11111111111111111111111111111111111111112": 150.25,
    });
    const [pythPrice, setPythPrice] = useState<number | null>(null);

    // Fetch Live Pyth Price (SOL/USD)
    useEffect(() => {
        const fetchPyth = async () => {
            try {
                // SOL/USD Price ID for Pyth
                const priceId = "ef0d8b6fda2ceba41da15d409211cda310a00d503893e360e427a92f150829ef";
                const response = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids[]=${priceId}`);
                if (response.ok) {
                    const data = await response.json();
                    const priceData = data.parsed[0].price;
                    const price = Number(priceData.price) * Math.pow(10, priceData.expo);
                    setPythPrice(price);

                    // Sync our simulation SOL price to stay close to real life
                    setPrices(prev => ({
                        ...prev,
                        "So11111111111111111111111111111111111111112": price
                    }));
                }
            } catch (e) {
                console.error("Pyth fetch failed:", e);
            }
        };

        fetchPyth();
        const interval = setInterval(fetchPyth, 10000); // 10s updates for live feed
        return () => clearInterval(interval);
    }, []);

    // Handle price fluctuations for other tokens (mock)
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
        <PriceContext.Provider value={{ prices, pythPrice, getUSDValue }}>
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
