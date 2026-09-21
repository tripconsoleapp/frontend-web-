import { AppShell } from "@/components/layout/app-shell";
import { VehicleCombine } from "@/components/trips/transport/vehicle-combine";

export default async function VehicleCombineRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <VehicleCombine template={template} />
    </AppShell>
  );
}
