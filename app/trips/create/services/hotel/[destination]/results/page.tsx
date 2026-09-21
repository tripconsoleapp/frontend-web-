import { AppShell } from "@/components/layout/app-shell";
import { HotelResults } from "@/components/trips/hotel/hotel-results";

export default async function HotelResultsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { destination } = await params;
  const { template } = await searchParams;

  return (
    <AppShell>
      <HotelResults destinationId={destination} template={template} />
    </AppShell>
  );
}
