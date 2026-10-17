/**
 * Phase 2: persists the Destinations step against the real backend
 * (POST/PATCH/DELETE/reorder /trips/:tripId/destinations) — see
 * backend/src/trips/dto/trip-destination.dto.ts and trips.service.ts for the
 * exact contract this maps onto.
 *
 * Only wired up when a real backendTripId exists (Start-from-Scratch trips —
 * see lib/trip-api.ts and trip-basics-form.tsx). Template/Pilgrimage/Join
 * Scheduled Trip drafts never have one, so this module is never invoked for
 * them and their behavior is unchanged.
 */

import type { ApiFetchOptions } from "@/lib/api-client";
import type { DestinationStop } from "@/components/trips/itinerary-stop-card";
import { KERALA_LOCATIONS } from "@/lib/kerala-locations";
import { PILGRIMAGE_DESTINATIONS } from "@/lib/pilgrimage-destinations";

type AuthedFetch = <T>(path: string, options?: ApiFetchOptions) => Promise<T>;

export interface BackendDestination {
  id: string;
  tripId: string;
  orderIndex: number;
  locationName: string;
  lat: number | null;
  lng: number | null;
  stayDurationHours: number | null;
  arrivalDay: number | null;
  notes: string | null;
  placeId: string | null;
  [key: string]: unknown;
}

/** This app's destinations are always chosen from the fixed Kerala/pilgrimage
 *  catalogs (see add-destination-drawer.tsx — there is no free-text custom
 *  location entry), so a hydrated backend row can always be matched back to
 *  its catalog entry by name to recover district/x/y for the illustrated
 *  map. lat/lng come from the backend record itself, not the catalog. */
function findCatalogLocationByName(name: string) {
  return (
    KERALA_LOCATIONS.find((loc) => loc.name === name) ??
    PILGRIMAGE_DESTINATIONS.find((loc) => loc.name === name)
  );
}

/** CreateTripDestinationDto has no `nights` field — only `stayDurationHours`.
 *  nights * 24 is the documented, reversible mapping used in both
 *  directions; @Min(1) on the backend means a day-visit (nights === 0) omits
 *  the field entirely rather than sending 0. */
function toCreateDestinationDto(stop: DestinationStop) {
  return {
    locationName: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    ...(stop.nights > 0 ? { stayDurationHours: stop.nights * 24 } : {}),
  };
}

function toUpdateDestinationDto(stop: DestinationStop) {
  return toCreateDestinationDto(stop);
}

export function backendDestinationToStop(row: BackendDestination): DestinationStop {
  const catalogMatch = findCatalogLocationByName(row.locationName);
  const nights = row.stayDurationHours ? Math.round(row.stayDurationHours / 24) : 0;
  return {
    id: catalogMatch?.id ?? row.id,
    name: row.locationName,
    district: catalogMatch?.district ?? "",
    x: catalogMatch?.x ?? 0,
    y: catalogMatch?.y ?? 0,
    lat: row.lat ?? catalogMatch?.lat ?? 0,
    lng: row.lng ?? catalogMatch?.lng ?? 0,
    nights,
    overnight: nights > 0,
    backendId: row.id,
  };
}

export async function listDestinations(tripId: string, authedFetch: AuthedFetch) {
  return authedFetch<BackendDestination[]>(`/trips/${tripId}/destinations`);
}

export async function createDestination(
  tripId: string,
  stop: DestinationStop,
  authedFetch: AuthedFetch
) {
  return authedFetch<BackendDestination>(`/trips/${tripId}/destinations`, {
    method: "POST",
    body: toCreateDestinationDto(stop),
  });
}

export async function updateDestination(
  tripId: string,
  destId: string,
  stop: DestinationStop,
  authedFetch: AuthedFetch
) {
  return authedFetch<BackendDestination>(`/trips/${tripId}/destinations/${destId}`, {
    method: "PATCH",
    body: toUpdateDestinationDto(stop),
  });
}

export async function deleteDestination(tripId: string, destId: string, authedFetch: AuthedFetch) {
  return authedFetch<{ success: boolean }>(`/trips/${tripId}/destinations/${destId}`, {
    method: "DELETE",
  });
}

export async function reorderDestinations(
  tripId: string,
  orderedBackendIds: string[],
  authedFetch: AuthedFetch
) {
  return authedFetch<BackendDestination[]>(`/trips/${tripId}/destinations/reorder`, {
    method: "PATCH",
    body: {
      destinations: orderedBackendIds.map((id, orderIndex) => ({ id, orderIndex })),
    },
  });
}
