"use client";

/**
 * Standalone Activity Booking — temporary frontend state (mock).
 *
 * Deliberately separate from Trip Builder's lib/listing-draft.ts and
 * TripContext, and from the Hotel/Vehicle/Restaurant standalone draft
 * modules — its own sessionStorage-backed draft under its own keys, scoped
 * only to the "Book a single service → Activity" flow. Mirrors the
 * established Hotel/Vehicle/Restaurant state-module conventions exactly.
 */

import type { ActivitySearchCriteria, GuestDetails, MockActivityBooking, MockPaymentMethod } from "./activity-booking-api";

const DRAFT_KEY = "tripconsole:activity-booking-draft";
const BOOKINGS_KEY = "tripconsole:activity-bookings-mock";

export interface ActivityBookingDraft {
  search?: ActivitySearchCriteria & { destinationLabel: string };
  selectedActivityId?: string;
  selectedDate?: string;
  selectedTime?: string;
  /** ticketTypeId -> quantity. The single source of truth for both
   *  participant count and pricing. */
  ticketQuantities?: Record<string, number>;
  guestDetails?: GuestDetails;
  paymentMethod?: MockPaymentMethod;
  lastBookingReference?: string;
}

function readDraft(): ActivityBookingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ActivityBookingDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<ActivityBookingDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...readDraft(), ...patch }));
  } catch {
    // sessionStorage unavailable — the flow still works within the current
    // render, it just won't survive a navigation away and back.
  }
}

export function getActivityBookingDraft(): ActivityBookingDraft {
  return readDraft();
}

export function saveActivitySearchCriteria(search: ActivityBookingDraft["search"]) {
  writeDraft({ search, selectedActivityId: undefined, selectedDate: undefined, selectedTime: undefined, ticketQuantities: undefined });
}

export function saveActivitySelection(activityId: string) {
  writeDraft({ selectedActivityId: activityId, selectedDate: undefined, selectedTime: undefined, ticketQuantities: undefined });
}

export function saveActivityDate(date: string) {
  // Changing the date invalidates whatever time was picked under the
  // previous date — the caller re-validates/reselects a time for the new
  // date rather than silently keeping a slot that may no longer apply.
  writeDraft({ selectedDate: date, selectedTime: undefined });
}

export function saveActivityTime(time: string) {
  writeDraft({ selectedTime: time });
}

export function saveTicketQuantities(ticketQuantities: Record<string, number>) {
  writeDraft({ ticketQuantities });
}

export function saveActivityGuestDetails(guestDetails: GuestDetails) {
  writeDraft({ guestDetails });
}

export function saveActivityPaymentMethod(paymentMethod: MockPaymentMethod) {
  writeDraft({ paymentMethod });
}

export function clearActivityBookingDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// Confirmed mock bookings — retrievable for the rest of the session,
// independently of whatever the current in-progress draft is. Starting a
// new Activity search/selection only ever touches DRAFT_KEY above, never
// this store, so an earlier confirmed booking is never overwritten.
// ─────────────────────────────────────────────────────────────

function readAllBookings(): Record<string, MockActivityBooking> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockActivityBooking>) : {};
  } catch {
    return {};
  }
}

export function saveMockActivityBooking(booking: MockActivityBooking) {
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

export function getMockActivityBooking(bookingReference: string): MockActivityBooking | null {
  return readAllBookings()[bookingReference] ?? null;
}
