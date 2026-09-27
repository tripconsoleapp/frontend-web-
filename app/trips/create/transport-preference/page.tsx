import { AppShell } from "@/components/layout/app-shell";
import { TransportPreferenceForm } from "@/components/trips/pilgrimage/transport-preference-form";

export default async function TransportPreferencePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <TransportPreferenceForm template={template} />
    </AppShell>
  );
}
