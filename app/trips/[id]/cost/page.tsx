import { AppShell } from "@/components/layout/app-shell";
import { CostConsole } from "@/components/trips/cost/cost-console";

export default async function CostConsoleRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <CostConsole tripId={id} />
    </AppShell>
  );
}
