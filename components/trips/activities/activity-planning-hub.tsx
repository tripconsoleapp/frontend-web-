"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check, Compass, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { DestinationActivityPlan, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { computeStayDates, formatStayDate } from "@/lib/hotel-stays";
import { activityCounts, destinationTotal, reconcileActivityDestinations } from "@/lib/activity-plan";
import { ActivityContextHeader } from "./activity-context-header";
import { SkipActivitiesDialog } from "./skip-activities-dialog";

export function ActivityPlanningHub({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";
  const backHref = `/trips/create/services${templateQuery}`;

  const [destinations, setDestinations] = useState<DestinationActivityPlan[] | null>(null);
  const [skipTarget, setSkipTarget] = useState<DestinationActivityPlan | null>(null);

  useEffect(() => {
    if (!trip.ready) return;
    const draft = getServicesDraft();
    const reconciled = reconcileActivityDestinations(draft.activities.destinations, trip.stops);
    saveServicesDraft({
      ...draft,
      activities: {
        ...draft.activities,
        destinations: reconciled,
        configured: reconciled.length > 0 && reconciled.every((d) => d.status !== "not_planned"),
      },
    });
    setDestinations(reconciled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.ready]);

  const dated = trip.ready ? computeStayDates(trip.stops, trip.startDate) : [];

  if (!destinations) {
    return (
      <div className="flex flex-col gap-6">
        <ActivityContextHeader backHref={backHref} eyebrow="Services · Activities" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <ActivityContextHeader backHref={backHref} eyebrow="Services · Activities" />
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <Compass size={22} className="text-navy/40" />
          <p className="font-heading text-base font-semibold text-navy">No destinations to plan activities for yet.</p>
          <p className="max-w-sm font-body text-sm text-text-grey">
            Add a destination with at least one night in the Destinations step to explore activities there.
          </p>
        </div>
      </div>
    );
  }

  function persist(next: DestinationActivityPlan[]) {
    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      activities: {
        ...draft.activities,
        destinations: next,
        configured: next.length > 0 && next.every((d) => d.status !== "not_planned"),
      },
    });
    setDestinations(next);
  }

  function confirmSkip() {
    if (!skipTarget || !destinations) return;
    const next = destinations.map((d) =>
      d.destinationId === skipTarget.destinationId ? { ...d, status: "skipped" as const, activities: [] } : d
    );
    persist(next);
    setSkipTarget(null);
  }

  const counts = activityCounts(destinations);
  const total = destinations.reduce((sum, d) => sum + destinationTotal(d.activities), 0);

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.07 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader backHref={backHref} eyebrow="Services · Activities" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Activities</h1>
        <p className="mt-1 max-w-lg font-body text-sm text-text-grey">
          Add experiences and activities to each destination in your trip.
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
        {destinations.map((dest, index) => {
          const stayDates = dated.find((d) => d.destinationId === dest.destinationId);
          return (
            <motion.div
              key={dest.destinationId}
              variants={item}
              className="flex flex-col gap-3 border-b border-navy/10 py-6 first:pt-0 last:border-b-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-navy">{dest.destinationName}</h2>
                  {stayDates && (
                    <p className="font-body text-sm text-text-grey">
                      {formatStayDate(stayDates.checkIn)} &ndash; {formatStayDate(stayDates.checkOut)}
                    </p>
                  )}
                </div>

                {dest.status === "has_activities" && (
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1.5 font-body text-sm font-medium text-navy">
                      <Check size={13} className="text-navy" /> {dest.activities.length}{" "}
                      {dest.activities.length === 1 ? "activity" : "activities"} selected
                    </p>
                    <p className="font-heading text-base font-bold text-navy">{formatCurrency(destinationTotal(dest.activities))}</p>
                  </div>
                )}
                {dest.status === "skipped" && (
                  <p className="flex items-center gap-1.5 font-body text-sm text-text-grey">
                    <Minus size={13} /> Activities skipped
                  </p>
                )}
                {dest.status === "not_planned" && (
                  <p className="font-body text-sm text-text-grey">No activities planned</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {dest.status === "has_activities" &&
                  dest.activities.map((a) => (
                    <span key={a.id} className="rounded-full border border-navy/15 bg-navy/[0.03] px-3 py-1.5 font-body text-sm text-navy">
                      {a.name}
                    </span>
                  ))}

                {dest.status === "has_activities" && (
                  <button
                    type="button"
                    onClick={() => router.push(`/trips/create/services/activities/${dest.destinationId}/discover${templateQuery}`)}
                    className="rounded-full border border-dashed border-navy/25 px-3.5 py-1.5 font-body text-sm font-medium text-navy transition-colors hover:border-orange hover:text-orange"
                  >
                    + Add Activity
                  </button>
                )}

                {dest.status === "not_planned" && (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push(`/trips/create/services/activities/${dest.destinationId}/discover${templateQuery}`)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
                    >
                      Explore Activities <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkipTarget(dest)}
                      className="font-body text-sm font-medium text-text-grey underline underline-offset-2 transition-colors hover:text-navy"
                    >
                      Skip activities
                    </button>
                  </>
                )}

                {dest.status === "skipped" && (
                  <button
                    type="button"
                    onClick={() => router.push(`/trips/create/services/activities/${dest.destinationId}/discover${templateQuery}`)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
                  >
                    Add Activities <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-sm text-text-grey">
          {counts.configured} configured &middot; {counts.skipped} skipped &middot;{" "}
          <span className={counts.notPlanned > 0 ? "font-medium text-orange" : ""}>{counts.notPlanned} not planned</span>
          {total > 0 && <span className="ml-2 font-semibold text-navy">{formatCurrency(total)}</span>}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/trips/create/services/activities/summary${templateQuery}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          View Activities Summary <ArrowRight size={14} />
        </button>
      </div>

      <SkipActivitiesDialog
        open={Boolean(skipTarget)}
        destinationName={skipTarget?.destinationName ?? ""}
        onConfirm={confirmSkip}
        onCancel={() => setSkipTarget(null)}
      />
    </div>
  );
}
