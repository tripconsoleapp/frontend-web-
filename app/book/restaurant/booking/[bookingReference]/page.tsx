import { AppShell } from "@/components/layout/app-shell";
import { RestaurantBookingDetailsView } from "@/components/book/restaurant/booking-details-view";

export default async function BookRestaurantBookingDetailsRoute({ params }: { params: Promise<{ bookingReference: string }> }) {
  const { bookingReference } = await params;
  return (
    <AppShell>
      <RestaurantBookingDetailsView bookingReference={bookingReference} />
    </AppShell>
  );
}
