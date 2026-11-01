import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TicketSearchView } from "@/components/tickets/ticket-search-view";

export default function TicketSearchPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <TicketSearchView />
      </Suspense>
    </AppShell>
  );
}
