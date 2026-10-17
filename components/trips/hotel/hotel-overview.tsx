"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, BedDouble } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import {
  DestinationStay,
  getBackendTripId,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { reconcileStays, staySummaryCounts, nightsLabel } from "@/lib/hotel-stays";
import { HotelContextHeader } from "./hotel-context-header";
import { DestinationNavigator } from "./destination-navigator";
import { SkipStayDialog } from "./skip-stay-dialog";
import { useAuth } from "@/lib/auth-context";
import { hotelServicesToStayPatches, type BackendTripService } from "@/lib/hotel-service-api";

export function HotelOverview({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const { authedFetch } = useAuth();

  const [stays, setStays] = useState<DestinationStay[] | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [skipTarget, setSkipTarget] = useState<DestinationStay | null>(null);

  useEffect(() => {
    if (!trip.ready) return;
    let cancelled = false;
    (async () => {
      const draft = getServicesDraft();
      let reconciled = reconcileStays(draft.hotel.stays, trip.stops, trip.startDate);

      // Backend is authoritative once a real trip exists — recover any
      // hotel selections already persisted there (e.g. after a refresh
      // that cleared sessionStorage) and let them override the local copy.
      const backendTripId = getBackendTripId();
      if (backendTripId) {
        try {
          const backendTrip = await authedFetch<{ services: BackendTripService[] }>(
            `/trips/${backendTripId}`
          );
          const patches = hotelServicesToStayPatches(backendTrip.services ?? []);
          if (patches.size > 0) {
            reconciled = reconciled.map((s) => patches.get(s.destinationId) ?? s);
          }
        } catch {
          // Non-fatal — continue with the local/route-derived list; any
          // subsequent add/change still reports its own success or failure.
        }
      }

      if (cancelled) return;
      saveServicesDraft({
        ...draft,
        hotel: { ...draft.hotel, stays: reconciled, configured: reconciled.length > 0 && reconciled.every((s) => s.status !== "pending") },
      });
      setStays(reconciled);
      setFocusId((current) => current ?? reconciled.find((s) => s.status === "pending")?.destinationId ?? reconciled[0]?.destinationId ?? null);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.ready]);

  const templateQuery = template ? `?template=${template}` : "";
  const backHref = `/trips/create/services${templateQuery}`;

  if (!stays) {
    return (
      <div className="flex flex-col gap-6">
        <HotelContextHeader backHref={backHref} eyebrow="Services · Hotel" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  if (stays.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <HotelContextHeader backHref={backHref} eyebrow="Services · Hotel" />
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <BedDouble size={22} className="text-navy/40" />
          <p className="font-heading text-base font-semibold text-navy">
            No overnight destinations yet.
          </p>
          <p className="max-w-sm font-body text-sm text-text-grey">
            Add a destination with at least one night in the Destinations step
            to select accommodation for it.
          </p>
        </div>
      </div>
    );
  }

  const counts = staySummaryCounts(stays);
  const focus = stays.find((s) => s.destinationId === focusId) ?? stays[0];

  function persist(next: DestinationStay[]) {
    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      hotel: {
        ...draft.hotel,
        stays: next,
        configured: next.length > 0 && next.every((s) => s.status !== "pending"),
      },
    });
    setStays(next);
  }

  function goToResults(destinationId: string) {
    router.push(`/trips/create/services/hotel/${destinationId}/results${templateQuery}`);
  }

  function confirmSkip() {
    if (!skipTarget || !stays) return;
    const next = stays.map((s) =>
      s.destinationId === skipTarget.destinationId
        ? { ...s, status: "skipped" as const, hotel: null, rooms: [], total: 0 }
        : s
    );
    persist(next);
    const nextPending = next.find((s) => s.status === "pending");
    setFocusId(nextPending?.destinationId ?? skipTarget.destinationId);
    setSkipTarget(null);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  const allDecided = counts.pending === 0;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <HotelContextHeader backHref={backHref} eyebrow="Services · Hotel" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Select Hotels</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-text-grey">
          <span>{stays.length} {stays.length === 1 ? "destination" : "destinations"}</span>
          <span className="text-navy/20">&middot;</span>
          <span>{counts.booked} {counts.booked === 1 ? "stay" : "stays"} booked</span>
          {counts.skipped > 0 && (
            <>
              <span className="text-navy/20">&middot;</span>
              <span>{counts.skipped} skipped</span>
            </>
          )}
          {counts.pending > 0 && (
            <>
              <span className="text-navy/20">&middot;</span>
              <span className="font-medium text-orange">{counts.pending} remaining</span>
            </>
          )}
        </p>
        {trip.routeLabel && (
          <p className="mt-0.5 font-body text-sm text-text-grey">{trip.routeLabel}</p>
        )}
      </div>

      <DestinationNavigator stays={stays} activeId={focus?.destinationId} onSelect={setFocusId} />

      <motion.div
        key={focus?.destinationId}
        variants={container}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-navy/10 bg-white p-6"
      >
        <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              {focus.status === "booked" ? "Booked stay" : focus.status === "skipped" ? "Skipped stay" : "Needs a decision"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-navy">{focus.destinationName}</h2>
            <p className="mt-0.5 font-body text-sm text-text-grey">{nightsLabel(focus.nights)}</p>
          </div>

          {focus.status === "booked" && focus.hotel && (
            <div className="text-right">
              <p className="font-body text-sm font-semibold text-navy">{focus.hotel.name}</p>
              <p className="font-body text-lg font-bold text-navy">{formatCurrency(focus.total)}</p>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="mt-5 flex flex-wrap items-center gap-3">
          {focus.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => goToResults(focus.destinationId)}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
              >
                Choose Hotel <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setSkipTarget(focus)}
                className="font-body text-sm font-medium text-text-grey underline underline-offset-2 transition-colors hover:text-navy"
              >
                Not staying here? Skip this stay
              </button>
            </>
          )}

          {focus.status === "booked" && (
            <button
              type="button"
              onClick={() => goToResults(focus.destinationId)}
              className="rounded-full border border-navy/20 px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
            >
              Change
            </button>
          )}

          {focus.status === "skipped" && (
            <button
              type="button"
              onClick={() => goToResults(focus.destinationId)}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              Add Stay <ArrowRight size={14} />
            </button>
          )}
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-sm text-text-grey">
          {allDecided
            ? "Every destination has been reviewed."
            : `${counts.pending} stay${counts.pending === 1 ? "" : "s"} still need${counts.pending === 1 ? "s" : ""} a decision.`}
        </p>
        <button
          type="button"
          disabled={!allDecided}
          onClick={() => router.push(`/trips/create/services/hotel/summary${templateQuery}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Review Your Stays <ArrowRight size={14} />
        </button>
      </div>

      <SkipStayDialog
        open={Boolean(skipTarget)}
        destinationName={skipTarget?.destinationName ?? ""}
        onConfirm={confirmSkip}
        onCancel={() => setSkipTarget(null)}
      />
    </div>
  );
}
