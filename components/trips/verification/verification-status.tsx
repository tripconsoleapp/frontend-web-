"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { TripRecord, TripVerification, getServicesDraft, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { computeTripPricing, createCostSnapshot, createNotification, currentCostSnapshot, supersedeCostSnapshots } from "@/lib/trip-operations";

const AFFECTED_LABEL: Record<NonNullable<TripVerification["affectedSection"]>, string> = {
  vehicle: "Transport",
  hotel: "Hotel",
  restaurant: "Meals",
  activities: "Activities",
  passengers: "Passenger Details",
};

const AFFECTED_HREF: Record<NonNullable<TripVerification["affectedSection"]>, (tripId: string) => string> = {
  vehicle: () => "/trips/create/services/vehicle",
  hotel: () => "/trips/create/services/hotel",
  restaurant: () => "/trips/create/services/restaurant",
  activities: () => "/trips/create/services/activities",
  passengers: (tripId) => `/trips/${tripId}/passengers`,
};

export function VerificationStatus({ tripId }: { tripId: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const startedReview = useRef(false);

  useEffect(() => {
    setRecord(getTripRecord());
  }, []);

  useEffect(() => {
    if (!record || record.verification.status !== "pending" || startedReview.current) return;
    startedReview.current = true;
    const t = setTimeout(() => {
      const current = getTripRecord();
      const next = { ...current, verification: { ...current.verification, status: "in_review" as const } };
      saveTripRecord(next);
      setRecord(next);
    }, shouldReduce ? 0 : 900);
    return () => clearTimeout(t);
  }, [record, shouldReduce]);

  if (!record) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to My Trips</Link>
      </div>
    );
  }

  const snapshot = currentCostSnapshot(record.costSnapshots);
  const livePricing = computeTripPricing(getServicesDraft(), { passengerCount: trip.passengerCount, participantBreakdown: trip.participantBreakdown });
  const approvedButStale = record.verification.status === "approved" && snapshot !== null && livePricing.total !== snapshot.total;

  function persist(next: TripRecord) {
    saveTripRecord(next);
    setRecord(next);
  }

  function decide(outcome: "approved" | "needs_changes", notes: string | null, affectedSection: NonNullable<TripVerification["affectedSection"]> | null) {
    if (!record || !snapshot) return;
    const notification =
      outcome === "approved"
        ? createNotification({
            type: "verification",
            severity: "success",
            title: "Trip verified",
            message: `Your cost snapshot (version ${snapshot.version}) has been approved. Payment is now available.`,
            actionHref: `/trips/${tripId}/payment`,
          })
        : createNotification({
            type: "verification",
            severity: "action_required",
            title: "Changes requested",
            message: notes ?? "TripConsole has requested changes to this submission.",
            actionHref: `/trips/${tripId}/verification`,
          });
    const next: TripRecord = {
      ...record,
      status: outcome === "approved" && record.status === "submitted" ? "verified" : record.status,
      verification: { status: outcome, reviewedAt: new Date().toISOString(), notes, affectedSection, snapshotId: snapshot.id },
      notifications: [...record.notifications, notification],
    };
    persist(next);
  }

  function resubmit() {
    if (!record) return;
    const services = getServicesDraft();
    const pricing = computeTripPricing(services, { passengerCount: trip.passengerCount, participantBreakdown: trip.participantBreakdown });
    const latest = currentCostSnapshot(record.costSnapshots);
    let costSnapshots = record.costSnapshots;
    if (!latest || latest.total !== pricing.total) {
      costSnapshots = [...supersedeCostSnapshots(record.costSnapshots), createCostSnapshot(pricing, record.costSnapshots)];
    }
    const next: TripRecord = {
      ...record,
      costSnapshots,
      verification: { status: "pending", reviewedAt: null, notes: null, affectedSection: null, snapshotId: currentCostSnapshot(costSnapshots)?.id ?? null },
    };
    persist(next);
    startedReview.current = false;
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/operations`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to operations
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Admin Verification</h1>
      </div>

      {record.verification.status === "pending" && (
        <StatusCard icon={Clock} tone="pending" title="Awaiting Review" body="Your submission is queued for review by the TripConsole team." />
      )}

      {record.verification.status === "in_review" && (
        <>
          <StatusCard icon={Clock} tone="active" title="Under Review" body="TripConsole is checking trip details, pricing, and the submitted cost snapshot." />
          <div className="rounded-2xl border border-dashed border-navy/20 p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Demo · Reviewer Actions</p>
            <p className="mt-1 font-body text-sm text-text-grey">This prototype has no live admin backend — use these controls to simulate the reviewer's decision.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => decide("approved", null, null)} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
                <Check size={14} /> Approve
              </button>
              <button
                type="button"
                onClick={() => decide("needs_changes", "Transport capacity needs adjustment for the current passenger count.", "vehicle")}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                Request Changes
              </button>
            </div>
          </div>
        </>
      )}

      {record.verification.status === "needs_changes" && (
        <>
          <StatusCard icon={AlertTriangle} tone="attention" title="Action Required" body={record.verification.notes ?? "TripConsole has requested changes to this submission."} />
          {record.verification.affectedSection && (
            <div className="flex items-center justify-between rounded-2xl bg-navy/[0.02] px-6 py-4">
              <p className="font-body text-sm text-navy">Affected section: <span className="font-semibold">{AFFECTED_LABEL[record.verification.affectedSection]}</span></p>
              <button
                type="button"
                onClick={() => router.push(AFFECTED_HREF[record.verification.affectedSection!](tripId))}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
              >
                Review & Fix <ArrowRight size={13} />
              </button>
            </div>
          )}
          <button type="button" onClick={resubmit} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
            Resubmit for Review
          </button>
        </>
      )}

      {record.verification.status === "approved" && snapshot && (
        <>
          <motion.div initial={shouldReduce ? undefined : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-2xl bg-mint/20 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-navy">
              <ShieldCheck size={26} />
            </span>
            <h2 className="font-heading text-xl font-bold text-navy">Verification Approved</h2>
            <p className="max-w-md font-body text-sm text-text-grey">Your submitted trip and cost snapshot have been reviewed by TripConsole.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Approved Snapshot &middot; Version {snapshot.version}</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{formatCurrency(snapshot.total)}</p>
            </div>
            <div className="rounded-2xl border border-navy/10 p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Verified Travelers</p>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{record.passengerManagement.travelers.filter((t) => t.registrationStatus === "verified").length} / {snapshot.totalTravelerCount}</p>
            </div>
          </div>

          {approvedButStale ? (
            <>
              <StatusCard
                icon={AlertTriangle}
                tone="attention"
                title="This trip no longer matches the approved snapshot"
                body={`A service was changed after approval — the current estimate is ${formatCurrency(livePricing.total)}. Resubmit to lock a new snapshot and start a fresh review before payment can proceed.`}
              />
              <button type="button" onClick={resubmit} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
                Resubmit for Review
              </button>
            </>
          ) : (
            <button type="button" onClick={() => router.push(`/trips/${tripId}/payment`)} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
              Proceed to Payment <ArrowRight size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

function StatusCard({ icon: Icon, tone, title, body }: { icon: typeof Clock; tone: "pending" | "active" | "attention"; title: string; body: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl px-6 py-5", tone === "attention" ? "bg-destructive-soft" : tone === "active" ? "bg-orange/10" : "bg-navy/[0.03]")}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", tone === "attention" ? "bg-destructive text-white" : tone === "active" ? "bg-orange text-white" : "bg-navy/10 text-navy")}>
        <Icon size={16} />
      </span>
      <div>
        <p className={cn("font-heading text-base font-semibold", tone === "attention" ? "text-destructive" : "text-navy")}>{title}</p>
        <p className={cn("mt-0.5 font-body text-sm", tone === "attention" ? "text-destructive" : "text-text-grey")}>{body}</p>
      </div>
    </div>
  );
}
