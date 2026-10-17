import { AppShell } from "@/components/layout/app-shell";
import { VehicleDetails } from "@/components/book/vehicle/vehicle-details";

export default async function BookVehicleDetailsRoute({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  return (
    <AppShell>
      <VehicleDetails vehicleId={vehicleId} />
    </AppShell>
  );
}
