"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/mock-trips";
import { BUS_TYPE_LABELS } from "@/lib/ksrtc-ticket-data";
import { getRefundAmount } from "@/lib/ksrtc-ticket-api";
import { getMockTicket, getTicketLifecycleStatus, cancelMockTicket } from "@/lib/ksrtc-ticket-state";
import type { MockKsrtcTicket } from "@/lib/ksrtc-ticket-api";

function hoursUntil(ticket: MockKsrtcTicket): number {
  const departure = new Date(`${ticket.service.journeyDate}T${ticket.service.departureTime}:00`);
  return (departure.getTime() - Date.now()) / (1000 * 60 * 60);
}

export function TicketCancelView({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<MockKsrtcTicket | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelled, setCancelled] = useState<MockKsrtcTicket | null>(null);

  useEffect(() => {
    setTicket(getMockTicket(ticketId));
  }, [ticketId]);

  if (ticket === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;

  if (!ticket) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This ticket couldn&apos;t be found.</p>
        <button type="button" onClick={() => router.push("/tickets")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to My Tickets
        </button>
      </div>
    );
  }

  if (!cancelled && (ticket.cancelledAt || getTicketLifecycleStatus(ticket) !== "upcoming")) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">
          {ticket.cancelledAt ? "This ticket has already been cancelled." : "Completed journeys can't be cancelled."}
        </p>
        <Link href={`/tickets/${ticket.id}`} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          View ticket
        </Link>
      </div>
    );
  }

  const hours = hoursUntil(ticket);
  const refundAmount = getRefundAmount(ticket.fare, hours);

  if (cancelled) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-navy/10 bg-white px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-navy">
          <Check size={24} />
        </span>
        <h1 className="font-heading text-xl font-bold text-navy">Ticket cancelled</h1>
        <p className="max-w-sm font-body text-sm text-text-grey">
          {refundAmount > 0
            ? `A refund of ${formatCurrency(refundAmount)} has been credited to your Wallet.`
            : "This cancellation isn't eligible for a refund under the cancellation policy."}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link href="/wallet" className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white hover:bg-orange/90">
            View Wallet
          </Link>
          <Link href={`/tickets/${ticket.id}`} className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-semibold text-navy hover:bg-navy/5">
            View Ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <button type="button" onClick={() => router.push(`/tickets/${ticket.id}`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to ticket
      </button>

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Cancel this ticket?</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {ticket.fromLabel} &rarr; {ticket.toLabel} &middot; {BUS_TYPE_LABELS[ticket.service.busType]}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3.5">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
        <p className="font-body text-sm text-destructive">This cannot be undone. Your seats will be released for other passengers.</p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Refund estimate</p>
        <p className="mt-1 font-body text-sm text-text-grey">Amount paid: {formatCurrency(ticket.fare.totalAmount)}</p>
        <p className="mt-2 font-heading text-xl font-bold text-navy">{formatCurrency(refundAmount)} refund</p>
        <p className="mt-1 font-body text-xs text-text-grey">
          {hours >= 4
            ? "Full fare refunded — only the reservation fee and GST are non-refundable."
            : hours >= 1
              ? "50% of the fare refunded — within 4 hours of departure."
              : "No refund — within 1 hour of departure or after the bus has departed."}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="self-start rounded-full bg-destructive px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-destructive-hover"
      >
        Cancel Ticket
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this ticket?"
        description={`You'll receive a refund of ${formatCurrency(refundAmount)} to your Wallet. This can't be undone.`}
        confirmLabel="Yes, Cancel"
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          const result = cancelMockTicket(ticket.id, refundAmount);
          setConfirmOpen(false);
          if (result) setCancelled(result);
        }}
      />
    </div>
  );
}
