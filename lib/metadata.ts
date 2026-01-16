import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
    fetchMetadataFromSeeds,
    findMetadataPda,
    deserializeMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { publicKey } from '@metaplex-foundation/umi';
import { Connection, PublicKey } from '@solana/web3.js';

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
                // Add cache-buster for GitHub raw URLs to avoid CDN lag
                const uriWithCache = metadata.uri.includes('github') ? `${metadata.uri}?v=${Date.now()}` : metadata.uri;
                const response = await fetch(uriWithCache);
                if (response.ok) {
                    const json = await response.json();
                    image = json.image || json.icon || "";
                } else if (metadata.uri.includes('raw.githubusercontent.com')) {
                    // Try the ?raw=true fallback if the raw subdomain is 404 (common on fresh uploads)
                    const fallbackUri = metadata.uri.replace('raw.githubusercontent.com', 'github.com').replace('/main/', '/blob/main/') + '?raw=true';
                    try {
                        const fbResponse = await fetch(fallbackUri);
                        if (fbResponse.ok) {
                            const json = await fbResponse.json();
                            image = json.image || json.icon || "";
                        }
                    } catch (fbErr) { }
                }
            } catch (e) {
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

/**
 * Advanced: Fetches metadata for an array of tokens in a single RPC batch.
 * This is 90% more efficient than fetching one-by-one.
 */
export async function getTokensMetadataBatch(connection: Connection, mints: string[]) {
    const results: Record<string, { name: string; symbol: string; image: string } | null> = {};
    const mintsToFetch: string[] = [];

    // 1. Filter out cached items
    for (const mint of mints) {
        if (metadataCache.has(mint)) {
            results[mint] = metadataCache.get(mint) || null;
        } else if (mint === "So11111111111111111111111111111111111111112") {
            const solData = {
                name: "Solana",
                symbol: "SOL",
                image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
            };
            results[mint] = solData;
            metadataCache.set(mint, solData);
        } else {
            mintsToFetch.push(mint);
        }
    }

    if (mintsToFetch.length === 0) return results;

    const umi = createUmi(connection.rpcEndpoint).use(web3JsRpc(connection));

    try {
        // 2. Derive PDAs for all mints
        const pdaAddresses = mintsToFetch.map(mint =>
            findMetadataPda(umi, { mint: publicKey(mint) })[0]
        );

        // 3. Convert Umi PublicKeys to Web3JS for the RPC call
        const web3PdaAddresses = pdaAddresses.map(pda => new PublicKey(pda));

        // 4. Batch fetch account info
        const accountInfos = await connection.getMultipleAccountsInfo(web3PdaAddresses);

        // 5. Parse results
        await Promise.all(accountInfos.map(async (info, index) => {
            const mint = mintsToFetch[index];
            if (!info) {
                metadataCache.set(mint, null);
                results[mint] = null;
                return;
            }

            try {
                // Deserialize Metaplex metadata
                const metadata = deserializeMetadata({
                    publicKey: pdaAddresses[index],
                    ...info,
                    data: new Uint8Array(info.data)
                } as any);

                const name = metadata.name.replace(/\0/g, '').trim();
                const symbol = metadata.symbol.replace(/\0/g, '').trim();
                let image = "";

                // Small optimization: only fetch JSON if needed
                if (metadata.uri) {
                    try {
                        const uriWithCache = metadata.uri.includes('github') ? `${metadata.uri}?v=${Date.now()}` : metadata.uri;
                        const response = await fetch(uriWithCache);
                        if (response.ok) {
                            const json = await response.json();
                            image = json.image || json.icon || "";
                        } else if (metadata.uri.includes('raw.githubusercontent.com')) {
                            // Try fallback
                            const fallbackUri = metadata.uri.replace('raw.githubusercontent.com', 'github.com').replace('/main/', '/blob/main/') + '?raw=true';
                            try {
                                const fbResponse = await fetch(fallbackUri);
                                if (fbResponse.ok) {
                                    const json = await fbResponse.json();
                                    image = json.image || json.icon || "";
                                }
                            } catch (fbErr) { }
                        }
                    } catch (e) { }
                }

                const metadataResult = { name, symbol, image };
                metadataCache.set(mint, metadataResult);
                results[mint] = metadataResult;
            } catch (e) {
                metadataCache.set(mint, null);
                results[mint] = null;
            }
        }));

    } catch (e) {
        console.error("Batch metadata fetch failed:", e);
    }

    return results;
}
