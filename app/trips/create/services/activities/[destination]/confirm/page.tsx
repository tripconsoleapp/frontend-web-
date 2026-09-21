import { AppShell } from "@/components/layout/app-shell";
import { ConfirmDestination } from "@/components/trips/activities/confirm-destination";

export default async function ConfirmDestinationRoute({
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
      <ConfirmDestination destinationId={destination} template={template} />
    </AppShell>
  );
}
