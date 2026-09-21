"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";

export function ActivityContextHeader({
  backHref,
  backLabel = "Back to Services",
  eyebrow,
  destinationName,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
  destinationName?: string;
}) {
  const { passengerCount, routeLabel, ready } = useTripContext();

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
      {ready && (passengerCount > 0 || routeLabel || destinationName) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
          {destinationName ? (
            <span className="flex items-center gap-1.5 font-semibold text-navy">
              <MapPin size={13} className="text-orange" /> {destinationName}
            </span>
          ) : (
            routeLabel && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {routeLabel}
              </span>
            )
          )}
          {passengerCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {passengerCount} travelers
            </span>
          )}
        </div>
      )}
    </div>
  );
}
