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
import { Info, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";

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
            // 1. Get the minimum lamports for a Mint Account to be rent-exempt
            const lamports = await getMinimumBalanceForRentExemptMint(connection);

            // 2. Generate a new keypair for the Token Mint itself
            const mintKeypair = Keypair.generate();

            // 3. Derive the Associated Token Account (ATA) address for the user
            const tokenATA = await getAssociatedTokenAddress(
                mintKeypair.publicKey,
                wallet.publicKey
            );

            // 4. Build the transaction with 4 instructions:
            const transaction = new Transaction().add(
                // A) Create the account for the Mint
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID,
                }),
                // B) Initialize it as a Mint
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    Number(formData.decimals),
                    wallet.publicKey,
                    wallet.publicKey,
                    TOKEN_PROGRAM_ID
                ),
                // C) Create the user's ATA for this new token
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    tokenATA,
                    wallet.publicKey,
                    mintKeypair.publicKey
                ),
                // D) Mint the initial supply into the user's ATA
                createMintToInstruction(
                    mintKeypair.publicKey,
                    tokenATA,
                    wallet.publicKey,
                    Number(formData.amount) * Math.pow(10, Number(formData.decimals))
                )
            );

            // 5. Fetch the latest blockhash with 'confirmed' commitment for reliability
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // 6. Partially sign with the Mint Keypair (since we're creating it)
            transaction.partialSign(mintKeypair);

            // 7. Request wallet signature and send
            const signedTx = await wallet.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });

            // 8. Use the modern confirmation strategy
            await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature: txId
            }, 'confirmed');

            setSuccess(`Success! Minted ${formData.amount} tokens. Mint ID: ${mintKeypair.publicKey.toBase58().slice(0, 8)}...`);
            setFormData({ name: "", symbol: "", decimals: "9", amount: "1000" });
        } catch (err: any) {
            console.error("Mint Error Details:", err);

            // Extract simulation logs if it's a SendTransactionError
            if (err.logs) {
                console.error("Simulation Logs:", err.logs);
                setError(`Simulation Failed: ${err.message}. Check console for logs.`);
            } else {
                setError(err.message || "Failed to mint token");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleMint} className="space-y-4">
            {error && (
                <div className="p-3 text-xs font-semibold text-black bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 text-xs font-semibold text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg break-all">
                    {success}
                </div>
            )}

            <div className="flex flex-col items-center py-6">
                <div className="text-5xl font-bold text-foreground tracking-tighter mb-2">0</div>
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">SPT</div>
            </div>

            <div className="space-y-4 border border-border rounded-xl overflow-hidden divide-y divide-border">
                <div className="p-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all cursor-pointer group">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Name</div>
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="SPLay Token"
                        className="text-right font-bold text-sm bg-transparent outline-none border-none placeholder:text-muted-foreground/30 text-foreground"
                    />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all cursor-pointer group">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Symbol</div>
                    <input
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="SPT"
                        className="text-right font-bold text-sm bg-transparent outline-none border-none placeholder:text-muted-foreground/30 text-foreground"
                    />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all cursor-pointer group">
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Decimals</div>
                        <Tooltip content="Smallest unit of your token. Solana standard is 9 (like 1.000000000). Use 0 for NFTs or non-divisible items.">
                            <Info className="w-3 h-3 text-muted-foreground" />
                        </Tooltip>
                    </div>
                    <input
                        type="number"
                        value={formData.decimals}
                        onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                        className="text-right font-bold text-sm bg-transparent outline-none border-none max-w-[60px] text-foreground"
                    />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all cursor-pointer group">
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Initial Supply</div>
                        <Tooltip content="Total amount of tokens to create immediately and send to your wallet.">
                            <Info className="w-3 h-3 text-muted-foreground" />
                        </Tooltip>
                    </div>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="text-right font-bold text-sm bg-transparent outline-none border-none text-foreground"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !wallet.connected}
                className={cn(
                    "inline-flex w-full items-center justify-center rounded-full text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground",
                    "bg-primary text-primary-foreground hover:bg-primary/95 h-12 shadow-sm mt-4 cursor-pointer"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                    </>
                ) : (
                    "Preview Mint"
                )}
            </button>
            {!wallet.connected && (
                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider mt-2">Connect wallet to mint tokens</p>
            )}
        </form>
    );
}
