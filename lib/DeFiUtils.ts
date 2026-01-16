import {
    PublicKey,
    Transaction,
    Connection,
    Keypair
} from "@solana/web3.js";
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

/**
 * Simulates a "Pull Payment" where a service wallet (delegate) 
 * pulls tokens from a user's wallet without the user's signature.
 */
export async function performPullPayment(
    connection: Connection,
    payer: Keypair, // The "Service" wallet that is the delegate
    ownerPublicKey: PublicKey,
    mintPublicKey: PublicKey,
    amount: number,
    decimals: number
) {
    const sourceATA = await getAssociatedTokenAddress(mintPublicKey, ownerPublicKey);
    const destinationATA = await getAssociatedTokenAddress(mintPublicKey, payer.publicKey);

    const transaction = new Transaction();

    // Ensure Destination ATA exists
    const destInfo = await connection.getAccountInfo(destinationATA);
    if (!destInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                payer.publicKey,
                destinationATA,
                payer.publicKey,
                mintPublicKey
            )
        );
    }

    const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

    transaction.add(
        createTransferInstruction(
            sourceATA,
            destinationATA,
            payer.publicKey, // Authority is the delegate (payer)
            rawAmount,
            [],
            TOKEN_PROGRAM_ID
        )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    transaction.sign(payer);

    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
}

/**
 * Mock data for the simulators
 */
export const PLAYGROUND_SERVICE_WALLET = Keypair.generate(); // Temporary wallet for simulation
