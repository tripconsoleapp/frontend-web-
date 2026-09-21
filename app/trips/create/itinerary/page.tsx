import { AppShell } from "@/components/layout/app-shell";
import { ItineraryGeneration } from "@/components/trips/itinerary/itinerary-generation";

export default async function ItineraryGenerationRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ItineraryGeneration template={template} />
    </AppShell>
  );
}
