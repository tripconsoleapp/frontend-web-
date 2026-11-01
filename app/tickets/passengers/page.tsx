import { AppShell } from "@/components/layout/app-shell";
import { PassengerFormView } from "@/components/tickets/passenger-form-view";

export default function TicketPassengersPage() {
  return (
    <AppShell>
      <PassengerFormView />
    </AppShell>
  );
}
