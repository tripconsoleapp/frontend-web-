import { AppShell } from "@/components/layout/app-shell";
import { ActivityDiscovery } from "@/components/trips/activities/activity-discovery";

export default async function ActivityDiscoveryRoute({
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
      <ActivityDiscovery destinationId={destination} template={template} />
    </AppShell>
  );
}
