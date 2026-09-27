import { AppShell } from "@/components/layout/app-shell";
import { PassengerHub } from "@/components/trips/passengers/passenger-hub";

export default async function PassengersRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <PassengerHub tripId={id} />
    </AppShell>
  );
}
