"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bus, Calendar, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Trip,
  TripStatus,
  formatCurrency,
  formatDateRange,
  getStatusAction,
  getStatusLabel,
  getTripActionHref,
} from "@/lib/mock-trips";
import { getUpcomingMockTickets } from "@/lib/ksrtc-ticket-state";
import type { MockKsrtcTicket } from "@/lib/ksrtc-ticket-api";

function tripValue(trip: Trip) {
  return trip.amountSettled ?? trip.invoiceAmount ?? trip.estimatedTotal ?? null;
}

const STATUS_DOT_CLASS: Record<TripStatus, string> = {
  draft: "bg-navy/25",
  submitted: "bg-mint",
  verified: "bg-orange",
  paid: "bg-navy",
  complete: "bg-navy/25",
};

type Row =
  | { kind: "trip"; key: string; date: string; trip: Trip }
  | { kind: "ticket"; key: string; date: string; ticket: MockKsrtcTicket };

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function FeaturedTrip({ trip }: { trip: Trip }) {
  const value = tripValue(trip);

  return (
    <Link
      href={getTripActionHref(trip)}
      className="group flex flex-col gap-5 overflow-hidden rounded-[20px] border border-navy/10 sm:flex-row"
    >
      <div className="relative h-56 shrink-0 overflow-hidden sm:h-auto sm:w-[42%]">
        <Image
          src={trip.imageUrl}
          alt={trip.name}
          fill
          sizes="(min-width: 640px) 40vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:py-8 sm:pr-8">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Featured</p>
          <h3 className="mt-1.5 font-serif text-2xl leading-tight text-navy">{trip.name}</h3>
          <p className="mt-1 font-body text-sm text-text-grey">{trip.location}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-sm text-text-grey">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {trip.travelers} travelers
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[trip.status]}`} />
              {getStatusLabel(trip.status)}
            </span>
          </div>

          {typeof trip.progress === "number" && (
            <div className="mt-5 max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                <div className="h-full rounded-full bg-orange" style={{ width: `${trip.progress}%` }} />
              </div>
              <p className="mt-1.5 font-body text-xs text-text-grey">{trip.progress}% planned</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
          <span className="font-serif text-lg text-navy">{value ? formatCurrency(value) : trip.location}</span>
          <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-navy transition-colors group-hover:text-orange">
            {getStatusAction(trip.status)}
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  return (
    <Link href={getTripActionHref(trip)} className="group flex items-center gap-4 py-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <Image src={trip.imageUrl} alt="" fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-base text-navy">{trip.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-xs text-text-grey">
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {trip.travelers}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[trip.status]}`} />
            {getStatusLabel(trip.status)}
          </span>
        </div>
      </div>
      <span className="shrink-0 font-body text-sm font-medium text-navy">
        {tripValue(trip) ? formatCurrency(tripValue(trip)!) : "—"}
      </span>
      <span className="flex shrink-0 items-center gap-1 font-body text-sm font-semibold text-navy transition-colors group-hover:text-orange">
        {getStatusAction(trip.status)} <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function TicketRow({ ticket }: { ticket: MockKsrtcTicket }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="group flex items-center gap-4 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
        <Bus size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-base text-navy">
          {ticket.fromLabel} &rarr; {ticket.toLabel}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-xs text-text-grey">
          <span>{formatDate(ticket.service.journeyDate)}</span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {ticket.passengers.length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange" />
            Upcoming
          </span>
        </div>
      </div>
      <span className="shrink-0 font-body text-sm font-medium text-navy">{formatCurrency(ticket.fare.totalAmount)}</span>
      <span className="flex shrink-0 items-center gap-1 font-body text-sm font-semibold text-navy transition-colors group-hover:text-orange">
        View Ticket <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** Your Trips, moved to the bottom: one large featured trip, then every
 *  other trip AND every upcoming KSRTC ticket as plain hairline-divided
 *  rows — no carousel, no stacked cards. Tickets are read client-side
 *  (sessionStorage), so they're merged in after mount. */
export function YourTrips({ trips }: { trips: Trip[] }) {
  const [tickets, setTickets] = useState<MockKsrtcTicket[]>([]);

  useEffect(() => {
    setTickets(getUpcomingMockTickets());
  }, []);

  if (trips.length === 0 && tickets.length === 0) {
    return (
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Your journeys</p>
        <h2 className="mt-1.5 font-serif text-2xl text-navy">Your Trips</h2>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] border border-navy/10 px-6 py-10">
          <p className="font-body text-sm text-text-grey">Your trips will appear here.</p>
          <Link href="/trips/new" className={buttonVariants({ variant: "accent", className: "rounded-xl" })}>
            Create your first listing
          </Link>
        </div>
      </div>
    );
  }

  const featured = trips.length > 0 ? trips.find((t) => t.status !== "draft") ?? trips[0] : null;
  const restTrips = trips.filter((t) => t.id !== featured?.id);

  const rows: Row[] = [
    ...restTrips.map((trip): Row => ({ kind: "trip", key: `trip-${trip.id}`, date: trip.startDate, trip })),
    ...tickets.map((ticket): Row => ({ kind: "ticket", key: `ticket-${ticket.id}`, date: ticket.service.journeyDate, ticket })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Your journeys</p>
          <h2 className="mt-1.5 font-serif text-2xl text-navy">Your Trips</h2>
        </div>
        <Link href="/trips" className="font-body text-sm font-medium text-navy underline underline-offset-4">
          View All &rarr;
        </Link>
      </div>

      {featured && (
        <div className="mt-6">
          <FeaturedTrip trip={featured} />
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-2 flex flex-col divide-y divide-navy/10 border-t border-navy/10">
          {rows.map((row) => (row.kind === "trip" ? <TripRow key={row.key} trip={row.trip} /> : <TicketRow key={row.key} ticket={row.ticket} />))}
        </div>
      )}
    </div>
  );
}
