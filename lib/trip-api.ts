/**
 * Phase 1B: the one backend call wired up so far — POST /trips from Trip
 * Basics, Start-from-Scratch only. See the Phase 1 integration report for
 * why Templates/Scheduled Trips/Pilgrimage don't call this yet.
 */

import type { ApiFetchOptions } from "@/lib/api-client";

export type BackendTripType = "SCHOOL" | "COLLEGE" | "GROUP" | "INDIVIDUAL";

const TRIP_TYPE_TO_BACKEND: Record<"school" | "college" | "group" | "individual", BackendTripType> = {
  school: "SCHOOL",
  college: "COLLEGE",
  group: "GROUP",
  individual: "INDIVIDUAL",
};

export interface CreateTripInput {
  tripName: string;
  tripType: "school" | "college" | "group" | "individual";
  startDate: string;
  endDate: string;
  participantCount: number;
  staffCount: number;
}

export interface BackendTrip {
  id: string;
  organizerId: string;
  title: string;
  tripType: BackendTripType;
  status: string;
  version?: number;
  declarationsConfirmed?: boolean;
  costSnapshot?: unknown;
  itinerarySnapshot?: unknown;
  [key: string]: unknown;
}

/** Maps the Trip Basics form's local field names directly onto CreateTripDto
 *  — see backend/src/trips/dto/create-trip.dto.ts. `description` and
 *  `startLocation` are omitted: Basics captures neither today. */
export function toCreateTripDto(input: CreateTripInput) {
  return {
    title: input.tripName,
    tripType: TRIP_TYPE_TO_BACKEND[input.tripType],
    startDate: input.startDate,
    endDate: input.endDate,
    participantCount: input.participantCount,
    staffCount: input.staffCount,
  };
}

export async function createTrip(
  input: CreateTripInput,
  authedFetch: <T>(path: string, options?: ApiFetchOptions) => Promise<T>
): Promise<BackendTrip> {
  return authedFetch<BackendTrip>("/trips", {
    method: "POST",
    body: toCreateTripDto(input),
  });
}

/**
 * Phase 6: submits a Start-from-Scratch trip for review — the one real call
 * behind Final Review's Submit button. Maps directly onto
 * backend/src/trips/trips.controller.ts's `PATCH /trips/:id/status`; the
 * controller derives nothing on its own, so `status` must be sent
 * explicitly alongside `declarationsConfirmed` (see
 * backend/src/trips/dto/submit-trip.dto.ts and trip-state-machine.ts).
 */
export async function submitTrip(
  tripId: string,
  authedFetch: <T>(path: string, options?: ApiFetchOptions) => Promise<T>
): Promise<BackendTrip> {
  return authedFetch<BackendTrip>(`/trips/${tripId}/status`, {
    method: "PATCH",
    body: { status: "UNDER_REVIEW", declarationsConfirmed: true },
  });
}
