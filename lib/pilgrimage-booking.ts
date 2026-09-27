"use client";

/**
 * Booking state for joining a published pilgrimage departure. Deliberately
 * separate from `listingDraft`'s `TripRecord` — that model assumes an
 * organizer-built trip going through admin cost-verification before
 * payment unlocks, which doesn't apply here: a departure's price is
 * already fixed, and a participant is reserving seats and paying
 * immediately, not building a trip.
 *
 * Reuses the same payment-ledger shape and helpers as the organizer
 * payment flow (`PaymentMethod`, `generateTransactionId`, etc. from
 * lib/trip-operations.ts) rather than inventing a second payment model.
 */

import { IdDocumentType, PaymentMethod } from "./listing-draft";

const STORAGE_KEY = "tripconsole:pilgrimage-bookings";

export type ReservationStatus =
  | "reserved"
  | "payment_pending"
  | "payment_processing"
  | "confirmed"
  | "released"
  | "cancelled";

export interface BookingPassenger {
  id: string;
  fullName: string;
  age: string;
  gender: "male" | "female" | "other" | "";
  idType: IdDocumentType | "";
  idNumber: string;
}

export interface DeparturePaymentAttempt {
  id: string;
  amount: number;
  method: PaymentMethod;
  methodLabel: string;
  status: "processing" | "succeeded" | "failed";
  transactionId: string | null;
  createdAt: string;
}

export interface DepartureBooking {
  id: string;
  departureId: string;
  participantCount: number;
  pricePerPerson: number;
  amount: number;
  passengers: BookingPassenger[];
  contactPhone: string;
  reservationStatus: ReservationStatus;
  paymentAttempts: DeparturePaymentAttempt[];
  bookingReference: string | null;
  createdAt: string;
}

interface BookingStore {
  bookings: Record<string, DepartureBooking>;
  /** Which booking id is currently "in progress" for a given departure in
   *  this tab — lets each step page (participants → passengers → summary
   *  → payment) find its booking without threading an id through every
   *  URL, mirroring how the rest of the app reads the shared listingDraft. */
  activeByDeparture: Record<string, string>;
}

function readStore(): BookingStore {
  if (typeof window === "undefined") return { bookings: {}, activeByDeparture: {} };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookingStore) : { bookings: {}, activeByDeparture: {} };
  } catch {
    return { bookings: {}, activeByDeparture: {} };
  }
}

function writeStore(store: BookingStore) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage unavailable — booking simply won't survive navigation.
  }
}

function generateBookingId() {
  return `book_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateBookingReference() {
  const year = new Date().getFullYear();
  return `TC-PLG-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

/** Seats held by CONFIRMED bookings made in this session — added on top
 *  of the mock data's starting `bookedCount` so availability reflects
 *  what's actually happened, without needing a real backend. Seats still
 *  mid-checkout (reserved/payment_pending/processing) are intentionally
 *  excluded here and counted separately via `heldSeatsForDeparture`,
 *  since only a real reservation-expiry system should treat those as a
 *  hard hold against other participants. */
export function confirmedSeatsForDeparture(departureId: string, excludeBookingId?: string): number {
  const store = readStore();
  return Object.values(store.bookings)
    .filter((b) => b.departureId === departureId && b.reservationStatus === "confirmed" && b.id !== excludeBookingId)
    .reduce((sum, b) => sum + b.participantCount, 0);
}

/** Seats currently held by an in-progress checkout (this participant's
 *  own, mid-flow) — combined with confirmed seats to prevent a single
 *  session from re-entering the flow and double-counting availability
 *  against itself. */
export function heldSeatsForDeparture(departureId: string, excludeBookingId?: string): number {
  const store = readStore();
  return Object.values(store.bookings)
    .filter(
      (b) =>
        b.departureId === departureId &&
        b.id !== excludeBookingId &&
        (b.reservationStatus === "reserved" ||
          b.reservationStatus === "payment_pending" ||
          b.reservationStatus === "payment_processing")
    )
    .reduce((sum, b) => sum + b.participantCount, 0);
}

export function getActiveBookingId(departureId: string): string | null {
  return readStore().activeByDeparture[departureId] ?? null;
}

export function getBooking(bookingId: string): DepartureBooking | null {
  return readStore().bookings[bookingId] ?? null;
}

export function getActiveBooking(departureId: string): DepartureBooking | null {
  const id = getActiveBookingId(departureId);
  return id ? getBooking(id) : null;
}

function saveBooking(booking: DepartureBooking) {
  const store = readStore();
  store.bookings[booking.id] = booking;
  store.activeByDeparture[booking.departureId] = booking.id;
  writeStore(store);
}

/** Starts (or restarts) a reservation for a departure. Creating a new one
 *  for the same departure supersedes any prior in-progress booking for
 *  it — a participant changing their seat count starts a clean hold
 *  rather than leaving a stale one behind. */
export function createBooking(departureId: string, participantCount: number, pricePerPerson: number): DepartureBooking {
  const booking: DepartureBooking = {
    id: generateBookingId(),
    departureId,
    participantCount,
    pricePerPerson,
    amount: participantCount * pricePerPerson,
    passengers: [],
    contactPhone: "",
    reservationStatus: "reserved",
    paymentAttempts: [],
    bookingReference: null,
    createdAt: new Date().toISOString(),
  };
  saveBooking(booking);
  return booking;
}

export function updatePassengers(bookingId: string, passengers: BookingPassenger[], contactPhone: string) {
  const booking = getBooking(bookingId);
  if (!booking) return;
  saveBooking({ ...booking, passengers, contactPhone });
}

export function moveToPaymentPending(bookingId: string) {
  const booking = getBooking(bookingId);
  if (!booking) return;
  saveBooking({ ...booking, reservationStatus: "payment_pending" });
}

export function addPaymentAttempt(bookingId: string, attempt: DeparturePaymentAttempt) {
  const booking = getBooking(bookingId);
  if (!booking) return;
  saveBooking({
    ...booking,
    reservationStatus: "payment_processing",
    paymentAttempts: [...booking.paymentAttempts, attempt],
  });
}

export function resolvePaymentAttempt(
  bookingId: string,
  attemptId: string,
  outcome: "succeeded" | "failed",
  transactionId: string | null
) {
  const booking = getBooking(bookingId);
  if (!booking) return;
  const paymentAttempts = booking.paymentAttempts.map((a) =>
    a.id === attemptId ? { ...a, status: outcome, transactionId } : a
  );
  const confirmed = outcome === "succeeded";
  saveBooking({
    ...booking,
    paymentAttempts,
    reservationStatus: confirmed ? "confirmed" : "payment_pending",
    bookingReference: confirmed ? generateBookingReference() : booking.bookingReference,
  });
}

/** Fully releases a reservation — the seats it held return to general
 *  availability. Used when a participant explicitly abandons checkout. */
export function releaseBooking(bookingId: string) {
  const booking = getBooking(bookingId);
  if (!booking) return;
  saveBooking({ ...booking, reservationStatus: "released" });
  const store = readStore();
  if (store.activeByDeparture[booking.departureId] === bookingId) {
    delete store.activeByDeparture[booking.departureId];
    writeStore(store);
  }
}
