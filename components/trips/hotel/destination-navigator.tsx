"use client";

import { Check, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { DestinationStay } from "@/lib/listing-draft";
import { formatCurrency } from "@/lib/mock-trips";
import { nightsLabel } from "@/lib/hotel-stays";

function statusLine(stay: DestinationStay) {
  switch (stay.status) {
    case "booked":
      return { icon: Check, text: stay.hotel?.name ?? "Hotel booked", tone: "booked" as const };
    case "skipped":
      return { icon: Minus, text: "Accommodation skipped", tone: "skipped" as const };
    case "not_required":
      return { icon: Minus, text: "Not required", tone: "skipped" as const };
    default:
      return { icon: Circle, text: "Hotel needed", tone: "pending" as const };
  }
}

const TONE_CLASSES = {
  booked: "border-mint/60 bg-mint/10",
  pending: "border-navy/15 bg-white hover:border-orange/40",
  skipped: "border-navy/10 bg-navy/[0.02]",
};

const ICON_CLASSES = {
  booked: "text-navy bg-mint/60",
  pending: "text-navy/40 bg-navy/5",
  skipped: "text-text-grey/60 bg-navy/5",
};

export function DestinationNavigator({
  stays,
  activeId,
  onSelect,
}: {
  stays: DestinationStay[];
  activeId?: string;
  onSelect: (destinationId: string) => void;
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {stays.map((stay) => {
        const { icon: Icon, text, tone } = statusLine(stay);
        const isActive = stay.destinationId === activeId;
        return (
          <button
            key={stay.destinationId}
            type="button"
            onClick={() => onSelect(stay.destinationId)}
            className={cn(
              "flex min-w-[168px] shrink-0 flex-col gap-1.5 rounded-xl border px-4 py-3 text-left transition-all duration-200",
              TONE_CLASSES[tone],
              isActive && "ring-2 ring-orange/40"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  ICON_CLASSES[tone]
                )}
              >
                <Icon size={11} strokeWidth={2.5} />
              </span>
              <span className="font-body text-sm font-semibold text-navy">
                {stay.destinationName}
              </span>
            </div>
            <p className="truncate font-body text-xs text-text-grey">{text}</p>
            <p className="font-body text-[11px] text-text-grey/70">
              {nightsLabel(stay.nights)}
              {stay.status === "booked" && stay.total > 0 ? ` · ${formatCurrency(stay.total)}` : ""}
            </p>
          </button>
        );
      })}
    </div>
  );
}
