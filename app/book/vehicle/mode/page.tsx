import { AppShell } from "@/components/layout/app-shell";
import { TransportModeSelect } from "@/components/book/vehicle/transport-mode";

export default function BookVehicleModeRoute() {
  return (
    <AppShell>
      <TransportModeSelect />
    </AppShell>
  );
}
