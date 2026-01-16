import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchMetadataFromSeeds } from '@metaplex-foundation/mpl-token-metadata';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { publicKey } from '@metaplex-foundation/umi';
import { Connection } from '@solana/web3.js';

// Cache to prevent redundant fetches within a session
const metadataCache = new Map<string, { name: string; symbol: string; image: string } | null>();

/**
 * Fetches Metaplex metadata for a given mint address.
 * Standard SPL tokens use this for names, symbols, and icons.
 */
export async function getTokenMetadata(connection: Connection, mintAddress: string) {
    // 1. Check cache first
    if (metadataCache.has(mintAddress)) {
        return metadataCache.get(mintAddress);
    }

    // 2. Handle Native SOL fallback (since it doesn't have a Metaplex metadata account)
    if (mintAddress === "So11111111111111111111111111111111111111112") {
        return {
            name: "Solana",
            symbol: "SOL",
            image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
        };
    }

    // 3. Initialize Umi with the existing connection
    const umi = createUmi(connection.rpcEndpoint).use(web3JsRpc(connection));

    try {
        // 4. Fetch the Metadata PDA data
        const metadata = await fetchMetadataFromSeeds(umi, {
            mint: publicKey(mintAddress),
        });

        const name = metadata.name.replace(/\0/g, '').trim();
        const symbol = metadata.symbol.replace(/\0/g, '').trim();
        let image = "";

        // 5. If there's an external URI, attempt to fetch the JSON for the icon
        if (metadata.uri) {
            try {
                const response = await fetch(metadata.uri);
                if (response.ok) {
                    const json = await response.json();
                    image = json.image || json.icon || "";
                }
            } catch (e) {
                // Silently fail icon fetch, name/symbol still useful
                console.warn(`Could not fetch JSON for ${mintAddress}:`, e);
            }
        }

        const result = { name, symbol, image };
        metadataCache.set(mintAddress, result);
        return result;

    } catch (e) {
        // Token likely has no Metaplex metadata
        metadataCache.set(mintAddress, null);
        return null;
    }
}
