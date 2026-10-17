import { AppShell } from "@/components/layout/app-shell";
import { RestaurantSearch } from "@/components/book/restaurant/restaurant-search";

export default function BookRestaurantRoute() {
  return (
    <AppShell>
      <RestaurantSearch />
    </AppShell>
  );
}
