import { AppShell } from "@/components/layout/app-shell";
import { TicketsListView } from "@/components/tickets/tickets-list-view";

export default function TicketsPage() {
  return (
    <AppShell>
      <TicketsListView />
    </AppShell>
  );
}
