import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RestaurantDetail } from "@/components/trips/meals/restaurant-detail";
import { getRestaurant } from "@/lib/mock-restaurant-catalog";

export default async function RestaurantDetailRoute({
  params,
  searchParams,
}: {
  params: Promise<{ mealKey: string; restaurantId: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { mealKey, restaurantId } = await params;
  const { template } = await searchParams;
  const restaurant = getRestaurant(restaurantId);

  if (!restaurant) {
    const backHref = `/trips/create/services/restaurant/${mealKey}/restaurants${template ? `?template=${template}` : ""}`;
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">We couldn&rsquo;t load this restaurant.</p>
          <Link href={backHref} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Back to results
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RestaurantDetail mealKey={mealKey} restaurant={restaurant} template={template} />
    </AppShell>
  );
}
