import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { KsrtcSearchBar } from "@/components/dashboard/ksrtc-search-bar";
import { ServiceCollection } from "@/components/dashboard/service-collection";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { YourTrips } from "@/components/dashboard/your-trips";
import { RecommendationRail } from "@/components/dashboard/recommendation-rail";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Template, getTemplateById } from "@/lib/mock-templates";

const RECOMMENDED_IDS = [
  "sabarimala-pilgrimage",
  "guruvayur-district",
  "school-excursion",
  "coorg-adventure",
];

export function EmptyDashboard({ name }: { name: string }) {
  const recommended = RECOMMENDED_IDS.map(getTemplateById).filter(
    (template): template is Template => Boolean(template)
  );

  return (
    <div className="flex flex-col gap-14 md:gap-16">
      {/* 1. Hero, 2. KSRTC search bar (overlapping) — visible in the
         empty state too */}
      <div className="relative">
        <DashboardHero name={name} roleLabel="Organizer" draftTrip={null} counts={{ active: 0, completed: 0, draft: 0 }} />
        <div className="relative z-10 mx-5 -mt-10 sm:mx-8">
          <KsrtcSearchBar />
        </div>
      </div>

      {/* 3. Book a single service */}
      <ScrollReveal>
        <ServiceCollection />
      </ScrollReveal>

      {/* 4. Pilgrimage program */}
      <ScrollReveal>
        <PilgrimageBanner />
      </ScrollReveal>

      {/* 5. Your Trips — directly below Pilgrimage program; renders its
         own "Your trips will appear here" placeholder since there are no
         trips yet (it still shows real rows if upcoming tickets exist). */}
      <ScrollReveal>
        <YourTrips trips={[]} />
      </ScrollReveal>

      {/* 6. Recommended for You */}
      <ScrollReveal>
        <RecommendationRail templates={recommended} />
      </ScrollReveal>
    </div>
  );
}
