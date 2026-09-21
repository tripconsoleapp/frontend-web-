import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Trip,
  formatDateRange,
  getStatusAction,
  getStatusBadgeClass,
  getStatusLabel,
  getTripActionHref,
} from "@/lib/mock-trips";

function RailCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={getTripActionHref(trip)}
      className="group relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 sm:w-[300px]"
    >
      <div className="relative h-40 w-full overflow-hidden rounded-2xl">
        <Image
          src={trip.imageUrl}
          alt={trip.name}
          fill
          sizes="300px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
            getStatusBadgeClass(trip.status)
          )}
        >
          {getStatusLabel(trip.status)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="font-heading text-base font-semibold leading-tight">
            {trip.name}
          </p>
          <p className="mt-1 flex items-center gap-2 font-body text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Users size={12} /> {trip.travelers}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3">
        {typeof trip.progress === "number" ? (
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full rounded-full bg-orange"
                style={{ width: `${trip.progress}%` }}
              />
            </div>
            <p className="mt-1 font-body text-xs text-text-grey">
              {trip.progress}% planned
            </p>
          </div>
        ) : (
          <span className="font-body text-xs text-text-grey">{trip.location}</span>
        )}
        <span className="flex shrink-0 items-center gap-1 font-body text-sm font-semibold text-navy">
          {getStatusAction(trip.status)}
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

export function ActiveTripRail({ trips }: { trips: Trip[] }) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <h2 className="font-heading text-2xl font-semibold text-navy">Your Trips</h2>
        <Link
          href="/trips"
          className="font-body text-sm font-medium text-navy underline underline-offset-4"
        >
          View All &rarr;
        </Link>
      </div>
      <div className="mt-5 -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {trips.map((trip) => (
          <RailCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
