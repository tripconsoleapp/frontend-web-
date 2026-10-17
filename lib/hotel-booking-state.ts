"use client";

/**
 * Standalone Hotel Booking — temporary frontend state (Phase 1, mock).
 *
 * Deliberately separate from lib/listing-draft.ts (Trip Builder) and from
 * TripContext — this is its own sessionStorage-backed draft, scoped only
 * to the "Book a single service → Hotel" flow. A confirmed MockBooking is
 * also written here for now (Phase 1 has no backend to be authoritative
 * instead); once the real Booking API exists, confirmed bookings should
 * be fetched from there and this module should keep only the in-progress
 * search/selection draft — see the module-level comment in
 * hotel-booking-api.ts.
 */

import type { GuestDetails, HotelSearchCriteria, MockBooking, MockPaymentMethod } from "./hotel-booking-api";

const DRAFT_KEY = "tripconsole:hotel-booking-draft";
const BOOKINGS_KEY = "tripconsole:hotel-bookings-mock";

export interface HotelBookingDraft {
  search?: HotelSearchCriteria & { destinationLabel: string };
  selectedHotelId?: string;
  selectedRoomId?: string;
  guestDetails?: GuestDetails;
  paymentMethod?: MockPaymentMethod;
  lastBookingReference?: string;
}

function readDraft(): HotelBookingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as HotelBookingDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<HotelBookingDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...readDraft(), ...patch }));
  } catch {
    // sessionStorage unavailable (private browsing / quota) — the flow
    // still works within the current render, it just won't survive a
    // navigation away and back.
  }
}

export function getHotelBookingDraft(): HotelBookingDraft {
  return readDraft();
}

export function saveSearchCriteria(search: HotelBookingDraft["search"]) {
  writeDraft({ search, selectedHotelId: undefined, selectedRoomId: undefined });
}

export function saveHotelSelection(hotelId: string) {
  writeDraft({ selectedHotelId: hotelId, selectedRoomId: undefined });
}

export function saveRoomSelection(roomId: string) {
  writeDraft({ selectedRoomId: roomId });
}

export function saveGuestDetails(guestDetails: GuestDetails) {
  writeDraft({ guestDetails });
}

export function savePaymentMethod(paymentMethod: MockPaymentMethod) {
  writeDraft({ paymentMethod });
}

export function clearHotelBookingDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// Confirmed mock bookings — retrievable for the rest of the session.
// Keyed by bookingReference so more than one can exist per session.
// ─────────────────────────────────────────────────────────────

function readAllBookings(): Record<string, MockBooking> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockBooking>) : {};
  } catch {
    return {};
  }
}

export function saveMockBooking(booking: MockBooking) {
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

export function getMockBooking(bookingReference: string): MockBooking | null {
  return readAllBookings()[bookingReference] ?? null;
}

export function listMockBookings(): MockBooking[] {
  return Object.values(readAllBookings()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
