"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { AlertTriangle, Check, Link as LinkIcon, Search, Upload, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTripContext } from "@/lib/use-trip-context";
import { Traveler, TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { deriveRegistrationStatus, getSelfRegistrations, maskIdNumber, registrationStats, travelerStatusLabel } from "@/lib/trip-operations";
import { RemindPendingDrawer } from "./remind-pending-drawer";

type StatusFilter = "all" | Traveler["registrationStatus"];

const STATUS_DOT: Record<Traveler["registrationStatus"], string> = {
  invited: "bg-navy/20",
  submitted: "bg-orange",
  needs_correction: "bg-destructive",
  verified: "bg-mint",
};

export function PassengerHub({ tripId }: { tripId: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();

  const [record, setRecord] = useState<TripRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [remindOpen, setRemindOpen] = useState(false);

  useEffect(() => {
    const current = getTripRecord();
    const token = current.passengerManagement.registrationLinkToken;
    if (!token) {
      setRecord(current);
      return;
    }
    const incoming = getSelfRegistrations(token).filter((r) => !current.passengerManagement.travelers.some((t) => t.id === r.id));
    if (incoming.length === 0) {
      setRecord(current);
      return;
    }
    const travelers = [...current.passengerManagement.travelers, ...incoming];
    const next: TripRecord = {
      ...current,
      passengerManagement: {
        ...current.passengerManagement,
        travelers,
        registrationStatus: deriveRegistrationStatus(travelers, trip.passengerCount, true),
      },
    };
    saveTripRecord(next);
    setRecord(next);
  }, []);

  const travelers = record?.passengerManagement.travelers ?? [];
  const filtered = useMemo(() => {
    return travelers.filter((t) => {
      if (statusFilter !== "all" && t.registrationStatus !== statusFilter) return false;
      if (search && !`${t.name} ${t.travelerType}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelers, search, statusFilter]);

  if (!record) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to My Trips
        </Link>
      </div>
    );
  }

  const stats = registrationStats(travelers, trip.passengerCount);

  function markReminded() {
    const next = { ...record!, passengerManagement: { ...record!.passengerManagement, remindedAt: new Date().toISOString() } };
    saveTripRecord(next);
    setRecord(next);
  }

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } } };
  const item: Variants = shouldReduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Passenger Management</h1>
        <p className="mt-1 font-body text-sm text-text-grey">{trip.tripName}</p>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-heading text-lg font-semibold text-navy">
            {stats.registered} / {stats.expected} registered
          </p>
          {stats.remaining > 0 && <p className="font-body text-sm text-text-grey">{stats.remaining} remaining</p>}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy/10">
          <motion.div
            className={cn("h-full rounded-full", stats.registered >= stats.expected && stats.expected > 0 ? "bg-mint" : "bg-orange")}
            initial={{ width: 0 }}
            animate={{ width: stats.expected > 0 ? `${Math.min(100, (stats.registered / stats.expected) * 100)}%` : "0%" }}
            transition={{ duration: shouldReduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-2 font-body text-sm text-text-grey">
          {stats.verified} verified &middot; {stats.pending} pending review &middot;{" "}
          <span className={stats.needsCorrection > 0 ? "font-medium text-destructive" : ""}>{stats.needsCorrection} need attention</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => router.push(`/trips/${tripId}/passengers/invite`)} className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
          <LinkIcon size={14} /> Invite Travelers
        </button>
        <button type="button" onClick={() => router.push(`/trips/${tripId}/passengers/import`)} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
          <Upload size={14} /> Import List
        </button>
        <button type="button" onClick={() => router.push(`/trips/${tripId}/passengers/add`)} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
          <UserPlus size={14} /> Add Traveler
        </button>
        {stats.remaining > 0 && travelers.length > 0 && (
          <button type="button" onClick={() => setRemindOpen(true)} className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-navy underline underline-offset-2 hover:text-orange">
            Remind Pending
          </button>
        )}
      </div>

      {travelers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <p className="font-heading text-base font-semibold text-navy">Passenger registration hasn&rsquo;t started yet.</p>
          <p className="max-w-sm font-body text-sm text-text-grey">{trip.passengerCount} travelers are expected. Choose how you&rsquo;d like to collect their details.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-grey" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search travelers..." className="w-full rounded-xl border border-navy/15 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {([
                ["all", "All"],
                ["verified", "Verified"],
                ["submitted", "Pending"],
                ["needs_correction", "Needs Correction"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn("shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors", statusFilter === value ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col divide-y divide-navy/10">
            {filtered.map((t) => (
              <motion.button
                key={t.id}
                variants={item}
                type="button"
                onClick={() => router.push(`/trips/${tripId}/passengers/${t.id}`)}
                className="flex items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-navy/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[t.registrationStatus])} />
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-navy">{t.name || "Unnamed traveler"}</p>
                    <p className="font-body text-xs text-text-grey">
                      {t.travelerType} &middot; {maskIdNumber(t.idType, t.idNumber)}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 font-body text-xs font-medium",
                    t.registrationStatus === "verified" ? "text-navy" : t.registrationStatus === "needs_correction" ? "text-destructive" : "text-text-grey"
                  )}
                >
                  {t.registrationStatus === "verified" && <Check size={12} />}
                  {t.registrationStatus === "needs_correction" && <AlertTriangle size={12} />}
                  {travelerStatusLabel(t.registrationStatus)}
                </span>
              </motion.button>
            ))}
            {filtered.length === 0 && <p className="py-8 text-center font-body text-sm text-text-grey">No travelers match this search or filter.</p>}
          </motion.div>
        </div>
      )}

      <RemindPendingDrawer open={remindOpen} pendingCount={stats.remaining} onClose={() => setRemindOpen(false)} onSend={markReminded} />
    </div>
  );
}
