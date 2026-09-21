import { Trip, TripStatus } from "@/lib/mock-trips";

const MILESTONE_LABELS: Record<Exclude<TripStatus, "complete">, string> = {
  draft: "Setup in progress",
  submitted: "Awaiting verification",
  verified: "Payment due",
  paid: "Trip confirmed",
};

function formatMonthDay(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("en-IN", { month: "short", day: "2-digit" })
    .toUpperCase();
}

export function UpcomingTimeline({ trips }: { trips: Trip[] }) {
  const upcoming = trips
    .filter((trip) => trip.status !== "complete")
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-navy">Upcoming</h2>
      <ol className="relative mt-5 flex flex-col gap-6 border-l border-navy/10 pl-6">
        {upcoming.map((trip) => (
          <li key={trip.id} className="relative">
            <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-orange ring-4 ring-white" />
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              {formatMonthDay(trip.startDate)}
            </p>
            <p className="mt-1 font-heading text-base font-semibold text-navy">
              {trip.name}
            </p>
            <p className="mt-0.5 font-body text-sm text-text-grey">
              {MILESTONE_LABELS[trip.status as Exclude<TripStatus, "complete">]} &middot;{" "}
              {trip.travelers} travelers
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
