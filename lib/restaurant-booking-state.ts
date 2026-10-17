"use client";

/**
 * Standalone Restaurant Booking — temporary frontend state (mock).
 *
 * Deliberately separate from lib/listing-draft.ts (Trip Builder) and from
 * TripContext — its own sessionStorage-backed draft, scoped only to the
 * "Book a single service → Restaurant" flow. Mirrors the Hotel/Vehicle
 * standalone state modules' conventions exactly.
 */

import type { ContactDetails, GuestDishSelection, MockPaymentMethod, MockRestaurantBooking, RestaurantSearchCriteria } from "./restaurant-booking-api";

const DRAFT_KEY = "tripconsole:restaurant-booking-draft";
const BOOKINGS_KEY = "tripconsole:restaurant-bookings-mock";

export interface RestaurantBookingDraft {
  search?: RestaurantSearchCriteria & { destinationLabel: string };
  selectedRestaurantId?: string;
  /** Ordered, length === search.guestCount once guest identification
   *  begins. A slot is `null` until that guest has given their name. */
  guestNames?: (string | null)[];
  /** One entry per guest once they've picked their dish — the single
   *  source of truth for the order (see calculateOrderPrice). */
  guestSelections?: GuestDishSelection[];
  contact?: ContactDetails;
  paymentMethod?: MockPaymentMethod;
  lastBookingReference?: string;
}

function readDraft(): RestaurantBookingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as RestaurantBookingDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<RestaurantBookingDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...readDraft(), ...patch }));
  } catch {
    // sessionStorage unavailable — the flow still works within the current
    // render, it just won't survive a navigation away and back.
  }
}

export function getRestaurantBookingDraft(): RestaurantBookingDraft {
  return readDraft();
}

export function saveRestaurantSearchCriteria(search: RestaurantBookingDraft["search"]) {
  writeDraft({ search, selectedRestaurantId: undefined, guestNames: undefined, guestSelections: undefined });
}

export function saveRestaurantSelection(restaurantId: string) {
  const guestCount = readDraft().search?.guestCount ?? 1;
  writeDraft({ selectedRestaurantId: restaurantId, guestNames: new Array(guestCount).fill(null), guestSelections: [] });
}

export function saveGuestName(index: number, name: string) {
  const current = readDraft();
  const names = [...(current.guestNames ?? [])];
  names[index] = name;
  writeDraft({ guestNames: names });
}

export function saveGuestDishSelection(selection: GuestDishSelection) {
  const current = readDraft();
  const selections = (current.guestSelections ?? []).filter((s) => s.guestId !== selection.guestId);
  selections.push(selection);
  writeDraft({ guestSelections: selections });
}

/** The first guest index that still needs a name and/or a dish pick, or
 *  `guestCount` once every guest has finished both. Used to guard direct
 *  navigation into the guest-identification/guest-dish-selection loop so a
 *  stale or hand-typed URL can never skip ahead of where the draft
 *  actually is. */
export function getNextIncompleteGuestIndex(draft: RestaurantBookingDraft): number {
  const guestCount = draft.search?.guestCount ?? 0;
  const names = draft.guestNames ?? [];
  const selections = draft.guestSelections ?? [];
  for (let i = 0; i < guestCount; i++) {
    const hasName = Boolean(names[i]);
    const hasDish = selections.some((s) => s.guestId === `guest-${i}`);
    if (!hasName || !hasDish) return i;
  }
  return guestCount;
}

export function saveContactDetails(contact: ContactDetails) {
  writeDraft({ contact });
}

export function saveRestaurantPaymentMethod(paymentMethod: MockPaymentMethod) {
  writeDraft({ paymentMethod });
}

export function clearRestaurantBookingDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// Confirmed mock bookings — retrievable for the rest of the session.
// ─────────────────────────────────────────────────────────────

function readAllBookings(): Record<string, MockRestaurantBooking> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockRestaurantBooking>) : {};
  } catch {
    return {};
  }
}

export function saveMockRestaurantBooking(booking: MockRestaurantBooking) {
  if (typeof window === "undefined") return;
  try {
    const all = readAllBookings();
    all[booking.bookingReference] = booking;
    window.sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    writeDraft({ lastBookingReference: booking.bookingReference });
  } catch {
    // ignore — the in-memory flow still completes for this render
  }
}

export function getMockRestaurantBooking(bookingReference: string): MockRestaurantBooking | null {
  return readAllBookings()[bookingReference] ?? null;
}
