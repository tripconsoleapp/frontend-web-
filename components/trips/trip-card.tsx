import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Trip,
  formatCurrency,
  formatDateRange,
  getStatusAction,
  getStatusBadgeClass,
  getStatusLabel,
} from "@/lib/mock-trips";

function getAmount(trip: Trip) {
  if (trip.status === "draft" && trip.estimatedTotal) {
    return { label: "Estimated Total", value: trip.estimatedTotal };
  }
  if (
    (trip.status === "submitted" || trip.status === "verified") &&
    trip.invoiceAmount
  ) {
    return { label: "Invoice Amount", value: trip.invoiceAmount };
  }
  if (
    (trip.status === "paid" || trip.status === "complete") &&
    trip.amountSettled
  ) {
    return { label: "Amount Settled", value: trip.amountSettled };
  }
  return null;
}

function getActionHref(trip: Trip) {
  switch (trip.status) {
    case "draft":
      return `/trips/${trip.id}/edit`;
    case "submitted":
      return `/trips/${trip.id}/track`;
    case "verified":
      return `/trips/${trip.id}/pay`;
    default:
      return `/trips/${trip.id}/receipt`;
  }
}

export function TripCard({ trip }: { trip: Trip }) {
  const amount = getAmount(trip);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-navy">{trip.name}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
            getStatusBadgeClass(trip.status)
          )}
        >
          {getStatusLabel(trip.status)}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-1 font-body text-base text-text-grey">
        <span className="flex items-center gap-2">
          <Calendar size={13} />
          {formatDateRange(trip.startDate, trip.endDate)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={13} />
          {trip.location}
        </span>
        <span className="flex items-center gap-2">
          <Users size={13} />
          {trip.travelers} Travelers
        </span>
      </div>

      {trip.status === "draft" && typeof trip.progress === "number" && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full bg-orange"
              style={{ width: `${trip.progress}%` }}
            />
          </div>
          <p className="mt-1 font-body text-base text-text-grey">
            {trip.progress}% Complete
          </p>
        </div>
      )}

      <div className="mt-3 flex items-end justify-between gap-3">
        {amount ? (
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-text-grey">
              {amount.label}
            </p>
            <p className="font-heading text-base font-semibold text-navy">
              {formatCurrency(amount.value)}
            </p>
          </div>
        ) : (
          <span />
        )}

        <Link
          href={getActionHref(trip)}
          className={cn(
            "rounded-full px-4 py-2 font-body text-base font-semibold",
            trip.status === "verified"
              ? "bg-orange text-white"
              : "bg-navy text-white"
          )}
        >
          {getStatusAction(trip.status)}
        </Link>
      </div>
    </div>
  );
}
