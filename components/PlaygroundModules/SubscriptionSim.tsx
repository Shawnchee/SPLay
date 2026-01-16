"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Info, Loader2, Play, RefreshCw, ShieldCheck, UserCheck, Copy } from "lucide-react";
import { useSolanaWallet } from "@/lib/useSolanaWallet";
import { performPullPayment, PLAYGROUND_SERVICE_WALLET } from "@/lib/DeFiUtils";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

export function SubscriptionSim() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const { tokens, refresh } = useSolanaWallet();

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [simWalletBalance, setSimWalletBalance] = useState(0);
    const [selectedTokenMint, setSelectedTokenMint] = useState<string | "">("");
    const [logs, setLogs] = useState<{ msg: string, type: 'info' | 'success' | 'error', tx?: string }[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    const selectedToken = tokens.find(t => t.mint === selectedTokenMint);
    const isDelegatedToSim = selectedToken?.delegate === PLAYGROUND_SERVICE_WALLET.publicKey.toBase58();

    useEffect(() => {
        const checkBalance = async () => {
            const bal = await connection.getBalance(PLAYGROUND_SERVICE_WALLET.publicKey);
            setSimWalletBalance(bal / LAMPORTS_PER_SOL);
        };
        checkBalance();
    }, [connection]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info', tx?: string) => {
        setLogs(prev => [{ msg, type, tx }, ...prev].slice(0, 5));
    };

    const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
    };

    const initSimWallet = async () => {
        setInitializing(true);
        try {
            addLog("Requesting airdrop for Simulator Wallet...", "info");
            const signature = await connection.requestAirdrop(PLAYGROUND_SERVICE_WALLET.publicKey, 1 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature, 'confirmed');
            const bal = await connection.getBalance(PLAYGROUND_SERVICE_WALLET.publicKey);
            setSimWalletBalance(bal / LAMPORTS_PER_SOL);
            addLog("Simulator Wallet funded with 1 SOL", "success");
        } catch (e: any) {
            addLog("Airdrop failed: " + e.message, "error");
        } finally {
            setInitializing(false);
        }
    };

    const handleCharge = async () => {
        if (!publicKey || !selectedToken) return;
        setLoading(true);
        try {
            addLog(`Simulating 'Netflix' pull payment of 10 tokens...`, "info");

            const signature = await performPullPayment(
                connection,
                PLAYGROUND_SERVICE_WALLET,
                publicKey,
                new PublicKey(selectedToken.mint),
                10,
                selectedToken.decimals
            );

            addLog("Pull Payment Successful! (No User Signature Required)", "success", signature);
            refresh();
        } catch (e: any) {
            console.error(e);
            addLog("Charge failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Setup & Wallet Status */}
                <div className="space-y-4">
                    <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Subscription Simulator</h3>
                                <p className="text-xs text-muted-foreground">Master "Pull Payments" via Delegation</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="p-3 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] leading-relaxed rounded-xl flex gap-3">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider mb-1">Educational Note</p>
                                    A service (like Netflix) can only "pull" tokens if you have <b>Approved</b> them as a delegate. Once approved, they can move funds up to your set allowance without asking for your signature again.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">1. Prepare Service Wallet</label>
                                <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-dashed border-border">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-mono text-muted-foreground">{PLAYGROUND_SERVICE_WALLET.publicKey.toBase58().slice(0, 16)}...</span>
                                        <span className="text-[13px] font-bold">{simWalletBalance.toFixed(2)} SOL</span>
                                    </div>
                                    <button
                                        onClick={initSimWallet}
                                        disabled={initializing}
                                        className="px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-lg hover:bg-primary/20 transition-all"
                                    >
                                        {initializing ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Airdrop Gas"}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">2. Select Token to Subscribe</label>
                                <select
                                    className="w-full p-3 bg-background rounded-xl border border-input text-sm font-bold outline-none"
                                    value={selectedTokenMint}
                                    onChange={(e) => setSelectedTokenMint(e.target.value)}
                                >
                                    <option value="">Select a token...</option>
                                    {tokens.filter(t => !t.isNative).map(t => (
                                        <option key={t.mint} value={t.mint}>
                                            {t.name || t.symbol || t.mint.slice(0, 8)} ({t.balance.toLocaleString()} available)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: The Demo Card */}
                <div className="space-y-4">
                    <div className={cn(
                        "bg-card p-6 rounded-2xl border shadow-sm h-full relative overflow-hidden transition-all",
                        isDelegatedToSim ? "border-primary/30 ring-1 ring-primary/10" : "opacity-60 grayscale-[0.5]"
                    )}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                FakeService Pro
                            </div>
                            {isDelegatedToSim && (
                                <div className="flex items-center gap-1.2 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold border border-green-500/20">
                                    <UserCheck className="w-3 h-3" />
                                    Active Allowance: {selectedToken?.delegatedAmount?.toLocaleString()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 mb-8">
                            <h4 className="text-2xl font-black">Monthly Subscription</h4>
                            <p className="text-sm text-muted-foreground font-medium">Auto-bill: 10 {selectedToken?.symbol || "Tokens"}/mo</p>
                        </div>

                        <div className="space-y-4">
                            {!isDelegatedToSim ? (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center space-y-3">
                                    <p className="text-[11px] font-bold text-amber-600 uppercase">Action Required</p>
                                    <p className="text-[12px] font-medium leading-relaxed">
                                        Go to your <b>Main Assets</b>, click the token and <b>Approve</b> the Service Wallet below as a delegate.
                                    </p>
                                    <div className="p-2 bg-white rounded-lg font-mono text-[10px] break-all select-all flex items-center justify-between gap-2">
                                        {PLAYGROUND_SERVICE_WALLET.publicKey.toBase58()}
                                        <button
                                            onClick={() => copyToClipboard(PLAYGROUND_SERVICE_WALLET.publicKey.toBase58()   )}
                                            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                        >
                                            {copied === PLAYGROUND_SERVICE_WALLET.publicKey.toBase58() ? (
                                                <div className="text-[10px] font-bold text-green-600 uppercase">Copied</div>
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCharge}
                                        disabled={loading || (selectedToken?.delegatedAmount || 0) < 10}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                        Run Billing Cycle (Charge 10)
                                    </button>
                                    <p className="text-[10px] text-center text-muted-foreground font-medium">
                                        Watch your terminal—this transaction is signed by the <b>Service</b>, not you!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Transaction Logs */}
            <div className="bg-card p-4 rounded-xl border border-dashed border-border">
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Live Simulation Logs</h5>
                    {logs.length > 0 && (
                        <button onClick={() => setLogs([])} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Clear</button>
                    )}
                </div>
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[11px] font-medium italic">
                        Waiting for actions...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg text-[12px] font-medium border",
                                log.type === 'info' ? "bg-blue-50/50 border-blue-100/50 text-blue-700" :
                                    log.type === 'success' ? "bg-green-50/50 border-green-100/50 text-green-700" :
                                        "bg-destructive/5 border-destructive/10 text-destructive"
                            )}>
                                <span className="opacity-50 text-[10px] font-bold">0{logs.length - i}</span>
                                <span className="flex-1">{log.msg}</span>
                                {log.tx && (
                                    <a
                                        href={`https://explorer.solana.com/tx/${log.tx}?cluster=devnet`}
                                        target="_blank"
                                        className="text-primary underline flex items-center gap-1 font-bold"
                                    >
                                        Tx
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
