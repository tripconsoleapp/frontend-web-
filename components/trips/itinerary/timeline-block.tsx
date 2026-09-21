"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { BedDouble, ChevronDown, ChevronUp, Coffee, MapPin, Pencil, Sparkles, Trash2, UtensilsCrossed, Wand2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { ItineraryBlock, ItineraryBlockType } from "@/lib/listing-draft";

const TYPE_LABEL: Record<ItineraryBlockType, string> = {
  travel: "Travel",
  activity: "Activity",
  meal: "Meal",
  check_in: "Check-in",
  stay: "Staying",
  check_out: "Check-out",
  free_time: "Free Time",
  hidden_gem: "Discovery",
  custom: "Custom",
};

const TYPE_ICON: Record<ItineraryBlockType, typeof MapPin> = {
  travel: MapPin,
  activity: Sparkles,
  meal: UtensilsCrossed,
  check_in: BedDouble,
  stay: BedDouble,
  check_out: BedDouble,
  free_time: Coffee,
  hidden_gem: Sparkles,
  custom: Wand2,
};

export function TimelineBlock({
  block,
  canMoveEarlier,
  canMoveLater,
  onMoveEarlier,
  onMoveLater,
  onEdit,
  onRemove,
}: {
  block: ItineraryBlock;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const Icon = TYPE_ICON[block.type];

  if (block.type === "stay") {
    return (
      <div className="flex items-center gap-2 py-2 font-body text-xs text-text-grey">
        <BedDouble size={13} className="text-navy/40" />
        Staying at {block.subtitle}
      </div>
    );
  }

  if (block.type === "free_time") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 rounded-xl border border-dashed border-navy/15 px-4 py-3"
      >
        <span className="w-14 shrink-0 font-body text-xs text-text-grey">{block.startTime}</span>
        <Coffee size={15} className="shrink-0 text-navy/30" />
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-medium text-navy">Free Time</p>
          <p className="font-body text-xs text-text-grey">
            {block.startTime} – {block.endTime} &middot; {block.subtitle}
          </p>
        </div>
      </motion.div>
    );
  }

  const isHiddenGem = block.type === "hidden_gem";

  return (
    <motion.div layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
      <div className="flex gap-4 py-4">
        <span className="w-14 shrink-0 pt-1 font-body text-sm font-semibold text-navy">{block.startTime}</span>

        {block.imageUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <Image src={block.imageUrl} alt={block.title} fill sizes="56px" className="object-cover" />
            {isHiddenGem && <span className="absolute inset-0 ring-2 ring-inset ring-mint" />}
          </div>
        ) : (
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
              block.type === "travel" ? "bg-navy/5 text-navy/50" : "bg-navy/5 text-navy/50"
            )}
          >
            <Icon size={18} />
          </span>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={cn(
              "font-body text-[10px] font-semibold uppercase tracking-wide",
              isHiddenGem ? "text-navy" : "text-text-grey"
            )}
          >
            {isHiddenGem && <Sparkles size={9} className="mr-1 inline -mt-0.5" />}
            {TYPE_LABEL[block.type]}
          </p>
          <p className="font-heading text-base font-semibold text-navy">{block.title}</p>
          {block.subtitle && <p className="font-body text-sm text-text-grey">{block.subtitle}</p>}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-xs text-text-grey">
            {block.participants && <span>{block.participants} participants</span>}
            {typeof block.price === "number" && block.price > 0 && <span className="font-medium text-navy">{formatCurrency(block.price)}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-1 pt-1">
          <button type="button" onClick={onMoveEarlier} disabled={!canMoveEarlier} aria-label={`Move ${block.title} earlier`} className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey/60 transition-colors hover:bg-navy/5 hover:text-navy disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button type="button" onClick={onMoveLater} disabled={!canMoveLater} aria-label={`Move ${block.title} later`} className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey/60 transition-colors hover:bg-navy/5 hover:text-navy disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
          <button type="button" onClick={onEdit} aria-label={`Edit ${block.title}`} className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-navy/5 hover:text-navy">
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={block.locked ? `Remove ${block.title} from itinerary` : `Remove ${block.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
