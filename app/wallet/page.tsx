import { AppShell } from "@/components/layout/app-shell";
import { WalletView } from "@/components/wallet/wallet-view";
import { MOCK_TRANSACTIONS } from "@/lib/mock-wallet";

export default function WalletPage() {
  return (
    <AppShell>
      <WalletView transactions={MOCK_TRANSACTIONS} />
    </AppShell>
  );
}
