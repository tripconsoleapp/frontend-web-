import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { PlanTripCard } from "@/components/dashboard/plan-trip-card";
import { ValueList } from "@/components/dashboard/value-list";
import { QuickBookRow } from "@/components/dashboard/quick-book-row";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { TemplateCard } from "@/components/dashboard/template-card";

export function EmptyDashboard({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardTopBar name={name} roleLabel="Organizer" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PlanTripCard
            title="Plan Your First Trip"
            description="Whether it's a group trip or a pilgrimage, we'll guide you step by step."
          />
        </div>
        <div className="flex flex-col justify-center gap-4 rounded-2xl border border-navy/10 bg-white p-6 lg:col-span-2">
          <h2 className="font-heading text-base font-semibold text-navy">
            Why TripConsole
          </h2>
          <ValueList />
        </div>
      </div>

      <QuickBookRow />

      <PilgrimageBanner />

      <div>
        <h2 className="font-heading text-lg font-semibold text-navy">
          Explore Templates
        </h2>
        <p className="mt-1 font-body text-sm text-text-grey">
          Not sure where to start? Try a ready-made plan.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TemplateCard
            href="/templates/sabarimala-pilgrimage"
            title="Sabarimala Pilgrimage"
            description="Complete itinerary covering key temples and stops along the way."
          />
          <TemplateCard
            href="/templates/guruvayur-district"
            title="Guruvayur District"
            description="Optimized schedule for visits and nearby attractions."
          />
          <TemplateCard
            href="/templates/school-excursion"
            title="School Excursion"
            description="A balanced, budget-friendly plan for educational group trips."
          />
        </div>
      </div>
    </div>
  );
}
