import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DepartureBookingPayment } from "@/components/trips/pilgrimage/departure-booking-payment";
import { getPilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { getTemplateById } from "@/lib/mock-templates";

export default async function DeparturePaymentPage({
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
      <DepartureBookingPayment departure={departure} template={template} bookingId={booking} />
    </AppShell>
  );
}
