import { AppShell } from "@/components/layout/app-shell";
import { ImportPassengers } from "@/components/trips/passengers/import-passengers";

export default async function ImportPassengersRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <ImportPassengers tripId={id} />
    </AppShell>
  );
}
