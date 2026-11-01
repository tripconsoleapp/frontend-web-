"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ticket as TicketIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { formatCurrency } from "@/lib/mock-trips";
import { BUS_TYPE_LABELS } from "@/lib/ksrtc-ticket-data";
import { getAllMockTickets, getTicketLifecycleStatus, type TicketLifecycleStatus } from "@/lib/ksrtc-ticket-state";
import type { MockKsrtcTicket } from "@/lib/ksrtc-ticket-api";

const TABS: { value: TicketLifecycleStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function TicketsListView() {
  const [tickets, setTickets] = useState<MockKsrtcTicket[] | null>(null);
  const [tab, setTab] = useState<TicketLifecycleStatus>("upcoming");

  useEffect(() => {
    setTickets(getAllMockTickets());
  }, []);

  const filtered = (tickets ?? []).filter((t) => getTicketLifecycleStatus(t) === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-navy">My Tickets</h1>
        <Link href="/tickets/search" className={buttonVariants({ variant: "accent" })}>
          + Book a Ticket
        </Link>
      </div>

      <SegmentedTabs options={TABS} value={tab} onChange={(v) => setTab(v as TicketLifecycleStatus)} />

      {tickets === null ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl border border-navy/10 bg-navy/[0.03]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
            <TicketIcon size={20} />
          </span>
          <p className="font-heading text-base font-semibold text-navy">No {tab} tickets.</p>
          <p className="font-body text-sm text-text-grey">Scheduled KSRTC bus tickets you book will show up here.</p>
          <Link href="/tickets/search" className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Book a ticket
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-4 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading text-base font-semibold text-navy">
                  {ticket.fromLabel} &rarr; {ticket.toLabel}
                </p>
                <p className="font-body text-xs text-text-grey">
                  {BUS_TYPE_LABELS[ticket.service.busType]} &middot; {formatDate(ticket.service.journeyDate)} &middot; {ticket.service.departureTime} &middot; {ticket.passengers.length} seat{ticket.passengers.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-heading text-base font-bold text-navy">{formatCurrency(ticket.fare.totalAmount)}</p>
                <ArrowRight size={15} className="text-text-grey" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
