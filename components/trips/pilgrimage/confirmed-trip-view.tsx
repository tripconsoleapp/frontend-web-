"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, Check, FileText, MapPin, Route, Users } from "lucide-react";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { DepartureBooking, getActiveBooking, getBooking } from "@/lib/pilgrimage-booking";

export function ConfirmedTripView({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [booking, setBooking] = useState<DepartureBooking | null>(null);

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    if (!active || active.reservationStatus !== "confirmed") {
      router.replace(detailHref);
      return;
    }
    setBooking(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return <div className="h-64" />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <motion.div
        initial={shouldReduce ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 rounded-2xl bg-mint/20 px-6 py-10 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-navy">
          <Check size={26} />
        </span>
        <h1 className="font-heading text-xl font-bold text-navy">You&apos;re confirmed!</h1>
        <p className="font-body text-sm text-text-grey">Booking Reference</p>
        <p className="font-heading text-lg font-bold text-navy">{booking.bookingReference}</p>
      </motion.div>

      <div className="relative h-48 w-full overflow-hidden rounded-2xl">
        <Image src={template.imageUrl} alt={template.name} fill sizes="672px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="font-heading text-lg font-bold text-white">{departure.title}</p>
          <p className="font-body text-xs text-white/80">{formatDateRange(departure.departureDate, departure.returnDate)}</p>
        </div>
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
          What&apos;s Included
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {template.includedServices.map((service) => (
            <span key={service} className="rounded-full bg-navy/5 px-3 py-1 font-body text-xs font-medium text-navy">
              {service}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passengers</p>
        <div className="mt-2 flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
          {booking.passengers.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <p className="font-body text-sm font-semibold text-navy">
                {i === 0 ? `${p.fullName} (Primary Contact)` : p.fullName}
              </p>
              <p className="font-body text-xs text-text-grey">{p.age} yrs</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-navy/[0.02] px-5 py-4">
        <span className="font-body text-sm font-semibold text-navy">Amount Paid</span>
        <span className="font-heading text-xl font-bold text-navy">{formatCurrency(booking.amount)}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`${detailHref}/itinerary?booking=${booking.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          <Route size={15} /> View Itinerary
        </Link>
        <Link
          href={`${detailHref}/receipt?booking=${booking.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
        >
          <FileText size={15} /> View Receipt
        </Link>
      </div>
    </div>
  );
}
