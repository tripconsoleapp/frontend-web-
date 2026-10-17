"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  AlertCircle,
  BedDouble,
  Car,
  Check,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreateStepper } from "@/components/trips/create-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { SERVICE_META, ServiceId } from "@/lib/service-meta";
import {
  DEFAULT_SERVICES_DRAFT,
  DestinationActivityPlan,
  DestinationStay,
  MealInstance,
  ServicesDraft,
  getReviewReturnHref,
  getServicesDraft,
  getTripMode,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { hotelServiceCost, staySummaryCounts } from "@/lib/hotel-stays";
import { mealCounts, mealPlanTotal } from "@/lib/meal-plan";
import { activityCounts, planTotal } from "@/lib/activity-plan";
import { useTripContext } from "@/lib/use-trip-context";
import { useTripMode } from "@/lib/use-trip-mode";
import { isKsrtcEligible } from "@/lib/transport-eligibility";

const ICONS: Record<ServiceId, typeof Car> = {
  vehicle: Car,
  hotel: BedDouble,
  restaurant: UtensilsCrossed,
  activities: Ticket,
};

export function ServicesForm({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, isIndividual, ready: tripReady } = useTripContext();
  const { mode } = useTripMode();

  const [services, setServices] = useState<ServicesDraft>(DEFAULT_SERVICES_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [reviewReturnActive, setReviewReturnActive] = useState(false);

  // sessionStorage isn't available during SSR, so the first render must match
  // the server's default-only output. Load the real persisted draft only
  // after mount, then start persisting changes from that point on.
  useEffect(() => {
    setServices(getServicesDraft());
    setReviewReturnActive(getTripMode().reviewReturnActive ?? false);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveServicesDraft(services);
  }, [services, hydrated]);

  const backHref = `/trips/create/destinations${
    template ? `?template=${template}` : ""
  }`;
  const templateQuery = template ? `?template=${template}` : "";

  const vehicleCost = services.vehicle.configured
    ? services.vehicle.vehicles.reduce((sum, v) => sum + v.price, 0)
    : 0;
  const hotelCost = services.hotel.configured ? hotelServiceCost(services.hotel.stays) : 0;
  const restaurantCost = services.restaurant.configured ? mealPlanTotal(services.restaurant.meals) : 0;
  const activitiesCost = services.activities.configured ? planTotal(services.activities.destinations) : 0;
  const subtotal = vehicleCost + hotelCost + restaurantCost + activitiesCost;

  const incompleteSingle = (["vehicle", "hotel", "restaurant", "activities"] as const).filter(
    (id) => services[id].enabled && !services[id].configured
  );
  const incompleteTitles = incompleteSingle.map((id) => SERVICE_META.find((s) => s.id === id)!.title);

  // If the group shrank below the KSRTC threshold after a KSRTC vehicle
  // was already confirmed, that selection is now invalid — never leave
  // it silently active. Only evaluate once trip context has hydrated so
  // this doesn't false-positive on the very first render.
  const hasInvalidKsrtcSelection =
    tripReady && !isKsrtcEligible(passengerCount, isIndividual) && services.vehicle.vehicles.some((v) => v.source === "ksrtc");

  const hasIncomplete = incompleteTitles.length > 0 || hasInvalidKsrtcSelection;

  // Pilgrimage trips don't offer Activities as a service at all — not
  // just "off by default" but not shown as a choice in the first place.
  const visibleServiceMeta =
    mode === "pilgrimage" ? SERVICE_META.filter((meta) => meta.id !== "activities") : SERVICE_META;

  function toggleEnabled(id: ServiceId) {
    setServices((current) => {
      if (id === "activities") {
        return {
          ...current,
          activities: current.activities.enabled
            ? { enabled: false, configured: false, destinations: [] }
            : { ...current.activities, enabled: true },
        };
      }
      if (id === "vehicle") {
        return {
          ...current,
          vehicle: current.vehicle.enabled
            ? { enabled: false, configured: false, vehicles: [], pending: [] }
            : { ...current.vehicle, enabled: true },
        };
      }
      if (id === "hotel") {
        return {
          ...current,
          hotel: current.hotel.enabled
            ? { enabled: false, configured: false, stays: [], pending: null }
            : { ...current.hotel, enabled: true },
        };
      }
      return {
        ...current,
        restaurant: current.restaurant.enabled
          ? { enabled: false, configured: false, meals: [] }
          : { ...current.restaurant, enabled: true },
      };
    });
  }

  function handleNext() {
    if (reviewReturnActive) {
      router.push(getReviewReturnHref("/trips/create/itinerary", template));
      return;
    }
    if (hasIncomplete) return;
    router.push("/trips/create/itinerary");
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-8 pb-28">
      <CreateStepper activeIndex={2} />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
            Step 3 &middot; Services
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
            Select Services
          </h1>
          <p className="mt-1 max-w-md font-body text-base text-text-grey">
            Build the essentials around your route. Turn on what your group
            needs — you can fine-tune each one below.
          </p>
        </div>
        <div className="relative hidden h-24 w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl sm:block">
          <Image
            src="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=600&q=80"
            alt=""
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {visibleServiceMeta.map((meta) => {
            const Icon = ICONS[meta.id];
            const isEnabled = services[meta.id].enabled;
            const isActivities = meta.id === "activities";
            const isVehicle = meta.id === "vehicle";
            const isHotel = meta.id === "hotel";
            const isConfigured = isActivities
              ? services.activities.configured
              : services[meta.id as "vehicle" | "hotel" | "restaurant"].configured;
            const selectionHref = `/trips/create/services/${meta.id}${templateQuery}`;

            return (
              <motion.div
                key={meta.id}
                variants={item}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all duration-300 sm:flex-row",
                  isEnabled ? "ring-orange/25" : "ring-navy/10"
                )}
              >
                <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-48">
                  <Image
                    src={meta.imageUrl}
                    alt={meta.imageAlt}
                    fill
                    sizes="200px"
                    className={cn(
                      "object-cover transition-all duration-500",
                      !isEnabled && "grayscale brightness-[0.85]"
                    )}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          isEnabled ? "bg-orange/10 text-orange" : "bg-navy/5 text-navy"
                        )}
                      >
                        <Icon size={17} />
                      </span>
                      <div>
                        <h3 className="font-heading text-base font-semibold text-navy">
                          {meta.title}
                        </h3>
                        <p className="mt-0.5 font-body text-sm text-text-grey">
                          {meta.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleEnabled(meta.id)}
                      label={`Enable ${meta.title}`}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {isEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        {isVehicle && (
                          <>
                            {hasInvalidKsrtcSelection ? (
                              <InvalidSelectionRow
                                message="Your KSRTC selection is no longer available for this group size."
                                label="Change Vehicle"
                                href={selectionHref}
                              />
                            ) : isConfigured && services.vehicle.vehicles.length > 0 ? (
                              <SelectedServiceRow
                                name={vehicleSummaryName(services.vehicle.vehicles)}
                                subtitle={vehicleSummarySubtitle(services.vehicle.vehicles)}
                                price={vehicleCost}
                                href={selectionHref}
                              />
                            ) : (
                              <NeedsSelectionRow
                                label="Choose Vehicle"
                                href={selectionHref}
                              />
                            )}
                          </>
                        )}

                        {isHotel && (
                          <>
                            {isConfigured && services.hotel.stays.length > 0 ? (
                              <SelectedServiceRow
                                name={hotelSummaryName(services.hotel.stays)}
                                subtitle={hotelSummarySubtitle(services.hotel.stays)}
                                price={hotelCost}
                                href={selectionHref}
                              />
                            ) : (
                              <NeedsSelectionRow label="Choose Hotel" href={selectionHref} />
                            )}
                          </>
                        )}

                        {!isActivities && !isVehicle && !isHotel && (
                          <>
                            {isConfigured && services.restaurant.meals.length > 0 ? (
                              <SelectedServiceRow
                                name={mealPlanSummaryName(services.restaurant.meals)}
                                subtitle={mealPlanSummarySubtitle(services.restaurant.meals)}
                                price={restaurantCost}
                                href={selectionHref}
                              />
                            ) : (
                              <NeedsSelectionRow
                                label={`Plan ${meta.title}`}
                                href={selectionHref}
                              />
                            )}
                          </>
                        )}

                        {isActivities && (
                          <>
                            {isConfigured && services.activities.destinations.some((d) => d.status === "has_activities") ? (
                              <SelectedServiceRow
                                name={activitiesSummaryName(services.activities.destinations)}
                                subtitle={activitiesSummarySubtitle(services.activities.destinations)}
                                price={activitiesCost}
                                href={selectionHref}
                              />
                            ) : (
                              <NeedsSelectionRow label="Plan Activities" href={selectionHref} />
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl bg-navy/[0.02] p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Cost Breakdown
            </p>
            <div className="mt-3 flex flex-col gap-2 font-body text-sm text-navy">
              <CostLine label="Vehicle" value={vehicleCost} />
              <CostLine label="Hotel" value={hotelCost} />
              <CostLine label="Dining" value={restaurantCost} />
              {mode !== "pilgrimage" && <CostLine label="Activities" value={activitiesCost} />}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
              <span className="font-body text-sm font-semibold text-navy">
                Estimated Total
              </span>
              {/* Plain, unanimated span — not AnimatePresence/key-swapped.
                  The mount effect below (which reads the real persisted
                  draft) can change `subtotal` moments after this component
                  first mounts, in the same commit as React's hydration. A
                  keyed AnimatePresence child mounted right at that boundary
                  reliably ends up orphaned by Framer Motion in this app
                  (confirmed empirically across several AnimatePresence
                  configurations — `mode="wait"`, default mode, with and
                  without `initial={false}`): the pre-hydration child never
                  gets properly tracked, so it either blocks the real value
                  from ever appearing or sits on screen indefinitely
                  overlapping it. A static span has no such lifecycle to
                  race and always reflects the current `subtotal` exactly —
                  the page's other animations (card stagger, expand/collapse)
                  are untouched. */}
              <span className="font-heading text-lg font-bold text-navy">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {hasInvalidKsrtcSelection && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-destructive" />
                <p className="font-body text-xs text-destructive">
                  Vehicle selection needs attention — the confirmed KSRTC option no longer fits this group size.
                </p>
              </div>
            )}

            {incompleteTitles.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-orange/10 px-3 py-2.5">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-orange" />
                <p className="font-body text-xs text-orange">
                  {incompleteTitles.join(", ")} selection required before
                  continuing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <Link href={backHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back
        </Link>
        <div className="flex items-center gap-3">
          {!reviewReturnActive && hasIncomplete && (
            <span className="hidden font-body text-xs text-orange sm:inline">
              Complete required selections to continue
            </span>
          )}
          <motion.button
            type="button"
            whileHover={!reviewReturnActive && hasIncomplete ? undefined : { y: -1 }}
            whileTap={!reviewReturnActive && hasIncomplete ? undefined : { scale: 0.98 }}
            onClick={handleNext}
            disabled={!reviewReturnActive && hasIncomplete}
            className={buttonVariants({
              variant: "accent",
              size: "lg",
              className: "disabled:cursor-not-allowed disabled:opacity-40",
            })}
          >
            {reviewReturnActive ? "Return to Template Review" : "Next: Itinerary"} &rarr;
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-grey">{label}</span>
      <span className={cn("font-medium", value === 0 && "text-text-grey/60")}>
        {value > 0 ? formatCurrency(value) : "—"}
      </span>
    </div>
  );
}

function InvalidSelectionRow({ message, label, href }: { message: string; label: string; href: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-destructive-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-start gap-1.5 font-body text-sm font-medium text-destructive">
        <AlertCircle size={14} className="mt-0.5 shrink-0" /> {message}
      </span>
      <Link
        href={href}
        className="shrink-0 font-body text-sm font-semibold text-navy underline underline-offset-2 transition-colors hover:text-destructive"
      >
        {label} &rarr;
      </Link>
    </div>
  );
}

function NeedsSelectionRow({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-orange/5 px-4 py-3">
      <span className="flex items-center gap-1.5 font-body text-sm font-medium text-orange">
        <AlertCircle size={14} /> Selection required
      </span>
      <Link
        href={href}
        className="font-body text-sm font-semibold text-navy underline underline-offset-2 transition-colors hover:text-orange"
      >
        {label} &rarr;
      </Link>
    </div>
  );
}

function SelectedServiceRow({
  name,
  subtitle,
  price,
  href,
}: {
  name: string;
  subtitle: string;
  price: number;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-navy/[0.03] px-4 py-3">
      <div className="flex min-w-0 items-start gap-2">
        <Check size={14} className="mt-0.5 shrink-0 text-orange" />
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold text-navy">{name}</p>
          <p className="font-body text-xs text-text-grey">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-body text-sm font-semibold text-navy">
          {formatCurrency(price)}
        </p>
        <Link
          href={href}
          className="font-body text-xs text-orange underline underline-offset-2"
        >
          Change
        </Link>
      </div>
    </div>
  );
}

function mealPlanSummaryName(meals: MealInstance[]) {
  const counts = mealCounts(meals);
  if (counts.confirmed === 0) return "No meals planned";
  return `${counts.confirmed} ${counts.confirmed === 1 ? "meal" : "meals"} confirmed`;
}

function mealPlanSummarySubtitle(meals: MealInstance[]) {
  const counts = mealCounts(meals);
  const parts = [] as string[];
  if (counts.skipped > 0) parts.push(`${counts.skipped} skipped`);
  if (counts.remaining > 0) parts.push(`${counts.remaining} remaining`);
  return parts.join(" · ");
}

function activitiesSummaryName(destinations: DestinationActivityPlan[]) {
  const counts = activityCounts(destinations);
  if (counts.configured === 0) return "No activities selected";
  const totalActivities = destinations.reduce((sum, d) => sum + d.activities.length, 0);
  return `${totalActivities} ${totalActivities === 1 ? "activity" : "activities"}`;
}

function activitiesSummarySubtitle(destinations: DestinationActivityPlan[]) {
  const counts = activityCounts(destinations);
  const configuredNames = destinations.filter((d) => d.status === "has_activities").map((d) => d.destinationName);
  const parts = [configuredNames.join(" · ")];
  if (counts.skipped > 0) parts.push(`${counts.skipped} skipped`);
  return parts.filter(Boolean).join(" · ");
}

function hotelSummaryName(stays: DestinationStay[]) {
  const counts = staySummaryCounts(stays);
  if (counts.booked === 0) return "No accommodation selected";
  if (counts.booked === 1) return stays.find((s) => s.status === "booked")!.hotel!.name;
  return `${counts.booked} stays booked`;
}

function hotelSummarySubtitle(stays: DestinationStay[]) {
  const counts = staySummaryCounts(stays);
  const bookedNames = stays.filter((s) => s.status === "booked").map((s) => s.destinationName);
  if (counts.booked === 0 && counts.skipped > 0) {
    return `${counts.skipped} ${counts.skipped === 1 ? "stay" : "stays"} skipped`;
  }
  const parts = [bookedNames.join(" · ")];
  if (counts.skipped > 0) parts.push(`${counts.skipped} skipped`);
  return parts.filter(Boolean).join(" · ");
}

function vehicleSummaryName(vehicles: ServicesDraft["vehicle"]["vehicles"]) {
  if (vehicles.length === 0) return "";
  if (vehicles.length === 1) return vehicles[0].name;
  return `${vehicles.length} vehicles`;
}

function vehicleSummarySubtitle(vehicles: ServicesDraft["vehicle"]["vehicles"]) {
  if (vehicles.length === 0) return "";
  const totalSeats = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  if (vehicles.length === 1) {
    return `${vehicles[0].capacity} seats · ${vehicles[0].provider}`;
  }
  const providers = Array.from(new Set(vehicles.map((v) => v.provider))).join(", ");
  return `${totalSeats} seats · ${providers}`;
}
