"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getMockBooking } from "@/lib/hotel-booking-state";
import type { MockBooking } from "@/lib/hotel-booking-api";

const MEAL_PLAN_LABEL = {
  room_only: "Room only",
  breakfast_included: "Breakfast included",
  half_board: "Breakfast & dinner included",
} as const;

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function BookingDetailsView({ bookingReference }: { bookingReference: string }) {
  const router = useRouter();
  // sessionStorage isn't available during SSR, so the first paint (and the
  // client's hydration pass, which must match it exactly) can't know yet
  // whether this booking exists — `undefined` means "not checked yet",
  // deferred to the effect below; only after that can the real
  // found/not-found branches below differ safely.
  const [booking, setBooking] = useState<MockBooking | null | undefined>(undefined);

  useEffect(() => {
    setBooking(getMockBooking(bookingReference) ?? null);
  }, [bookingReference]);

  if (booking === undefined) {
    return <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">We couldn&rsquo;t find this booking.</p>
        <button type="button" onClick={() => router.push("/dashboard")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <button type="button" onClick={() => router.push("/dashboard")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy print:hidden">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div id="hotel-voucher" className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-navy/10 pb-5">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Hotel Booking Voucher</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-navy">{booking.hotelName}</h1>
            <p className="font-body text-sm text-text-grey">{booking.hotelLocation}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-text-grey">Booking Reference</p>
            <p className="font-heading text-base font-bold text-navy">{booking.bookingReference}</p>
            <p className={`mt-1 font-body text-xs font-semibold ${booking.status === "CONFIRMED" ? "text-navy" : "text-destructive"}`}>{booking.status}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Stay</p>
            <p className="mt-1 font-body text-sm text-navy">Check-in: {formatDate(booking.checkIn)}</p>
            <p className="font-body text-sm text-navy">Check-out: {formatDate(booking.checkOut)}</p>
            <p className="font-body text-sm text-navy">
              {booking.nights} night{booking.nights === 1 ? "" : "s"} &middot; {booking.roomCount} room{booking.roomCount === 1 ? "" : "s"}
            </p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guests</p>
            <p className="mt-1 font-body text-sm text-navy">
              {booking.adults} Adult{booking.adults === 1 ? "" : "s"}
              {booking.children > 0 ? ` · ${booking.children} Child${booking.children === 1 ? "" : "ren"}` : ""}
            </p>
            <p className="mt-2 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Primary Guest</p>
            <p className="font-body text-sm text-navy">
              {booking.guest.firstName} {booking.guest.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {booking.guest.email} &middot; {booking.guest.phone}
            </p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Room &amp; Meal Plan</p>
            <p className="mt-1 font-body text-sm text-navy">{booking.roomName}</p>
            <p className="font-body text-xs text-text-grey">{MEAL_PLAN_LABEL[booking.mealPlan]}</p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Cancellation Policy</p>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-navy">
              <ShieldCheck size={14} />
              {booking.cancellation === "free"
                ? `Free cancellation until ${booking.freeCancellationDaysBeforeCheckIn ?? 2} days before check-in`
                : "Non-refundable"}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-navy/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-text-grey">Payment method</span>
            <span className="font-body text-sm capitalize text-navy">{booking.paymentMethod}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold text-navy">Total Paid</span>
            <span className="font-heading text-lg font-bold text-navy">{formatCurrency(booking.pricing.totalAmount)}</span>
          </div>
        </div>

        <p className="mt-5 font-body text-[11px] text-text-grey">
          This is a demo voucher generated for the TripConsole standalone hotel booking prototype — it does not represent a real hotel reservation.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex w-fit items-center gap-1.5 self-end rounded-full border border-navy/15 px-5 py-2.5 font-body text-sm font-semibold text-navy hover:bg-navy/5 print:hidden"
      >
        <Printer size={14} /> Download / Print Voucher
      </button>
    </div>
  );
}
