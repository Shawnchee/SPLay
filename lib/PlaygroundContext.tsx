"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PlaygroundState {
    stakedAmount: number;
    stakingRewards: number;
    lpPositions: {
        pair: string;
        amountA: number;
        amountB: number;
        lpTokens: number;
    }[];
    totalTVL: number;
}

interface PlaygroundContextType {
    state: PlaygroundState;
    updateStaked: (amount: number) => void;
    addLP: (pair: string, a: number, b: number, lp: number) => void;
    claimRewards: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<PlaygroundState>({
        stakedAmount: 0,
        stakingRewards: 0,
        lpPositions: [],
        totalTVL: 0,
    });

    // Simulate passive reward growth for staking
    useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                stakingRewards: prev.stakedAmount > 0
                    ? prev.stakingRewards + (prev.stakedAmount * 0.0001)
                    : prev.stakingRewards
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const updateStaked = (amount: number) => {
        setState(prev => ({ ...prev, stakedAmount: amount }));
    };

    const addLP = (pair: string, a: number, b: number, lp: number) => {
        setState(prev => ({
            ...prev,
            lpPositions: [...prev.lpPositions, { pair, amountA: a, amountB: b, lpTokens: lp }]
        }));
    };

    const claimRewards = () => {
        setState(prev => ({ ...prev, stakingRewards: 0 }));
    };

    return (
        <PlaygroundContext.Provider value={{ state, updateStaked, addLP, claimRewards }}>
            {children}
        </PlaygroundContext.Provider>
    );
}

export function usePlayground() {
    const context = useContext(PlaygroundContext);
    if (!context) throw new Error("usePlayground must be used within PlaygroundProvider");
    return context;
}
