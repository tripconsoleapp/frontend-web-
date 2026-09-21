"use client";

/**
 * Minimal client-side listingDraft store for the trip-builder flow.
 *
 * The rest of the app has no shared draft/persistence layer today — each
 * builder step (Basics, Destinations) keeps its own local component state
 * that resets on navigation. This module is the first real, working slice
 * of a listingDraft: it survives navigating away from Services and back
 * (sessionStorage persists across route changes and reloads within the
 * same tab), without inventing a fake backend. Other steps can adopt the
 * same pattern later by adding their own section to `ListingDraft`.
 */

const STORAGE_KEY = "tripconsole:listing-draft";

/** A single booked vehicle — a transport plan may hold more than one when
 *  vehicles are combined to cover the full group. */
export interface VehicleSelectionItem {
  id: string;
  name: string;
  capacity: number;
  provider: string;
  price: number;
  source: "private" | "ksrtc";
  ac: boolean;
  rating: number;
  trips: number;
}

export interface VehicleDraft {
  enabled: boolean;
  configured: boolean;
  /** Confirmed transport plan — only written by the final Confirm step. */
  vehicles: VehicleSelectionItem[];
  /** In-progress selection while the user is still inside the transport
   *  flow (browsing / capacity-mismatch / combination). Never read by the
   *  Services hub — only `vehicles` counts as "configured". */
  pending: VehicleSelectionItem[];
  lastSource?: "private" | "ksrtc";
  lastTypeId?: string;
}

/** A destination-specific accommodation decision. "skipped" and
 *  "not_required" are both valid completed states — only "pending" blocks
 *  finishing the Hotel service. Never conflate "skipped" with "booked". */
export type StayStatus = "pending" | "booked" | "skipped" | "not_required";

/** The hotel chosen for one destination stay — enough to render a summary
 *  row without re-fetching the catalog. */
export interface HotelPropertySelection {
  id: string;
  name: string;
  propertyType: string;
  location: string;
  rating: number;
  imageUrl: string;
}

export interface RoomSelectionItem {
  roomId: string;
  roomName: string;
  pricePerNight: number;
  /** Guests that fit in one room of this type — drives the "rooms required" math. */
  capacity: number;
  quantity: number;
}

/** One required-or-optional overnight stop's accommodation state. A trip
 *  with N overnight destinations holds N of these — hotel selection is
 *  per-destination, never a single trip-wide hotel. */
export interface DestinationStay {
  destinationId: string;
  destinationName: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  status: StayStatus;
  hotel: HotelPropertySelection | null;
  rooms: RoomSelectionItem[];
  total: number;
}

/** In-progress hotel+room choice for one destination, held while the user is
 *  still inside Results → Detail → Rooms → Confirm. Mirrors the vehicle
 *  flow's pending/confirmed split — only "Add to Trip" commits this into
 *  `stays`, so browsing never disturbs already-decided destinations. */
export interface PendingHotelSelection {
  destinationId: string;
  hotel: HotelPropertySelection;
  rooms: RoomSelectionItem[];
}

export interface HotelDraft {
  enabled: boolean;
  configured: boolean;
  stays: DestinationStay[];
  pending: PendingHotelSelection | null;
}

export type MealType = "breakfast" | "lunch" | "dinner";

/** Mirrors the 5 conceptual meal states from the spec: PENDING (no decision
 *  yet) and SKIPPED (organizer intentionally wants no arrangement) must
 *  never be conflated. RESTAURANT_SELECTED/PLANNING mark progress before a
 *  meal is CONFIRMED. */
export type MealStatus = "pending" | "restaurant_selected" | "planning" | "confirmed" | "skipped";

export type MealPlanningMode = "manual" | "group" | null;

export interface MealMenuSelection {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
}

/** One guest's group-planning submission. `extraItemId` covers the spec's
 *  "one required main course, optional starter/dessert/beverage" rule. */
export interface GuestMealResponse {
  guestId: string;
  guestName: string;
  mainItemId: string;
  mainItemName: string;
  mainPrice: number;
  extraItemId?: string;
  extraItemName?: string;
  extraPrice?: number;
  respondedAt: string;
}

export interface MealRestaurantSelection {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  imageUrl: string;
  rating: number;
  capacity: number;
}

/** One meal instance — one per (day, mealType). Hotel selection is
 *  per-destination; meal selection is per-day-per-meal, since lunch and
 *  dinner on the same day can go to different restaurants. */
export interface MealInstance {
  dayIndex: number;
  destinationId: string;
  destinationName: string;
  mealType: MealType;
  status: MealStatus;
  restaurant: MealRestaurantSelection | null;
  planningMode: MealPlanningMode;
  /** The finalized order — for group mode this is the aggregate of
   *  `responses`, computed at confirm time so both modes produce the same
   *  kind of order object. */
  selections: MealMenuSelection[];
  responses: GuestMealResponse[];
  shareToken: string | null;
  /** Trip size at the time this meal was planned — never re-derived later,
   *  so a meal confirmed for 46 stays "46 meals" even if Basics changes. */
  participantCount: number;
  total: number;
}

export interface MealPlanDraft {
  enabled: boolean;
  configured: boolean;
  meals: MealInstance[];
}

export interface ActivitySelection {
  id: string;
  name: string;
  location: string;
  duration: string;
  price: number;
}

/** A destination can have activities decided, explicitly skipped, or not
 *  yet planned — the same three-state pattern as hotel stays, kept
 *  separate here since "not planned" and "skipped" must never be
 *  conflated in the UI. */
export type ActivityDestinationStatus = "not_planned" | "has_activities" | "skipped";

export type ActivityPricingType = "per_person" | "per_group";

/** One booked instance of an activity — a destination can hold several,
 *  even of the same catalog activity at a different time. */
export interface ScheduledActivity {
  /** Unique per instance, distinct from the catalog `activityId`, so the
   *  same activity can be added twice (e.g. two different time slots). */
  id: string;
  activityId: string;
  name: string;
  imageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  participants: number;
  pricingType: ActivityPricingType;
  unitPrice: number;
  total: number;
}

export interface DestinationActivityPlan {
  destinationId: string;
  destinationName: string;
  status: ActivityDestinationStatus;
  activities: ScheduledActivity[];
}

export interface ActivitiesDraft {
  enabled: boolean;
  configured: boolean;
  destinations: DestinationActivityPlan[];
}

export interface ServicesDraft {
  vehicle: VehicleDraft;
  hotel: HotelDraft;
  restaurant: MealPlanDraft;
  activities: ActivitiesDraft;
}

export const DEFAULT_SERVICES_DRAFT: ServicesDraft = {
  vehicle: { enabled: true, configured: false, vehicles: [], pending: [] },
  hotel: { enabled: true, configured: false, stays: [], pending: null },
  restaurant: { enabled: false, configured: false, meals: [] },
  activities: { enabled: false, configured: false, destinations: [] },
};

/** The handful of Basics fields the transport flow actually needs — real
 *  values written by TripBasicsForm, never fabricated downstream. */
/** Optional breakdown of `participantCount` (e.g. students + staff) — the
 *  Itinerary flow shows this alongside the total so a school trip never
 *  silently switches between "42" and "46" in different places. Omitted
 *  for group types with a single undifferentiated headcount. */
export interface ParticipantBreakdownEntry {
  label: string;
  count: number;
}

export interface BasicsSummary {
  tripName: string;
  participantCount: number;
  participantBreakdown?: ParticipantBreakdownEntry[];
  startDate: string;
  endDate: string;
}

/** One overnight destination as chosen in the Destinations step — only
 *  stops with nights > 0 are included, since a day visit needs no stay. */
export interface DestinationStopSummary {
  id: string;
  name: string;
  nights: number;
}

/** A short route label ("Kochi → Munnar") plus the real overnight stops,
 *  both written by the Destinations step. The Hotel flow derives which
 *  destinations need accommodation from `stops` — it never invents them.
 *  `startLocationId`/`startLocationName` are the trip's real departure
 *  point — the Itinerary flow needs this as structured data (for the
 *  Day 1 "depart from X" travel block) rather than parsing it back out
 *  of `routeLabel`. */
export interface DestinationsSummary {
  routeLabel: string;
  stops: DestinationStopSummary[];
  startLocationId?: string;
  startLocationName?: string;
}

export type ItineraryBlockType =
  | "travel"
  | "activity"
  | "meal"
  | "check_in"
  | "stay"
  | "check_out"
  | "free_time"
  | "hidden_gem"
  | "custom";

export type ItineraryStatus = "not_generated" | "draft" | "ready";
export type ConflictLevel = "info" | "warning" | "error";

/** A block never duplicates service data — `sourceType`/`sourceId` point
 *  back at the authoritative record in `ServicesDraft` (or the hidden-gem
 *  catalog, which has no service state of its own). `price` is a cached
 *  display value read from that source at generation/edit time, never an
 *  independently invented number. `locked` marks blocks whose identity is
 *  owned by a service — the itinerary can only reschedule them; changing
 *  what they *are* means going back to that service's own flow. */
export interface ItineraryBlock {
  id: string;
  type: ItineraryBlockType;
  title: string;
  subtitle?: string;
  destinationId: string;
  date: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  sourceType?: "vehicle" | "hotel" | "meal" | "activity" | "hiddenGem" | null;
  sourceId?: string | null;
  participants?: number;
  price?: number;
  locked: boolean;
}

export interface ItineraryConflict {
  id: string;
  level: ConflictLevel;
  message: string;
  blockIds: string[];
}

export interface ItineraryDay {
  dayIndex: number;
  date: string;
  destinationId: string;
  destinationName: string;
  blocks: ItineraryBlock[];
  conflicts: ItineraryConflict[];
}

export interface ItineraryDraft {
  status: ItineraryStatus;
  generatedAt: string | null;
  days: ItineraryDay[];
}

export const DEFAULT_ITINERARY_DRAFT: ItineraryDraft = {
  status: "not_generated",
  generatedAt: null,
  days: [],
};

interface ListingDraft {
  services?: ServicesDraft;
  basics?: BasicsSummary;
  destinationsSummary?: DestinationsSummary;
  itinerary?: ItineraryDraft;
}

function readDraft(): ListingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ListingDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<ListingDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readDraft(), ...patch })
    );
  } catch {
    // sessionStorage unavailable (private browsing / quota) — the in-memory
    // React state for this session still works, it just won't survive a
    // navigation away and back.
  }
}

export function getServicesDraft(): ServicesDraft {
  const stored = readDraft().services;
  if (!stored) return DEFAULT_SERVICES_DRAFT;
  // The vehicle section's shape changed (single `selection` → `vehicles`/
  // `pending` arrays, to support combinations). A draft written by the
  // older shape — or anything else malformed — must not crash the app;
  // fall back to a clean vehicle section rather than trusting raw JSON.
  const vehicle =
    stored.vehicle && Array.isArray(stored.vehicle.vehicles) && Array.isArray(stored.vehicle.pending)
      ? stored.vehicle
      : DEFAULT_SERVICES_DRAFT.vehicle;
  // Same guard for hotel: the old shape was a single `selection`, the new
  // shape is a per-destination `stays` array plus a `pending` slot.
  const hotel =
    stored.hotel && Array.isArray(stored.hotel.stays)
      ? stored.hotel
      : DEFAULT_SERVICES_DRAFT.hotel;
  // Same guard for restaurant: the old shape was a single `selection`, the
  // new shape is a per-(day, meal) `meals` array.
  const restaurant =
    stored.restaurant && Array.isArray(stored.restaurant.meals)
      ? stored.restaurant
      : DEFAULT_SERVICES_DRAFT.restaurant;
  // Same guard for activities: the old shape was a flat `selections` list,
  // the new shape is per-destination `destinations`.
  const activities =
    stored.activities && Array.isArray(stored.activities.destinations)
      ? stored.activities
      : DEFAULT_SERVICES_DRAFT.activities;
  return { ...DEFAULT_SERVICES_DRAFT, ...stored, vehicle, hotel, restaurant, activities };
}

export function saveServicesDraft(services: ServicesDraft) {
  writeDraft({ services });
}

export function getBasicsSummary(): BasicsSummary | null {
  return readDraft().basics ?? null;
}

export function saveBasicsSummary(basics: BasicsSummary) {
  writeDraft({ basics });
}

export function getDestinationsSummary(): DestinationsSummary | null {
  const stored = readDraft().destinationsSummary;
  if (!stored) return null;
  // Older drafts predate `stops` — default it rather than trusting raw JSON.
  return { ...stored, stops: stored.stops ?? [] };
}

export function saveDestinationsSummary(destinationsSummary: DestinationsSummary) {
  writeDraft({ destinationsSummary });
}

export function getItineraryDraft(): ItineraryDraft {
  const stored = readDraft().itinerary;
  if (!stored || !Array.isArray(stored.days)) return DEFAULT_ITINERARY_DRAFT;
  return { ...DEFAULT_ITINERARY_DRAFT, ...stored };
}

export function saveItineraryDraft(itinerary: ItineraryDraft) {
  writeDraft({ itinerary });
}
