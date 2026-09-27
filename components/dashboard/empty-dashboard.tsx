import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ServiceCollection } from "@/components/dashboard/service-collection";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
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
      <DashboardHero name={name} roleLabel="Organizer" draftTrip={null} counts={{ active: 0, completed: 0, draft: 0 }} />

      <ScrollReveal>
        <ServiceCollection />
      </ScrollReveal>

      <ScrollReveal>
        <PilgrimageBanner />
      </ScrollReveal>

      <ScrollReveal>
        <RecommendationRail templates={recommended} />
      </ScrollReveal>
    </div>
  );
}
