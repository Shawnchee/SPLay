const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const HELIUS_URL = process.env.NEXT_PUBLIC_HELIUS_URL || "https://api.helius-rpc.com/v0";

export type TransactionCategory = 
  | "token_transfer"
  | "swap"
  | "liquidity"
  | "staking"
  | "mint"
  | "burn"
  | "nft"
  | "other";

export interface HeliusTransaction {
  signature: string;
  blockTime: number;
  type: string;
  status: "success" | "failed";
  fee: number;
  feePayer: string;
  source: string;
  description: string;
  instructions: Array<{
    programName: string;
    instructionName: string;
  }>;
  events: {
    nft?: Array<any>;
    token?: Array<any>;
    compressed?: Array<any>;
  };
}

// Categorize Helius transaction types (cause was having issues with solana tx types)
// Docs here: https://www.helius.dev/docs/api-reference/enhanced-transactions/gettransactionsbyaddress
const TRANSACTION_TYPES: Record<string, TransactionCategory> = {
  // Token Transfers
  TRANSFER: "token_transfer",
  TOKEN_SWAP: "swap",

  // Swap & Exchange
  SWAP: "swap",
  SWAP_EXACT_OUT: "swap",
  SWAP_WITH_PRICE_IMPACT: "swap",
  PLACE_AND_TAKE_PERP_ORDER: "swap",

  // Liquidity
  ADD_LIQUIDITY: "liquidity",
  REMOVE_LIQUIDITY: "liquidity",
  ADD_LIQUIDITY_ONE_SIDE: "liquidity",
  REMOVE_LIQUIDITY_BY_RANGE: "liquidity",
  ADD_LIQUIDITY_BY_WEIGHT: "liquidity",
  REMOVE_LIQUIDITY_SINGLE_SIDE: "liquidity",
  INCREASE_LIQUIDITY: "liquidity",
  DECREASE_LIQUIDITY: "liquidity",
  ADD_BALANCE_LIQUIDITY: "liquidity",
  ADD_IMBALANCE_LIQUIDITY: "liquidity",
  REMOVE_BALANCE_LIQUIDITY: "liquidity",
  COLLECT_FEES: "liquidity",
  SYNC_LIQUIDITY: "liquidity",
  ADMIN_SYNC_LIQUIDITY: "liquidity",

  // Staking & Rewards
  STAKE: "staking",
  UNSTAKE: "staking",
  STAKE_TOKEN: "staking",
  UNSTAKE_TOKEN: "staking",
  CLAIM_REWARD: "staking",
  CLAIM_REWARDS: "staking",
  HARVEST_REWARD: "staking",
  REWARD_USER_ONCE: "staking",
  DEPOSIT_TO_FARM_VAULT: "staking",
  WITHDRAW_FROM_FARM_VAULT: "staking",
  REFRESH_FARMER: "staking",
  REFRESH_FARM: "staking",

  // Mint & Burn
  MINT_TO: "mint",
  TOKEN_MINT: "mint",
  BURN: "burn",
  BURN_NFT: "burn",
  BURN_PAYMENT: "burn",

  // NFT Operations
  COMPRESSED_NFT_MINT: "nft",
  COMPRESSED_NFT_TRANSFER: "nft",
  COMPRESSED_NFT_BURN: "nft",
  NFT_MINT: "nft",
  NFT_SALE: "nft",
  NFT_LISTING: "nft",
  NFT_CANCEL_LISTING: "nft",
  NFT_BID: "nft",
  NFT_AUCTION_CREATED: "nft",
  CREATE_MASTER_EDITION: "nft",
  CREATE_METADATA_ACCOUNT: "nft",
  COMPRESS_NFT: "nft",
  DECOMPRESS_NFT: "nft",
};

export function categorizeTransaction(type: string): TransactionCategory {
  return TRANSACTION_TYPES[type] || "other";
}

export async function getHeliusTransactions(
  address: string,
  limit = 20
): Promise<HeliusTransaction[]> {
  if (!HELIUS_API_KEY) {
    throw new Error("Helius API key not configured");
  }

  try {
    const response = await fetch(
      `${HELIUS_URL}/addresses/${address}/transactions/?api-key=${HELIUS_API_KEY}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const transactions: HeliusTransaction[] = await response.json();
    return transactions.sort((a, b) => b.blockTime - a.blockTime);
  } catch (error) {
    console.error("Helius fetch failed:", error);
    throw error;
  }
}

export function getTransactionDescription(tx: HeliusTransaction): string {
  if (tx.description && tx.description !== "Unknown") {
    return tx.description;
  }

  // Fallback: Build description from instructions
  if (tx.instructions && tx.instructions.length > 0) {
    const programs = [...new Set(tx.instructions.map((i) => i.programName))];
    return programs.join(" → ");
  }

  return tx.type || "Transaction";
}

export function getTransactionEmoji(category: TransactionCategory): string {
  const emojis: Record<TransactionCategory, string> = {
    token_transfer: "💸",
    swap: "🔄",
    liquidity: "💧",
    staking: "🪨",
    mint: "✨",
    burn: "🔥",
    nft: "🖼️",
    other: "📝",
  };
  return emojis[category];
}
