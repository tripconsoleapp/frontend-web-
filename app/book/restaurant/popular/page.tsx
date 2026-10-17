import { AppShell } from "@/components/layout/app-shell";
import { PopularRestaurants } from "@/components/book/restaurant/popular-restaurants";

export default function BookRestaurantPopularRoute() {
  return (
    <AppShell>
      <PopularRestaurants />
    </AppShell>
  );
}
