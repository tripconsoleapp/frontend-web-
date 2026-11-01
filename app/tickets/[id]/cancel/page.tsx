import { AppShell } from "@/components/layout/app-shell";
import { TicketCancelView } from "@/components/tickets/ticket-cancel-view";

export default async function TicketCancelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <TicketCancelView ticketId={decodeURIComponent(id)} />
    </AppShell>
  );
}
