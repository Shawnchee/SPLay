"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
    Fingerprint,
    Eye,
    Code2,
    ShieldCheck,
    ChevronRight,
    Loader2,
    Info,
    AlertCircle,
    CheckCircle2,
    Scale,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SigningSim() {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();

    const [status, setStatus] = useState<'idle' | 'building' | 'simulating' | 'signing' | 'complete'>('idle');
    const [txData, setTxData] = useState<{
        message?: string;
        signature?: string;
        simulationResults?: any;
        preBalance?: number;
        postBalance?: number;
    }>({});
    const [error, setError] = useState<string | null>(null);

    const handleSimulation = async () => {
        if (!publicKey) return;
        setStatus('building');
        setError(null);

        try {
            // 1. Build a simple transaction (Transfer 0.1 SOL)
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey("Gv9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v"), // Burn address
                    lamports: 0.1 * LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            // Serialize for display
            const serialized = transaction.serializeMessage().toString('hex');

            // 2. Simulate
            setStatus('simulating');
            const simulation = await connection.simulateTransaction(transaction);
            const currentBalance = await connection.getBalance(publicKey);

            if (simulation.value.err) {
                setError("Simulation Failed: " + JSON.stringify(simulation.value.err));
            } else {
                setTxData({
                    message: serialized,
                    simulationResults: simulation.value,
                    preBalance: currentBalance / LAMPORTS_PER_SOL,
                    postBalance: (currentBalance / LAMPORTS_PER_SOL) - 0.100005 // Approx with fee
                });
            }

            setStatus('idle');
        } catch (e: any) {
            setError(e.message);
            setStatus('idle');
        }
    };

    const handleSign = async () => {
        if (!publicKey || !signTransaction) return;
        setStatus('signing');
        setError(null);

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey("Gv9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v9v"),
                    lamports: 0.1 * LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signedTx = await signTransaction(transaction);
            const signature = signedTx.signatures[0].signature?.toString('hex');

            setTxData(prev => ({ ...prev, signature }));
            setStatus('complete');
        } catch (e: any) {
            setError(e.message);
            setStatus('idle');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                            <Fingerprint className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Transaction Center</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Construction • Simulation • Signing</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Step 1: Build & Simulate */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">1</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pre-flight Safety</span>
                        </div>

                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Build a transaction to transfer <b>0.1 SOL</b>. We'll run a "Simulation" to check for errors and balance impacts.
                            </p>
                            <button
                                onClick={handleSimulation}
                                disabled={status !== 'idle' || !publicKey}
                                className="w-full h-12 bg-white border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-sm group"
                            >
                                {status === 'simulating' || status === 'building' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Eye className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                                )}
                                Preview & Simulate
                            </button>
                        </div>

                        {txData.simulationResults && (
                            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl animate-in zoom-in-95 duration-300 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-[10px] font-black text-green-700 uppercase">Balance Change Info</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Pre</span>
                                        <span className="text-xs font-black">{txData.preBalance?.toFixed(2)} SOL</span>
                                    </div>
                                    <ArrowDownRight className="w-4 h-4 text-slate-300" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Post</span>
                                        <span className="text-xs font-black text-red-600">{txData.postBalance?.toFixed(4)} SOL</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-green-500/10">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Network Fee:</span>
                                        <span className="font-mono font-bold text-green-700">≈ 0.000005 SOL</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Inspection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">2</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Serialization</span>
                        </div>

                        <div className="p-5 bg-slate-900 rounded-2xl h-[280px] flex flex-col">
                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <Code2 className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Hex Message Pool</span>
                            </div>
                            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-orange-400/80 break-all leading-relaxed p-2 bg-black/30 rounded-lg border border-white/5 thin-scrollbar">
                                {txData.message || "// Message will appear here..."}
                            </div>
                            <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-start gap-3">
                                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    This binary blob is what your wallet <b>actually</b> signs. It contains the instruction data and account indices.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Global Signing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">3</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authorization</span>
                        </div>

                        <div className="p-5 bg-card border-2 border-dashed border-slate-200 rounded-3xl h-[280px] flex flex-col items-center justify-center text-center space-y-6">
                            {status === 'complete' ? (
                                <div className="space-y-4 animate-in scale-90 fade-in duration-500">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                        <ShieldCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Valid Cryptographic Proof</h4>
                                        <p className="text-[10px] text-muted-foreground break-all px-4 font-mono mt-2 bg-slate-50 p-2 rounded-lg border">
                                            {txData.signature}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setStatus('idle'); setTxData({}); }}
                                        className="text-[11px] font-bold text-primary hover:underline"
                                    >
                                        Start New Session
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                                        <Fingerprint className={cn("w-8 h-8 text-primary", status === 'signing' && "animate-pulse")} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm">Sign the Message</h4>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed px-4">
                                            Your wallet will generate an Ed25519 signature. This proves ownership without revealing your keys.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSign}
                                        disabled={!txData.message || status !== 'idle'}
                                        className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.03] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {status === 'signing' ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize & Sign"}
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-bottom-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-xs font-bold">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
