import { AppShell } from "@/components/layout/app-shell";
import { ScheduledDeparturesView } from "@/components/trips/pilgrimage/scheduled-departures-view";
import { PILGRIMAGE_DEPARTURES } from "@/lib/pilgrimage-departures";

export default function ScheduledDeparturesPage() {
  return (
    <AppShell>
      <ScheduledDeparturesView departures={PILGRIMAGE_DEPARTURES} />
    </AppShell>
  );
}
