import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ScheduledDepartureDetail } from "@/components/trips/pilgrimage/scheduled-departure-detail";
import { getPilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { getTemplateById } from "@/lib/mock-templates";

export default async function ScheduledDepartureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const departure = getPilgrimageDeparture(id);
  if (!departure) notFound();

  const template = getTemplateById(departure.templateId);
  if (!template) notFound();

  return (
    <AppShell>
      <ScheduledDepartureDetail departure={departure} template={template} />
    </AppShell>
  );
}
