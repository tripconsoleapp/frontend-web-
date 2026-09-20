"use client";

import { Reorder, useDragControls } from "motion/react";
import { GripVertical, MapPin, Pencil, X } from "lucide-react";

export interface DestinationStop {
  id: string;
  name: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  nights: number;
  overnight: boolean;
}

export function StartStopCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-navy/10 border-l-[3px] border-l-orange bg-navy/[0.03] px-4 py-3.5 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy font-body text-xs font-bold text-white">
        1
      </span>
      <div className="flex-1">
        <p className="font-body text-sm font-semibold text-navy">{name}</p>
        <span className="mt-0.5 inline-block rounded-full bg-mint/40 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-navy">
          Starting Point
        </span>
      </div>
    </div>
  );
}

export function DestinationStopCard({
  stop,
  travelLabel,
  onEdit,
  onRemove,
}: {
  stop: DestinationStop;
  travelLabel?: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={stop}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 28px rgba(45,62,80,0.16)" }}
      whileHover={{ y: -2 }}
      className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md hover:shadow-navy/10"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label={`Reorder ${stop.name}`}
        className="mt-1 shrink-0 cursor-grab touch-none text-text-grey/50 transition-colors hover:text-navy active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-body text-sm font-semibold text-navy">
            {stop.name}
          </p>
          <span className="rounded-full bg-orange/10 px-2 py-0.5 font-body text-[10px] font-semibold text-orange">
            {stop.nights === 0
              ? "Day visit"
              : `${stop.nights} ${stop.nights === 1 ? "night" : "nights"}`}
          </span>
        </div>
        {travelLabel && (
          <p className="mt-1 flex items-center gap-1 font-body text-xs text-text-grey">
            <MapPin size={11} className="shrink-0" /> {travelLabel}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${stop.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-navy/5 hover:text-navy"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${stop.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
        >
          <X size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}
