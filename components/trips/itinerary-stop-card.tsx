"use client";

import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, MapPin, Pencil, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DestinationStop {
  id: string;
  name: string;
  district: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  nights: number;
  overnight: boolean;
}

export function StartStopCard({
  name,
  district,
  selected,
  onSelect,
}: {
  name: string;
  district: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border-l-[3px] border-l-orange bg-navy/[0.03] px-4 py-4 text-left shadow-sm transition-colors",
        selected && "bg-orange/5 ring-1 ring-orange/30"
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy font-body text-xs font-bold text-white">
        1
      </span>
      <div className="flex-1">
        <p className="font-body text-base font-semibold text-navy">{name}</p>
        <p className="font-body text-xs text-text-grey">{district}</p>
        <span className="mt-0.5 inline-block rounded-full bg-mint/40 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-navy">
          Starting Point
        </span>
      </div>
    </button>
  );
}

export function DestinationStopCard({
  index,
  stop,
  travelLabel,
  selected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  stop: DestinationStop;
  travelLabel?: string;
  selected?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
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
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-navy/10",
        selected && "ring-2 ring-orange/40"
      )}
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label={`Reorder ${stop.name}`}
        className="mt-1 shrink-0 cursor-grab touch-none text-text-grey/50 transition-colors hover:text-navy active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>

      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-body text-xs font-bold transition-colors",
          selected ? "bg-orange text-white" : "bg-navy/10 text-navy"
        )}
      >
        {index}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-body text-base font-semibold text-navy">
            {stop.name}
          </p>
          <span className="rounded-full bg-orange/10 px-2 py-0.5 font-body text-[10px] font-semibold text-orange">
            {stop.nights === 0
              ? "Day visit"
              : `${stop.nights} ${stop.nights === 1 ? "night" : "nights"}`}
          </span>
        </div>
        <p className="font-body text-xs text-text-grey">{stop.district}</p>
        {travelLabel && (
          <p className="mt-1 flex items-center gap-1 font-body text-xs text-text-grey">
            <MapPin size={11} className="shrink-0" /> {travelLabel}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={!canMoveUp}
          aria-label={`Move ${stop.name} up`}
          className="flex h-5 w-5 items-center justify-center rounded text-text-grey/60 transition-colors hover:bg-navy/5 hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronUp size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={!canMoveDown}
          aria-label={`Move ${stop.name} down`}
          className="flex h-5 w-5 items-center justify-center rounded text-text-grey/60 transition-colors hover:bg-navy/5 hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit ${stop.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-navy/5 hover:text-navy"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${stop.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
        >
          <X size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}
