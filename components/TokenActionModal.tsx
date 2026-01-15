"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram
} from "@solana/web3.js";
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    createApproveInstruction,
    createRevokeInstruction,
    createFreezeAccountInstruction,
    createThawAccountInstruction,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { Info, Loader2, Send, Shield, Snowflake, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/Tooltip";

interface TokenActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokenMint: string;
    tokenBalance: number;
    tokenDecimals: number;
}

type ActionType = 'transfer' | 'delegate' | 'freeze';

export function TokenActionModal({ isOpen, onClose, tokenMint, tokenBalance, tokenDecimals }: TokenActionModalProps) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [activeTab, setActiveTab] = useState<ActionType>('transfer');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        recipient: "",
        amount: "",
    });

    if (!isOpen) return null;

    const handleTransfer = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        setLoading(true);
        setStatus(null);
        try {
            const recipientPubkey = new PublicKey(formData.recipient);
            const mintPubkey = new PublicKey(tokenMint);

            const fromATA = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);
            const toATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

            // Create toATA if it doesn't exist? For MVP, assuming it exists or handled by wallet simulation is risky.
            // Ideally we check if account exists, if not, add createAssociatedTokenAccountInstruction.
            // For simplicity/speed, let's just create instruction. If it fails, user needs to create ATA manually or we add logic.
            // Adding ATA creation logic is safer for "Transfer to any devnet wallet".

            const transaction = new Transaction();

            // Check if recipient ATA exists
            const recipientAccountInfo = await connection.getAccountInfo(toATA);
            if (!recipientAccountInfo) {
                const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        toATA,
                        recipientPubkey,
                        mintPubkey
                    )
                );
            }

            const amount = BigInt(Math.floor(Number(formData.amount) * Math.pow(10, tokenDecimals)));

            transaction.add(
                createTransferInstruction(
                    fromATA,
                    toATA,
                    wallet.publicKey,
                    amount,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTx = await wallet.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(txId, 'confirmed');

            setStatus("Transfer Successful!");
            setFormData({ recipient: "", amount: "" });
        } catch (e: any) {
            console.error(e);
            setStatus("Transfer Failed: " + (e.message || e));
        } finally {
            setLoading(false);
        }
    };

    const handleDelegate = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        setLoading(true);
        setStatus(null);
        try {
            const delegatePubkey = new PublicKey(formData.recipient);
            const mintPubkey = new PublicKey(tokenMint);
            const accountPubkey = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);

            // "Revoke" is "Approve 0" or Revoke Instruction. Logic: if amount is 0/empty, maybe revoke?
            // Or explicit Revoke Button.
            // Let's go with Approve.

            const amount = BigInt(Math.floor(Number(formData.amount) * Math.pow(10, tokenDecimals)));

            const transaction = new Transaction().add(
                createApproveInstruction(
                    accountPubkey,
                    delegatePubkey,
                    wallet.publicKey,
                    amount,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTx = await wallet.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(txId, 'confirmed');

            setStatus("Delegation Successful!");
        } catch (e: any) {
            console.error(e);
            setStatus("Delegation Failed: " + (e.message || e));
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = async (action: 'freeze' | 'unfreeze') => {
        if (!wallet.publicKey || !wallet.signTransaction) return;
        setLoading(true);
        setStatus(null);
        try {
            const mintPubkey = new PublicKey(tokenMint);
            // To freeze OTHER accounts, we need the account address.
            // If the user wants to freeze "their own" account or "another" account?
            // Usually Freeze Authority freezes SOMEONE ELSE's account (or their own).
            // Requirements: "Freeze/unfreeze token accounts".
            // Let's assume we are freezing the account specified in "recipient" or the user's own if empty?
            // Let's use the input field for "Target Account Owner Address" to find their ATA and freeze it.

            if (!formData.recipient) {
                throw new Error("Please enter the wallet address to freeze/unfreeze");
            }

            const targetOwner = new PublicKey(formData.recipient);
            const targetATA = await getAssociatedTokenAddress(mintPubkey, targetOwner);

            const transaction = new Transaction();

            if (action === 'freeze') {
                transaction.add(
                    createFreezeAccountInstruction(
                        targetATA,
                        mintPubkey,
                        wallet.publicKey,
                        [],
                        TOKEN_PROGRAM_ID
                    )
                );
            } else {
                transaction.add(
                    createThawAccountInstruction(
                        targetATA,
                        mintPubkey,
                        wallet.publicKey,
                        [],
                        TOKEN_PROGRAM_ID
                    )
                );
            }

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTx = await wallet.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(txId, 'confirmed');

            setStatus(`${action === 'freeze' ? "Frozen" : "Unfrozen"} Successfully!`);
        } catch (e: any) {
            console.error(e);
            setStatus(`Failed to ${action}: ` + (e.message || e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-xl border shadow-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Token Actions</h2>
                <div className="flex bg-muted p-1 rounded-lg mb-6">
                    {(['transfer', 'delegate', 'freeze'] as const).map((tab) => (
                        <Tooltip
                            key={tab}
                            content={
                                tab === 'transfer' ? "Move tokens to another wallet." :
                                    tab === 'delegate' ? "Give spending permission to another wallet." :
                                        "Authority control: Lock a wallet's ability to move tokens."
                            }
                        >
                            <button
                                onClick={() => { setActiveTab(tab); setStatus(null); }}
                                className={cn(
                                    "flex-1 py-1.5 px-6 text-sm font-medium rounded-md capitalize transition-all",
                                    activeTab === tab
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        </Tooltip>
                    ))}
                </div>

                <div className="space-y-4">
                    {status && (
                        <div className={cn(
                            "p-3 text-sm rounded-md break-all",
                            status.includes("Failed") ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
                        )}>
                            {status}
                        </div>
                    )}

                    {activeTab === 'transfer' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipient Address</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Solana Address"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleTransfer}
                                disabled={loading}
                                className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Transfer
                            </button>
                        </div>
                    )}

                    {activeTab === 'delegate' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] leading-relaxed rounded-lg flex gap-3">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider mb-1">What is Delegation?</p>
                                    Approve another wallet (the "Delegate") to spend tokens on your behalf. This is how DEXs (like Raydium) or Staking platforms work—they need your permission to move tokens when you swap or stake.
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delegate Address</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Delegate's Solana Address"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Allowance Amount</label>
                                <input
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleDelegate}
                                disabled={loading}
                                className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Approve
                            </button>
                        </div>
                    )}

                    {activeTab === 'freeze' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] leading-relaxed rounded-lg flex gap-3">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider mb-1">What is Freezing?</p>
                                    Only the <span className="font-bold underline">Mint Authority</span> can freeze an account. Once frozen, the holder cannot transfer or sell these tokens until you "Thaw" them. Used for compliance, security, or preventing fraud.
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Wallet Address</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Wallet Address to Freeze/Unfreeze"
                                    value={formData.recipient}
                                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleFreeze('freeze')}
                                    disabled={loading}
                                    className="h-10 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Freeze
                                </button>
                                <button
                                    onClick={() => handleFreeze('unfreeze')}
                                    disabled={loading}
                                    className="h-10 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Thaw
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
