import { AppShell } from "@/components/layout/app-shell";
import { BookingDetailsView } from "@/components/book/hotel/booking-details-view";

export default async function BookHotelBookingDetailsRoute({ params }: { params: Promise<{ bookingReference: string }> }) {
  const { bookingReference } = await params;
  return (
    <AppShell>
      <BookingDetailsView bookingReference={decodeURIComponent(bookingReference)} />
    </AppShell>
  );
}
