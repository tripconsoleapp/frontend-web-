import { AppShell } from "@/components/layout/app-shell";
import { ActivityBookingDetailsView } from "@/components/book/activity/booking-details-view";

export default async function BookActivityBookingDetailsRoute({ params }: { params: Promise<{ bookingReference: string }> }) {
  const { bookingReference } = await params;
  return (
    <AppShell>
      <ActivityBookingDetailsView bookingReference={bookingReference} />
    </AppShell>
  );
}
