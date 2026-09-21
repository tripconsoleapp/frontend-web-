import { AppShell } from "@/components/layout/app-shell";
import { HiddenGemsExplorer } from "@/components/trips/activities/hidden-gems-explorer";
import { getKeralaLocation } from "@/lib/kerala-locations";

export default async function HiddenGemsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { destination } = await params;
  const { template } = await searchParams;
  const destinationName = getKeralaLocation(destination)?.name ?? destination;

  return (
    <AppShell>
      <HiddenGemsExplorer destinationId={destination} destinationName={destinationName} template={template} />
    </AppShell>
  );
}
