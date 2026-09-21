import { AppShell } from "@/components/layout/app-shell";
import { TransportPricing } from "@/components/trips/transport/transport-pricing";

export default async function TransportPricingRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <TransportPricing template={template} />
    </AppShell>
  );
}
