import { AppShell } from "@/components/layout/app-shell";
import { RestaurantDetails } from "@/components/book/restaurant/restaurant-details";

export default async function BookRestaurantDetailsRoute({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  return (
    <AppShell>
      <RestaurantDetails restaurantId={restaurantId} />
    </AppShell>
  );
}
