import { AppShell } from "@/components/layout/app-shell";
import { HotelConfirm } from "@/components/trips/hotel/hotel-confirm";

export default async function HotelConfirmRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { destination } = await params;
  const { template } = await searchParams;

  return (
    <AppShell>
      <HotelConfirm destinationId={destination} template={template} />
    </AppShell>
  );
}
