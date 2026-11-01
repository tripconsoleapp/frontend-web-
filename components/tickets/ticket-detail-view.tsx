"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Download, X } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { BUS_TYPE_LABELS } from "@/lib/ksrtc-ticket-data";
import { getMockTicket, getTicketLifecycleStatus, type TicketLifecycleStatus } from "@/lib/ksrtc-ticket-state";
import type { MockKsrtcTicket } from "@/lib/ksrtc-ticket-api";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Deterministic, decorative "QR" — a seeded square grid, not a real
 *  scannable code. There is no backend to issue a verifiable one yet. */
function TicketQrCode({ seed }: { seed: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const size = 9;
  const cells: boolean[] = [];
  let state = h >>> 0;
  for (let i = 0; i < size * size; i++) {
    state = (state * 1103515245 + 12345) >>> 0;
    cells.push((state >>> 16) % 2 === 0);
  }
  return (
    <div className="grid grid-cols-9 gap-[2px] rounded-lg bg-white p-2" style={{ width: 144, height: 144 }}>
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-navy" : "bg-transparent"} />
      ))}
    </div>
  );
}

function downloadTicket(ticket: MockKsrtcTicket) {
  const lines = [
    "TripConsole — KSRTC Ticket",
    `Reference: ${ticket.id}`,
    `Route: ${ticket.fromLabel} -> ${ticket.toLabel}`,
    `Service: ${BUS_TYPE_LABELS[ticket.service.busType]}`,
    `Date: ${formatDate(ticket.service.journeyDate)}`,
    `Departure: ${ticket.service.departureTime} | Arrival: ${ticket.service.arrivalTime}`,
    `Boarding point: ${ticket.boardingPointLabel}`,
    `Dropping point: ${ticket.droppingPointLabel}`,
    "",
    "Passengers:",
    ...ticket.passengers.map((p) => `  Seat ${p.seatLabel} — ${p.name} (${p.age}, ${p.gender})`),
    "",
    `Amount paid: ${formatCurrency(ticket.fare.totalAmount)}`,
    "",
    "This is a demo booking — no real reservation has been made.",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ticket.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<MockKsrtcTicket | null | undefined>(undefined);
  const [status, setStatus] = useState<TicketLifecycleStatus | null>(null);

  useEffect(() => {
    const found = getMockTicket(ticketId);
    setTicket(found);
    if (found) setStatus(getTicketLifecycleStatus(found));
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

  const isCancelled = status === "cancelled";

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className={`relative flex flex-col justify-end overflow-hidden rounded-3xl p-8 ${isCancelled ? "bg-navy/80" : "bg-navy"}`}>
        <div className="flex flex-col gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${isCancelled ? "bg-white/20 text-white" : "bg-mint text-navy"}`}>
            {isCancelled ? <X size={20} /> : <Check size={20} />}
          </span>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-mint">{isCancelled ? "Ticket Cancelled" : status === "completed" ? "Journey Completed" : "KSRTC Ticket Confirmed"}</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">
              {ticket.fromLabel} &rarr; {ticket.toLabel}
            </h1>
            <p className="mt-1 max-w-md font-body text-sm text-white/85">This is a demo booking — no real reservation has been made.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_200px]">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Reference</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{ticket.id}</p>
            </div>
            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amount Paid</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{formatCurrency(ticket.fare.totalAmount)}</p>
            </div>
            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Status</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{isCancelled ? "Cancelled" : status === "completed" ? "Completed" : "Confirmed"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Journey details</p>
            <div className="mt-3 grid grid-cols-1 gap-2 font-body text-sm text-navy sm:grid-cols-2">
              <p><span className="text-text-grey">Service:</span> {BUS_TYPE_LABELS[ticket.service.busType]}</p>
              <p><span className="text-text-grey">Date:</span> {formatDate(ticket.service.journeyDate)}</p>
              <p><span className="text-text-grey">Departure:</span> {ticket.service.departureTime}</p>
              <p><span className="text-text-grey">Arrival:</span> {ticket.service.arrivalTime}</p>
              <p><span className="text-text-grey">Boarding point:</span> {ticket.boardingPointLabel}</p>
              <p><span className="text-text-grey">Dropping point:</span> {ticket.droppingPointLabel}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passengers &amp; Seats</p>
            <ul className="mt-3 flex flex-col gap-2">
              {ticket.passengers.map((p) => (
                <li key={p.seatId} className="flex items-center justify-between font-body text-sm text-navy">
                  <span>{p.name} &middot; {p.age}, {p.gender}</span>
                  <span className="font-semibold text-text-grey">Seat {p.seatLabel}</span>
                </li>
              ))}
            </ul>
          </div>

          {isCancelled && typeof ticket.refundAmount === "number" && (
            <div className="rounded-2xl bg-mint/30 px-4 py-3.5">
              <p className="font-body text-sm font-semibold text-navy">Refund of {formatCurrency(ticket.refundAmount)} credited to your Wallet.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Scan on board</p>
          <TicketQrCode seed={ticket.id} />
          <p className="text-center font-body text-[11px] text-text-grey">Demo QR — not scannable</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/trips" className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-semibold text-navy hover:bg-navy/5">
          Back to My Trips
        </Link>
        <button type="button" onClick={() => downloadTicket(ticket)} className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-semibold text-navy hover:bg-navy/5">
          <Download size={14} /> Download
        </button>
        {!isCancelled && status === "upcoming" && (
          <Link href={`/tickets/${ticket.id}/cancel`} className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-6 py-3 font-body text-sm font-semibold text-white hover:bg-destructive-hover">
            Cancel Ticket
          </Link>
        )}
      </div>
    </div>
  );
}
