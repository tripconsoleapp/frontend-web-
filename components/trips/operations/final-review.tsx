"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { getItineraryDraft, getServicesDraft, ServicesDraft, ItineraryDraft } from "@/lib/listing-draft";
import { computeTripCostBreakdown } from "@/lib/trip-operations";
import { CreateStepper } from "@/components/trips/create-stepper";

export function FinalReview() {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();

  const [services, setServices] = useState<ServicesDraft | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);
  const [confirmedTerms, setConfirmedTerms] = useState(false);
  const [confirmedAvailability, setConfirmedAvailability] = useState(false);
  const [confirmedPolicy, setConfirmedPolicy] = useState(false);

  useEffect(() => {
    setServices(getServicesDraft());
    setItinerary(getItineraryDraft());
  }, []);

  if (!services || !itinerary) {
    return (
      <div className="flex flex-col gap-6">
        <CreateStepper activeIndex={4} />
        <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const cost = computeTripCostBreakdown(services);
  const allConfirmed = confirmedTerms && confirmedAvailability && confirmedPolicy;
  const destinationNames = Array.from(new Set(itinerary.days.map((d) => d.destinationName)));
  const includedServices = [
    services.vehicle.configured && "Transport",
    services.hotel.configured && services.hotel.stays.some((s) => s.status === "booked") && "Stay",
    services.restaurant.configured && services.restaurant.meals.some((m) => m.status === "confirmed") && "Meals",
    services.activities.configured && services.activities.destinations.some((d) => d.status === "has_activities") && "Activities",
  ].filter(Boolean) as string[];

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.07 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  function handleSubmit() {
    if (!allConfirmed) return;
    router.push("/trips/create/submitting");
  }

  return (
    <div className="flex flex-col gap-8 pb-28">
      <CreateStepper activeIndex={4} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Final Review</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{trip.tripName || "Your Trip"}</h1>
        <p className="mt-1 font-body text-base text-text-grey">
          {trip.passengerCount} Travelers
          {trip.participantBreakdown.length > 0 && (
            <span className="text-text-grey"> &middot; {trip.participantBreakdown.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(" · ")}</span>
          )}
        </p>
        <p className="mt-1 font-body text-sm text-text-grey">
          {trip.dateRangeLabel || formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.routeLabel || destinationNames.join(" → ")}
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <motion.div variants={item}>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Included Services</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {includedServices.length === 0 ? (
                <p className="font-body text-sm text-text-grey">No services configured yet.</p>
              ) : (
                includedServices.map((s) => (
                  <span key={s} className="rounded-full border border-navy/15 bg-navy/[0.03] px-3.5 py-1.5 font-body text-sm text-navy">
                    {s}
                  </span>
                ))
              )}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Itinerary</p>
            <p className="mt-2 font-body text-sm text-navy">
              {itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"} planned &middot; {destinationNames.length} destinations
            </p>
          </motion.div>

          <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Before You Submit</p>
            <label className="flex items-start gap-3 font-body text-sm text-navy">
              <input type="checkbox" checked={confirmedTerms} onChange={(e) => setConfirmedTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange" />
              I confirm all trip and traveler details are accurate.
            </label>
            <label className="flex items-start gap-3 font-body text-sm text-navy">
              <input type="checkbox" checked={confirmedAvailability} onChange={(e) => setConfirmedAvailability(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange" />
              I understand transport, stay, and activity bookings are subject to availability confirmation.
            </label>
            <label className="flex items-start gap-3 font-body text-sm text-navy">
              <input type="checkbox" checked={confirmedPolicy} onChange={(e) => setConfirmedPolicy(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange" />
              I agree to the cancellation and refund policy and Terms of Service.
            </label>
          </motion.div>
        </div>

        <motion.div variants={item} className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Cost Breakdown</p>
            <div className="mt-3 flex flex-col gap-2 font-body text-sm text-navy">
              <div className="flex items-center justify-between"><span className="text-text-grey">Transport</span><span>{cost.vehicle > 0 ? formatCurrency(cost.vehicle) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-text-grey">Stay</span><span>{cost.hotel > 0 ? formatCurrency(cost.hotel) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-text-grey">Meals</span><span>{cost.dining > 0 ? formatCurrency(cost.dining) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-text-grey">Activities</span><span>{cost.activities > 0 ? formatCurrency(cost.activities) : "—"}</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
              <span className="font-body text-sm font-semibold text-navy">Total</span>
              <span className="font-heading text-xl font-bold text-navy">{formatCurrency(cost.total)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-xs text-text-grey">{allConfirmed ? "Ready to submit" : "Confirm all declarations to continue"}</span>
        <motion.button
          type="button"
          whileHover={allConfirmed ? { y: -1 } : undefined}
          whileTap={allConfirmed ? { scale: 0.98 } : undefined}
          disabled={!allConfirmed}
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-8 py-4 font-body text-base font-medium text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={16} /> Submit Trip <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
