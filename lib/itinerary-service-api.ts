/**
 * Phase 5 (Itinerary): persists the organizer's editable itinerary DRAFT as
 * a single `TripService` configuration snapshot — the same transitional
 * model as Hotel/Transport/Meals (see lib/hotel-service-api.ts,
 * lib/vehicle-service-api.ts, lib/meal-service-api.ts).
 *
 * ══════════════════════════════════════════════════════════════════════
 * CRITICAL — two unrelated concepts share the word "itinerary." Do not
 * confuse them, and never call the thing this file writes a "real
 * itinerarySnapshot" or imply it is backend operational data:
 *
 * 1. FRONTEND ITINERARY CONFIGURATION SNAPSHOT (what this file persists)
 *    - The organizer's editable `ItineraryDraft` from lib/listing-draft.ts
 *      (lib/itinerary.ts's generateItinerary/recomputeDay/moveBlock/
 *      validateDayConflicts — none of that logic is touched here).
 *    - Stored as ONE `TripService{serviceType: DESTINATION}` row, tagged
 *      `operatorServiceId: "demo-itinerary:<tripId>"` and
 *      `metadata.configurationType: "frontend-itinerary-snapshot"`.
 *    - Purpose: survive a refresh/session loss during trip creation.
 *      Nothing more. It is demo/config bookkeeping, exactly like Hotel/
 *      Transport/Meals — never a real booking or operational record.
 *
 * 2. BACKEND `Trip.itinerarySnapshot` (untouched by this file, ever)
 *    - Written exactly once, server-side, by
 *      backend/src/trips/trip-itinerary.service.ts's `generateSnapshot()`,
 *      only at the DRAFT → UNDER_REVIEW submission transition (see
 *      backend/src/trips/trips.service.ts `updateTripStatus`).
 *    - A generated, read-only report (hardcoded meal/checkin times, first-
 *      service-only), structurally parallel to a cost snapshot — not the
 *      organizer's actual edited plan.
 *    - This module never reads, writes, or references that field or that
 *      generator. `GET /trips/:id/itinerary` is not called anywhere here.
 * ══════════════════════════════════════════════════════════════════════
 *
 * Why `operatorServiceId` is a "demo-itinerary:" tag, not a real id: same
 * reasoning as the other three service-api modules — `TripService.
 * operatorServiceId`/`metadata` are unconstrained strings/JSON with no FK,
 * so a clearly non-UUID, self-labeled sentinel satisfies the field
 * honestly without ever being mistaken for a real Listing reference.
 *
 * Exactly one such row exists per trip at any time — the entire
 * `ItineraryDraft` (all days, all blocks, full fidelity, no stripped
 * fields) lives inside `metadata.itinerary` as one JSON blob. Reconfirming
 * or editing the itinerary replaces that one row (create-new-then-delete-
 * old), it never decomposes into per-day or per-block rows.
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { ItineraryDraft } from "@/lib/listing-draft";
import { ApiError } from "@/lib/api-client";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export const DEMO_ITINERARY_ID_PREFIX = "demo-itinerary:";
const CONFIGURATION_TYPE = "frontend-itinerary-snapshot" as const;

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

interface ItineraryServiceMetadata {
  demo: true;
  configurationType: typeof CONFIGURATION_TYPE;
  /** The complete, untransformed ItineraryDraft — every day, every block,
   *  every field, exactly as lib/itinerary.ts produced/edited it. */
  itinerary: ItineraryDraft;
}

function toItineraryServiceDto(tripId: string, itinerary: ItineraryDraft) {
  const metadata: ItineraryServiceMetadata = {
    demo: true,
    configurationType: CONFIGURATION_TYPE,
    itinerary,
  };
  return {
    serviceType: "DESTINATION" as const,
    operatorServiceId: `${DEMO_ITINERARY_ID_PREFIX}${tripId}`,
    metadata: metadata as unknown as Record<string, unknown>,
  };
}

async function createItineraryService(
  tripId: string,
  itinerary: ItineraryDraft,
  authedFetch: AuthedFetch
): Promise<BackendTripService> {
  return authedFetch<BackendTripService>(`/trips/${tripId}/services`, {
    method: "POST",
    body: toItineraryServiceDto(tripId, itinerary),
  });
}

/** Tolerates a 404 (already gone) as success — same reasoning as Hotel/
 *  Transport/Meals: this is demo/config bookkeeping, not a financial or
 *  operational record. */
async function deleteItineraryService(
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
 * Replaces whichever itinerary configuration snapshot already exists for
 * this trip — create-new-then-delete-old, the same pattern Hotel/
 * Transport/Meals use. If the create fails, the previous snapshot (if any)
 * is left completely untouched (it's only deleted after the new one is
 * confirmed created), so a failed save never destroys a previously valid
 * snapshot and never leaves the trip with neither an old nor a new one.
 */
export async function replaceItineraryService(
  tripId: string,
  previousBackendId: string | undefined,
  itinerary: ItineraryDraft,
  authedFetch: AuthedFetch
): Promise<string> {
  const created = await createItineraryService(tripId, itinerary, authedFetch);
  if (previousBackendId) {
    await deleteItineraryService(tripId, previousBackendId, authedFetch);
  }
  return created.id;
}

/**
 * Reads back the trip's services (via GET /trips/:id — there is no
 * dedicated list-services route, and this is NOT a call to
 * GET /trips/:id/itinerary, which is a different, backend-generated
 * artifact this module never touches) and, if a frontend itinerary
 * configuration snapshot exists, returns it exactly as saved — with
 * `backendId` attached — for the caller to restore as-is. Never
 * regenerates, never transforms; the frontend's own generation/editing
 * logic remains authoritative and is not invoked here.
 */
export function findItineraryConfigurationSnapshot(
  services: BackendTripService[]
): (ItineraryDraft & { backendId: string }) | null {
  for (const service of services) {
    if (service.serviceType !== "DESTINATION") continue;
    const m = service.metadata as unknown as ItineraryServiceMetadata | null;
    if (!m || m.demo !== true || m.configurationType !== CONFIGURATION_TYPE) continue;
    if (!m.itinerary) continue;
    return { ...m.itinerary, backendId: service.id };
  }
  return null;
}
