"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Trip, TripStatus } from "@/lib/mock-trips";
import { TripCard } from "@/components/trips/trip-card";
import { TripsEmptyState } from "@/components/trips/trips-empty-state";

const TABS: { value: TripStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "verified", label: "Verified" },
  { value: "paid", label: "Paid" },
  { value: "complete", label: "Complete" },
];

export function TripsView({ trips }: { trips: Trip[] }) {
  const [tab, setTab] = useState<TripStatus | "all">("all");
  const filtered =
    tab === "all" ? trips : trips.filter((trip) => trip.status === tab);

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto border-b border-navy/10 px-4 py-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 font-body text-sm font-medium",
              tab === t.value ? "bg-orange text-white" : "bg-navy/5 text-navy"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-28">
        <p className="mb-3 font-body text-xs text-text-grey">
          {filtered.length} {filtered.length === 1 ? "Trip" : "Trips"} found
        </p>

        {filtered.length === 0 ? (
          <TripsEmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/trips/new"
        aria-label="Create trip"
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-lg"
      >
        <Plus size={26} />
      </Link>
    </div>
  );
}
