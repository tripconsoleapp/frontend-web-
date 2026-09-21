"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { DestinationActivityPlan, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { activityCounts, destinationTotal, planTotal } from "@/lib/activity-plan";
import { ActivityContextHeader } from "./activity-context-header";

export function ActivitiesSummary({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const templateQuery = template ? `?template=${template}` : "";

  const [destinations, setDestinations] = useState<DestinationActivityPlan[] | null>(null);

  useEffect(() => {
    setDestinations(getServicesDraft().activities.destinations);
  }, []);

  if (!destinations) {
    return (
      <div className="flex flex-col gap-6">
        <ActivityContextHeader backHref={`/trips/create/services/activities${templateQuery}`} eyebrow="Activities Summary" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const total = planTotal(destinations);
  const counts = activityCounts(destinations);

  function handleContinue() {
    const draft = getServicesDraft();
    saveServicesDraft({ ...draft, activities: { ...draft.activities, configured: true } });
    router.push(`/trips/create/services${templateQuery}`);
  }

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.07 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader backHref={`/trips/create/services/activities${templateQuery}`} eyebrow="Activities Summary" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Activities Summary</h1>
      </div>

      {counts.notPlanned > 0 && (
        <div className="rounded-xl bg-orange/10 px-4 py-3">
          <p className="font-body text-sm text-orange">
            {counts.notPlanned} destination{counts.notPlanned === 1 ? "" : "s"} still need{counts.notPlanned === 1 ? "s" : ""} a decision.
          </p>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
        {destinations.map((d) => (
          <motion.div key={d.destinationId} variants={item} className="flex items-center justify-between gap-3 border-b border-navy/10 py-4 first:pt-0 last:border-b-0">
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                className={
                  d.status === "has_activities"
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/60 text-navy"
                    : d.status === "skipped"
                      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy/5 text-text-grey"
                      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-navy/20"
                }
              >
                {d.status === "has_activities" ? <Check size={11} /> : d.status === "skipped" ? <Minus size={11} /> : null}
              </span>
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-navy">{d.destinationName}</p>
                <p className="font-body text-sm text-text-grey">
                  {d.status === "has_activities"
                    ? `${d.activities.length} ${d.activities.length === 1 ? "activity" : "activities"}`
                    : d.status === "skipped"
                      ? "Activities skipped"
                      : "Not yet planned"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {d.status === "has_activities" && <p className="font-body text-sm font-semibold text-navy">{formatCurrency(destinationTotal(d.activities))}</p>}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    d.status === "has_activities"
                      ? `/trips/create/services/activities/${d.destinationId}/plan${templateQuery}`
                      : `/trips/create/services/activities/${d.destinationId}/discover${templateQuery}`
                  )
                }
                className="font-body text-sm font-semibold text-orange underline underline-offset-2"
              >
                Edit Activities
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-sm text-text-grey">Total Activities</p>
          <p className="font-heading text-lg font-bold text-navy">{total > 0 ? formatCurrency(total) : "—"}</p>
        </div>
        <button
          type="button"
          disabled={counts.notPlanned > 0}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to Services <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
