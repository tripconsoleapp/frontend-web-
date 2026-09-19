import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlanTripCard } from "@/components/dashboard/plan-trip-card";
import { QuickBookRow } from "@/components/dashboard/quick-book-row";
import { TemplateCard } from "@/components/dashboard/template-card";
import { QuickAccessRow } from "@/components/dashboard/quick-access-row";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TripCard } from "@/components/trips/trip-card";
import { Trip, getTripCounts } from "@/lib/mock-trips";

export function ActiveDashboard({
  name,
  trips,
}: {
  name: string;
  trips: Trip[];
}) {
  const counts = getTripCounts(trips);
  const mostRecent = trips[0];

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-semibold text-navy">
            Good morning, {name}
          </h1>
        </div>
        <Badge variant="mint" className="mt-1 w-fit">
          Organizer
        </Badge>
        <p className="mt-2 font-body text-sm text-text-grey">
          Ready to manage your next great adventure?
        </p>
      </div>

      <PlanTripCard
        title="Plan a New Trip"
        description="Start building your next trip — general or pilgrimage."
      />

      <QuickBookRow />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-navy">
            Your Trips
          </h2>
          <Link
            href="/trips"
            className="font-body text-sm font-medium text-navy underline"
          >
            View All &rarr;
          </Link>
        </div>
        <p className="mt-1 font-body text-xs text-text-grey">
          {counts.active} Active &middot; {counts.completed} Completed &middot;{" "}
          {counts.draft} Draft
        </p>
        {mostRecent && (
          <div className="mt-3">
            <TripCard trip={mostRecent} />
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-base font-semibold text-navy">
          Recommended for You
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TemplateCard
            href="/templates/sabarimala-heritage"
            title="Sabarimala Heritage"
            description="A guided pilgrimage route with verified stops."
            priceLabel="₹4,500-6,000/service"
          />
          <TemplateCard
            href="/templates/munnar-nature"
            title="Munnar Nature Trail"
            description="Scenic tea-country route for group getaways."
            priceLabel="₹2,500-3,000/service"
          />
        </div>
      </div>

      <QuickAccessRow />

      <RecentActivity />
    </div>
  );
}
