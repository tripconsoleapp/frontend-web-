import { formatCurrency } from "@/lib/mock-trips";

export function WalletStats({
  totalBalance,
  pendingPayments,
  totalSpent,
}: {
  totalBalance: number;
  pendingPayments: number;
  totalSpent: number;
}) {
  const STATS = [
    { label: "Total Balance", value: totalBalance },
    { label: "Pending Payments", value: pendingPayments },
    { label: "Total Spent", value: totalSpent },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-navy/10 bg-white p-6"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            {stat.label}
          </p>
          <p className="mt-2 font-heading text-2xl font-bold text-navy">
            {formatCurrency(stat.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
