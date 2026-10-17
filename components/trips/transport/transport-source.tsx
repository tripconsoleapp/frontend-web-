"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { getBackendTripId, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { useTripContext } from "@/lib/use-trip-context";
import { isKsrtcEligible } from "@/lib/transport-eligibility";
import { TransportContextHeader } from "./transport-context-header";
import { useAuth } from "@/lib/auth-context";
import { vehicleServicesToSelection, type BackendTripService } from "@/lib/vehicle-service-api";

type Source = "private" | "ksrtc";

const SOURCES: {
  id: Source;
  title: string;
  description: string;
  icon: typeof Truck;
}[] = [
  {
    id: "private",
    title: "Private Operators",
    description: "Flexible operators and vehicles from verified providers.",
    icon: Truck,
  },
  {
    id: "ksrtc",
    title: "KSRTC",
    description: "Government-operated transport options.",
    icon: ShieldCheck,
  },
];

export function TransportSource({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, isIndividual, ready } = useTripContext();
  const { authedFetch } = useAuth();
  const [selected, setSelected] = useState<Source | null>(null);

  // KSRTC is only ever offered once the group meets the configured
  // threshold — the organizer never sees it as a selectable option
  // otherwise, so there's nothing to discover is unavailable later.
  const availableSources = ready && !isKsrtcEligible(passengerCount, isIndividual)
    ? SOURCES.filter((s) => s.id !== "ksrtc")
    : SOURCES;

  // Entering the transport flow fresh always starts a new selection attempt.
  // The previously confirmed plan (`vehicle.vehicles`) is untouched — only
  // the in-progress `pending` slot is cleared.
  useEffect(() => {
    const draft = getServicesDraft();
    if (draft.vehicle.pending.length > 0) {
      saveServicesDraft({
        ...draft,
        vehicle: { ...draft.vehicle, pending: [] },
      });
    }

    // Backend is authoritative once a real trip exists — recover a
    // previously confirmed configuration that isn't in local state (e.g.
    // after a refresh cleared sessionStorage). Never overrides a plan
    // that's already present locally.
    const backendTripId = getBackendTripId();
    if (!backendTripId || draft.vehicle.vehicles.length > 0) return;
    (async () => {
      try {
        const backendTrip = await authedFetch<{ services: BackendTripService[] }>(
          `/trips/${backendTripId}`
        );
        const restored = vehicleServicesToSelection(backendTrip.services ?? []);
        if (restored.length === 0) return;
        const latest = getServicesDraft();
        if (latest.vehicle.vehicles.length > 0) return; // something else set it meanwhile
        saveServicesDraft({
          ...latest,
          vehicle: { ...latest.vehicle, vehicles: restored, configured: true },
        });
      } catch {
        // Non-fatal — the organizer just starts (or continues) with no
        // restored plan; a fresh confirm still reports its own success/failure.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A preference recorded earlier (e.g. the pilgrimage Transport
  // Preference step) is pre-selected here rather than asking again —
  // still just a starting point, the organizer can change it. If Trip
  // Basics changed since then and KSRTC is no longer eligible, the stale
  // preference is corrected back to Private rather than left sitting in
  // the draft — nothing here has offered KSRTC to see, so there's no
  // "selection" to preserve, only a hint that no longer applies.
  useEffect(() => {
    if (!ready) return;
    const draft = getServicesDraft();
    const preferred = draft.vehicle.lastSource;
    if (!preferred) return;
    if (preferred === "ksrtc" && !isKsrtcEligible(passengerCount, isIndividual)) {
      saveServicesDraft({ ...draft, vehicle: { ...draft.vehicle, lastSource: "private" } });
      return;
    }
    setSelected(preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const query = template ? `&template=${template}` : "";
  const backHref = `/trips/create/services${template ? `?template=${template}` : ""}`;

  function handleContinue() {
    if (!selected) return;
    if (selected === "ksrtc") {
      router.push(`/trips/create/services/vehicle/results?source=ksrtc${query}`);
    } else {
      router.push(`/trips/create/services/vehicle/type?source=private${query}`);
    }
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader
        backHref={backHref}
        eyebrow="Services · Transport"
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Find transport that fits your group.
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Choose how you&apos;d like to arrange transport for this trip.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={cn("grid grid-cols-1 gap-4", availableSources.length > 1 && "sm:grid-cols-2")}
      >
        {availableSources.map((source) => {
          const Icon = source.icon;
          const isSelected = selected === source.id;
          return (
            <motion.button
              key={source.id}
              variants={item}
              type="button"
              onClick={() => setSelected(source.id)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-2xl border bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5",
                isSelected
                  ? "border-orange bg-orange/5 shadow-sm"
                  : "border-navy/10 hover:border-navy/25"
              )}
            >
              {isSelected && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  isSelected ? "bg-orange/10 text-orange" : "bg-navy/5 text-navy"
                )}
              >
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold text-navy">
                  {source.title}
                </h3>
                <p className="mt-1 font-body text-sm text-text-grey">
                  {source.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {selected ? "Ready to continue" : "Choose a transport source"}
        </span>
        <motion.button
          type="button"
          whileHover={selected ? { y: -1 } : undefined}
          whileTap={selected ? { scale: 0.98 } : undefined}
          onClick={handleContinue}
          disabled={!selected}
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "disabled:cursor-not-allowed disabled:opacity-40",
          })}
        >
          Continue &rarr;
        </motion.button>
      </div>
    </div>
  );
}
