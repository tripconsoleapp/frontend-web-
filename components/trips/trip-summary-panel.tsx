"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Users } from "lucide-react";

interface TripSummaryPanelProps {
  tripName: string;
  tripTypeLabel: string;
  travelerCount: number;
  dateRangeLabel: string;
  durationLabel: string;
}

function AnimatedText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function TripSummaryPanel({
  tripName,
  tripTypeLabel,
  travelerCount,
  dateRangeLabel,
  durationLabel,
}: TripSummaryPanelProps) {
  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-8">
      <div className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl shadow-lg shadow-navy/10">
        <Image
          src="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=900&q=80"
          alt="Misty tea plantations in the Western Ghats"
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/10" />

        <div className="relative z-10 flex flex-col gap-2 p-5">
          <AnimatedText
            value={tripTypeLabel.toUpperCase()}
            className="block w-fit rounded-full bg-white/15 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
          />
          <AnimatedText
            value={tripName || "Untitled Journey"}
            className="block font-heading text-xl font-bold leading-tight text-white"
          />
          <div className="mt-1 flex flex-wrap items-center gap-3 font-body text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {travelerCount} traveler{travelerCount === 1 ? "" : "s"}
            </span>
            {dateRangeLabel && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {dateRangeLabel}
              </span>
            )}
          </div>
          {durationLabel && (
            <p className="font-body text-xs font-medium text-mint">{durationLabel}</p>
          )}
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          Trip at a glance
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="font-body text-xs text-text-grey">Type</p>
            <AnimatedText
              value={tripTypeLabel}
              className="block font-heading text-base font-semibold text-navy"
            />
          </div>
          <div>
            <p className="font-body text-xs text-text-grey">Travelers</p>
            <AnimatedText
              value={`${travelerCount}`}
              className="block font-heading text-base font-semibold text-navy"
            />
          </div>
          <div>
            <p className="font-body text-xs text-text-grey">Dates</p>
            <AnimatedText
              value={dateRangeLabel || "Not set yet"}
              className="block font-heading text-base font-semibold text-navy"
            />
          </div>
          <div>
            <p className="font-body text-xs text-text-grey">Duration</p>
            <AnimatedText
              value={durationLabel || "—"}
              className="block font-heading text-base font-semibold text-navy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
