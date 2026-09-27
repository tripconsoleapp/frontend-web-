"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { ItineraryDraft, getItineraryDraft, getReviewReturnHref, getServicesDraft, saveItineraryDraft } from "@/lib/listing-draft";
import { itineraryHasBlockingErrors, itineraryTotalCost } from "@/lib/itinerary";
import { ItineraryContextHeader, TravelerSummary } from "./itinerary-context-header";

export function ItineraryReview({ template }: { template?: string }) {
  const router = useRouter();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setItinerary(getItineraryDraft());
  }, []);

  if (!itinerary) {
    return (
      <div className="flex flex-col gap-6">
        <ItineraryContextHeader backHref={`/trips/create/itinerary/overview${templateQuery}`} eyebrow="Itinerary Review" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const services = getServicesDraft();
  const destinationCount = new Set(itinerary.days.map((d) => d.destinationId)).size;
  const errorCount = itinerary.days.reduce((sum, d) => sum + d.conflicts.filter((c) => c.level === "error").length, 0);
  const warningCount = itinerary.days.reduce((sum, d) => sum + d.conflicts.filter((c) => c.level === "warning").length, 0);
  const hasErrors = itineraryHasBlockingErrors(itinerary);

  const transportScheduled = services.vehicle.configured;
  const activitiesConfigured = services.activities.destinations.every((d) => d.status !== "not_planned");
  const mealsAccounted = services.restaurant.enabled ? services.restaurant.configured : true;
  const hotelsAccounted = services.hotel.stays.every((s) => s.status !== "pending");
  const vehicleCost = services.vehicle.configured ? services.vehicle.vehicles.reduce((sum, v) => sum + v.price, 0) : 0;
  const itineraryCost = itineraryTotalCost(itinerary);

  const coverage = [
    { label: "All destinations covered", pass: destinationCount === trip.stops.length },
    { label: "Transport scheduled", pass: transportScheduled },
    { label: "Activities scheduled", pass: activitiesConfigured },
    { label: "Meals accounted for", pass: mealsAccounted },
    { label: "Hotels accounted for", pass: hotelsAccounted },
    { label: "No critical conflicts", pass: errorCount === 0 },
  ];

  function handleSave() {
    const next = { ...itinerary!, status: (hasErrors ? "draft" : "ready") as "draft" | "ready" };
    saveItineraryDraft(next);
    setItinerary(next);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy">
          <Check size={26} />
        </motion.span>
        <h1 className="font-heading text-xl font-bold text-navy">Itinerary saved</h1>
        <p className="font-body text-sm text-text-grey">
          Status: <span className="font-semibold text-navy">{itinerary.status === "ready" ? "Ready" : "Draft"}</span>
        </p>
        <button
          type="button"
          onClick={() => router.push(getReviewReturnHref("/trips/create/review", template))}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Continue &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ItineraryContextHeader backHref={`/trips/create/itinerary/overview${templateQuery}`} backLabel="Back to overview" eyebrow="Itinerary Review" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Is this itinerary ready?</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {itinerary.days.length} days &middot; {destinationCount} destinations &middot; <TravelerSummary />
        </p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Coverage</p>
        <div className="mt-3 flex flex-col gap-2">
          {coverage.map((c) => (
            <div key={c.label} className="flex items-center gap-2 font-body text-sm">
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", c.pass ? "bg-mint/60 text-navy" : "bg-navy/5 text-text-grey")}>
                {c.pass ? <Check size={11} /> : <X size={11} />}
              </span>
              <span className={c.pass ? "text-navy" : "text-text-grey"}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {(errorCount > 0 || warningCount > 0) && (
        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Timing</p>
          <div className="mt-3 flex flex-col gap-2">
            {itinerary.days.flatMap((d) =>
              d.conflicts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => router.push(`/trips/create/itinerary/day/${d.dayIndex}${templateQuery}`)}
                  className={cn(
                    "flex items-start gap-2 rounded-xl px-4 py-2.5 text-left font-body text-sm transition-colors",
                    c.level === "error" ? "bg-destructive-soft text-destructive hover:bg-destructive-soft/80" : "bg-orange/10 text-orange hover:bg-orange/15"
                  )}
                >
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {c.message} <span className="underline underline-offset-2">Day {d.dayIndex} &rarr;</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Participant consistency</p>
        <p className="mt-2 font-body text-sm text-navy">
          <TravelerSummary />
        </p>
        <p className="mt-1 font-body text-xs text-text-grey">Used consistently across all activity, meal, and hotel pricing.</p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated cost</p>
        <div className="mt-2 flex items-center justify-between font-body text-sm text-navy">
          <span className="text-text-grey">Transport (whole trip)</span>
          <span>{vehicleCost > 0 ? formatCurrency(vehicleCost) : "—"}</span>
        </div>
        <div className="flex items-center justify-between font-body text-sm text-navy">
          <span className="text-text-grey">Hotels, meals &amp; activities (from itinerary)</span>
          <span>{formatCurrency(itineraryCost)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-navy/10 pt-2">
          <span className="font-body text-sm font-semibold text-navy">Total</span>
          <span className="font-heading text-lg font-bold text-navy">{formatCurrency(vehicleCost + itineraryCost)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
          Save Itinerary <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
