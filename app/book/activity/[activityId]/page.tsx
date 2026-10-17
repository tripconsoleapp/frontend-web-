import { AppShell } from "@/components/layout/app-shell";
import { ActivityDetails } from "@/components/book/activity/activity-details";

export default async function BookActivityDetailsRoute({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params;
  return (
    <AppShell>
      <ActivityDetails activityId={activityId} />
    </AppShell>
  );
}
