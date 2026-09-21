import { AppShell } from "@/components/layout/app-shell";
import { VehicleResults } from "@/components/trips/transport/vehicle-results";

export default async function VehicleResultsRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; source?: string; type?: string }>;
}) {
  const { template, source, type } = await searchParams;
  const resolvedSource = source === "ksrtc" ? "ksrtc" : "private";

  return (
    <AppShell>
      <VehicleResults source={resolvedSource} typeId={type} template={template} />
    </AppShell>
  );
}
