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

import type { TripStatus } from "./mock-trips";

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

export type BasicsTripType = "school" | "college" | "group" | "individual";

export interface BasicsSummary {
  tripName: string;
  tripType?: BasicsTripType;
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

// ---------------------------------------------------------------------
// Post-submission / trip operations — the trip's lifecycle state once it
// leaves the builder. Reuses `TripStatus` from mock-trips.ts (the
// dashboard's existing vocabulary: draft/submitted/verified/paid/complete)
// rather than inventing a second, parallel status enum.
// ---------------------------------------------------------------------

export type PassengerRegistrationStatus = "not_started" | "open" | "in_progress" | "complete";
export type TravelerRegistrationStatus = "invited" | "submitted" | "needs_correction" | "verified";
export type TravelerSource = "link" | "import" | "manual";
export type TravelerType = "student" | "staff" | "traveler";
export type IdDocumentType = "passport" | "aadhaar" | "school_id" | "driving_license" | "other";
export type RegistrationAccess = "anyone_with_link" | "invited_only";
export type AdminReviewStatus = "pending" | "in_review" | "approved" | "needs_changes";
export type OperatorAssignmentStatus = "pending" | "assigned" | "confirmed";
/** A configured service (hotel/meals/activities) still needs its own
 *  operator/property to confirm the booking — separate from admin
 *  verification and from payment. A service that was never configured is
 *  not tracked here at all (there's nothing to confirm). */
export type ServiceBookingStatus = "pending" | "confirmed";

export interface Traveler {
  id: string;
  name: string;
  travelerType: TravelerType;
  idType: IdDocumentType | null;
  idNumber: string | null;
  phone: string | null;
  /** True once a photo/ID document has been attached — this app never
   *  stores or transmits real identity images, only tracks the fact. */
  hasIdPhoto: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  source: TravelerSource;
  registrationStatus: TravelerRegistrationStatus;
  correctionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PassengerManagement {
  registrationStatus: PassengerRegistrationStatus;
  registrationLinkToken: string | null;
  registrationAccess: RegistrationAccess;
  remindedAt: string | null;
  travelers: Traveler[];
}

/** Transport operator assignment stays here (it's an operational booking
 *  step, distinct from admin verification and from payment). Hotel/meal/
 *  activity booking confirmation live alongside it — each only meaningful
 *  when that service was actually configured. */
export interface TripOperations {
  operatorAssignment: { status: OperatorAssignmentStatus };
  hotelBooking: { status: ServiceBookingStatus };
  mealsBooking: { status: ServiceBookingStatus };
  activitiesBooking: { status: ServiceBookingStatus };
}

/** The service-by-service cost totals a snapshot freezes — same shape the
 *  live pricing engine produces, so a snapshot is never a re-derived or
 *  independently-shaped number. */
export interface TripCostSnapshot {
  vehicle: number;
  hotel: number;
  dining: number;
  activities: number;
  total: number;
}

export type CostSnapshotState = "current" | "superseded";

/** One frozen financial record. Submitting the trip creates version 1;
 *  editing a service afterward never mutates it in place — it creates a
 *  new version and marks the old one superseded, preserving an audit
 *  trail and forcing re-verification before payment can use the new
 *  number. */
export interface CostSnapshot {
  id: string;
  version: number;
  createdAt: string;
  items: TripCostSnapshot;
  contingency: number;
  taxes: number;
  discounts: number;
  total: number;
  totalTravelerCount: number;
  pricingParticipantCount: number;
  state: CostSnapshotState;
}

/** Admin verification of the current cost snapshot. Distinct from trip
 *  submission (SUBMITTED) and from payment — a trip can be submitted with
 *  a locked snapshot and still be `pending` verification. */
export interface TripVerification {
  status: AdminReviewStatus;
  reviewedAt: string | null;
  notes: string | null;
  /** Which service the reviewer flagged, so "Review & Fix" can route
   *  straight to the relevant flow instead of a generic message. */
  affectedSection: "vehicle" | "hotel" | "restaurant" | "activities" | "passengers" | null;
  /** The snapshot this verdict applies to — a later snapshot always needs
   *  its own review, never inherits an old approval. */
  snapshotId: string | null;
}

export type PaymentStatus = "locked" | "unlocked" | "pending" | "partially_paid" | "paid" | "failed";
export type PaymentPlanType = "full" | "advance_balance";
export type PaymentMethod = "card" | "upi" | "netbanking";
export type PaymentAttemptStatus = "processing" | "succeeded" | "failed" | "pending";
export type PaymentAttemptType = "full" | "advance" | "balance";

/** Fixed the moment the organizer chooses it, against one specific
 *  approved snapshot. A later snapshot (a service changed and was
 *  re-verified) always needs a fresh plan — this one is never reused or
 *  recalculated against a new total; see `isPaymentPlanStale`. */
export interface PaymentPlan {
  id: string;
  type: PaymentPlanType;
  snapshotId: string;
  advancePercentage: number;
  advanceAmount: number;
  balanceAmount: number;
  balanceDueDate: string | null;
}

/** One payment transaction attempt — an append-only ledger entry. A failed
 *  attempt is never deleted or overwritten; retrying creates a new entry.
 *  `totalPaid` (see trip-operations.ts) only ever sums `succeeded`
 *  entries, so a failed or still-processing attempt never counts toward
 *  the balance. */
export interface PaymentAttempt {
  id: string;
  snapshotId: string;
  paymentPlanId: string;
  type: PaymentAttemptType;
  amount: number;
  method: PaymentMethod;
  methodLabel: string;
  status: PaymentAttemptStatus;
  transactionId: string | null;
  createdAt: string;
}

/** Payment has no persisted `status`/`amountPaid`/`remainingBalance` of
 *  its own — those are always derived from `attempts` against the current
 *  approved snapshot (see `derivePaymentStatus`, `totalPaidAmount` in
 *  trip-operations.ts), so there is exactly one formula for "how much has
 *  been paid" anywhere in the app. */
export interface PaymentRecord {
  plan: PaymentPlan | null;
  attempts: PaymentAttempt[];
}

export type NotificationType = "payment" | "verification" | "booking" | "itinerary" | "reminder" | "system";
export type NotificationSeverity = "info" | "success" | "warning" | "action_required";

/** Generated only at real state-transition points (payment succeeded,
 *  verification decided, a booking confirmed) — never a decorative or
 *  invented entry. */
export interface TripNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionHref: string | null;
}

export interface TripRecord {
  id: string;
  reference: string | null;
  status: TripStatus;
  submittedAt: string | null;
  /** Every snapshot ever created for this trip, oldest first — the last
   *  entry is always the current one. Never mutate an existing entry. */
  costSnapshots: CostSnapshot[];
  verification: TripVerification;
  payment: PaymentRecord;
  passengerManagement: PassengerManagement;
  operations: TripOperations;
  notifications: TripNotification[];
}

export function defaultTripRecord(id: string): TripRecord {
  return {
    id,
    reference: null,
    status: "draft",
    submittedAt: null,
    costSnapshots: [],
    verification: {
      status: "pending",
      reviewedAt: null,
      notes: null,
      affectedSection: null,
      snapshotId: null,
    },
    payment: {
      plan: null,
      attempts: [],
    },
    passengerManagement: {
      registrationStatus: "not_started",
      registrationLinkToken: null,
      registrationAccess: "anyone_with_link",
      remindedAt: null,
      travelers: [],
    },
    operations: {
      operatorAssignment: { status: "pending" },
      hotelBooking: { status: "pending" },
      mealsBooking: { status: "pending" },
      activitiesBooking: { status: "pending" },
    },
    notifications: [],
  };
}

// ---------------------------------------------------------------------
// Trip mode — pilgrimage is a specialized mode of the same trip/listing
// model, not a separate application. `entryMethod` records how the trip
// was started (kept for context; it never changes what data model is
// used downstream).
// ---------------------------------------------------------------------

export type TripMode = "standard" | "pilgrimage";
export type TripEntryMethod = "scratch" | "template" | "scheduled";

export interface TripModeInfo {
  mode: TripMode;
  entryMethod: TripEntryMethod | null;
  /** Set only when entryMethod is "template" — which template (and which
   *  version of it) this listing was instantiated from. The template
   *  itself is never mutated; this is a reference/snapshot pointer only.
   *  A listing already instantiated from a template is never re-copied
   *  from it again just because the organizer revisits Basics. */
  sourceTemplateId?: string | null;
  sourceTemplateVersion?: number | null;
  /** True while a template-derived listing is still in its consolidated
   *  "Template-Based Review" experience — every workflow's own terminal
   *  "done" action (Basics submit, Destinations' Next, the Transport/
   *  Hotel/Meals/Itinerary confirm steps) checks this and returns to that
   *  review screen instead of continuing the linear Start-from-Scratch
   *  wizard. Cleared once the organizer explicitly continues from there
   *  to Final Review, at which point further edits behave normally. */
  reviewReturnActive?: boolean;
}

const DEFAULT_TRIP_MODE: TripModeInfo = {
  mode: "standard",
  entryMethod: null,
  sourceTemplateId: null,
  sourceTemplateVersion: null,
  reviewReturnActive: false,
};

interface ListingDraft {
  services?: ServicesDraft;
  basics?: BasicsSummary;
  destinationsSummary?: DestinationsSummary;
  itinerary?: ItineraryDraft;
  trip?: TripRecord;
  tripMode?: TripModeInfo;
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

export function generateTripId() {
  return `trip_${Math.random().toString(36).slice(2, 10)}`;
}

/** Lazily creates the trip record on first access and persists it
 *  immediately, so the same `id` is established once and reused by every
 *  screen from that point on — Review, Submit, and every Operations/
 *  Passenger route read this same record, never a fresh one. */
/** Migrates a draft written before cost-snapshot versioning / verification /
 *  the payment ledger / notifications existed, so a trip already in
 *  progress in someone's browser isn't silently reset. Handles two prior
 *  shapes: the oldest (a single `costSnapshot` object, `operations.
 *  adminReview`, no ledger) and the intermediate one (versioned snapshots
 *  and `verification` already present, but `payment` was a flat
 *  status/amountPaid record instead of an attempts ledger). Loosely typed
 *  on purpose — this function's entire job is reading shapes that no
 *  longer match the current types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateTripRecord(stored: any): TripRecord {
  const isCurrentShape =
    Array.isArray(stored.costSnapshots) &&
    stored.verification &&
    stored.payment &&
    Array.isArray(stored.payment.attempts) &&
    Array.isArray(stored.notifications) &&
    !("adminReview" in (stored.operations ?? {}));
  if (isCurrentShape) return stored as TripRecord;

  const fresh = defaultTripRecord(stored.id);
  const basics = readDraft().basics;
  const totalTravelerCount = basics?.participantCount ?? 0;
  const pricingCount =
    basics?.participantBreakdown && basics.participantBreakdown.length > 0
      ? basics.participantBreakdown.filter((e: ParticipantBreakdownEntry) => e.label.toLowerCase() !== "staff").reduce((sum: number, e: ParticipantBreakdownEntry) => sum + e.count, 0) ||
        totalTravelerCount
      : totalTravelerCount;

  let costSnapshots: CostSnapshot[];
  if (Array.isArray(stored.costSnapshots) && stored.costSnapshots.length > 0) {
    costSnapshots = stored.costSnapshots;
  } else if (stored.costSnapshot) {
    const legacySnapshot = stored.costSnapshot as TripCostSnapshot;
    costSnapshots = [
      {
        id: `snap_${Math.random().toString(36).slice(2, 10)}`,
        version: 1,
        createdAt: stored.submittedAt ?? new Date().toISOString(),
        items: legacySnapshot,
        contingency: 0,
        taxes: 0,
        discounts: 0,
        total: legacySnapshot.total,
        totalTravelerCount,
        pricingParticipantCount: pricingCount,
        state: "current",
      },
    ];
  } else {
    costSnapshots = [];
  }
  const latestSnapshot = costSnapshots.length > 0 ? costSnapshots[costSnapshots.length - 1] : null;

  const verification: TripVerification =
    stored.verification && typeof stored.verification === "object"
      ? stored.verification
      : { ...fresh.verification, status: stored.operations?.adminReview?.status ?? "pending", snapshotId: latestSnapshot?.id ?? null };

  let payment: PaymentRecord;
  if (stored.payment && Array.isArray(stored.payment.attempts)) {
    payment = stored.payment;
  } else {
    const legacyPayment = stored.payment as { plan?: PaymentPlanType | null; amountPaid?: number; reference?: string | null; snapshotId?: string | null } | undefined;
    const attempts: PaymentAttempt[] = [];
    if (legacyPayment?.amountPaid && legacyPayment.amountPaid > 0 && latestSnapshot) {
      attempts.push({
        id: `pay_${Math.random().toString(36).slice(2, 10)}`,
        snapshotId: legacyPayment.snapshotId ?? latestSnapshot.id,
        paymentPlanId: "migrated",
        type: legacyPayment.plan === "advance_balance" ? "advance" : "full",
        amount: legacyPayment.amountPaid,
        method: "card",
        methodLabel: "Previously recorded payment",
        status: "succeeded",
        transactionId: legacyPayment.reference ?? null,
        createdAt: stored.submittedAt ?? new Date().toISOString(),
      });
    }
    payment = { plan: null, attempts };
  }

  const notifications: TripNotification[] = Array.isArray(stored.notifications) ? stored.notifications : [];

  return {
    ...fresh,
    reference: stored.reference,
    status: stored.status,
    submittedAt: stored.submittedAt,
    costSnapshots,
    verification,
    payment,
    passengerManagement: stored.passengerManagement ?? fresh.passengerManagement,
    operations: {
      operatorAssignment: stored.operations?.operatorAssignment ?? fresh.operations.operatorAssignment,
      hotelBooking: stored.operations?.hotelBooking ?? fresh.operations.hotelBooking,
      mealsBooking: stored.operations?.mealsBooking ?? fresh.operations.mealsBooking,
      activitiesBooking: stored.operations?.activitiesBooking ?? fresh.operations.activitiesBooking,
    },
    notifications,
  };
}

export function getTripRecord(): TripRecord {
  const stored = readDraft().trip;
  if (stored && typeof stored.id === "string") {
    const migrated = migrateTripRecord(stored);
    if (migrated !== stored) writeDraft({ trip: migrated });
    return migrated;
  }
  const created = defaultTripRecord(generateTripId());
  writeDraft({ trip: created });
  return created;
}

export function saveTripRecord(trip: TripRecord) {
  writeDraft({ trip });
}

export function getTripMode(): TripModeInfo {
  const stored = readDraft().tripMode;
  if (!stored || (stored.mode !== "standard" && stored.mode !== "pilgrimage")) {
    return DEFAULT_TRIP_MODE;
  }
  return stored;
}

export function saveTripMode(info: TripModeInfo) {
  writeDraft({ tripMode: info });
}

/** The one place every workflow's terminal "done" action asks "where do I
 *  go now?" — while a template-derived listing is still in its
 *  consolidated review, every one of them (Basics, Destinations, the
 *  Transport/Hotel/Meals confirm steps, the itinerary review step) comes
 *  back to `/trips/create/template-review` instead of continuing its own
 *  hardcoded next step in the linear wizard. Once the organizer leaves
 *  that review (via "Continue to Final Review"), this reverts to the
 *  `fallback` every caller already had. */
export function getReviewReturnHref(fallback: string, templateId?: string | null): string {
  if (!getTripMode().reviewReturnActive) return fallback;
  const id = templateId ?? getTripMode().sourceTemplateId;
  return `/trips/create/template-review${id ? `?template=${id}` : ""}`;
}

/** Ends the consolidated review — called once, when the organizer
 *  explicitly continues from Template Review to Final Review. Further
 *  edits from that point behave like any other trip's. */
export function exitReviewReturn() {
  const current = getTripMode();
  if (!current.reviewReturnActive) return;
  saveTripMode({ ...current, reviewReturnActive: false });
}
