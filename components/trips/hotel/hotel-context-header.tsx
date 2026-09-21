"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";
import { formatStayDate, nightsLabel } from "@/lib/hotel-stays";

/** Shared header for every Hotel screen. On the overview/summary screens it
 *  shows trip-wide context (route, dates, group size). On a per-destination
 *  screen (results/detail/rooms/confirm) it instead shows that stay's own
 *  dates and guest count — inherited from the trip, never re-entered. */
export function HotelContextHeader({
  backHref,
  backLabel = "Back to Services",
  eyebrow,
  stay,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
  stay?: { destinationName: string; checkIn: string; checkOut: string; nights: number };
}) {
  const { passengerCount, dateRangeLabel, routeLabel, ready } = useTripContext();
  const hasTripContext = ready && (passengerCount > 0 || routeLabel || dateRangeLabel);

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

      {stay ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
          <span className="flex items-center gap-1.5 font-semibold text-navy">
            <MapPin size={13} className="text-orange" /> {stay.destinationName}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {formatStayDate(stay.checkIn)} &rarr; {formatStayDate(stay.checkOut)}
          </span>
          <span>{nightsLabel(stay.nights)}</span>
          {ready && passengerCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {passengerCount} guests
            </span>
          )}
        </div>
      ) : (
        hasTripContext && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
            {passengerCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={13} /> {passengerCount} guests
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
        )
      )}
    </div>
  );
}
