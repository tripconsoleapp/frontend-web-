"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronDown, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { MEAL_LABELS } from "@/lib/meal-plan";
import { useTripContext } from "@/lib/use-trip-context";
import { ServicesDraft, TripRecord, getServicesDraft, getTripRecord } from "@/lib/listing-draft";
import { computeTripPricing, currentCostSnapshot, formatCostDelta, TripPricing } from "@/lib/trip-operations";

type SectionKey = "vehicle" | "hotel" | "restaurant" | "activities";

export function CostConsole({ tripId }: { tripId: string }) {
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [services, setServices] = useState<ServicesDraft | null>(null);
  const [open, setOpen] = useState<Set<SectionKey>>(new Set());

  useEffect(() => {
    setRecord(getTripRecord());
    setServices(getServicesDraft());
  }, []);

  if (!record || !services) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to My Trips</Link>
      </div>
    );
  }

  if (record.status === "draft") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip hasn&rsquo;t been submitted yet.</p>
        <p className="max-w-sm font-body text-sm text-text-grey">The Cost Console opens once a trip has a locked cost snapshot to work from.</p>
        <Link href="/trips/create/review" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Go to Final Review</Link>
      </div>
    );
  }

  const pricing: TripPricing = computeTripPricing(services, { passengerCount: trip.passengerCount, participantBreakdown: trip.participantBreakdown });
  const snapshot = currentCostSnapshot(record.costSnapshots);
  const delta = snapshot ? pricing.total - snapshot.total : 0;
  const changedSince = snapshot
    ? {
        vehicle: pricing.serviceTotals.vehicle - snapshot.items.vehicle,
        hotel: pricing.serviceTotals.hotel - snapshot.items.hotel,
        dining: pricing.serviceTotals.dining - snapshot.items.dining,
        activities: pricing.serviceTotals.activities - snapshot.items.activities,
      }
    : null;

  function toggle(key: SectionKey) {
    setOpen((cur) => {
      const next = new Set(cur);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/operations`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to operations
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference} &middot; Cost Console</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{trip.tripName || "Trip Cost"}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">{trip.passengerCount} travelers &middot; {trip.stops.length} destination{trip.stops.length === 1 ? "" : "s"}</p>
      </div>

      {delta !== 0 && (
        <div className="rounded-2xl bg-destructive-soft px-6 py-4">
          <p className="font-body text-sm font-semibold text-destructive">Cost updated since your last approved snapshot</p>
          <p className="mt-0.5 font-body text-sm text-destructive">
            Previous: {formatCurrency(snapshot!.total)} &middot; Current estimate: {formatCurrency(pricing.total)} ({formatCostDelta(delta, formatCurrency)})
          </p>
          {changedSince && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {changedSince.vehicle !== 0 && <li className="font-body text-sm text-destructive">Transport {formatCostDelta(changedSince.vehicle, formatCurrency)}</li>}
              {changedSince.hotel !== 0 && <li className="font-body text-sm text-destructive">Hotel {formatCostDelta(changedSince.hotel, formatCurrency)}</li>}
              {changedSince.dining !== 0 && <li className="font-body text-sm text-destructive">Meals {formatCostDelta(changedSince.dining, formatCurrency)}</li>}
              {changedSince.activities !== 0 && <li className="font-body text-sm text-destructive">Activities {formatCostDelta(changedSince.activities, formatCurrency)}</li>}
            </ul>
          )}
          <p className="mt-2 font-body text-xs text-destructive">Re-verification will be required before payment can proceed against the new amount.</p>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          {snapshot ? `Approved Snapshot · Version ${snapshot.version}` : "Current Cost Estimate"}
        </p>
        <p className="mt-1 font-heading text-3xl font-bold text-navy">{formatCurrency(snapshot?.total ?? pricing.total)}</p>
        <p className="mt-1 font-body text-sm text-text-grey">
          {trip.passengerCount} total travelers
          {pricing.pricingParticipantCount !== trip.passengerCount && ` · pricing basis: ${pricing.pricingParticipantCount}`}
        </p>
        {pricing.pricingParticipantCount > 0 && (
          <p className="font-body text-sm text-navy">
            {formatCurrency(Math.round((snapshot?.total ?? pricing.total) / pricing.pricingParticipantCount))} per participant
          </p>
        )}
        <Link href={`/trips/${tripId}/cost/snapshot`} className="mt-3 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-orange underline underline-offset-2">
          <History size={13} /> View Snapshot History
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
        <CostSection
          sectionKey="vehicle"
          title="Transport"
          total={pricing.serviceTotals.vehicle}
          open={open.has("vehicle")}
          onToggle={() => toggle("vehicle")}
          editHref="/trips/create/services/vehicle"
        >
          {!services.vehicle.configured || services.vehicle.vehicles.length === 0 ? (
            <p className="font-body text-sm text-text-grey">Transport is not configured for this trip.</p>
          ) : (
            services.vehicle.vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-1.5 font-body text-sm text-navy">
                <span>{v.name} &middot; {v.provider}</span>
                <span>{formatCurrency(v.price)}</span>
              </div>
            ))
          )}
        </CostSection>

        <CostSection
          sectionKey="hotel"
          title="Accommodation"
          total={pricing.serviceTotals.hotel}
          open={open.has("hotel")}
          onToggle={() => toggle("hotel")}
          editHref="/trips/create/services/hotel"
        >
          {!services.hotel.configured || services.hotel.stays.length === 0 ? (
            <p className="font-body text-sm text-text-grey">Hotels are not configured for this trip.</p>
          ) : (
            services.hotel.stays.map((s) => (
              <div key={s.destinationId} className="py-2">
                <div className="flex items-center justify-between font-body text-sm font-semibold text-navy">
                  <span>{s.destinationName}{s.hotel ? ` · ${s.hotel.name}` : ""}</span>
                  <span>{s.status === "booked" ? formatCurrency(s.total) : "₹0"}</span>
                </div>
                {s.status === "booked" ? (
                  <div className="mt-0.5 flex flex-col gap-0.5 pl-3">
                    {s.rooms.map((r) => (
                      <p key={r.roomId} className="font-body text-xs text-text-grey">
                        {r.quantity} × {r.roomName} &middot; {s.nights} night{s.nights === 1 ? "" : "s"} @ {formatCurrency(r.pricePerNight)}/night
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="pl-3 font-body text-xs text-text-grey capitalize">{s.status.replace("_", " ")}</p>
                )}
              </div>
            ))
          )}
        </CostSection>

        <CostSection
          sectionKey="restaurant"
          title="Meals"
          total={pricing.serviceTotals.dining}
          open={open.has("restaurant")}
          onToggle={() => toggle("restaurant")}
          editHref="/trips/create/services/restaurant"
        >
          {!services.restaurant.configured || services.restaurant.meals.length === 0 ? (
            <p className="font-body text-sm text-text-grey">Meals are not configured for this trip.</p>
          ) : (
            <>
              <p className="mb-1.5 font-body text-xs text-text-grey">Only confirmed meals are included in this total.</p>
              {services.restaurant.meals.map((m) => (
                <div key={`${m.dayIndex}-${m.mealType}`} className="flex items-center justify-between py-1.5 font-body text-sm text-navy">
                  <span>
                    Day {m.dayIndex} &middot; {MEAL_LABELS[m.mealType]}
                    {m.restaurant ? ` · ${m.restaurant.name}` : ""}
                  </span>
                  <span className={m.status !== "confirmed" ? "text-text-grey" : ""}>{m.status === "confirmed" ? formatCurrency(m.total) : m.status === "skipped" ? "Skipped" : "Pending"}</span>
                </div>
              ))}
            </>
          )}
        </CostSection>

        <CostSection
          sectionKey="activities"
          title="Activities"
          total={pricing.serviceTotals.activities}
          open={open.has("activities")}
          onToggle={() => toggle("activities")}
          editHref="/trips/create/services/activities"
        >
          {!services.activities.configured || services.activities.destinations.length === 0 ? (
            <p className="font-body text-sm text-text-grey">Activities are not configured for this trip.</p>
          ) : (
            services.activities.destinations.map((d) => (
              <div key={d.destinationId} className="py-2">
                <p className="font-body text-sm font-semibold text-navy">{d.destinationName}</p>
                {d.status === "has_activities" ? (
                  <div className="mt-0.5 flex flex-col gap-0.5 pl-3">
                    {d.activities.map((a) => (
                      <div key={a.id} className="flex items-center justify-between font-body text-xs text-text-grey">
                        <span>{a.name} &middot; {a.participants} participant{a.participants === 1 ? "" : "s"} &middot; {a.pricingType === "per_person" ? "per person" : "per group"}</span>
                        <span>{formatCurrency(a.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pl-3 font-body text-xs text-text-grey">{d.status === "skipped" ? "Skipped — ₹0" : "Not planned"}</p>
                )}
              </div>
            ))
          )}
        </CostSection>
      </div>

      <div className="rounded-2xl bg-navy/[0.02] p-6">
        <div className="flex flex-col gap-2 font-body text-sm text-navy">
          <div className="flex items-center justify-between"><span className="text-text-grey">Subtotal</span><span>{formatCurrency(pricing.subtotal)}</span></div>
          {pricing.contingency > 0 && <div className="flex items-center justify-between"><span className="text-text-grey">Contingency</span><span>{formatCurrency(pricing.contingency)}</span></div>}
          {pricing.taxes > 0 && <div className="flex items-center justify-between"><span className="text-text-grey">Taxes</span><span>{formatCurrency(pricing.taxes)}</span></div>}
          {pricing.discounts > 0 && <div className="flex items-center justify-between"><span className="text-text-grey">Discounts</span><span>-{formatCurrency(pricing.discounts)}</span></div>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-body text-sm font-semibold text-navy">Current Total</span>
          <span className="font-heading text-xl font-bold text-navy">{formatCurrency(pricing.total)}</span>
        </div>
      </div>
    </div>
  );
}

function CostSection({
  sectionKey,
  title,
  total,
  open,
  onToggle,
  editHref,
  children,
}: {
  sectionKey: SectionKey;
  title: string;
  total: number;
  open: boolean;
  onToggle: () => void;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-navy/[0.02]">
        <span className="flex items-center gap-2 font-body text-sm font-semibold text-navy">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {title}
        </span>
        <span className="font-body text-sm font-semibold text-navy">{total > 0 ? formatCurrency(total) : "—"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={sectionKey}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              {children}
              <Link href={editHref} className="mt-2 inline-block font-body text-sm font-semibold text-orange underline underline-offset-2">
                Edit {title}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
