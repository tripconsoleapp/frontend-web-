import { AppShell } from "@/components/layout/app-shell";
import { MealReview } from "@/components/trips/meals/meal-review";

export default async function MealReviewRoute({
  params,
  searchParams,
}: {
  params: Promise<{ mealKey: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { mealKey } = await params;
  const { template } = await searchParams;

  return (
    <AppShell>
      <MealReview mealKey={mealKey} template={template} />
    </AppShell>
  );
}
