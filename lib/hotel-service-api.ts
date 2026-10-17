/**
 * Phase 3 (Hotel): persists the organizer's hotel/room selection as a
 * `TripService` row via POST/DELETE /trips/:tripId/services — see
 * backend/src/trips/dto/add-service.dto.ts and trips.service.ts#addService.
 *
 * ── Why `operatorServiceId` holds a "demo-hotel:" tag, not a real id ──
 * AddServiceDto requires `serviceType` + (`operatorServiceId` OR
 * `internalPlaceId`) — both are plain, unconstrained strings on the Prisma
 * schema (`TripService.operatorServiceId String?`, no relation, no FK, no
 * @IsUUID()). The backend has no seeded/onboarded real Listing inventory for
 * hotels, and this app's hotel catalog (lib/mock-hotel-catalog.ts) is static
 * demo data with no relationship to any real backend Listing.id.
 *
 * Putting a bare catalog id in `operatorServiceId` would make this row
 * indistinguishable from a real operator-listing reference to any future
 * reader (admin tooling, PMS sync, search) — exactly the fake relationship
 * we must not create. Instead this satisfies the field's required-non-empty
 * constraint with a value that can never be mistaken for a real Listing
 * UUID: `demo-hotel:<catalogHotelId>`. It is never read back by this app —
 * `metadata` (below) is the sole source of truth on read — it exists purely
 * so the row is honestly self-labeled wherever it's inspected (DB, admin
 * panel, logs) as demo/config data, not a booking.
 *
 * `internalPlaceId` was considered instead, but its own schema comment ties
 * it specifically to "OSM / dataset-based attractions" (the real `Place`
 * table) — reusing it for a hotel would be a different, equally misleading
 * category error, not a fix.
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { DestinationStay } from "@/lib/listing-draft";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export const DEMO_HOTEL_ID_PREFIX = "demo-hotel:";

export interface BackendTripService {
  id: string;
  tripId: string;
  serviceType: "DESTINATION" | "HOTEL" | "RESTAURANT" | "VEHICLE" | "ACTIVITY";
  operatorServiceId: string | null;
  internalPlaceId: string | null;
  quantity: number | null;
  metadata: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Everything needed to fully reconstruct a booked `DestinationStay` without
 *  re-deriving anything — the metadata blob is the authoritative record. */
interface HotelServiceMetadata {
  demo: true;
  catalogHotelId: string;
  hotelName: string;
  propertyType: string;
  location: string;
  rating: number;
  imageUrl: string;
  destinationId: string;
  destinationName: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  rooms: DestinationStay["rooms"];
  total: number;
}

function toHotelServiceDto(stay: DestinationStay) {
  if (!stay.hotel) throw new Error("Cannot persist a stay with no hotel selected");
  const metadata: HotelServiceMetadata = {
    demo: true,
    catalogHotelId: stay.hotel.id,
    hotelName: stay.hotel.name,
    propertyType: stay.hotel.propertyType,
    location: stay.hotel.location,
    rating: stay.hotel.rating,
    imageUrl: stay.hotel.imageUrl,
    destinationId: stay.destinationId,
    destinationName: stay.destinationName,
    nights: stay.nights,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: stay.rooms,
    total: stay.total,
  };
  return {
    serviceType: "HOTEL" as const,
    operatorServiceId: `${DEMO_HOTEL_ID_PREFIX}${stay.hotel.id}`,
    quantity: stay.rooms.reduce((sum, r) => sum + r.quantity, 0) || undefined,
    metadata: metadata as unknown as Record<string, unknown>,
  };
}

export async function createHotelService(
  tripId: string,
  stay: DestinationStay,
  authedFetch: AuthedFetch
) {
  return authedFetch<BackendTripService>(`/trips/${tripId}/services`, {
    method: "POST",
    body: toHotelServiceDto(stay),
  });
}

/** Tolerates a 404 (already gone) as success — this is demo/config
 *  bookkeeping, not a financial record, so "it's already deleted" is a fine
 *  outcome when replacing a stale service, not a failure to surface. */
export async function deleteHotelService(
  tripId: string,
  serviceId: string,
  authedFetch: AuthedFetch
) {
  try {
    await authedFetch<{ message: string }>(`/trips/${tripId}/services/${serviceId}`, {
      method: "DELETE",
    });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }
}

/** Reads back HOTEL-type services already on the trip (via GET /trips/:id,
 *  which includes `services` — there is no dedicated list-services route)
 *  and reconstructs each into a booked DestinationStay patch, keyed by the
 *  destinationId recorded in its own metadata at creation time. */
export function hotelServicesToStayPatches(
  services: BackendTripService[]
): Map<string, DestinationStay> {
  const patches = new Map<string, DestinationStay>();
  for (const service of services) {
    if (service.serviceType !== "HOTEL") continue;
    const m = service.metadata as unknown as HotelServiceMetadata | null;
    if (!m || !m.destinationId) continue;
    patches.set(m.destinationId, {
      destinationId: m.destinationId,
      destinationName: m.destinationName,
      nights: m.nights,
      checkIn: m.checkIn,
      checkOut: m.checkOut,
      status: "booked",
      hotel: {
        id: m.catalogHotelId,
        name: m.hotelName,
        propertyType: m.propertyType,
        location: m.location,
        rating: m.rating,
        imageUrl: m.imageUrl,
      },
      rooms: m.rooms,
      total: m.total,
      backendId: service.id,
    });
  }
  return patches;
}
