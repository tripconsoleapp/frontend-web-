"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Check, Compass, Sparkles } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";
import { getItineraryDraft, getServicesDraft, saveItineraryDraft } from "@/lib/listing-draft";
import { generateItinerary } from "@/lib/itinerary";

type StageStatus = "pending" | "active" | "done";

interface Stage {
  id: string;
  label: string;
  run: () => void | boolean;
}

export function ItineraryGeneration({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const [stageIndex, setStageIndex] = useState(-1);
  const [done, setDone] = useState(false);
  const [dayCount, setDayCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!trip.ready || startedRef.current) return;
    startedRef.current = true;

    // Re-entering this route (e.g. from Services, or after a refresh) must
    // never silently overwrite an itinerary the organizer already edited —
    // only run generation the first time.
    const existing = getItineraryDraft();
    if (existing.status !== "not_generated" && existing.days.length > 0) {
      router.replace(`/trips/create/itinerary/overview${templateQuery}`);
      return;
    }

    const stages: Stage[] = [
      { id: "validate", label: "Validating destinations", run: () => trip.stops.length > 0 },
      { id: "sync", label: "Syncing services", run: () => true },
      { id: "timeline", label: "Generating day timeline", run: () => true },
      { id: "schedule", label: "Checking schedule for conflicts", run: () => true },
      { id: "finalize", label: "Finalizing itinerary", run: () => true },
    ];

    let cancelled = false;
    let generated: ReturnType<typeof generateItinerary> | null = null;

    async function run() {
      for (let i = 0; i < stages.length; i++) {
        if (cancelled) return;
        setStageIndex(i);
        // Each stage corresponds to a real step below — the delay only
        // paces the UI for perceptibility, it doesn't fake the work.
        await new Promise((r) => setTimeout(r, shouldReduce ? 0 : 280));
        if (stages[i].id === "timeline") {
          const services = getServicesDraft();
          generated = generateItinerary({
            stops: trip.stops,
            startDate: trip.startDate,
            startLocationId: trip.startLocationId,
            startLocationName: trip.startLocationName,
            services,
          });
        }
      }
      if (cancelled || !generated) return;
      saveItineraryDraft(generated);
      setDayCount(generated.days.length);
      setDone(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [trip.ready, trip.stops, trip.startDate, trip.startLocationId, trip.startLocationName, shouldReduce]);

  const stageLabels = [
    "Validating destinations",
    "Syncing services",
    "Generating day timeline",
    "Checking schedule for conflicts",
    "Finalizing itinerary",
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 py-16 text-center">
      <motion.span
        animate={done ? { scale: 1 } : { rotate: shouldReduce ? 0 : 360 }}
        transition={done ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy"
      >
        {done ? <Check size={28} className="text-navy" /> : <Compass size={26} />}
      </motion.span>

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          {done ? "Itinerary ready" : "Building your itinerary..."}
        </h1>
        <p className="mt-2 max-w-md font-body text-sm text-text-grey">
          {done
            ? `${dayCount} ${dayCount === 1 ? "day" : "days"} organized from your destinations, services, and timings.`
            : "Organizing destinations, services and timings into a day-by-day travel plan."}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5 text-left">
        {stageLabels.map((label, i) => {
          const status: StageStatus = done || i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
          return (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className={
                  status === "done"
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/60 text-navy"
                    : status === "active"
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-orange"
                      : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-navy/15"
                }
              >
                {status === "done" && <Check size={11} />}
              </span>
              <span className={status === "pending" ? "font-body text-sm text-text-grey/60" : "font-body text-sm text-navy"}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {done && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.push(`/trips/create/itinerary/overview${templateQuery}`)}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
          >
            <Sparkles size={14} /> Review Itinerary
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
