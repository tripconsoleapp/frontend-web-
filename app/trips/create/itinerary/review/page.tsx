import { AppShell } from "@/components/layout/app-shell";
import { ItineraryReview } from "@/components/trips/itinerary/itinerary-review";

export default async function ItineraryReviewRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ItineraryReview template={template} />
    </AppShell>
  );
}
