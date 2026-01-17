import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const limit = searchParams.get("limit") || "20";

    if (!address) {
      return NextResponse.json(
        { error: "Missing required parameter: address" },
        { status: 400 }
      );
    }

    const heliusApiKey = process.env.HELIUS_API_KEY;
    const heliusUrl = process.env.HELIUS_URL || "https://api.helius-rpc.com/v0";

    if (!heliusApiKey) {
      return NextResponse.json(
        { error: "Helius API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${heliusUrl}/addresses/${address}/transactions/?api-key=${heliusApiKey}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }

    const transactions: HeliusTransaction[] = await response.json();
    const sortedTransactions = transactions.sort(
      (a, b) => b.blockTime - a.blockTime
    );

    return NextResponse.json(sortedTransactions);
  } catch (error: any) {
    console.error("Helius fetch failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
