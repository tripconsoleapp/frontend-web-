/**
 * Standalone Activity Booking — mock repository/API layer.
 *
 * Every exported function here is a MOCK implementation backed by
 * lib/activity-booking-data.ts. Pages must only ever import from this
 * module, never from activity-booking-data.ts directly — mirrors the
 * Hotel/Vehicle/Restaurant standalone flows' convention so a future
 * real-backend swap touches one file, not every screen.
 */

import {
  ACTIVITY_DESTINATIONS,
  ACTIVITIES,
  getActivitiesForDestination,
  getPopularActivities,
  getActivity,
  getSlotRemaining,
  isDateFullyUnavailable,
  type Activity,
  type ActivityCategory,
} from "./activity-booking-data";

export const ACTIVITY_BOOKING_IS_MOCK = true as const;

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────

export interface ActivitySearchCriteria {
  destinationId: string;
  activityDate: string; // ISO yyyy-mm-dd
  adults: number;
  children: number;
  category?: ActivityCategory;
}

function simulateLatency<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listActivityDestinations() {
  return ACTIVITY_DESTINATIONS;
}

export async function searchPopularActivities(destinationId: string): Promise<Activity[]> {
  return simulateLatency(getPopularActivities(destinationId), 450);
}

export type ActivitySortKey = "recommended" | "rating" | "price_low" | "duration";

export interface ActivitySearchFilters {
  search?: string;
  category?: ActivityCategory;
  minRating?: number;
}

function fromPrice(activity: Activity): number {
  return Math.min(...activity.ticketTypes.map((t) => t.price));
}

export async function searchActivities(
  destinationId: string,
  filters: ActivitySearchFilters = {},
  sort: ActivitySortKey = "recommended"
): Promise<Activity[]> {
  let results = getActivitiesForDestination(destinationId);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((a) => `${a.name} ${a.category} ${a.location}`.toLowerCase().includes(q));
  }
  if (filters.category) {
    results = results.filter((a) => a.category === filters.category);
  }
  if (filters.minRating) {
    results = results.filter((a) => a.rating >= filters.minRating!);
  }

  switch (sort) {
    case "rating":
      results = [...results].sort((a, b) => b.rating - a.rating);
      break;
    case "price_low":
      results = [...results].sort((a, b) => fromPrice(a) - fromPrice(b));
      break;
    case "duration":
      results = [...results].sort((a, b) => a.durationHours - b.durationHours);
      break;
    case "recommended":
    default:
      results = [...results].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  }

  return simulateLatency(results, 500);
}

export async function getActivityDetails(activityId: string): Promise<Activity | null> {
  return simulateLatency(getActivity(activityId), 350);
}

export function listAllActivities() {
  return ACTIVITIES;
}

// ─────────────────────────────────────────────────────────────
// Date / time-slot availability — re-exported so pages never need to
// import lib/activity-booking-data.ts directly (same rule as the catalog
// lookups above).
// ─────────────────────────────────────────────────────────────

export { getSlotRemaining, isDateFullyUnavailable };

// ─────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────

export interface PriceLineItem {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  lineItems: PriceLineItem[];
  subtotal: number;
  taxes: number;
  mandatoryFees: number;
  discount: number;
  totalAmount: number;
}

// Mock assumptions, documented here as the single source of truth used by
// Review/Payment/Success/Voucher alike:
const GST_RATE = 0.18; // 18% GST slab for recreational/adventure activity services
const BOOKING_FEE_RATE = 0.03; // flat 3% mock booking/convenience fee

export function calculateActivityPrice(activity: Activity, ticketQuantities: Record<string, number>, discount = 0): PriceBreakdown {
  const lineItems: PriceLineItem[] = activity.ticketTypes
    .filter((t) => (ticketQuantities[t.id] ?? 0) > 0)
    .map((t) => ({ label: `${t.label} x${ticketQuantities[t.id]}`, amount: t.price * ticketQuantities[t.id] }));
  const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const taxes = Math.round(subtotal * GST_RATE);
  const mandatoryFees = Math.round(subtotal * BOOKING_FEE_RATE);
  const totalAmount = Math.max(0, subtotal + taxes + mandatoryFees - discount);
  return { lineItems, subtotal, taxes, mandatoryFees, discount, totalAmount };
}

export function totalParticipants(ticketQuantities: Record<string, number>): number {
  return Object.values(ticketQuantities).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
}

// ─────────────────────────────────────────────────────────────
// Booking + payment (mock)
// ─────────────────────────────────────────────────────────────

export type MockPaymentMethod = "upi" | "card" | "netbanking";
export type MockBookingStatus = "PENDING" | "CONFIRMED" | "PAYMENT_FAILED" | "CANCELLED";

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface MockActivityBooking {
  isMock: true;
  bookingReference: string;
  status: MockBookingStatus;
  createdAt: string;
  activityId: string;
  activityName: string;
  activityLocation: string;
  meetingPoint: string;
  destinationId: string;
  destinationLabel: string;
  date: string;
  time: string;
  durationHours: number;
  ticketBreakdown: { ticketTypeId: string; label: string; price: number; quantity: number }[];
  participants: number;
  guest: GuestDetails;
  pricing: PriceBreakdown;
  paymentMethod: MockPaymentMethod;
}

function generateBookingReference(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TC-ACT-${suffix}`;
}

/**
 * Simulates a booking-confirmation + payment round trip. `forceFailure`
 * exists purely so the Payment screen's failure state is reachable in
 * testing — mirrors the identical convention in hotel-booking-api.ts,
 * vehicle-booking-api.ts and restaurant-booking-api.ts.
 */
export async function createMockBooking(
  input: Omit<MockActivityBooking, "isMock" | "bookingReference" | "status" | "createdAt">,
  options: { forceFailure?: boolean } = {}
): Promise<MockActivityBooking> {
  await simulateLatency(null, 1300);

  if (options.forceFailure) {
    return { ...input, isMock: true, bookingReference: generateBookingReference(), status: "PAYMENT_FAILED", createdAt: new Date().toISOString() };
  }

  return { ...input, isMock: true, bookingReference: generateBookingReference(), status: "CONFIRMED", createdAt: new Date().toISOString() };
}
