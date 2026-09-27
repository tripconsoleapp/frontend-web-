"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ClipboardCheck, Truck, Users } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { TripRecord, getTripRecord } from "@/lib/listing-draft";
import { currentCostSnapshot } from "@/lib/trip-operations";

const NEXT_STEPS = [
  { icon: ClipboardCheck, title: "Admin Review", body: "TripConsole reviews your itinerary and submitted requirements." },
  { icon: Truck, title: "Operator Assignment", body: "Transport and other operational requirements are coordinated." },
  { icon: Users, title: "Passenger Details", body: "Collect traveler information before final logistics are completed." },
];

function formatSubmissionDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function TripSubmitted() {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);

  useEffect(() => {
    const r = getTripRecord();
    if (r.status !== "submitted") {
      router.replace("/trips/create/review");
      return;
    }
    setRecord(r);
  }, [router]);

  if (!record) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  const snapshot = currentCostSnapshot(record.costSnapshots);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="relative flex h-56 flex-col justify-end overflow-hidden rounded-3xl sm:h-64">
        <Image
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
        <div className="relative z-10 flex flex-col gap-3 p-8">
          <motion.span
            initial={shouldReduce ? undefined : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-navy"
          >
            <Check size={20} />
          </motion.span>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-mint">Trip Submitted</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">{trip.tripName || "Your trip"} is on its way</h1>
            <p className="mt-1 max-w-md font-body text-sm text-white/85">Your trip has been successfully submitted for review.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Trip Reference</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{record.reference}</p>
        </div>
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Total Investment</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{formatCurrency(snapshot?.total ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Submission Date</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{record.submittedAt ? formatSubmissionDate(record.submittedAt) : "—"}</p>
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">What happens next</p>
        <div className="mt-4 flex flex-col">
          {NEXT_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4 border-b border-navy/10 py-4 first:pt-0 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 font-body text-sm font-semibold text-navy">{i + 1}</span>
              <div>
                <p className="flex items-center gap-1.5 font-heading text-base font-semibold text-navy">
                  <step.icon size={15} className="text-orange" /> {step.title}
                </p>
                <p className="mt-0.5 font-body text-sm text-text-grey">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`/trips/${record.id}/operations`)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
        >
          Go to Trip Operations <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
