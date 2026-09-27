"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { getActiveBooking, getBooking } from "@/lib/pilgrimage-booking";

export function ReadOnlyItineraryView({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [activeDay, setActiveDay] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    setIsConfirmed(active?.reservationStatus === "confirmed");
  }, [bookingId, departure.id]);

  const day = template.itinerary[activeDay];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href={isConfirmed ? `${detailHref}/confirmed?booking=${bookingId ?? ""}` : detailHref}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
            {departure.title}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Itinerary</h1>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 font-body text-xs font-medium text-navy">
          <Lock size={12} /> Read-only
        </span>
      </div>
      <p className="font-body text-sm text-text-grey">
        This itinerary is fixed by TripConsole for this departure — it can&apos;t
        be edited, reordered, or changed.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {template.itinerary.map((d, index) => (
          <button
            key={d.day}
            type="button"
            onClick={() => setActiveDay(index)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors",
              activeDay === index
                ? "border-orange bg-orange/10 text-orange"
                : "border-navy/15 text-navy hover:border-navy/30"
            )}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {day && (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-heading text-lg font-semibold text-navy">{day.title}</h2>
            <div className="flex flex-col gap-3">
              {day.activities.map((activity, i) => (
                <div key={`${activity.time}-${i}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                      <Clock size={14} />
                    </span>
                    {i < day.activities.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-navy/10" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                      {activity.time}
                    </p>
                    <p className="font-body text-sm font-medium text-navy">{activity.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
