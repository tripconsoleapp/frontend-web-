import { AppShell } from "@/components/layout/app-shell";
import { InviteTravelers } from "@/components/trips/passengers/invite-travelers";

export default async function InviteTravelersRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <InviteTravelers tripId={id} />
    </AppShell>
  );
}
