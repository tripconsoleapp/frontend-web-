import { AppShell } from "@/components/layout/app-shell";
import { ActivityPlanningHub } from "@/components/trips/activities/activity-planning-hub";

export default async function ActivitiesRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ActivityPlanningHub template={template} />
    </AppShell>
  );
}
