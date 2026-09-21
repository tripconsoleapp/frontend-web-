"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { DestinationActivityPlan, getServicesDraft } from "@/lib/listing-draft";
import { destinationTotal } from "@/lib/activity-plan";
import { formatStayDate } from "@/lib/hotel-stays";
import { ActivityContextHeader } from "./activity-context-header";

export function ConfirmDestination({ destinationId, template }: { destinationId: string; template?: string }) {
  const router = useRouter();
  const templateQuery = template ? `?template=${template}` : "";

  const [dest, setDest] = useState<DestinationActivityPlan | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const draft = getServicesDraft();
    setDest(draft.activities.destinations.find((d) => d.destinationId === destinationId) ?? null);
  }, [destinationId]);

  if (!dest) {
    return (
      <div className="flex flex-col gap-6">
        <ActivityContextHeader backHref={`/trips/create/services/activities${templateQuery}`} eyebrow="Confirm" />
        <div className="h-32 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const total = destinationTotal(dest.activities);

  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy"
        >
          <Check size={26} />
        </motion.span>
        <h1 className="font-heading text-xl font-bold text-navy">{dest.destinationName} activities configured</h1>
        <p className="font-body text-sm text-text-grey">
          {dest.activities.length} {dest.activities.length === 1 ? "activity" : "activities"} &middot; {formatCurrency(total)}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/trips/create/services/activities${templateQuery}`)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Back to Activities &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities/${destinationId}/plan${templateQuery}`}
        backLabel="Back and edit"
        eyebrow="Confirm"
        destinationName={dest.destinationName}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{dest.destinationName}</h1>
        <p className="mt-0.5 font-body text-sm text-text-grey">
          {dest.activities.length} {dest.activities.length === 1 ? "activity" : "activities"}
        </p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <div className="flex flex-col gap-3">
          {dest.activities.map((a, i) => (
            <div key={a.id} className="flex items-center justify-between">
              <p className="font-body text-sm text-navy">
                Activity {i + 1}
                <span className="block font-semibold">{a.name}</span>
                <span className="font-body text-xs text-text-grey">
                  {formatStayDate(a.date)} &middot; {a.startTime}
                </span>
              </p>
              <p className="font-body text-sm font-semibold text-navy">{formatCurrency(a.total)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-body text-sm font-semibold text-navy">Total</span>
          <span className="font-heading text-xl font-bold text-navy">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
        >
          <Check size={15} /> Confirm
        </button>
        <button
          type="button"
          onClick={() => router.push(`/trips/create/services/activities/${destinationId}/plan${templateQuery}`)}
          className="font-body text-sm font-medium text-navy underline underline-offset-2 transition-colors hover:text-orange"
        >
          Back and edit
        </button>
      </div>
    </div>
  );
}
