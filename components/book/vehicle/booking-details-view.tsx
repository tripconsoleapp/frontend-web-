"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Users } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getMockVehicleBooking } from "@/lib/vehicle-booking-state";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function VehicleBookingDetailsView({ bookingReference }: { bookingReference: string }) {
  const router = useRouter();
  const booking = getMockVehicleBooking(bookingReference);

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

  const isPrivate = booking.transportMode === "private";

  return (
    <div className="flex flex-col gap-6 pb-16">
      <button type="button" onClick={() => router.push("/dashboard")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy print:hidden">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-navy/10 pb-5">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">{isPrivate ? "Vehicle Booking Voucher" : "KSRTC Booking Voucher"}</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-navy">{isPrivate ? `${booking.privateDetail?.vehicles.length} vehicle${booking.privateDetail?.vehicles.length === 1 ? "" : "s"}` : booking.ksrtcDetail?.service.busType}</h1>
            <p className="font-body text-sm text-text-grey">{isPrivate ? "Private Operator" : "KSRTC"}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-text-grey">Booking Reference</p>
            <p className="font-heading text-base font-bold text-navy">{booking.bookingReference}</p>
            <p className={`mt-1 font-body text-xs font-semibold ${booking.status === "CONFIRMED" ? "text-navy" : "text-destructive"}`}>{booking.status}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Journey</p>
            <p className="mt-1 font-body text-sm text-navy">
              {booking.journey.pickupLocationName} &rarr; {booking.journey.dropLocationName}
            </p>
            <p className="font-body text-sm text-navy">
              {formatDate(booking.journey.journeyDate)} at {booking.journey.pickupTime}
            </p>
            {booking.journey.isRoundTrip && booking.journey.returnDate && <p className="font-body text-sm text-navy">Return: {formatDate(booking.journey.returnDate)}</p>}
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passenger</p>
            <p className="mt-1 font-body text-sm text-navy">
              {booking.passenger.firstName} {booking.passenger.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {booking.passenger.email} &middot; {booking.passenger.phone}
            </p>
            <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-navy">
              <Users size={13} /> {booking.journey.passengers} passenger{booking.journey.passengers === 1 ? "" : "s"}
            </p>
          </div>
          {isPrivate && booking.privateDetail && (
            <div className="sm:col-span-2">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Vehicles</p>
              <div className="mt-1 flex flex-col gap-1">
                {booking.privateDetail.vehicles.map((veh) => (
                  <div key={veh.id} className="flex items-center justify-between font-body text-sm text-navy">
                    <span>
                      {veh.name} &middot; {veh.operatorName}
                    </span>
                    <span className="text-text-grey">{veh.seatingCapacity} seats</span>
                  </div>
                ))}
              </div>
              <p className="mt-1 font-body text-xs font-semibold text-navy">Combined capacity: {booking.privateDetail.combinedCapacity}</p>
            </div>
          )}
          {!isPrivate && booking.ksrtcDetail && (
            <div className="sm:col-span-2">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Service</p>
              <p className="mt-1 font-body text-sm text-navy">
                {booking.ksrtcDetail.service.busType} &middot; {booking.ksrtcDetail.service.departureTime} &rarr; {booking.ksrtcDetail.service.arrivalTime}
              </p>
            </div>
          )}
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
          This is a demo voucher generated for the TripConsole standalone vehicle booking prototype — it does not represent a real {isPrivate ? "vehicle" : "KSRTC"} reservation.
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
