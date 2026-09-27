"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { getTemplateById } from "@/lib/mock-templates";
import {
  PilgrimageDeparture,
  departureStatus,
  isDepartureBookable,
  remainingSlots,
} from "@/lib/pilgrimage-departures";
import { confirmedSeatsForDeparture } from "@/lib/pilgrimage-booking";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  almost_full: "Almost Full",
  full: "Fully Booked",
  closed: "Closed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function ScheduledDeparturesView({
  departures,
}: {
  departures: PilgrimageDeparture[];
}) {
  // Seats confirmed in this session are a client-only read (sessionStorage)
  // — start at the safe "none yet" baseline so the first client render
  // matches the server, then settle in after mount.
  const [bookedInSession, setBookedInSession] = useState<Record<string, number>>({});
  useEffect(() => {
    setBookedInSession(
      Object.fromEntries(departures.map((d) => [d.id, confirmedSeatsForDeparture(d.id)]))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [featured, ...rest] = departures;
  const featuredTemplate = featured ? getTemplateById(featured.templateId) : undefined;
  const featuredBooked = bookedInSession[featured?.id ?? ""] ?? 0;
  const featuredStatus = featured ? departureStatus(featured, featuredBooked) : "open";
  const featuredBookable = isDepartureBookable(featuredStatus);
  const featuredRemaining = featured ? remainingSlots(featured, featuredBooked) : 0;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link
          href="/pilgrimage"
          className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <p className="mt-3 font-body text-sm font-semibold uppercase tracking-wide text-orange">
          Join a Scheduled Trip
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold leading-tight text-navy">
          These departures are already organized.
        </h1>
        <p className="mt-2 max-w-xl font-body text-base text-text-grey">
          Route, transport, stay and meals are already arranged — reserve
          your seats and join the group.
        </p>
      </div>

      {featured && featuredTemplate && (
        <Link
          href={`/pilgrimage/scheduled/${featured.id}`}
          className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl sm:min-h-[340px]"
        >
          <Image
            src={featuredTemplate.imageUrl}
            alt={featuredTemplate.name}
            fill
            priority
            sizes="(min-width: 1024px) 90vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent" />
          <div className="relative z-10 flex flex-col gap-3 p-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md">
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-mint/90 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-navy">
                Next Departure
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
                {featured.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  {formatDateRange(featured.departureDate, featured.returnDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {featured.meetingPoint}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {featuredBookable ? `${featuredRemaining} seats left` : STATUS_LABEL[featuredStatus]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-body text-[10px] uppercase tracking-wide text-white/60">
                  Per person
                </p>
                <p className="font-heading text-xl font-bold text-white">
                  {formatCurrency(featured.pricePerPerson)}
                </p>
              </div>
              <span className={cn(buttonVariants({ variant: "accent", size: "md" }), "gap-1.5")}>
                View Details <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            Other Departures
          </p>
          <div className="mt-3 flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
            {rest.map((departure) => {
              const template = getTemplateById(departure.templateId);
              const additionalBooked = bookedInSession[departure.id] ?? 0;
              const status = departureStatus(departure, additionalBooked);
              const bookable = isDepartureBookable(status);
              const remaining = remainingSlots(departure, additionalBooked);

              return (
                <Link
                  key={departure.id}
                  href={`/pilgrimage/scheduled/${departure.id}`}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-navy/[0.02] sm:p-5"
                >
                  {template && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                      <Image
                        src={template.imageUrl}
                        alt={template.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-heading text-base font-semibold text-navy">
                        {departure.title}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
                          status === "open" && "bg-mint/30 text-navy",
                          status === "almost_full" && "bg-orange/10 text-orange",
                          !bookable && "bg-navy/10 text-navy/60"
                        )}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-xs text-text-grey">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDateRange(departure.departureDate, departure.returnDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {departure.meetingPoint}
                      </span>
                      <span>
                        {bookable ? `${remaining} of ${departure.capacity} seats left` : STATUS_LABEL[status]}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-base font-bold text-navy">
                      {formatCurrency(departure.pricePerPerson)}
                    </p>
                    <span className="font-body text-xs font-medium text-orange">
                      Details &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
