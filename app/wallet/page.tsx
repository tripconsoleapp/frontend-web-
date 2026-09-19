import { AppShell } from "@/components/layout/app-shell";
import { WalletStats } from "@/components/wallet/wallet-stats";
import { TransactionList } from "@/components/wallet/transaction-list";
import { WalletEmptyState } from "@/components/wallet/wallet-empty-state";
import { MOCK_TRANSACTIONS, getWalletSummary } from "@/lib/mock-wallet";

export default function WalletPage() {
  const summary = getWalletSummary(MOCK_TRANSACTIONS);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="font-heading text-2xl font-bold text-navy">Wallet</h1>

        <WalletStats {...summary} />

        {MOCK_TRANSACTIONS.length === 0 ? (
          <WalletEmptyState />
        ) : (
          <TransactionList transactions={MOCK_TRANSACTIONS} />
        )}
      </div>
    </AppShell>
  );
}
