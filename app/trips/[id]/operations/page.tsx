import { AppShell } from "@/components/layout/app-shell";
import { OperationsHub } from "@/components/trips/operations/operations-hub";

export default async function TripOperationsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <OperationsHub tripId={id} />
    </AppShell>
  );
}
