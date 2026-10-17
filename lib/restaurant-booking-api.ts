/**
 * Standalone Restaurant Booking — mock repository/API layer.
 *
 * Every exported function here is a MOCK implementation backed by
 * lib/restaurant-booking-data.ts. Pages must only ever import from this
 * module, never from restaurant-booking-data.ts directly — mirrors the
 * Hotel/Vehicle standalone flows' convention so a future real-backend swap
 * touches one file, not every screen.
 */

import {
  RESTAURANT_DESTINATIONS,
  MOCK_RESTAURANTS,
  getRestaurant,
  getRestaurantsForDestination,
  getPopularRestaurants,
  type Restaurant,
} from "./restaurant-booking-data";

export const RESTAURANT_BOOKING_IS_MOCK = true as const;

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────

export interface RestaurantSearchCriteria {
  destinationId: string;
  reservationDate: string; // ISO yyyy-mm-dd
  reservationTime: string; // HH:mm
  guestCount: number;
}

function simulateLatency<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listRestaurantDestinations() {
  return RESTAURANT_DESTINATIONS;
}

export async function searchPopularRestaurants(destinationId: string): Promise<Restaurant[]> {
  const popular = getPopularRestaurants(destinationId);
  const list = popular.length > 0 ? popular : getRestaurantsForDestination(destinationId).slice(0, 3);
  return simulateLatency(list, 450);
}

export type RestaurantSortKey = "recommended" | "rating" | "price_low" | "distance";

export interface RestaurantSearchFilters {
  search?: string;
  diet?: "any" | "veg" | "veg-and-non-veg";
  minRating?: number;
  cuisines?: string[];
}

const PRICE_RANK: Record<string, number> = { "₹": 1, "₹₹": 2, "₹₹₹": 3 };

export async function searchRestaurants(
  destinationId: string,
  filters: RestaurantSearchFilters = {},
  sort: RestaurantSortKey = "recommended"
): Promise<Restaurant[]> {
  let results = getRestaurantsForDestination(destinationId);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((r) => `${r.name} ${r.cuisine} ${r.locationLabel}`.toLowerCase().includes(q));
  }
  if (filters.diet && filters.diet !== "any") {
    results = results.filter((r) => r.dietType === filters.diet);
  }
  if (filters.minRating) {
    results = results.filter((r) => r.rating >= filters.minRating!);
  }
  if (filters.cuisines && filters.cuisines.length > 0) {
    results = results.filter((r) => filters.cuisines!.includes(r.cuisine));
  }

  switch (sort) {
    case "rating":
      results = [...results].sort((a, b) => b.rating - a.rating);
      break;
    case "price_low":
      results = [...results].sort((a, b) => PRICE_RANK[a.priceTier] - PRICE_RANK[b.priceTier]);
      break;
    case "distance":
      results = [...results].sort((a, b) => a.distanceFromCenterKm - b.distanceFromCenterKm);
      break;
    case "recommended":
    default:
      results = [...results].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
  }

  return simulateLatency(results, 500);
}

export async function getRestaurantDetails(restaurantId: string): Promise<Restaurant | null> {
  return simulateLatency(getRestaurant(restaurantId), 350);
}

export function listAllRestaurants() {
  return MOCK_RESTAURANTS;
}

// ─────────────────────────────────────────────────────────────
// Guest dish selections → pricing
// ─────────────────────────────────────────────────────────────

export interface GuestDishSelection {
  guestId: string;
  guestName: string;
  dishId: string;
  dishName: string;
  price: number;
}

export interface OrderLine {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
}

/** Aggregates individual guest picks into one line per distinct dish —
 *  the quantity is how many guests chose it. This is the single source of
 *  truth for the order: nothing else (e.g. the menu-preview page) may add
 *  billable quantity. */
export function aggregateGuestSelections(selections: GuestDishSelection[]): OrderLine[] {
  const map = new Map<string, OrderLine>();
  for (const s of selections) {
    const existing = map.get(s.dishId);
    if (existing) existing.quantity += 1;
    else map.set(s.dishId, { dishId: s.dishId, dishName: s.dishName, price: s.price, quantity: 1 });
  }
  return Array.from(map.values());
}

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

const GST_RATE = 0.05; // 5% GST on restaurant food (standard non-AC/AC dine-in slab)
const SERVICE_CHARGE_RATE = 0.1;

export function calculateOrderPrice(selections: GuestDishSelection[], discount = 0): PriceBreakdown {
  const lines = aggregateGuestSelections(selections);
  const lineItems: PriceLineItem[] = lines.map((l) => ({
    label: `${l.dishName} x${l.quantity}`,
    amount: l.price * l.quantity,
  }));
  const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const taxes = Math.round(subtotal * GST_RATE);
  const mandatoryFees = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const totalAmount = Math.max(0, subtotal + taxes + mandatoryFees - discount);
  return { lineItems, subtotal, taxes, mandatoryFees, discount, totalAmount };
}

// ─────────────────────────────────────────────────────────────
// Booking + payment (mock)
// ─────────────────────────────────────────────────────────────

export type MockPaymentMethod = "upi" | "card" | "netbanking";
export type MockBookingStatus = "PENDING" | "CONFIRMED" | "PAYMENT_FAILED" | "CANCELLED";

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface ReservationSummary {
  destinationId: string;
  destinationLabel: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
}

export interface MockRestaurantBooking {
  isMock: true;
  bookingReference: string;
  status: MockBookingStatus;
  createdAt: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLocation: string;
  reservation: ReservationSummary;
  guestSelections: GuestDishSelection[];
  contact: ContactDetails;
  pricing: PriceBreakdown;
  paymentMethod: MockPaymentMethod;
}

function generateBookingReference(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TC-DINE-${suffix}`;
}

/**
 * Simulates a reservation-confirmation + payment round trip. `forceFailure`
 * exists purely so the Payment screen's failure state is reachable in
 * testing — mirrors the identical convention in hotel-booking-api.ts and
 * vehicle-booking-api.ts.
 */
export async function createMockBooking(
  input: Omit<MockRestaurantBooking, "isMock" | "bookingReference" | "status" | "createdAt">,
  options: { forceFailure?: boolean } = {}
): Promise<MockRestaurantBooking> {
  await simulateLatency(null, 1300);

  if (options.forceFailure) {
    return { ...input, isMock: true, bookingReference: generateBookingReference(), status: "PAYMENT_FAILED", createdAt: new Date().toISOString() };
  }

  return { ...input, isMock: true, bookingReference: generateBookingReference(), status: "CONFIRMED", createdAt: new Date().toISOString() };
}
