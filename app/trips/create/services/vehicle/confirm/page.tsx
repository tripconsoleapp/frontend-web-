import { AppShell } from "@/components/layout/app-shell";
import { TransportConfirm } from "@/components/trips/transport/transport-confirm";

export default async function TransportConfirmRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <TransportConfirm template={template} />
    </AppShell>
  );
}
