import { TransactionHistory } from "@/components/TransactionHistory";
import { DocBlock } from "@/components/DocBlock";

export default function HistoryPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <img src="/SPLay-icon.svg" alt="SPLay Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Transaction History</h1>
                        <p className="text-sm text-muted-foreground font-medium">View your recent on-chain activity on Solana Devnet.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
                <TransactionHistory />
            </div>

            <DocBlock
                title="The Solana Transaction Ledger"
                description="Everything on Solana is a transaction. Whether you are sending money, minting a token, or just changing a setting, a signed message is sent to a validator who executes the instructions and records the state change permanently in the ledger."
                links={[
                    { label: "Transaction Lifecycle", href: "https://docs.solana.com/developing/programming-model/transactions" },
                    { label: "Solana Explorer", href: "https://explorer.solana.com/" },
                    { label: "Solscan Activity", href: "https://solscan.io/" }
                ]}
            />
        </div>
    );
}
