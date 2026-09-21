import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RoomSelection } from "@/components/trips/hotel/room-selection";
import { getHotel } from "@/lib/mock-hotel-catalog";

export default async function RoomSelectionRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string; hotelId: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { destination, hotelId } = await params;
  const { template } = await searchParams;
  const hotel = getHotel(hotelId);

  if (!hotel) {
    const backHref = `/trips/create/services/hotel/${destination}/results${template ? `?template=${template}` : ""}`;
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">
            We couldn&rsquo;t load this hotel.
          </p>
          <Link href={backHref} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Back to results
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RoomSelection destinationId={destination} hotel={hotel} template={template} />
    </AppShell>
  );
}
