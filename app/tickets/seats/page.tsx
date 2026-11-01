import { AppShell } from "@/components/layout/app-shell";
import { SeatSelectionView } from "@/components/tickets/seat-selection-view";

export default async function TicketSeatsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <AppShell>
      <SeatSelectionView serviceId={service ?? ""} />
    </AppShell>
  );
}
