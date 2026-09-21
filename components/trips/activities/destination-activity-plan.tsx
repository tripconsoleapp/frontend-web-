"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Pencil, X } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { DestinationActivityPlan, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { destinationTotal } from "@/lib/activity-plan";
import { formatStayDate } from "@/lib/hotel-stays";
import { ActivityContextHeader } from "./activity-context-header";

export function DestinationActivityPlanView({ destinationId, template }: { destinationId: string; template?: string }) {
  const router = useRouter();
  const templateQuery = template ? `?template=${template}` : "";

  const [dest, setDest] = useState<DestinationActivityPlan | null>(null);

  useEffect(() => {
    const draft = getServicesDraft();
    setDest(draft.activities.destinations.find((d) => d.destinationId === destinationId) ?? null);
  }, [destinationId]);

  if (!dest) {
    return (
      <div className="flex flex-col gap-6">
        <ActivityContextHeader backHref={`/trips/create/services/activities${templateQuery}`} eyebrow="Activity Plan" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const sorted = [...dest.activities].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const total = destinationTotal(dest.activities);

  function removeActivity(id: string) {
    const draft = getServicesDraft();
    const next = draft.activities.destinations.map((d) =>
      d.destinationId === destinationId ? { ...d, activities: d.activities.filter((a) => a.id !== id) } : d
    );
    saveServicesDraft({ ...draft, activities: { ...draft.activities, destinations: next } });
    setDest(next.find((d) => d.destinationId === destinationId) ?? null);
  }

  function handleConfirm() {
    router.push(`/trips/create/services/activities/${destinationId}/confirm${templateQuery}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities${templateQuery}`}
        eyebrow={`${dest.destinationName} Activities`}
        destinationName={dest.destinationName}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{dest.destinationName} Activities</h1>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <p className="font-heading text-base font-semibold text-navy">No activities planned yet.</p>
          <p className="max-w-sm font-body text-sm text-text-grey">
            Add an experience to make {dest.destinationName} part of the journey.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/trips/create/services/activities/${destinationId}/discover${templateQuery}`)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
          >
            Explore Activities <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div className="flex flex-col">
            {sorted.map((a, index) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 border-b border-navy/10 py-4 first:pt-0 last:border-b-0"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 font-body text-sm font-semibold text-navy">
                  {index + 1}
                </span>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={a.imageUrl} alt={a.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-semibold text-navy">{a.name}</p>
                  <p className="font-body text-xs text-text-grey">
                    {formatStayDate(a.date)} &middot; {a.startTime} &middot; {a.durationHours}{" "}
                    {a.durationHours === 1 ? "hour" : "hours"} &middot; {a.participants} participants
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="font-body text-sm font-semibold text-navy">{formatCurrency(a.total)}</p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/trips/create/services/activities/${destinationId}/activity/${a.activityId}/configure?edit=${a.id}${template ? `&template=${template}` : ""}`
                      )
                    }
                    aria-label={`Edit ${a.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-navy/5 hover:text-navy"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeActivity(a.id)}
                    aria-label={`Remove ${a.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-body text-sm text-text-grey">Total activities</p>
            <p className="font-heading text-lg font-bold text-navy">{formatCurrency(total)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/trips/create/services/activities/${destinationId}/discover${templateQuery}`)}
              className="rounded-full border border-navy/20 px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
            >
              + Add another activity
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              Confirm {dest.destinationName} Activities <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
