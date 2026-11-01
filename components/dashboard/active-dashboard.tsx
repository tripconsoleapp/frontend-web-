import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { KsrtcSearchBar } from "@/components/dashboard/ksrtc-search-bar";
import { ServiceCollection } from "@/components/dashboard/service-collection";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { YourTrips } from "@/components/dashboard/your-trips";
import { RecommendationRail } from "@/components/dashboard/recommendation-rail";
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

  // No draft → surface the next confirmed trip in the hero instead of a
  // generic greeting: the nearest trip that hasn't started yet, or (this
  // demo's dates are fixed in the past relative to "today") the most
  // recently dated one as a fallback so the hero never has nothing to show.
  const nonDraftTrips = trips.filter((trip) => trip.status !== "draft");
  const upcomingTrips = nonDraftTrips
    .filter((trip) => new Date(trip.startDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const mostRecentTrip = nonDraftTrips
    .slice()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
  const nextTrip = draftTrip ? null : upcomingTrips[0] ?? mostRecentTrip ?? null;

  const recommended = RECOMMENDED_IDS.map(getTemplateById).filter(
    (template): template is Template => Boolean(template)
  );

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {/* 1. Hero, 2. KSRTC search bar (overlapping, ~40px, margins match
         the hero's own p-5/sm:p-8 inner padding so the edges line up) */}
      <div className="relative">
        <DashboardHero name={name} roleLabel="Organizer" draftTrip={draftTrip} nextTrip={nextTrip} counts={counts} />
        <div className="relative z-10 mx-5 -mt-10 sm:mx-8">
          <KsrtcSearchBar />
        </div>
      </div>

      {/* 3. Book a single service */}
      <ScrollReveal>
        <ServiceCollection />
      </ScrollReveal>

      {/* 4. Pilgrimage program */}
      <ScrollReveal delay={0.05}>
        <PilgrimageBanner />
      </ScrollReveal>

      {/* 5. Your Trips — directly below Pilgrimage program */}
      <ScrollReveal delay={0.1}>
        <YourTrips trips={trips} />
      </ScrollReveal>

      {/* 6. Recommended for You */}
      <ScrollReveal delay={0.15}>
        <RecommendationRail templates={recommended} />
      </ScrollReveal>
    </div>
  );
}
