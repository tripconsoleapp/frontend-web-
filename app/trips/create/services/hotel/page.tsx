import { AppShell } from "@/components/layout/app-shell";
import { HotelOverview } from "@/components/trips/hotel/hotel-overview";

export default async function HotelOverviewRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <HotelOverview template={template} />
    </AppShell>
  );
}
