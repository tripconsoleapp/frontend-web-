"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getMockActivityBooking } from "@/lib/activity-booking-state";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function ActivityBookingDetailsView({ bookingReference }: { bookingReference: string }) {
  const router = useRouter();
  const booking = getMockActivityBooking(bookingReference);

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

      <div id="activity-voucher" className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-navy/10 pb-5">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Activity Booking Voucher</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-navy">{booking.activityName}</h1>
            <p className="font-body text-sm text-text-grey">{booking.activityLocation}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-text-grey">Booking Reference</p>
            <p className="font-heading text-base font-bold text-navy">{booking.bookingReference}</p>
            <p className={`mt-1 font-body text-xs font-semibold ${booking.status === "CONFIRMED" ? "text-navy" : "text-destructive"}`}>{booking.status}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Booking</p>
            <p className="mt-1 font-body text-sm text-navy">Date: {formatDate(booking.date)}</p>
            <p className="font-body text-sm text-navy">Time: {booking.time}</p>
            <p className="font-body text-sm text-navy">Duration: {booking.durationHours} {booking.durationHours === 1 ? "hour" : "hours"}</p>
            <p className="font-body text-sm text-navy">Meeting point: {booking.meetingPoint}</p>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Lead Guest</p>
            <p className="mt-1 font-body text-sm text-navy">
              {booking.guest.firstName} {booking.guest.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {booking.guest.email} &middot; {booking.guest.phone}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-navy/10 pt-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Tickets</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {booking.ticketBreakdown.map((t) => (
              <div key={t.ticketTypeId} className="flex items-center justify-between font-body text-sm text-navy">
                <span>
                  {t.label} x{t.quantity}
                </span>
                <span className="text-text-grey">{formatCurrency(t.price * t.quantity)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 font-body text-xs text-text-grey">{booking.participants} participants total</p>
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
          This is a demo voucher generated for the TripConsole standalone activity booking prototype — it does not represent a real activity reservation or supplier confirmation.
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
