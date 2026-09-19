import { AppShell } from "@/components/layout/app-shell";
import { TripsView } from "@/components/trips/trips-view";
import { MOCK_TRIPS } from "@/lib/mock-trips";

export default function TripsPage() {
  return (
    <AppShell>
      <TripsView trips={MOCK_TRIPS} />
    </AppShell>
  );
}
