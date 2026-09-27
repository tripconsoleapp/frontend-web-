"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { AlertTriangle, ArrowRight, Car, CheckCircle2, MapPin, Route as RouteIcon, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { getHotel } from "@/lib/mock-hotel-catalog";
import { getRestaurant } from "@/lib/mock-restaurant-catalog";
import {
  DestinationsSummary,
  ItineraryDraft,
  ServicesDraft,
  exitReviewReturn,
  getDestinationsSummary,
  getItineraryDraft,
  getServicesDraft,
} from "@/lib/listing-draft";
import { useTripContext } from "@/lib/use-trip-context";
import { useTripMode } from "@/lib/use-trip-mode";
import { isKsrtcEligible } from "@/lib/transport-eligibility";
import { hotelServiceCost, staySummaryCounts } from "@/lib/hotel-stays";
import { mealCounts, mealPlanTotal } from "@/lib/meal-plan";

type SectionStatus = "from_template" | "configured" | "needs_review" | "not_configured";

function StatusBadge({ status }: { status: SectionStatus }) {
  const LABEL: Record<SectionStatus, string> = {
    from_template: "From Template",
    configured: "Configured",
    needs_review: "Needs Review",
    not_configured: "Not Configured",
  };
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide",
        status === "configured" && "bg-mint/30 text-navy",
        status === "from_template" && "bg-navy/5 text-navy",
        status === "needs_review" && "bg-destructive-soft text-destructive",
        status === "not_configured" && "bg-orange/10 text-orange"
      )}
    >
      {LABEL[status]}
    </span>
  );
}

function ReviewSection({
  icon: Icon,
  title,
  status,
  children,
  editLabel,
  editHref,
}: {
  icon: typeof Car;
  title: string;
  status: SectionStatus;
  children: ReactNode;
  editLabel: string;
  editHref: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <Icon size={17} />
          </span>
          <h2 className="font-heading text-base font-semibold text-navy">{title}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="font-body text-sm text-text-grey">{children}</div>
      <Link
        href={editHref}
        className="w-fit font-body text-sm font-semibold text-orange underline underline-offset-2"
      >
        {editLabel}
      </Link>
    </div>
  );
}

export function TemplateReviewView({ template }: { template: Template }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const { mode } = useTripMode();

  const [services, setServices] = useState<ServicesDraft | null>(null);
  const [destinations, setDestinations] = useState<DestinationsSummary | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);

  useEffect(() => {
    setServices(getServicesDraft());
    setDestinations(getDestinationsSummary());
    setItinerary(getItineraryDraft());
  }, []);

  if (!services || !destinations || !itinerary || !trip.ready) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const templateQuery = `?template=${template.id}`;
  const isPilgrimage = mode === "pilgrimage";

  // ---- Transport ----
  const eligible = isKsrtcEligible(trip.passengerCount, trip.isIndividual);
  const confirmedVehicle = services.vehicle.configured && services.vehicle.vehicles.length > 0;
  const hasKsrtcSelected =
    services.vehicle.vehicles.some((v) => v.source === "ksrtc") || services.vehicle.lastSource === "ksrtc";
  const transportNeedsReview = hasKsrtcSelected && !eligible;
  const transportStatus: SectionStatus = transportNeedsReview
    ? "needs_review"
    : confirmedVehicle
      ? "configured"
      : services.vehicle.lastSource
        ? "from_template"
        : "not_configured";

  // ---- Stay ----
  const stayCounts = staySummaryCounts(services.hotel.stays);
  const stayConfigured = services.hotel.enabled && stayCounts.booked > 0;
  const templateHotel = template.defaultHotelId ? getHotel(template.defaultHotelId) : undefined;
  const stayStatus: SectionStatus = !services.hotel.enabled
    ? "not_configured"
    : stayConfigured
      ? "configured"
      : templateHotel
        ? "from_template"
        : "not_configured";

  // ---- Meals ----
  const mealStats = mealCounts(services.restaurant.meals);
  const mealsConfigured = services.restaurant.enabled && services.restaurant.configured;
  const templateRestaurant = template.defaultRestaurantId ? getRestaurant(template.defaultRestaurantId) : undefined;
  const mealsStatus: SectionStatus = !services.restaurant.enabled
    ? "not_configured"
    : mealsConfigured
      ? "configured"
      : templateRestaurant
        ? "from_template"
        : "not_configured";

  // ---- Itinerary ----
  const hasLiveItinerary = itinerary.days.length > 0;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  function handleContinue() {
    exitReviewReturn();
    router.push("/trips/create/review");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-28">
      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
          Review &amp; Customize Your Trip
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
          {trip.tripName || template.name}
        </h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Created from <span className="font-semibold text-navy">{template.name}</span> — we
          prepared this trip for you. Review it, make any changes you need, then continue.
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
        <motion.div variants={item}>
          <ReviewSection
            icon={MapPin}
            title="Trip Details"
            status="configured"
            editLabel="Edit Trip Details"
            editHref={`/trips/create/basics${templateQuery}`}
          >
            {template.durationLabel} · {trip.participantBreakdown.length > 0 ? trip.participantBreakdown.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(" · ") : `${trip.passengerCount} travelers`}
            {trip.dateRangeLabel && <> · {trip.dateRangeLabel}</>}
          </ReviewSection>
        </motion.div>

        <motion.div variants={item}>
          <ReviewSection
            icon={RouteIcon}
            title="Route"
            status="configured"
            editLabel="Edit Route"
            editHref={`/trips/create/destinations?start=${destinations.startLocationId}&template=${template.id}`}
          >
            {[destinations.startLocationName, ...destinations.stops.map((s) => s.name)].join(" → ") ||
              "No route yet"}
          </ReviewSection>
        </motion.div>

        <motion.div variants={item}>
          <ReviewSection
            icon={Car}
            title="Transport"
            status={transportStatus}
            editLabel={transportNeedsReview ? "Change Transport" : confirmedVehicle ? "Change Transport" : "Choose Transport"}
            editHref={`/trips/create/services/vehicle${templateQuery}`}
          >
            {transportNeedsReview ? (
              <span className="flex items-start gap-1.5 text-destructive">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {services.vehicle.vehicles.find((v) => v.source === "ksrtc")?.name ?? "KSRTC"} is no
                longer available because this trip now has {trip.passengerCount} passenger
                {trip.passengerCount === 1 ? "" : "s"}.
              </span>
            ) : confirmedVehicle ? (
              <>
                {services.vehicle.vehicles.map((v) => v.name).join(", ")} — configured for{" "}
                {trip.passengerCount} passengers ({formatCurrency(services.vehicle.vehicles.reduce((s, v) => s + v.price, 0))})
              </>
            ) : services.vehicle.lastSource ? (
              <>{services.vehicle.lastSource === "ksrtc" ? "KSRTC" : "Private Operator"} — preference from template, not yet booked</>
            ) : (
              "Not yet chosen"
            )}
          </ReviewSection>
        </motion.div>

        {services.hotel.enabled && (
          <motion.div variants={item}>
            <ReviewSection
              icon={MapPin}
              title="Stay"
              status={stayStatus}
              editLabel={stayConfigured ? "Change Stay" : "Choose Stay"}
              editHref={`/trips/create/services/hotel${templateQuery}`}
            >
              {stayConfigured ? (
                <>{stayCounts.booked} of {services.hotel.stays.length} stays booked ({formatCurrency(hotelServiceCost(services.hotel.stays))})</>
              ) : templateHotel ? (
                <>Recommended by template: {templateHotel.name} — not yet booked</>
              ) : (
                "Not yet configured"
              )}
            </ReviewSection>
          </motion.div>
        )}

        {services.restaurant.enabled && (
          <motion.div variants={item}>
            <ReviewSection
              icon={UtensilsCrossed}
              title="Meals"
              status={mealsStatus}
              editLabel={mealsConfigured ? "Change Meals" : "Choose Meals"}
              editHref={`/trips/create/services/restaurant${templateQuery}`}
            >
              {mealsConfigured ? (
                <>{mealStats.confirmed} meal{mealStats.confirmed === 1 ? "" : "s"} confirmed ({formatCurrency(mealPlanTotal(services.restaurant.meals))})</>
              ) : templateRestaurant ? (
                <>Recommended by template: {templateRestaurant.name} — not yet booked</>
              ) : (
                "Not yet configured"
              )}
            </ReviewSection>
          </motion.div>
        )}

        <motion.div variants={item}>
          <ReviewSection
            icon={CheckCircle2}
            title="Itinerary"
            status={hasLiveItinerary ? "configured" : "from_template"}
            editLabel={hasLiveItinerary ? "Edit Itinerary" : "Generate Itinerary"}
            editHref={`/trips/create/itinerary${templateQuery}`}
          >
            {hasLiveItinerary ? (
              <>{itinerary.days.length} {itinerary.days.length === 1 ? "day" : "days"} planned · {itinerary.status === "ready" ? "Ready" : "Draft"}</>
            ) : (
              <div className="flex flex-col gap-1.5">
                <span>From template, for reference — generate the real itinerary once your services are configured:</span>
                {template.itinerary.map((day) => (
                  <span key={day.day} className="font-body text-xs text-text-grey">
                    <span className="font-semibold text-navy">Day {day.day}:</span> {day.title}
                  </span>
                ))}
              </div>
            )}
          </ReviewSection>
        </motion.div>
      </motion.div>

      <p className="font-body text-xs text-text-grey">
        {isPilgrimage ? (
          "Activities aren't offered for pilgrimage trips."
        ) : (
          <>
            Want activities or anything else not shown above?{" "}
            <Link href={`/trips/create/services${templateQuery}`} className="font-semibold text-navy underline underline-offset-2">
              Open the full Services hub
            </Link>
            .
          </>
        )}
      </p>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {transportNeedsReview ? "Resolve the transport warning before continuing" : "Ready when you are"}
        </span>
        <motion.button
          type="button"
          whileHover={transportNeedsReview ? undefined : { y: -1 }}
          whileTap={transportNeedsReview ? undefined : { scale: 0.98 }}
          onClick={handleContinue}
          disabled={transportNeedsReview}
          className={cn(
            buttonVariants({ variant: "accent", size: "lg" }),
            "gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          Continue to Final Review <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
