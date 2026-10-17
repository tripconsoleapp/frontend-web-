import { AppShell } from "@/components/layout/app-shell";
import { HotelDetails } from "@/components/book/hotel/hotel-details";

export default async function BookHotelDetailsRoute({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params;
  return (
    <AppShell>
      <HotelDetails hotelId={hotelId} />
    </AppShell>
  );
}
