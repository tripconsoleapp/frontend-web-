"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Clock, Sliders, Star, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { CounterInput } from "@/components/ui/counter-input";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { KSRTC_STATIONS, BUS_TYPE_LABELS, getStationById, type KsrtcBusType } from "@/lib/ksrtc-ticket-data";
import { searchScheduledServices } from "@/lib/ksrtc-ticket-api";
import { saveTicketSearch } from "@/lib/ksrtc-ticket-state";
import type { KsrtcScheduledService } from "@/lib/ksrtc-ticket-data";

export const TICKET_STEPS = ["Search", "Seats", "Passengers", "Review", "Ticket"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

const BUS_TYPES: KsrtcBusType[] = ["garuda-volvo-ac", "super-fast", "super-deluxe", "fast-passenger", "ordinary"];

export function TicketSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fromId, setFromId] = useState(searchParams.get("from") || "kochi");
  const [toId, setToId] = useState(searchParams.get("to") || "munnar");
  const [date, setDate] = useState(searchParams.get("date") || todayIso());
  const [passengers, setPassengers] = useState(Number(searchParams.get("passengers")) || 1);
  const [editing, setEditing] = useState(false);
  const [busTypeFilter, setBusTypeFilter] = useState<Set<KsrtcBusType>>(new Set());

  const [results, setResults] = useState<KsrtcScheduledService[] | null>(null);

  const from = getStationById(fromId);
  const to = getStationById(toId);
  const sameStation = fromId === toId;

  useEffect(() => {
    if (sameStation) {
      setResults([]);
      return;
    }
    setResults(null);
    searchScheduledServices({ fromStationId: fromId, toStationId: toId, journeyDate: date, passengers }).then(setResults);
    saveTicketSearch({ fromStationId: fromId, fromLabel: from?.name ?? fromId, toStationId: toId, toLabel: to?.name ?? toId, journeyDate: date, passengers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromId, toId, date, passengers]);

  const filtered = useMemo(() => {
    if (!results) return null;
    if (busTypeFilter.size === 0) return results;
    return results.filter((s) => busTypeFilter.has(s.busType));
  }, [results, busTypeFilter]);

  function toggleBusType(type: KsrtcBusType) {
    setBusTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function handleSwap() {
    setFromId(toId);
    setToId(fromId);
  }

  function goToSeats(serviceId: string) {
    router.push(`/tickets/seats?service=${serviceId}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={0} />

      <div className="sticky top-0 z-20 -mx-6 border-b border-navy/10 bg-white/95 px-6 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDate((d) => shiftDate(d, -1))}
              aria-label="Previous day"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/10 text-navy transition-colors hover:bg-navy/5"
            >
              <ChevronLeft size={14} />
            </button>
            <div>
              <h1 className="font-heading text-lg font-bold text-navy sm:text-xl">
                {from?.name ?? fromId} &rarr; {to?.name ?? toId}
              </h1>
              <p className="font-body text-xs text-text-grey">
                {formatDateLabel(date)} &middot; {passengers} Passenger{passengers === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDate((d) => shiftDate(d, 1))}
              aria-label="Next day"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/10 text-navy transition-colors hover:bg-navy/5"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border border-navy/15 px-4 py-2 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
          >
            Modify search
          </button>
        </div>

        {editing && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] p-4 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">From</span>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 font-body text-sm text-navy">
                {KSRTC_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleSwap} aria-label="Swap" className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-navy/10 bg-white text-navy sm:self-end">
              <ArrowLeftRight size={14} />
            </button>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">To</span>
              <select value={toId} onChange={(e) => setToId(e.target.value)} className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 font-body text-sm text-navy">
                {KSRTC_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Date</span>
              <input type="date" value={date} min={todayIso()} onChange={(e) => setDate(e.target.value || todayIso())} className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 font-body text-sm text-navy" />
            </label>
            <div className="flex-1 sm:max-w-[200px]">
              <CounterInput label="Passengers" value={passengers} onChange={setPassengers} min={1} max={6} />
            </div>
          </div>
        )}
      </div>

      {!sameStation && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            <Sliders size={12} /> Bus type
          </span>
          {BUS_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleBusType(type)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition-colors",
                busTypeFilter.has(type) ? "bg-orange text-white" : "bg-navy/5 text-navy hover:bg-navy/10"
              )}
            >
              {BUS_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {sameStation && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">Please choose two different stations.</p>
          <p className="font-body text-sm text-text-grey">Your origin and destination can&apos;t be the same.</p>
        </div>
      )}

      {!sameStation && filtered === null && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl border border-navy/10 bg-navy/[0.03]" />
          ))}
        </div>
      )}

      {!sameStation && filtered !== null && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">
            {results && results.length > 0 ? "No buses match your filters." : "No KSRTC buses found for this route."}
          </p>
          <p className="font-body text-sm text-text-grey">
            {results && results.length > 0 ? "Try clearing a filter to see more services." : "Try a different date or a nearby station."}
          </p>
          {results && results.length > 0 && (
            <button type="button" onClick={() => setBusTypeFilter(new Set())} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
              Clear filters
            </button>
          )}
        </div>
      )}

      {!sameStation && filtered !== null && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => goToSeats(service.id)}
              className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4 text-left transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading text-base font-semibold text-navy">{BUS_TYPE_LABELS[service.busType]}</p>
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-text-grey">
                  <Clock size={12} /> {service.departureTime} &rarr; {service.arrivalTime} &middot; {service.durationLabel}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-text-grey">
                  <Star size={12} className="text-orange" /> {service.rating} &middot; {service.amenities.join(", ")}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
                  <Users size={12} /> {service.totalSeats} total seats
                </p>
                <div className="text-right">
                  <p className="font-heading text-lg font-bold text-navy">{formatCurrency(service.fare)}</p>
                  <p className="font-body text-[11px] text-text-grey">per seat</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
