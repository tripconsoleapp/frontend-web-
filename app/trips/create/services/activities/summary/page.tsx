import { AppShell } from "@/components/layout/app-shell";
import { ActivitiesSummary } from "@/components/trips/activities/activities-summary";

export default async function ActivitiesSummaryRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ActivitiesSummary template={template} />
    </AppShell>
  );
}
