"use client";

import Image from "next/image";
import { Check, Users, Coffee, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import type { HotelRoomOption } from "@/lib/hotel-booking-data";

const MEAL_PLAN_LABEL: Record<HotelRoomOption["mealPlan"], string> = {
  room_only: "Room only",
  breakfast_included: "Breakfast included",
  half_board: "Breakfast & dinner included",
};

export function RoomCard({
  room,
  nights,
  roomCount,
  selected,
  fitsParty,
  onSelect,
}: {
  room: HotelRoomOption;
  nights: number;
  roomCount: number;
  selected: boolean;
  fitsParty: boolean;
  onSelect: () => void;
}) {
  const total = room.pricePerNight * nights * roomCount;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row",
        selected ? "border-orange bg-orange/[0.04]" : "border-navy/10 bg-white"
      )}
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-36">
        <Image src={room.image} alt="" fill sizes="144px" className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="font-heading text-base font-semibold text-navy">{room.name}</p>
        <p className="font-body text-xs text-text-grey">{room.bedType}</p>
        <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
          <Users size={13} /> Sleeps {room.maxGuests}
        </p>
        {room.mealPlan !== "room_only" && (
          <p className="flex items-center gap-1.5 font-body text-xs text-navy/80">
            <Coffee size={13} /> {MEAL_PLAN_LABEL[room.mealPlan]}
          </p>
        )}
        <p className={cn("flex items-center gap-1.5 font-body text-xs", room.cancellation === "free" ? "text-navy/80" : "text-text-grey")}>
          <ShieldCheck size={13} />
          {room.cancellation === "free"
            ? `Free cancellation until ${room.freeCancellationDaysBeforeCheckIn ?? 2} days before check-in`
            : "Non-refundable"}
        </p>
        {!fitsParty && (
          <p className="font-body text-xs font-medium text-destructive">
            This room accommodates up to {room.maxGuests} guests per room. Please choose another room or adjust your party size.
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 sm:w-36">
        <div className="text-right">
          <p className="font-heading text-base font-bold text-navy">{formatCurrency(room.pricePerNight)}</p>
          <p className="font-body text-[11px] text-text-grey">/ night</p>
          <p className="mt-1 font-body text-xs text-text-grey">
            {formatCurrency(total)} total{roomCount > 1 ? ` (${roomCount} rooms)` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          disabled={!fitsParty}
          className={cn(
            "inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-2 font-body text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            selected ? "bg-navy text-white" : "bg-orange text-white hover:bg-orange/90"
          )}
        >
          {selected ? (
            <>
              <Check size={13} /> Selected
            </>
          ) : (
            "Select"
          )}
        </button>
      </div>
    </div>
  );
}
