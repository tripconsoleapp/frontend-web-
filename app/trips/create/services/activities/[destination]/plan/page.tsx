import { AppShell } from "@/components/layout/app-shell";
import { DestinationActivityPlanView } from "@/components/trips/activities/destination-activity-plan";

export default async function DestinationActivityPlanRoute({
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
      <DestinationActivityPlanView destinationId={destination} template={template} />
    </AppShell>
  );
}
