import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { FeaturedTrips } from "@/components/dashboard/featured-trips";
import { ServiceCollection } from "@/components/dashboard/service-collection";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { RecommendationRail } from "@/components/dashboard/recommendation-rail";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Trip, getTripCounts } from "@/lib/mock-trips";
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
  const draftTrip = trips.find((trip) => trip.status === "draft") ?? null;
  const recommended = RECOMMENDED_IDS.map(getTemplateById).filter(
    (template): template is Template => Boolean(template)
  );

  return (
    <div className="flex flex-col gap-14 md:gap-16">
      <DashboardHero name={name} roleLabel="Organizer" draftTrip={draftTrip} counts={counts} />

      <ScrollReveal>
        <FeaturedTrips trips={trips} />
      </ScrollReveal>

      <ScrollReveal>
        <ServiceCollection />
      </ScrollReveal>

      <ScrollReveal>
        <PilgrimageBanner />
      </ScrollReveal>

      <ScrollReveal>
        <RecommendationRail templates={recommended} />
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <UpcomingPanel trips={trips} />
          <div className="flex flex-col gap-6">
            <QuickActionsPanel />
            <RecentActivity />
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
