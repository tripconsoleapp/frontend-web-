"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileClock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { TripRecord, getTripRecord } from "@/lib/listing-draft";

export function CostSnapshotHistory({ tripId }: { tripId: string }) {
  const [record, setRecord] = useState<TripRecord | null>(null);

  useEffect(() => {
    setRecord(getTripRecord());
  }, []);

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

  const snapshots = [...record.costSnapshots].reverse();

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/cost`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to Cost Console
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Cost Snapshot History</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Financial Audit Trail</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Every locked snapshot is kept — editing a service after submission never rewrites one, it creates the next version.</p>
      </div>

      {snapshots.length === 0 ? (
        <p className="rounded-2xl bg-navy/[0.02] px-6 py-10 text-center font-body text-sm text-text-grey">No cost snapshot has been created yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
          {snapshots.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-4 px-6 py-5">
              <div>
                <p className="flex items-center gap-2 font-heading text-base font-semibold text-navy">
                  <FileClock size={15} className="text-navy/50" /> Version {s.version}
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-xs font-semibold", s.state === "current" ? "bg-mint/50 text-navy" : "bg-navy/[0.06] text-text-grey")}>
                    {s.state === "current" && <Check size={11} />} {s.state === "current" ? "Current" : "Superseded"}
                  </span>
                </p>
                <p className="mt-1 font-body text-sm text-text-grey">
                  Created {new Date(s.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <p className="mt-1 font-body text-sm text-text-grey">
                  {s.totalTravelerCount} travelers &middot; pricing basis {s.pricingParticipantCount}
                </p>
              </div>
              <p className="font-heading text-lg font-bold text-navy">{formatCurrency(s.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
