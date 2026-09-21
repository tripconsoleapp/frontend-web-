import { AppShell } from "@/components/layout/app-shell";
import { MealPlanningHub } from "@/components/trips/meals/meal-planning-hub";

export default async function MealPlanningRoute({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <MealPlanningHub template={template} />
    </AppShell>
  );
}
