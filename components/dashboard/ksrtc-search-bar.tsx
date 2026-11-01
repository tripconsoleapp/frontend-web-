"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, ArrowRight, Bus, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { KSRTC_STATIONS } from "@/lib/ksrtc-ticket-data";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const FIELD_HOVER = "rounded-xl px-2.5 py-1.5 -mx-2.5 transition-colors hover:bg-mint/15 focus-within:bg-mint/15";

/** A slim utility bar — not a card. Overlaps the hero's bottom edge
 *  (positioned by the parent, see active-dashboard.tsx). The only
 *  element on the dashboard allowed a noticeable shadow. Wraps into two
 *  rows on its own via flex-wrap rather than truncating city names. */
export function KsrtcSearchBar() {
  const router = useRouter();
  const [fromId, setFromId] = useState("kochi");
  const [toId, setToId] = useState("munnar");
  const [date, setDate] = useState(todayIso());
  const [passengers, setPassengers] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const today = todayIso();
  const tomorrow = tomorrowIso();

  useEffect(() => {
    if (!popoverOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setPopoverOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [popoverOpen]);

  function handleSwap() {
    setFromId(toId);
    setToId(fromId);
  }

  function handleSearch() {
    const params = new URLSearchParams({ from: fromId, to: toId, date, passengers: String(passengers) });
    router.push(`/tickets/search?${params.toString()}`);
  }

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-navy/10 bg-white px-5 py-3 shadow-[0_20px_45px_-20px_rgba(45,62,80,0.3)] sm:px-6">
      <div className="flex shrink-0 items-center gap-2 text-navy">
        <Bus size={16} />
        <span className="font-body text-xs font-semibold uppercase tracking-wide">KSRTC</span>
      </div>

      <span className="hidden h-9 w-px shrink-0 bg-navy/10 sm:block" />

      <label className={cn("flex min-w-[200px] flex-col", FIELD_HOVER)}>
        <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-text-grey">From</span>
        <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="w-full bg-transparent font-body text-sm text-navy focus:outline-none">
          {KSRTC_STATIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={handleSwap}
        aria-label="Swap from and to"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-navy/10 text-navy transition-colors hover:bg-mint/15"
      >
        <ArrowLeftRight size={12} />
      </button>

      <label className={cn("flex min-w-[200px] flex-col", FIELD_HOVER)}>
        <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-text-grey">To</span>
        <select value={toId} onChange={(e) => setToId(e.target.value)} className="w-full bg-transparent font-body text-sm text-navy focus:outline-none">
          {KSRTC_STATIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <span className="hidden h-9 w-px shrink-0 bg-navy/10 sm:block" />

      <div className={cn("flex shrink-0 flex-col", FIELD_HOVER)}>
        <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-text-grey">Date</span>
        <div className="flex items-center gap-2">
          <span className="relative font-body text-sm text-navy">
            {dateLabel}
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value || today)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Choose a date"
            />
          </span>
          <button type="button" onClick={() => setDate(tomorrow)} className="font-body text-xs font-semibold text-navy underline underline-offset-2 hover:text-orange">
            Tomorrow
          </button>
        </div>
      </div>

      <span className="hidden h-9 w-px shrink-0 bg-navy/10 sm:block" />

      <div ref={popoverRef} className="relative shrink-0">
        <button type="button" onClick={() => setPopoverOpen((v) => !v)} className={cn("flex flex-col text-left", FIELD_HOVER)}>
          <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-text-grey">Passengers</span>
          <span className="font-body text-sm text-navy">
            {passengers} passenger{passengers === 1 ? "" : "s"}
          </span>
        </button>

        {popoverOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 flex items-center gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3 shadow-[0_20px_45px_-20px_rgba(45,62,80,0.3)]">
            <button
              type="button"
              onClick={() => setPassengers((p) => Math.max(1, p - 1))}
              disabled={passengers <= 1}
              aria-label="Fewer passengers"
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-navy/10 text-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center font-body text-sm font-semibold text-navy">{passengers}</span>
            <button
              type="button"
              onClick={() => setPassengers((p) => Math.min(6, p + 1))}
              disabled={passengers >= 6}
              aria-label="More passengers"
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-navy/10 text-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="group ml-auto flex shrink-0 items-center gap-1.5 rounded-xl bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
      >
        Search buses
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </div>
  );
}
