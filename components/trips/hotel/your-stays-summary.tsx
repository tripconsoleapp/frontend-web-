"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { DestinationStay, getReviewReturnHref, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { hotelServiceCost, staySummaryCounts, nightsLabel } from "@/lib/hotel-stays";
import { HotelContextHeader } from "./hotel-context-header";

export function YourStaysSummary({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const templateQuery = template ? `?template=${template}` : "";

  const [stays, setStays] = useState<DestinationStay[] | null>(null);

  useEffect(() => {
    setStays(getServicesDraft().hotel.stays);
  }, []);

  if (!stays) {
    return (
      <div className="flex flex-col gap-6">
        <HotelContextHeader backHref={`/trips/create/services/hotel${templateQuery}`} eyebrow="Select Hotels · Your Stays" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const counts = staySummaryCounts(stays);
  const total = hotelServiceCost(stays);
  const pendingStay = stays.find((s) => s.status === "pending");

  function handleContinue() {
    const draft = getServicesDraft();
    saveServicesDraft({ ...draft, hotel: { ...draft.hotel, configured: true } });
    router.push(getReviewReturnHref(`/trips/create/services${templateQuery}`, template));
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.07 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <HotelContextHeader backHref={`/trips/create/services/hotel${templateQuery}`} eyebrow="Select Hotels · Your Stays" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Your Stays</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {stays.length} {stays.length === 1 ? "destination" : "destinations"} reviewed
        </p>
      </div>

      {pendingStay && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-orange/10 px-4 py-3">
          <p className="font-body text-sm text-orange">1 stay still needs a decision.</p>
          <button
            type="button"
            onClick={() => router.push(`/trips/create/services/hotel${templateQuery}`)}
            className="shrink-0 font-body text-sm font-semibold text-navy underline underline-offset-2"
          >
            Review pending stay &rarr;
          </button>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
        {stays.map((stay) => (
          <motion.div
            key={stay.destinationId}
            variants={item}
            className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={
                  stay.status === "booked"
                    ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/60 text-navy"
                    : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/5 text-text-grey"
                }
              >
                {stay.status === "booked" ? <Check size={13} /> : <Minus size={13} />}
              </span>
              <div className="min-w-0">
                <p className="font-body text-base font-semibold text-navy">{stay.destinationName}</p>
                <p className="font-body text-sm text-text-grey">
                  {stay.status === "booked" && stay.hotel ? stay.hotel.name : "Accommodation skipped"}
                </p>
                <p className="font-body text-xs text-text-grey/70">{nightsLabel(stay.nights)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 pl-9 sm:pl-0">
              {stay.status === "booked" && (
                <p className="font-body text-base font-semibold text-navy">{formatCurrency(stay.total)}</p>
              )}
              <button
                type="button"
                onClick={() => router.push(`/trips/create/services/hotel/${stay.destinationId}/results${templateQuery}`)}
                className="font-body text-sm font-semibold text-orange underline underline-offset-2"
              >
                {stay.status === "booked" ? "Change" : "Add stay"}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-sm text-text-grey">
            {counts.booked} {counts.booked === 1 ? "stay" : "stays"} booked
            {counts.skipped > 0 ? ` · ${counts.skipped} ${counts.skipped === 1 ? "stay" : "stays"} skipped` : ""}
          </p>
          <p className="font-heading text-lg font-bold text-navy">
            {total > 0 ? formatCurrency(total) : "No accommodation cost"}
          </p>
        </div>
        <button
          type="button"
          disabled={Boolean(pendingStay)}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to Services <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
