/**
 * Phase 3 (Transport): persists the organizer's confirmed vehicle
 * selection(s) as `TripService` rows, one per vehicle — same transitional
 * model established for Hotel (see lib/hotel-service-api.ts, whose header
 * comment explains in full why `operatorServiceId` carries a "demo-"
 * sentinel rather than a real Listing id; the same reasoning applies here
 * verbatim, just for VEHICLE instead of HOTEL).
 *
 * ── Grouping is frontend-only ──
 * When the organizer combines several vehicles to cover one group, that is
 * purely a frontend concept (`VehicleDraft.vehicles[]`, an array with no
 * shared identifier). The backend has no relation between `TripService`
 * rows — each is persisted independently, exactly like Hotel's per-
 * destination rows. Nothing here invents a backend grouping model.
 *
 * ── KSRTC ──
 * `VehicleSelectionItem.source: "private"|"ksrtc"` is preserved verbatim in
 * metadata for display/reconstruction. It is NOT a backend concept (no
 * KSRTC/operator-type field exists anywhere in this schema — see the
 * Phase-0 audit) and this module makes no claim otherwise; eligibility
 * itself is untouched, still decided entirely by lib/transport-eligibility.ts
 * before a vehicle ever reaches this module.
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { VehicleSelectionItem } from "@/lib/listing-draft";
import { ApiError } from "@/lib/api-client";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export const DEMO_VEHICLE_ID_PREFIX = "demo-vehicle:";

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

interface VehicleServiceMetadata {
  demo: true;
  catalogVehicleId: string;
  name: string;
  provider: string;
  capacity: number;
  price: number;
  source: "private" | "ksrtc";
  ac: boolean;
  rating: number;
  trips: number;
}

function toVehicleServiceDto(vehicle: VehicleSelectionItem) {
  const metadata: VehicleServiceMetadata = {
    demo: true,
    catalogVehicleId: vehicle.id,
    name: vehicle.name,
    provider: vehicle.provider,
    capacity: vehicle.capacity,
    price: vehicle.price,
    source: vehicle.source,
    ac: vehicle.ac,
    rating: vehicle.rating,
    trips: vehicle.trips,
  };
  return {
    serviceType: "VEHICLE" as const,
    operatorServiceId: `${DEMO_VEHICLE_ID_PREFIX}${vehicle.id}`,
    quantity: 1,
    metadata: metadata as unknown as Record<string, unknown>,
  };
}

async function createVehicleService(
  tripId: string,
  vehicle: VehicleSelectionItem,
  authedFetch: AuthedFetch
): Promise<BackendTripService> {
  return authedFetch<BackendTripService>(`/trips/${tripId}/services`, {
    method: "POST",
    body: toVehicleServiceDto(vehicle),
  });
}

/** Tolerates a 404 (already gone) as success — same reasoning as the Hotel
 *  module: this is demo/config bookkeeping, not a financial record. */
async function deleteVehicleService(
  tripId: string,
  serviceId: string,
  authedFetch: AuthedFetch
): Promise<void> {
  try {
    await authedFetch<{ message: string }>(`/trips/${tripId}/services/${serviceId}`, {
      method: "DELETE",
    });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) throw err;
  }
}

/**
 * Replaces whatever vehicle TripServices exist for this trip with the
 * currently confirmed set — the same "delete old, create new" semantics
 * Hotel uses, extended from 1-old/1-new to N-old/M-new.
 *
 * All-or-nothing: if any create fails partway through, every service this
 * call itself created is rolled back (deleted) before the error is
 * rethrown, so a partial failure never leaves half the new configuration
 * silently persisted. `previousVehicles` (whichever already carry a
 * `backendId`) are only deleted once every new one has been created
 * successfully — never the reverse — so a failure never leaves the trip
 * with zero transport when it previously had a valid one.
 */
export async function replaceVehicleServices(
  tripId: string,
  previousVehicles: VehicleSelectionItem[],
  nextVehicles: VehicleSelectionItem[],
  authedFetch: AuthedFetch
): Promise<VehicleSelectionItem[]> {
  const created: BackendTripService[] = [];
  try {
    for (const vehicle of nextVehicles) {
      created.push(await createVehicleService(tripId, vehicle, authedFetch));
    }
  } catch (err) {
    await Promise.all(
      created.map((service) => deleteVehicleService(tripId, service.id, authedFetch).catch(() => {}))
    );
    throw err;
  }

  const previousIds = previousVehicles.map((v) => v.backendId).filter((id): id is string => Boolean(id));
  await Promise.all(previousIds.map((id) => deleteVehicleService(tripId, id, authedFetch)));

  return nextVehicles.map((vehicle, i) => ({ ...vehicle, backendId: created[i].id }));
}

/** Reads back VEHICLE-type services already on the trip (via GET /trips/:id
 *  — there is no dedicated list-services route) and reconstructs the
 *  confirmed vehicle array from their metadata. */
export function vehicleServicesToSelection(services: BackendTripService[]): VehicleSelectionItem[] {
  return services
    .filter((s) => s.serviceType === "VEHICLE")
    .map((service) => {
      const m = service.metadata as unknown as VehicleServiceMetadata;
      return {
        id: m.catalogVehicleId,
        name: m.name,
        capacity: m.capacity,
        provider: m.provider,
        price: m.price,
        source: m.source,
        ac: m.ac,
        rating: m.rating,
        trips: m.trips,
        backendId: service.id,
      };
    });
}
