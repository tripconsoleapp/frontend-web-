import { AppShell } from "@/components/layout/app-shell";
import { HotelListings } from "@/components/book/hotel/hotel-listings";

export default function BookHotelListingsRoute() {
  return (
    <AppShell>
      <HotelListings />
    </AppShell>
  );
}
