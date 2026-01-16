import { TransactionHistory } from "@/components/TransactionHistory";

export default function HistoryPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Transaction History</h1>
                    <p className="text-sm text-muted-foreground font-medium">View your recent on-chain activity on Solana Devnet.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
                <TransactionHistory />
            </div>
        </div>
    );
}
