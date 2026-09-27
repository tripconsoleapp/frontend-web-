import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmedTripView } from "@/components/trips/pilgrimage/confirmed-trip-view";
import { getPilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { getTemplateById } from "@/lib/mock-templates";

export default async function ConfirmedTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { id } = await params;
  const { booking } = await searchParams;
  const departure = getPilgrimageDeparture(id);
  if (!departure) notFound();
  const template = getTemplateById(departure.templateId);
  if (!template) notFound();

  return (
    <AppShell>
      <ConfirmedTripView departure={departure} template={template} bookingId={booking} />
    </AppShell>
  );
}
