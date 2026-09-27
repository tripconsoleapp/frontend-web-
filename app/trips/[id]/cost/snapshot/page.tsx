import { AppShell } from "@/components/layout/app-shell";
import { CostSnapshotHistory } from "@/components/trips/cost/cost-snapshot-history";

export default async function CostSnapshotRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <CostSnapshotHistory tripId={id} />
    </AppShell>
  );
}
