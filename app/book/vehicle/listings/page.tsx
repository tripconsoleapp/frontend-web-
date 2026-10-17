import { AppShell } from "@/components/layout/app-shell";
import { VehicleListings } from "@/components/book/vehicle/vehicle-listings";

export default function BookVehicleListingsRoute() {
  return (
    <AppShell>
      <VehicleListings />
    </AppShell>
  );
}
