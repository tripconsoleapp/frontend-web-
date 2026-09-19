import { Wallet } from "lucide-react";

export function WalletEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
        <Wallet size={26} />
      </span>
      <h2 className="font-heading text-lg font-semibold text-navy">
        No transactions yet
      </h2>
      <p className="max-w-sm font-body text-sm text-text-grey">
        Payments and refunds for your trips will show up here once you make
        your first booking.
      </p>
    </div>
  );
}
