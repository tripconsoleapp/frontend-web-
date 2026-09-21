import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WorkspaceHero } from "@/components/dashboard/workspace-hero";
import { QuickOverview } from "@/components/dashboard/quick-overview";
import { ServiceRail } from "@/components/dashboard/service-rail";
import { PilgrimageBanner } from "@/components/dashboard/pilgrimage-banner";
import { RecommendationRail } from "@/components/dashboard/recommendation-rail";
import { Template, getTemplateById } from "@/lib/mock-templates";

const RECOMMENDED_IDS = [
  "sabarimala-pilgrimage",
  "guruvayur-district",
  "school-excursion",
  "coorg-adventure",
];

const QUICK_STARTS = [
  { label: "Start from Scratch", href: "/trips/create/loading" },
  { label: "Use a Template", href: "/templates" },
  { label: "Plan a Pilgrimage", href: "/pilgrimage" },
];

export function EmptyDashboard({ name }: { name: string }) {
  const recommended = RECOMMENDED_IDS.map(getTemplateById).filter(
    (template): template is Template => Boolean(template)
  );

  return (
    <div className="flex flex-col gap-10">
      <DashboardHeader name={name} roleLabel="Organizer" />

      <WorkspaceHero
        eyebrow="Welcome to TripConsole"
        heading="Start organizing your first journey."
        description="Create your first professional trip listing."
        imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1600&q=80"
        imageAlt="Kerala hills"
        ctaLabel="Create Your First Listing"
        ctaHref="/trips/new"
        quickStarts={QUICK_STARTS}
      />

      <QuickOverview counts={{ active: 0, completed: 0, draft: 0 }} />

      <ServiceRail />

      <PilgrimageBanner />

      <RecommendationRail templates={recommended} />
    </div>
  );
}
