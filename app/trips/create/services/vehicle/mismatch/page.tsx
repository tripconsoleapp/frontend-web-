import { AppShell } from "@/components/layout/app-shell";
import { CapacityMismatch } from "@/components/trips/transport/capacity-mismatch";

export default async function CapacityMismatchRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; source?: string; type?: string }>;
}) {
  const { template, source, type } = await searchParams;
  const resolvedSource = source === "ksrtc" ? "ksrtc" : "private";

  return (
    <AppShell>
      <CapacityMismatch source={resolvedSource} typeId={type} template={template} />
    </AppShell>
  );
}
