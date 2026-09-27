"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { PilgrimageDeparture, departureStatus, isDepartureBookable, remainingSlots } from "@/lib/pilgrimage-departures";
import { confirmedSeatsForDeparture } from "@/lib/pilgrimage-booking";
import { Template } from "@/lib/mock-templates";

const STATUS_LABEL: Record<string, string> = {
  open: "Open for Booking",
  almost_full: "Almost Full",
  full: "Fully Booked",
  closed: "Closed",
  cancelled: "This departure was cancelled",
  completed: "This departure has completed",
};

export function ScheduledDepartureDetail({
  departure,
  template,
}: {
  departure: PilgrimageDeparture;
  template: Template;
}) {
  const shouldReduce = useReducedMotion();
  // Availability depends on other confirmed bookings made in this
  // session — a client-only read, so it starts at the safe "no other
  // bookings yet" baseline and settles after mount rather than risking a
  // server/client mismatch.
  const [additionalBooked, setAdditionalBooked] = useState(0);
  useEffect(() => {
    setAdditionalBooked(confirmedSeatsForDeparture(departure.id));
  }, [departure.id]);

  const status = departureStatus(departure, additionalBooked);
  const bookable = isDepartureBookable(status);
  const remaining = remainingSlots(departure, additionalBooked);

  const fadeUp: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/pilgrimage/scheduled"
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> Back to Departures
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex flex-col gap-6">
          <div className="relative h-64 w-full overflow-hidden rounded-3xl sm:h-80">
            <Image
              src={template.imageUrl}
              alt={template.name}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-mint">
                  Scheduled Departure
                </p>
                <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                  {departure.title}
                </h1>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-body text-xs font-semibold text-white backdrop-blur-sm">
                <ShieldCheck size={13} /> Organized by TripConsole
              </span>
            </div>
          </div>

          <p className="font-body text-base text-text-grey">{template.about}</p>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">
              What&apos;s Included
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {template.includedServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-navy/5 px-3 py-1 font-body text-xs font-medium text-navy"
                >
                  {service}
                </span>
              ))}
            </div>
            <p className="mt-2 font-body text-xs text-text-grey">
              Transport, stay and meals for this departure are already
              arranged by TripConsole — nothing further to configure.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Highlights</h2>
            <ul className="mt-2 flex flex-col gap-1.5 font-body text-sm text-text-grey">
              {template.highlights.map((highlight) => (
                <li key={highlight}>&bull; {highlight}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-navy">Day-by-Day</h2>
              <Link
                href={`/pilgrimage/scheduled/${departure.id}/itinerary`}
                className="font-body text-xs font-semibold text-orange underline underline-offset-2"
              >
                Full itinerary
              </Link>
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {template.itinerary.map((day) => (
                <div key={day.day} className="rounded-xl border border-navy/10 p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                    Day {day.day}
                  </p>
                  <p className="font-heading text-sm font-semibold text-navy">{day.title}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6 lg:sticky lg:top-8">
          <div className="flex flex-col gap-2 font-body text-sm text-text-grey">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatDateRange(departure.departureDate, departure.returnDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> Meets at {departure.meetingPoint}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {bookable ? `${remaining} of ${departure.capacity} seats left` : STATUS_LABEL[status]}
            </span>
          </div>

          <div className="border-t border-navy/10 pt-4">
            <p className="font-body text-xs uppercase tracking-wide text-text-grey">
              Per person
            </p>
            <p className="font-heading text-2xl font-bold text-navy">
              {formatCurrency(departure.pricePerPerson)}
            </p>
          </div>

          <Link
            href={bookable ? `/pilgrimage/scheduled/${departure.id}/participants` : "#"}
            aria-disabled={!bookable}
            className={cn(
              buttonVariants({ variant: "accent", size: "lg" }),
              "w-full",
              !bookable && "pointer-events-none cursor-not-allowed opacity-40"
            )}
          >
            {bookable ? "Book Now" : STATUS_LABEL[status]}
          </Link>
          <p className="font-body text-xs text-text-grey">
            You&apos;re joining this departure as published — the route,
            transport, stay and meals shown here won&apos;t change.
          </p>
        </div>
      </div>
    </div>
  );
}
