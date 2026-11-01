"use client";

import { useEffect, useState } from "react";
import { WalletStats } from "@/components/wallet/wallet-stats";
import { TransactionList } from "@/components/wallet/transaction-list";
import { WalletEmptyState } from "@/components/wallet/wallet-empty-state";
import { Transaction, getWalletSummary } from "@/lib/mock-wallet";
import { getTicketRefundTransactions } from "@/lib/ksrtc-ticket-state";

/** Merges the static Wallet mock transactions with any cancelled-KSRTC-ticket
 *  refunds recorded this session — lib/mock-wallet.ts is never mutated, so a
 *  real refund feed can replace getTicketRefundTransactions() later without
 *  this page changing. Client-only because the ticket refund list lives in
 *  sessionStorage. */
export function WalletView({ transactions }: { transactions: Transaction[] }) {
  const [merged, setMerged] = useState(transactions);

  useEffect(() => {
    const refunds = getTicketRefundTransactions();
    if (refunds.length > 0) {
      setMerged([...refunds, ...transactions].sort((a, b) => b.date.localeCompare(a.date)));
    }
  }, [transactions]);

  const summary = getWalletSummary(merged);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Wallet</h1>

      <WalletStats {...summary} />

      {merged.length === 0 ? <WalletEmptyState /> : <TransactionList transactions={merged} />}
    </div>
  );
}
