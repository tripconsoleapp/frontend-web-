"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Check, FileCheck } from "lucide-react";
import { getBasicsSummary, getServicesDraft, getSubmittedTrip, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { computeTripPricing, createCostSnapshot, generateTripReference } from "@/lib/trip-operations";

const STAGE_LABELS = ["Validating trip details", "Locking cost snapshot", "Creating trip submission", "Sending to operations queue"];

export function SubmissionProcessing() {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(-1);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // No cancellation flag here: React's dev-mode Strict Mode double-invokes
    // this effect once on mount (setup → cleanup → setup), and a shared
    // "cancelled" flag set by that synchronous cleanup would permanently
    // stop the loop right after stage 0 — the started run never gets to
    // finish. Navigating away for real simply unmounts the component;
    // the remaining setState calls become harmless no-ops, and letting the
    // final saveTripRecord() complete anyway is correct — a submission in
    // progress shouldn't be abandoned just because the tab changed route.
    async function run() {
      // The real PATCH /trips/:id/status call already happened on Final
      // Review (see final-review.tsx) — it must succeed before the router
      // ever pushes here. This screen never calls the backend itself and
      // never fabricates a success outcome; it only proceeds once a real
      // backend confirmation is already on record. Reaching this screen
      // any other way (direct navigation, back button after a failed
      // submit) sends the organizer back to Review instead of faking it.
      const confirmed = getSubmittedTrip();
      if (!confirmed) {
        router.replace("/trips/create/review");
        return;
      }

      for (let i = 0; i < STAGE_LABELS.length; i++) {
        setStageIndex(i);
        await new Promise((r) => setTimeout(r, shouldReduce ? 0 : 320));
      }

      // Backend submission is already confirmed above. This is bookkeeping
      // for the existing local Operations/Payment/Passenger/Verification
      // mock lifecycle (out of scope here) so those already-working screens
      // keep functioning — it is no longer what decides success.
      //
      // `confirmed.id` (the real backend/demo-backend trip id) is passed as
      // the preferred id for a brand-new local record only — this is the
      // first place in the normal flow that ever calls getTripRecord(), so
      // for a plain Start-from-Scratch trip this seeds the record with the
      // same id the "Go to Trip Operations" link (trip-submitted.tsx) and
      // the six secondary pages' URLs already use, instead of an unrelated
      // random one. Template/pilgrimage/scheduled-join trips never reach
      // this with a real submitted id in the same way, so they're
      // unaffected. An existing record (e.g. this trip's own record from an
      // earlier visit) is always returned as-is — this never reassigns or
      // overwrites an id already in use.
      const services = getServicesDraft();
      const basics = getBasicsSummary();
      const pricing = computeTripPricing(services, {
        passengerCount: basics?.participantCount ?? 0,
        participantBreakdown: basics?.participantBreakdown ?? [],
      });
      const trip = getTripRecord(confirmed.id);
      const snapshot = createCostSnapshot(pricing, trip.costSnapshots);
      saveTripRecord({
        ...trip,
        status: "submitted",
        reference: trip.reference ?? generateTripReference(),
        submittedAt: new Date().toISOString(),
        costSnapshots: [...trip.costSnapshots, snapshot],
        verification: { ...trip.verification, status: "pending", snapshotId: snapshot.id, reviewedAt: null, notes: null, affectedSection: null },
      });

      router.replace("/trips/create/submitted");
    }

    run();
  }, [router, shouldReduce]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 py-16 text-center">
      <motion.span
        animate={{ rotate: shouldReduce ? 0 : 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy"
      >
        <FileCheck size={26} />
      </motion.span>

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Submitting your trip...</h1>
        <p className="mt-2 max-w-md font-body text-sm text-text-grey">
          Please don&rsquo;t close this window. Your itinerary is being locked and sent to the operations team.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5 text-left">
        {STAGE_LABELS.map((label, i) => {
          const status = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
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
              <span className={status === "pending" ? "font-body text-sm text-text-grey/60" : "font-body text-sm text-navy"}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
