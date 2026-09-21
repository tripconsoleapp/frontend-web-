"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";

export function ItineraryContextHeader({
  backHref,
  backLabel = "Back to Services",
  eyebrow,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">{eyebrow}</p>
    </div>
  );
}

/** Renders "46 travelers" or, when a breakdown exists, "46 travelers ·
 *  42 students · 4 staff" — always derived from the same trip context, so
 *  no screen can silently show a different headcount than another. */
export function TravelerSummary({ className }: { className?: string }) {
  const trip = useTripContext();
  if (!trip.ready || trip.passengerCount === 0) return null;
  const breakdown = trip.participantBreakdown.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(" · ");
  return (
    <span className={className}>
      {trip.passengerCount} travelers
      {breakdown && <span className="text-text-grey"> · {breakdown}</span>}
    </span>
  );
}
