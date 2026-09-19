import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { Transaction, TransactionStatus } from "@/lib/mock-wallet";

const STATUS_CLASSES: Record<TransactionStatus, string> = {
  paid: "bg-mint/50 text-navy",
  pending: "bg-amber-100 text-amber-800",
  refunded: "bg-navy/10 text-navy",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
};

function getDetailHref(transaction: Transaction) {
  if (transaction.status === "pending") {
    return `/trips/${transaction.tripId}/pay`;
  }
  return `/trips/${transaction.tripId}/receipt`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-navy/10 bg-navy/[0.02]">
          <tr>
            <th className="px-6 py-3 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Trip
            </th>
            <th className="px-6 py-3 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Date
            </th>
            <th className="px-6 py-3 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Amount
            </th>
            <th className="px-6 py-3 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4">
                <Link
                  href={getDetailHref(transaction)}
                  className="font-body text-sm font-medium text-navy hover:underline"
                >
                  {transaction.tripName}
                </Link>
              </td>
              <td className="px-6 py-4 font-body text-sm text-text-grey">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 font-body text-sm font-medium text-navy">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-body text-xs font-semibold",
                    STATUS_CLASSES[transaction.status]
                  )}
                >
                  {STATUS_LABELS[transaction.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
