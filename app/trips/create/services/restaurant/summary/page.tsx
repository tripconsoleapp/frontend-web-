import { AppShell } from "@/components/layout/app-shell";
import { MealsSummary } from "@/components/trips/meals/meals-summary";

export default async function MealsSummaryRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <MealsSummary template={template} />
    </AppShell>
  );
}
