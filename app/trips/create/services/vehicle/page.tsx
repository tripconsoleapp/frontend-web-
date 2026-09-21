import { AppShell } from "@/components/layout/app-shell";
import { TransportSource } from "@/components/trips/transport/transport-source";

export default async function VehicleSelectionRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <TransportSource template={template} />
    </AppShell>
  );
}
