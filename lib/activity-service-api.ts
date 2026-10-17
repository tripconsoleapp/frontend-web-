/**
 * Trip Builder Activities: persists a destination's confirmed activity
 * selections as a `TripService` configuration snapshot — the same
 * transitional model as Hotel (lib/hotel-service-api.ts), Transport
 * (lib/vehicle-service-api.ts), Meals (lib/meal-service-api.ts), and the
 * Itinerary configuration snapshot (lib/itinerary-service-api.ts). See
 * those files' header comments for the full reasoning; summarized here for
 * ACTIVITY:
 *
 * The real backend's `TripService` row has no constraint on
 * `operatorServiceId`/`metadata`, so — exactly like the other three
 * service types — this demo catalog's activities (which have no real
 * backend `Listing` to reference) are stored there rather than implying a
 * real reservation.
 *
 * One `TripService` per destination — the same grain the frontend already
 * commits at (confirm-destination.tsx's handleConfirm, once per
 * destination's full activity list, matching how Hotel persists one
 * service per destination stay).
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { DestinationActivityPlan, ScheduledActivity } from "@/lib/listing-draft";
import { ApiError } from "@/lib/api-client";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export const DEMO_ACTIVITY_ID_PREFIX = "demo-activity:";

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

interface ActivityServiceMetadata {
  demo: true;
  destinationId: string;
  destinationName: string;
  activities: ScheduledActivity[];
}

function toActivityServiceDto(dest: DestinationActivityPlan) {
  const metadata: ActivityServiceMetadata = {
    demo: true,
    destinationId: dest.destinationId,
    destinationName: dest.destinationName,
    activities: dest.activities,
  };
  return {
    serviceType: "ACTIVITY" as const,
    operatorServiceId: `${DEMO_ACTIVITY_ID_PREFIX}${dest.destinationId}`,
    quantity: dest.activities.length || undefined,
    metadata: metadata as unknown as Record<string, unknown>,
  };
}

async function createActivityService(
  tripId: string,
  dest: DestinationActivityPlan,
  authedFetch: AuthedFetch
): Promise<BackendTripService> {
  return authedFetch<BackendTripService>(`/trips/${tripId}/services`, {
    method: "POST",
    body: toActivityServiceDto(dest),
  });
}

/** Tolerates a 404 (already gone) as success — same reasoning as Hotel,
 *  Transport, and Meals: this is demo/config bookkeeping, not a financial
 *  or operational record. */
async function deleteActivityService(
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
 * Replaces whichever TripService already backs this destination's
 * activities — create-new-then-delete-old, the same pattern Itinerary and
 * Meals use. If the create fails, the previous service (if any) is left
 * completely untouched (it's only deleted after the new one is confirmed
 * created), so a failed save never destroys a previously valid snapshot and
 * never leaves the destination with neither an old nor a new backend
 * record.
 */
export async function replaceActivityService(
  tripId: string,
  previousBackendId: string | undefined,
  dest: DestinationActivityPlan,
  authedFetch: AuthedFetch
): Promise<string> {
  const created = await createActivityService(tripId, dest, authedFetch);
  if (previousBackendId) {
    await deleteActivityService(tripId, previousBackendId, authedFetch);
  }
  return created.id;
}

/** Reads back ACTIVITY-type demo services already on the trip (via
 *  GET /trips/:id — there is no dedicated list-services route) and
 *  reconstructs each into a confirmed DestinationActivityPlan patch, keyed
 *  by destinationId exactly as the frontend already keys activity plans. */
export function activityServicesToDestinationPatches(
  services: BackendTripService[]
): Map<string, DestinationActivityPlan> {
  const patches = new Map<string, DestinationActivityPlan>();
  for (const service of services) {
    if (service.serviceType !== "ACTIVITY") continue;
    const m = service.metadata as unknown as ActivityServiceMetadata | null;
    if (!m || m.demo !== true || !m.destinationId) continue;
    patches.set(m.destinationId, {
      destinationId: m.destinationId,
      destinationName: m.destinationName,
      status: "has_activities",
      activities: m.activities,
      backendId: service.id,
    });
  }
  return patches;
}
