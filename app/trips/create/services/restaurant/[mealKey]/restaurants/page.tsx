import { AppShell } from "@/components/layout/app-shell";
import { RestaurantDiscovery } from "@/components/trips/meals/restaurant-discovery";

export default async function RestaurantDiscoveryRoute({
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
      <RestaurantDiscovery mealKey={mealKey} template={template} />
    </AppShell>
  );
}
