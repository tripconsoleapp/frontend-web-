import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { TripsView } from "@/components/trips/trips-view";
import { MOCK_TRIPS } from "@/lib/mock-trips";

export default function TripsPage() {
  return (
    <AppShell header={<AppHeader title="My Trips" />}>
      <TripsView trips={MOCK_TRIPS} />
    </AppShell>
  );
}
