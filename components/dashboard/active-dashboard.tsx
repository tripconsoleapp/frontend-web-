import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WorkspaceHero } from "@/components/dashboard/workspace-hero";
import { QuickOverview } from "@/components/dashboard/quick-overview";
import { ServiceRail } from "@/components/dashboard/service-rail";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { RecommendationRail } from "@/components/dashboard/recommendation-rail";
import { ActiveTripRail } from "@/components/dashboard/active-trip-rail";
import { UpcomingTimeline } from "@/components/dashboard/upcoming-timeline";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Trip, getTripActionHref, getTripCounts } from "@/lib/mock-trips";
import { Template, getTemplateById } from "@/lib/mock-templates";

const RECOMMENDED_IDS = [
  "sabarimala-heritage",
  "munnar-nature",
  "wayanad-wildlife-trail",
  "alleppey-backwaters",
];

export function ActiveDashboard({
  name,
  trips,
}: {
  name: string;
  trips: Trip[];
}) {
  const counts = getTripCounts(trips);
  const draftTrip = trips.find((trip) => trip.status === "draft");
  const recommended = RECOMMENDED_IDS.map(getTemplateById).filter(
    (template): template is Template => Boolean(template)
  );

  return (
    <div className="flex flex-col gap-10">
      <DashboardHeader name={name} roleLabel="Organizer" />

      {draftTrip ? (
        <WorkspaceHero
          eyebrow="Continue where you left off"
          heading={draftTrip.name}
          description={draftTrip.location}
          imageUrl={draftTrip.imageUrl}
          imageAlt={draftTrip.name}
          tag="Draft"
          progress={draftTrip.progress}
          stepLabel={draftTrip.currentStepLabel ?? "Trip setup"}
          ctaLabel="Continue setup"
          ctaHref={getTripActionHref(draftTrip)}
        />
      ) : (
        <WorkspaceHero
          eyebrow="Ready for your next journey?"
          heading="Start planning your next trip listing."
          imageUrl="https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?auto=format&fit=crop&w=1600&q=80"
          imageAlt="Kerala backwaters"
          ctaLabel="Create New Listing"
          ctaHref="/trips/new"
        />
      )}

      <QuickOverview counts={counts} />

      <ServiceRail />

      <PilgrimageBanner />

      <RecommendationRail templates={recommended} />

      <ActiveTripRail trips={trips.slice(0, 6)} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <UpcomingTimeline trips={trips} />
        <RecentActivity />
      </div>
    </div>
  );
}
