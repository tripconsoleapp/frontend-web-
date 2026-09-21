"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";

export function TransportContextHeader({
  backHref,
  backLabel = "Back to Services",
  eyebrow,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
}) {
  const { passengerCount, dateRangeLabel, routeLabel, ready } = useTripContext();
  const hasContext = ready && (passengerCount > 0 || routeLabel || dateRangeLabel);

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
        {eyebrow}
      </p>
      {hasContext && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
          {passengerCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {passengerCount} passengers
            </span>
          )}
          {routeLabel && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {routeLabel}
            </span>
          )}
          {dateRangeLabel && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {dateRangeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
