"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, MapPin, Tag } from "lucide-react";

interface TripSummaryPanelProps {
  tripName: string;
  tripTypeLabel: string;
  dateRangeLabel: string;
}

function SummaryValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="block font-heading text-base font-semibold text-navy"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function TripSummaryPanel({
  tripName,
  tripTypeLabel,
  dateRangeLabel,
}: TripSummaryPanelProps) {
  return (
    <div className="sticky top-8 flex flex-col gap-4 overflow-hidden rounded-2xl bg-white shadow-lg shadow-navy/10">
      <div className="flex flex-col gap-4 p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          Trip Summary
        </p>

        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <Tag size={15} />
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Trip Name</p>
            <SummaryValue value={tripName || "Untitled Trip"} />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <MapPin size={15} />
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Type</p>
            <SummaryValue value={tripTypeLabel} />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <Calendar size={15} />
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Dates</p>
            <SummaryValue value={dateRangeLabel || "Not set yet"} />
          </div>
        </div>
      </div>

      <div className="relative h-56 w-full">
        <Image
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
          alt="Traditional houseboat gliding through Kerala's backwaters"
          fill
          sizes="(min-width: 1024px) 400px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
      </div>
    </div>
  );
}
