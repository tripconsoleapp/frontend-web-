"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { AlertTriangle, ArrowRight, Circle } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { ItineraryDraft, getBackendTripId, getItineraryDraft, saveItineraryDraft } from "@/lib/listing-draft";
import { dayPlannedMinutes, dayTotalCost } from "@/lib/itinerary";
import { ItineraryContextHeader, TravelerSummary } from "./itinerary-context-header";
import { useAuth } from "@/lib/auth-context";
import { findItineraryConfigurationSnapshot, type BackendTripService } from "@/lib/itinerary-service-api";

function formatPlannedHours(minutes: number) {
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hrs planned`;
}

function formatDayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", day: "numeric", weekday: "long" });
}

export function ItineraryOverview({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";
  const { authedFetch } = useAuth();

  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let draft = getItineraryDraft();

      // Backend is authoritative once a real trip exists — recover a
      // previously saved itinerary configuration that isn't in local state
      // (e.g. after a refresh cleared sessionStorage) and restore it
      // exactly as saved. Never overrides a draft that's already present
      // locally, and never regenerates — the frontend's own generation/
      // editing logic (lib/itinerary.ts) is not invoked here at all.
      const backendTripId = getBackendTripId();
      if ((draft.status === "not_generated" || draft.days.length === 0) && backendTripId) {
        try {
          const backendTrip = await authedFetch<{ services: BackendTripService[] }>(
            `/trips/${backendTripId}`
          );
          const restored = findItineraryConfigurationSnapshot(backendTrip.services ?? []);
          if (restored) {
            draft = restored;
            saveItineraryDraft(draft);
          }
        } catch {
          // Non-fatal — the organizer just continues with local/generation
          // behavior; a subsequent save still reports its own success/failure.
        }
      }

      if (cancelled) return;
      setItinerary(draft);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (itinerary && (itinerary.status === "not_generated" || itinerary.days.length === 0)) {
      router.replace(`/trips/create/itinerary${templateQuery}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary]);

  if (!itinerary || itinerary.status === "not_generated" || itinerary.days.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <ItineraryContextHeader backHref={`/trips/create/services${templateQuery}`} eyebrow="Itinerary" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const destinationCount = new Set(itinerary.days.map((d) => d.destinationId)).size;

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ItineraryContextHeader backHref={`/trips/create/services${templateQuery}`} eyebrow="Itinerary" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Itinerary</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {itinerary.days.length} Days &middot; {destinationCount} Destinations &middot; <TravelerSummary />
        </p>
        <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-orange">
          <Circle size={8} className="fill-orange" /> Draft &mdash; you can edit before submitting
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
        {itinerary.days.map((day) => {
          const timedBlocks = day.blocks.filter((b) => b.type !== "free_time" && b.type !== "stay");
          const highlights = timedBlocks.slice(0, 5);
          const errorCount = day.conflicts.filter((c) => c.level === "error").length;
          const warningCount = day.conflicts.filter((c) => c.level === "warning").length;
          const cost = dayTotalCost(day);

          return (
            <motion.div key={day.dayIndex} variants={item} className="flex flex-col gap-3 border-b border-navy/10 py-6 first:pt-0 last:border-b-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Day {day.dayIndex}</p>
                  <h2 className="font-heading text-lg font-semibold text-navy">{formatDayDate(day.date)}</h2>
                  <p className="font-body text-sm text-text-grey">{day.destinationName}</p>
                </div>
                <div className="text-right">
                  {cost > 0 && <p className="font-heading text-base font-bold text-navy">{formatCurrency(cost)}</p>}
                  {errorCount > 0 ? (
                    <p className="flex items-center justify-end gap-1 font-body text-xs font-medium text-destructive">
                      <AlertTriangle size={12} /> {errorCount} conflict{errorCount === 1 ? "" : "s"}
                    </p>
                  ) : warningCount > 0 ? (
                    <p className="flex items-center justify-end gap-1 font-body text-xs font-medium text-orange">
                      <AlertTriangle size={12} /> {warningCount} warning{warningCount === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {highlights.map((b) => (
                  <div key={b.id} className="flex items-baseline gap-3 font-body text-sm">
                    <span className="w-12 shrink-0 text-text-grey">{b.startTime}</span>
                    <span className="text-navy">{b.title}</span>
                  </div>
                ))}
                {timedBlocks.length === 0 && <p className="font-body text-sm text-text-grey">No activities or meals planned yet.</p>}
              </div>

              <div className="flex items-center justify-between">
                <p className="font-body text-xs text-text-grey">{formatPlannedHours(dayPlannedMinutes(day))}</p>
                <button
                  type="button"
                  onClick={() => router.push(`/trips/create/itinerary/day/${day.dayIndex}${templateQuery}`)}
                  className="font-body text-sm font-semibold text-orange underline underline-offset-2"
                >
                  View day &rarr;
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`/trips/create/itinerary/review${templateQuery}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Review Itinerary <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
