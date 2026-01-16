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
import { Info, Loader2, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { createMetadataAccountV3, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters';
import { publicKey, createNoopSigner } from '@metaplex-foundation/umi';

const TEMPLATES = [
    {
        name: "PayPal USD",
        symbol: "PYUSD",
        decimals: "6",
        uri: "https://token-metadata.paxos.com/pyusd_metadata/prod/solana/pyusd_metadata.json",
        color: "bg-[#003087]"
    },
    {
        name: "Bonk",
        symbol: "BONK",
        decimals: "5",
        uri: "https://arweave.net/h9P_S_U2vO7X2sC3FfG8O5_X-2J8-5S8_U2J_X-2J8-5S8",
        color: "bg-[#f5a623]"
    },
    {
        name: "USDC",
        symbol: "USDC",
        decimals: "6",
        uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/metadata.json",
        color: "bg-[#2775ca]"
    }
];

export function TokenMint() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        decimals: "9",
        amount: "1000",
        uri: "", // Metadata JSON URI
    });

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 512;
                    const MAX_HEIGHT = 512;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/png", 0.8));
                };
            };
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadMetadata = async (name: string, symbol: string) => {
        if (!image) return null;
        setUploading(true);
        try {
            const compressedBase64 = await compressImage(image);
            const response = await fetch("/api/upload-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    symbol,
                    imageBase64: compressedBase64,
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data.uri;
        } catch (err: any) {
            setError("Upload failed: " + err.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

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
            let finalUri = formData.uri;

            if (image) {
                const uploadedUri = await uploadMetadata(formData.name, formData.symbol);
                if (!uploadedUri) return;
                finalUri = uploadedUri;
            }

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

            // 4.5. Add Metaplex Metadata if Name/Symbol provided
            if (formData.name && formData.symbol) {
                const umi = createUmi(connection.rpcEndpoint).use(web3JsRpc(connection));
                const mintPubkey = fromWeb3JsPublicKey(mintKeypair.publicKey);
                const walletPubkey = fromWeb3JsPublicKey(wallet.publicKey);
                const metadataPDA = findMetadataPda(umi, { mint: mintPubkey });

                const metadataInstruction = createMetadataAccountV3(umi, {
                    metadata: metadataPDA,
                    mint: mintPubkey,
                    mintAuthority: createNoopSigner(walletPubkey),
                    payer: createNoopSigner(walletPubkey),
                    updateAuthority: walletPubkey,
                    data: {
                        name: formData.name,
                        symbol: formData.symbol,
                        uri: finalUri || "",
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: null,
                });

                const web3jsInstruction = toWeb3JsInstruction(metadataInstruction.getInstructions()[0]);
                transaction.add(web3jsInstruction);
            }

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

            setSuccess(`Success! Minted ${formData.amount} ${formData.symbol || 'tokens'}. Mint ID: ${mintKeypair.publicKey.toBase58().slice(0, 8)}...`);
            setFormData({ name: "", symbol: "", decimals: "9", amount: "1000", uri: "" });
            setImage(null);
            setImagePreview(null);
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

            <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Quick Templates</div>
                <div className="flex gap-2">
                    {TEMPLATES.map((t) => (
                        <button
                            key={t.symbol}
                            type="button"
                            onClick={() => setFormData({ ...formData, name: t.name, symbol: t.symbol, decimals: t.decimals, uri: t.uri })}
                            className={cn(
                                "flex-1 py-2 rounded-lg border border-border hover:border-primary transition-all flex flex-col items-center gap-1 group",
                                formData.symbol === t.symbol ? "bg-primary/5 border-primary" : "bg-white"
                            )}
                        >
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", t.color)}>
                                {t.symbol[0]}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary">{t.symbol}</span>
                        </button>
                    ))}
                </div>
            </div>

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
                <div className="p-4 flex flex-col gap-4 hover:bg-[#f4f7f9] transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors text-left">Token Icon</div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="token-icon"
                        />
                        <label
                            htmlFor="token-icon"
                            className="cursor-pointer px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full hover:bg-primary/20 transition-all uppercase tracking-tighter"
                        >
                            {image ? "Change Image" : "Upload Image"}
                        </label>
                    </div>
                    {imagePreview && (
                        <div className="flex justify-center">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm bg-white flex items-center justify-center">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                >
                    {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Advanced Settings
                </button>

                {showAdvanced && (
                    <div className="border border-border rounded-xl overflow-hidden divide-y divide-border bg-[#f8fafc]/50">
                        <div className="p-4 flex items-center justify-between hover:bg-[#f4f7f9] transition-all cursor-pointer group">
                            <div className="flex items-center gap-2 text-left">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Metadata JSON URI</div>
                                <Tooltip content="Link to a JSON file (Arweave/IPFS/GitHub) containing your token icon. If you upload an image, this will be automatically generated.">
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                </Tooltip>
                            </div>
                            <input
                                value={formData.uri}
                                onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                                placeholder={uploading ? "Uploading to GitHub..." : (image ? "Generated on Mint" : "https://...")}
                                disabled={uploading}
                                className="text-right font-bold text-sm bg-transparent outline-none border-none placeholder:text-muted-foreground/30 text-foreground flex-1 ml-4"
                            />
                        </div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || uploading || !wallet.connected}
                className={cn(
                    "inline-flex w-full items-center justify-center rounded-full text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground",
                    "bg-primary text-primary-foreground hover:bg-primary/95 h-12 shadow-sm mt-4 cursor-pointer"
                )}
            >
                {loading || uploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? "Uploading..." : "Minting..."}
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
