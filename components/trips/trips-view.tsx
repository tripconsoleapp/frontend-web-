"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
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

// Dashboard quick-status links use these broader buckets ("active" spans
// submitted+verified, "completed" spans paid+complete) since they mirror
// getTripCounts rather than a single TripsView tab.
function matchesQuickFilter(trip: Trip, filter: string) {
  if (filter === "active") return trip.status === "submitted" || trip.status === "verified";
  if (filter === "completed") return trip.status === "paid" || trip.status === "complete";
  return trip.status === filter;
}

export function TripsView({ trips }: { trips: Trip[] }) {
  const searchParams = useSearchParams();
  const quickFilter = searchParams.get("status");
  const [tab, setTab] = useState<TripStatus | "all">(
    quickFilter && TABS.some((t) => t.value === quickFilter)
      ? (quickFilter as TripStatus)
      : "all"
  );
  const filtered =
    tab !== "all"
      ? trips.filter((trip) => trip.status === tab)
      : quickFilter === "active" || quickFilter === "completed"
      ? trips.filter((trip) => matchesQuickFilter(trip, quickFilter))
      : trips;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-navy">
          My Trips
        </h1>
        <Link
          href="/trips/new"
          className={buttonVariants({ variant: "accent" })}
        >
          + New Trip
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-navy/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium",
              tab === t.value ? "bg-orange text-white" : "bg-navy/5 text-navy"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="font-body text-sm text-text-grey">
        {filtered.length} {filtered.length === 1 ? "Trip" : "Trips"} found
      </p>

      {filtered.length === 0 ? (
        <TripsEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
