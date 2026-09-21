import { AppShell } from "@/components/layout/app-shell";
import { ItineraryOverview } from "@/components/trips/itinerary/itinerary-overview";

export default async function ItineraryOverviewRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ItineraryOverview template={template} />
    </AppShell>
  );
}
