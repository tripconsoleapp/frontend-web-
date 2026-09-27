import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Trip,
  formatCurrency,
  formatDateRange,
  getStatusAction,
  getStatusBadgeClass,
  getStatusLabel,
  getTripActionHref,
} from "@/lib/mock-trips";

function tripValue(trip: Trip) {
  return trip.amountSettled ?? trip.invoiceAmount ?? trip.estimatedTotal ?? null;
}

function FeaturedCard({ trip }: { trip: Trip }) {
  const value = tripValue(trip);

  return (
    <Link
      href={getTripActionHref(trip)}
      className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-navy/[0.06] bg-white transition-shadow duration-300 hover:shadow-[0_25px_50px_-25px_rgba(45,62,80,0.35)] sm:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative h-56 overflow-hidden sm:h-full sm:min-h-[280px]">
        <Image
          src={trip.imageUrl}
          alt={trip.name}
          fill
          sizes="(min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide", getStatusBadgeClass(trip.status))}>
          {getStatusLabel(trip.status)}
        </span>
      </div>

      <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Featured</p>
          <h3 className="mt-1.5 font-heading text-2xl font-bold leading-tight text-navy">{trip.name}</h3>
          <p className="mt-1 font-body text-sm text-text-grey">{trip.location}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-sm text-text-grey">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {trip.travelers} travelers
            </span>
          </div>

          {typeof trip.progress === "number" && (
            <div className="mt-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                <div className="h-full rounded-full bg-orange" style={{ width: `${trip.progress}%` }} />
              </div>
              <p className="mt-1.5 font-body text-xs text-text-grey">{trip.progress}% planned</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-navy/[0.06] pt-5">
          <span className="font-heading text-lg font-bold text-navy">{value ? formatCurrency(value) : trip.location}</span>
          <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-navy transition-colors group-hover:text-orange">
            {getStatusAction(trip.status)}
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={getTripActionHref(trip)}
      className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-navy/[0.06] bg-white transition-shadow duration-300 hover:shadow-[0_18px_35px_-20px_rgba(45,62,80,0.3)] sm:w-[260px]"
    >
      <div className="relative h-32 w-full overflow-hidden">
        <Image src={trip.imageUrl} alt={trip.name} fill sizes="260px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide", getStatusBadgeClass(trip.status))}>
          {getStatusLabel(trip.status)}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="font-heading text-sm font-semibold leading-tight text-navy">{trip.name}</p>
        <p className="font-body text-xs text-text-grey">{formatDateRange(trip.startDate, trip.endDate)}</p>
        <span className="flex items-center gap-1 font-body text-xs font-semibold text-navy transition-colors group-hover:text-orange">
          {getStatusAction(trip.status)} <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedTrips({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;

  const featured = trips.find((t) => t.status !== "draft") ?? trips[0];
  const rest = trips.filter((t) => t.id !== featured.id);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Your journeys</p>
          <h2 className="mt-1.5 font-heading text-2xl font-bold text-navy">Your Trips</h2>
        </div>
        <Link href="/trips" className="font-body text-sm font-medium text-navy underline underline-offset-4">
          View All &rarr;
        </Link>
      </div>

      <div className="mt-5">
        <FeaturedCard trip={featured} />
      </div>

      {rest.length > 0 && (
        <div className="mt-4 -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rest.map((trip) => (
            <CompactCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
