import { AppShell } from "@/components/layout/app-shell";
import { VehicleBookingDetailsView } from "@/components/book/vehicle/booking-details-view";

export default async function BookVehicleBookingDetailsRoute({ params }: { params: Promise<{ bookingReference: string }> }) {
  const { bookingReference } = await params;
  return (
    <AppShell>
      <VehicleBookingDetailsView bookingReference={decodeURIComponent(bookingReference)} />
    </AppShell>
  );
}
