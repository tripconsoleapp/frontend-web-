import { AppShell } from "@/components/layout/app-shell";
import { RestaurantListings } from "@/components/book/restaurant/restaurant-listings";

export default function BookRestaurantListingsRoute() {
  return (
    <AppShell>
      <RestaurantListings />
    </AppShell>
  );
}
