import { AppShell } from "@/components/layout/app-shell";
import { NotificationCenter } from "@/components/trips/notifications/notification-center";

export default async function NotificationsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <NotificationCenter tripId={id} />
    </AppShell>
  );
}
