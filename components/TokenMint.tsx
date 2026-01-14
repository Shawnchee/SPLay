"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
    createInitializeMintInstruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createMintToInstruction,
} from "@solana/spl-token";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function TokenMint() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        decimals: "9",
        amount: "1000",
    });

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wallet.publicKey || !wallet.signTransaction) {
            setError("Please connect your wallet first");
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const lamports = await getMinimumBalanceForRentExemptMint(connection);
            const mintKeypair = Keypair.generate();
            const tokenATA = await getAssociatedTokenAddress(
                mintKeypair.publicKey,
                wallet.publicKey
            );

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    Number(formData.decimals),
                    wallet.publicKey,
                    wallet.publicKey,
                    TOKEN_PROGRAM_ID
                ),
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    tokenATA,
                    wallet.publicKey,
                    mintKeypair.publicKey
                ),
                createMintToInstruction(
                    mintKeypair.publicKey,
                    tokenATA,
                    wallet.publicKey,
                    Number(formData.amount) * Math.pow(10, Number(formData.decimals))
                )
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            transaction.partialSign(mintKeypair);

            const signedTx = await wallet.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize());

            await connection.confirmTransaction(txId, 'confirmed');

            setSuccess(`Token Minted! Address: ${mintKeypair.publicKey.toBase58()}`);
            setFormData({ name: "", symbol: "", decimals: "9", amount: "1000" });
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to mint token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleMint} className="space-y-4">
            {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded-md break-all">
                    {success}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Token Name</label>
                <input
                    type="text"
                    placeholder="e.g. SolPlay Token"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Symbol</label>
                    <input
                        type="text"
                        placeholder="SPT"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Decimals</label>
                    <input
                        type="number"
                        min="0"
                        max="9"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.decimals}
                        onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Initial Supply</label>
                <input
                    type="number"
                    min="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading || !wallet.connected}
                className={cn(
                    "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                    </>
                ) : (
                    "Mint Token"
                )}
            </button>
            {!wallet.connected && (
                <p className="text-xs text-center text-muted-foreground">Connect wallet to mint</p>
            )}
        </form>
    );
}
