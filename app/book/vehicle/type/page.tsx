import { AppShell } from "@/components/layout/app-shell";
import { VehicleTypeSelect } from "@/components/book/vehicle/vehicle-type-select";

export default function BookVehicleTypeRoute() {
  return (
    <AppShell>
      <VehicleTypeSelect />
    </AppShell>
  );
}
