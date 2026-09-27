import { Users } from "lucide-react";
import { Trip, TripStatus } from "@/lib/mock-trips";

const MILESTONE_LABELS: Record<Exclude<TripStatus, "complete">, string> = {
  draft: "Setup in progress",
  submitted: "Awaiting verification",
  verified: "Payment due",
  paid: "Trip confirmed",
};

function monthShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}

function dayNumber(dateStr: string) {
  return new Date(dateStr).getDate();
}

/** Each upcoming trip reads as a boarding-pass stub — a date block, a
 *  perforated divider, then the trip details — rather than a plain
 *  bordered timeline list. */
export function UpcomingPanel({ trips }: { trips: Trip[] }) {
  const upcoming = trips
    .filter((trip) => trip.status !== "complete")
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">What&rsquo;s next</p>
      <h2 className="mt-1.5 font-heading text-2xl font-bold text-navy">Upcoming</h2>

      <div className="mt-5 flex flex-col gap-3">
        {upcoming.map((trip) => (
          <div key={trip.id} className="flex overflow-hidden rounded-2xl border border-navy/[0.06] bg-white">
            <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 bg-navy/[0.03] py-4">
              <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-orange">{monthShort(trip.startDate)}</span>
              <span className="font-heading text-2xl font-bold text-navy">{dayNumber(trip.startDate)}</span>
            </div>
            <div className="flex flex-1 items-center gap-0 border-l border-dashed border-navy/15 py-4 pl-5 pr-5">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-semibold text-navy">{trip.name}</p>
                <p className="mt-0.5 font-body text-sm text-text-grey">
                  {MILESTONE_LABELS[trip.status as Exclude<TripStatus, "complete">]}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 font-body text-sm text-text-grey">
                <Users size={13} /> {trip.travelers}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
