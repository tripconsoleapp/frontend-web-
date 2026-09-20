import Link from "next/link";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { PlanTripCard } from "@/components/dashboard/plan-trip-card";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { QuickBookRow } from "@/components/dashboard/quick-book-row";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { TemplateCard } from "@/components/dashboard/template-card";
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
  const recent = trips.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <DashboardTopBar name={name} roleLabel="Organizer" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PlanTripCard
            title="Plan a New Trip"
            description="Start building your next trip — general or pilgrimage."
          />
        </div>
        <div className="lg:col-span-2">
          <StatsSummary counts={counts} />
        </div>
      </div>

      <QuickBookRow />

      <PilgrimageBanner />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Your Trips
          </h2>
          <Link
            href="/trips"
            className="font-body text-base font-medium text-navy underline"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Recommended for You
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
