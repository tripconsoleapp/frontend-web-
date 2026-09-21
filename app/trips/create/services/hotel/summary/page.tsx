import { AppShell } from "@/components/layout/app-shell";
import { YourStaysSummary } from "@/components/trips/hotel/your-stays-summary";

export default async function HotelSummaryRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <YourStaysSummary template={template} />
    </AppShell>
  );
}
