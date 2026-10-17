"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Calendar, Check, MapPin, Car } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getMockRestaurantBooking } from "@/lib/restaurant-booking-state";
import type { MockRestaurantBooking } from "@/lib/restaurant-booking-api";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Builds a minimal, valid .ics file client-side — no backend, no external
 *  calendar API, just a real downloadable artifact for the reservation. */
function downloadIcs(booking: MockRestaurantBooking) {
  const [y, m, d] = booking.reservation.reservationDate.split("-").map(Number);
  const [hh, mm] = booking.reservation.reservationTime.split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const toIcsDate = (dt: Date) =>
    `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}00`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripConsole//Restaurant Booking Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${booking.bookingReference}@tripconsole.mock`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:Table at ${booking.restaurantName} (${booking.reservation.guestCount} guests)`,
    `LOCATION:${booking.restaurantLocation}`,
    `DESCRIPTION:Demo reservation — TripConsole standalone Restaurant booking prototype. Reference ${booking.bookingReference}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${booking.bookingReference}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RestaurantBookingSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref");
  const [booking, setBooking] = useState<MockRestaurantBooking | null | undefined>(undefined);

  useEffect(() => {
    if (!ref) {
      router.replace("/book/restaurant");
      return;
    }
    const found = getMockRestaurantBooking(ref);
    if (!found || found.status !== "CONFIRMED") {
      router.replace("/book/restaurant");
      return;
    }
    setBooking(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  if (!booking) return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${booking.restaurantName}, ${booking.restaurantLocation}`)}`;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="relative flex h-56 flex-col justify-end overflow-hidden rounded-3xl bg-navy sm:h-64">
        <div className="relative z-10 flex flex-col gap-3 p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-navy">
            <Check size={20} />
          </span>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-mint">Table Confirmed!</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">Your table at {booking.restaurantName} is booked</h1>
            <p className="mt-1 max-w-md font-body text-sm text-white/85">
              A confirmation has been sent for your reference. This is a demo booking — no real reservation has been made.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Booking Reference</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{booking.bookingReference}</p>
        </div>
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amount Paid</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{formatCurrency(booking.pricing.totalAmount)}</p>
        </div>
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Booking Status</p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">Confirmed</p>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Reservation details</p>
        <div className="mt-3 grid grid-cols-1 gap-2 font-body text-sm text-navy sm:grid-cols-2">
          <p>
            <span className="text-text-grey">Restaurant:</span> {booking.restaurantName}
          </p>
          <p>
            <span className="text-text-grey">Location:</span> {booking.restaurantLocation}
          </p>
          <p>
            <span className="text-text-grey">Date:</span> {formatDate(booking.reservation.reservationDate)}
          </p>
          <p>
            <span className="text-text-grey">Time:</span> {booking.reservation.reservationTime}
          </p>
          <p>
            <span className="text-text-grey">Guests:</span> {booking.reservation.guestCount}
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-3">
          {booking.guestSelections.map((s) => (
            <div key={s.guestId} className="flex items-center justify-between font-body text-sm text-navy">
              <span>{s.guestName}</span>
              <span className="text-text-grey">{s.dishName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadIcs(booking)}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-5 py-2.5 font-body text-sm font-semibold text-navy hover:bg-navy/5"
        >
          <Calendar size={14} /> Add to Calendar
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-5 py-2.5 font-body text-sm font-semibold text-navy hover:bg-navy/5"
        >
          <MapPin size={14} /> Get Directions
        </a>
        <button
          type="button"
          onClick={() => router.push("/book/vehicle")}
          className="inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-5 py-2.5 font-body text-sm font-semibold text-navy hover:bg-mint/60"
        >
          <Car size={14} /> Need a ride there? Book Transport
        </button>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-semibold text-navy hover:bg-navy/5"
        >
          Back to Dashboard
        </button>
        <button
          type="button"
          onClick={() => router.push(`/book/restaurant/booking/${booking.bookingReference}`)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
        >
          View Booking &amp; Voucher <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
