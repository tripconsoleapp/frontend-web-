"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { BookingHeader } from "@/components/trips/pilgrimage/booking-header";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { DepartureBooking, getActiveBooking, getBooking, moveToPaymentPending } from "@/lib/pilgrimage-booking";

export function BookingSummaryView({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const router = useRouter();
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [booking, setBooking] = useState<DepartureBooking | null>(null);

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    if (!active || active.passengers.length !== active.participantCount) {
      router.replace(`${detailHref}/participants`);
      return;
    }
    setBooking(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return <div className="h-64" />;

  function handleProceed() {
    if (!booking) return;
    moveToPaymentPending(booking.id);
    router.push(`${detailHref}/payment?booking=${booking.id}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <BookingHeader
        title={departure.title}
        imageUrl={template.imageUrl}
        departureDate={departure.departureDate}
        returnDate={departure.returnDate}
        backHref={`${detailHref}/passengers?booking=${booking.id}`}
        activeIndex={2}
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Booking Summary</h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Review your details before proceeding to payment.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-navy/10 p-5 font-body text-sm text-text-grey">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={14} />
          {formatDateRange(departure.departureDate, departure.returnDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={14} /> Meets at {departure.meetingPoint}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} /> {booking.participantCount} passenger{booking.participantCount === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          Passengers
        </p>
        <div className="mt-2 flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
          {booking.passengers.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-body text-sm font-semibold text-navy">
                  {i === 0 ? `${p.fullName} (Primary Contact)` : p.fullName}
                </p>
                <p className="font-body text-xs text-text-grey">
                  {p.age} yrs &middot; {p.gender}
                </p>
              </div>
              <p className="font-body text-xs text-text-grey capitalize">{p.idType}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 font-body text-xs text-text-grey">Contact: {booking.contactPhone}</p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-navy/[0.02] px-5 py-4">
        <div className="flex items-center justify-between font-body text-sm text-text-grey">
          <span>
            {booking.participantCount} &times; {formatCurrency(booking.pricePerPerson)}
          </span>
          <span>{formatCurrency(booking.amount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-navy/10 pt-2">
          <span className="font-body text-sm font-semibold text-navy">Amount Due</span>
          <span className="font-heading text-xl font-bold text-navy">{formatCurrency(booking.amount)}</span>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProceed}
        className={buttonVariants({ variant: "accent", size: "lg", className: "w-full" })}
      >
        Proceed to Payment &rarr;
      </motion.button>
    </div>
  );
}
