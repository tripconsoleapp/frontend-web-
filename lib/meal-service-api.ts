/**
 * Phase 4 (Meals): persists a confirmed meal as a `TripService` configuration
 * snapshot — the same transitional model as Hotel (lib/hotel-service-api.ts)
 * and Transport (lib/vehicle-service-api.ts). See those files' header
 * comments for the full reasoning; summarized here for RESTAURANT:
 *
 * `POST /bookings/meal-plan` was deliberately NOT used — `MealPlanDay.
 * bookingId` is a required, non-nullable FK to a real `Booking` (which
 * itself needs a real, verified restaurant `Listing`), and `MealPlanItem.
 * menuItemId` is validated against real `RestaurantMenuItem` rows. None of
 * that exists for this app's demo restaurant/menu catalog, and writing into
 * that structure would imply a real reservation the backend's own dietary-
 * summary/cost reporting treats as operational data. `TripService` has no
 * such constraints, so it's the only honest target for demo/config data.
 *
 * One `TripService` per confirmed (dayIndex, mealType) — the same grain the
 * frontend already commits at (meal-review.tsx's handleConfirm, once per
 * meal instance). Per-guest `responses[]` and `shareToken` are intentionally
 * NOT persisted here — see the note at the bottom of this file.
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { MealInstance, MealMenuSelection } from "@/lib/listing-draft";
import { ApiError } from "@/lib/api-client";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export const DEMO_RESTAURANT_ID_PREFIX = "demo-restaurant:";

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

interface MealServiceMetadata {
  demo: true;
  dayIndex: number;
  mealType: MealInstance["mealType"];
  destinationId: string;
  destinationName: string;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    location: string;
    imageUrl: string;
    rating: number;
    capacity: number;
  };
  selections: MealMenuSelection[];
  planningMode: MealInstance["planningMode"];
  participantCount: number;
  total: number;
}

function toMealServiceDto(meal: MealInstance) {
  if (!meal.restaurant) throw new Error("Cannot persist a meal with no restaurant selected");
  const metadata: MealServiceMetadata = {
    demo: true,
    dayIndex: meal.dayIndex,
    mealType: meal.mealType,
    destinationId: meal.destinationId,
    destinationName: meal.destinationName,
    restaurant: {
      id: meal.restaurant.id,
      name: meal.restaurant.name,
      cuisine: meal.restaurant.cuisine,
      location: meal.restaurant.location,
      imageUrl: meal.restaurant.imageUrl,
      rating: meal.restaurant.rating,
      capacity: meal.restaurant.capacity,
    },
    selections: meal.selections,
    planningMode: meal.planningMode,
    participantCount: meal.participantCount,
    total: meal.total,
  };
  return {
    serviceType: "RESTAURANT" as const,
    operatorServiceId: `${DEMO_RESTAURANT_ID_PREFIX}${meal.restaurant.id}`,
    quantity: meal.participantCount || undefined,
    metadata: metadata as unknown as Record<string, unknown>,
  };
}

async function createMealService(
  tripId: string,
  meal: MealInstance,
  authedFetch: AuthedFetch
): Promise<BackendTripService> {
  return authedFetch<BackendTripService>(`/trips/${tripId}/services`, {
    method: "POST",
    body: toMealServiceDto(meal),
  });
}

/** Tolerates a 404 (already gone) as success — same reasoning as Hotel and
 *  Transport: this is demo/config bookkeeping, not a financial record. */
async function deleteMealService(
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
 * Replaces whichever TripService already backs this one (dayIndex,
 * mealType) meal — delete-old-then-create-new, the same pattern Hotel uses.
 * If the create fails, the previous service (if any) is left completely
 * untouched (it's only deleted after the new one is confirmed created), so
 * a failure never leaves the meal with neither an old nor a new backend
 * record.
 */
export async function replaceMealService(
  tripId: string,
  previousBackendId: string | undefined,
  meal: MealInstance,
  authedFetch: AuthedFetch
): Promise<string> {
  const created = await createMealService(tripId, meal, authedFetch);
  if (previousBackendId) {
    await deleteMealService(tripId, previousBackendId, authedFetch);
  }
  return created.id;
}

/** Reads back RESTAURANT-type demo services already on the trip (via
 *  GET /trips/:id — there is no dedicated list-services route) and
 *  reconstructs each into a confirmed MealInstance patch, keyed by
 *  (dayIndex, mealType) exactly as the frontend already keys meals. */
export function mealServicesToInstancePatches(
  services: BackendTripService[]
): Map<string, MealInstance> {
  const patches = new Map<string, MealInstance>();
  for (const service of services) {
    if (service.serviceType !== "RESTAURANT") continue;
    const m = service.metadata as unknown as MealServiceMetadata | null;
    if (!m || m.demo !== true || m.dayIndex == null || !m.mealType) continue;
    const key = `${m.dayIndex}-${m.mealType}`;
    patches.set(key, {
      dayIndex: m.dayIndex,
      destinationId: m.destinationId,
      destinationName: m.destinationName,
      mealType: m.mealType,
      status: "confirmed",
      restaurant: m.restaurant,
      planningMode: m.planningMode,
      selections: m.selections,
      // Per-guest responses and the share link are never persisted to the
      // backend (see lib/meal-service-api.ts header) — a restored meal has
      // no reconstructable response history, only its final selections.
      responses: [],
      shareToken: null,
      participantCount: m.participantCount,
      total: m.total,
      backendId: service.id,
    });
  }
  return patches;
}

// ---------------------------------------------------------------------
// NOT implemented in this phase, by design:
//
// - `responses[]` (per-guest GuestMealResponse records) — there is no
//   backend concept of an individual guest's meal choice anywhere in this
//   schema (MealPlanItem only ever stores aggregate veg/non-veg/jain
//   counts, and that model isn't even the one in use here). Persisting
//   per-guest data would require a genuine new data-model decision on the
//   backend, not a mapping onto something that already exists — out of
//   scope for a configuration-snapshot integration.
// - `shareToken` — purely a frontend/localStorage mechanism for the group
//   meal-planning share link; it has no meaning outside this browser
//   session and nothing to persist it as.
//
// The existing group-planning flow (share link, guest responses,
// aggregation into `selections`) is completely unchanged — it still runs
// entirely client-side exactly as before; only the final aggregated
// `selections` a confirm produces is what reaches the backend.
// ---------------------------------------------------------------------
