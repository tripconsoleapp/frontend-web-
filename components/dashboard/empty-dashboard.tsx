import Link from "next/link";
import { PhotoPanel } from "@/components/ui/photo-panel";
import { PlanTripCard } from "@/components/dashboard/plan-trip-card";
import { QuickBookRow } from "@/components/dashboard/quick-book-row";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { TemplateCard } from "@/components/dashboard/template-card";

export function EmptyDashboard({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <div>
        <h1 className="font-heading text-xl font-semibold text-navy">
          Good morning, {name}
        </h1>
        <p className="font-body text-sm text-text-grey">
          Let&rsquo;s plan your first trip.
        </p>
      </div>

      <PhotoPanel className="h-36 w-full" />

      <PlanTripCard
        title="Plan Your First Trip"
        description="Whether it's a group trip or a pilgrimage, we'll guide you step by step."
      />

      <QuickBookRow />

      <PilgrimageBanner />

      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-navy">
              Explore Templates
            </h2>
            <p className="font-body text-xs text-text-grey">
              Not sure where to start? Try a ready-made plan.
            </p>
          </div>
          <Link
            href="/templates"
            className="shrink-0 font-body text-sm font-medium text-navy underline"
          >
            Browse all &rarr;
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
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
        </div>
      </div>

      <p className="text-center font-body text-xs text-text-grey">
        Your trips and activity will show up here once you start planning.
      </p>
    </div>
  );
}
