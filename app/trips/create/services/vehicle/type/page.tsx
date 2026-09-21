import { AppShell } from "@/components/layout/app-shell";
import { VehicleTypeSelect } from "@/components/trips/transport/vehicle-type-select";

export default async function VehicleTypeRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <VehicleTypeSelect template={template} />
    </AppShell>
  );
}
