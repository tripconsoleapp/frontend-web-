"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getMockBooking } from "@/lib/hotel-booking-state";
import type { MockBooking } from "@/lib/hotel-booking-api";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function HotelBookingSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref");
  const [booking, setBooking] = useState<MockBooking | null | undefined>(undefined);

  useEffect(() => {
    if (!ref) {
      router.replace("/book/hotel");
      return;
    }
    const found = getMockBooking(ref);
    if (!found || found.status !== "CONFIRMED") {
      router.replace("/book/hotel");
      return;
    }
    setBooking(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  if (!booking) return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="relative flex h-56 flex-col justify-end overflow-hidden rounded-3xl sm:h-64">
        <Image src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
        <div className="relative z-10 flex flex-col gap-3 p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-navy">
            <Check size={20} />
          </span>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-mint">Booking Confirmed</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">Your stay at {booking.hotelName} is booked</h1>
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
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Stay details</p>
        <div className="mt-3 grid grid-cols-1 gap-2 font-body text-sm text-navy sm:grid-cols-2">
          <p>
            <span className="text-text-grey">Hotel:</span> {booking.hotelName}
          </p>
          <p>
            <span className="text-text-grey">Location:</span> {booking.hotelLocation}
          </p>
          <p>
            <span className="text-text-grey">Check-in:</span> {formatDate(booking.checkIn)}
          </p>
          <p>
            <span className="text-text-grey">Check-out:</span> {formatDate(booking.checkOut)}
          </p>
          <p>
            <span className="text-text-grey">Room:</span> {booking.roomName}
          </p>
          <p>
            <span className="text-text-grey">Guests:</span> {booking.adults} Adult{booking.adults === 1 ? "" : "s"}
            {booking.children > 0 ? ` · ${booking.children} Child${booking.children === 1 ? "" : "ren"}` : ""} &middot; {booking.roomCount} Room
            {booking.roomCount === 1 ? "" : "s"}
          </p>
        </div>
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
          onClick={() => router.push(`/book/hotel/booking/${booking.bookingReference}`)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
        >
          View Booking &amp; Voucher <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
