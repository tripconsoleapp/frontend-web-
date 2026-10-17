"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HotelBookingStepper } from "./booking-stepper";
import { BookingSummary } from "./booking-summary";
import { Button } from "@/components/ui/button";
import { calculateHotelPrice } from "@/lib/hotel-booking-api";
import { getHotelBookingDraft, type HotelBookingDraft } from "@/lib/hotel-booking-state";
import { getHotelDetails } from "@/lib/hotel-booking-api";
import type { Hotel } from "@/lib/hotel-booking-data";

const MEAL_PLAN_LABEL = {
  room_only: "Room only",
  breakfast_included: "Breakfast included",
  half_board: "Breakfast & dinner included",
} as const;

const WELCOME_DISCOUNT = 500;

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000);
}

export function BookingReview() {
  const router = useRouter();
  // sessionStorage isn't available during SSR, so the first paint (and the
  // client's hydration pass, which must match it exactly) renders with no
  // draft — the real read is deferred to the effect below, same pattern
  // used for the async hotel-details fetch just underneath it.
  const [draft, setDraft] = useState<HotelBookingDraft | null>(null);
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);

  useEffect(() => {
    const d = getHotelBookingDraft();
    setDraft(d);
    if (!d.search || !d.selectedHotelId || !d.selectedRoomId || !d.guestDetails) {
      router.replace("/book/hotel");
      return;
    }
    getHotelDetails(d.selectedHotelId).then(setHotel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = draft?.search;
  if (!draft || !search || !draft.selectedHotelId || !draft.selectedRoomId || !draft.guestDetails) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <HotelBookingStepper activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (hotel === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <HotelBookingStepper activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (hotel === null) return null;

  const room = hotel.rooms.find((r) => r.id === draft.selectedRoomId)!;
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const pricing = calculateHotelPrice(room, nights, search.rooms, WELCOME_DISCOUNT);

  return (
    <div className="flex flex-col gap-8 pb-28">
      <HotelBookingStepper activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/hotel/guest-details")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to guest details
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Booking Review</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{hotel.name}</h1>
            <p className="font-body text-sm text-text-grey">{hotel.location}</p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guest</p>
            <p className="mt-1 font-body text-sm text-navy">
              {draft.guestDetails.firstName} {draft.guestDetails.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {draft.guestDetails.email} &middot; {draft.guestDetails.phone}
            </p>
            {draft.guestDetails.specialRequests && (
              <p className="mt-2 rounded-lg bg-navy/[0.03] px-3 py-2 font-body text-xs text-navy/80">
                &ldquo;{draft.guestDetails.specialRequests}&rdquo; — subject to availability, not guaranteed.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Room &amp; Meal Plan</p>
            <p className="mt-1 font-body text-sm font-semibold text-navy">{room.name}</p>
            <p className="font-body text-xs text-text-grey">{MEAL_PLAN_LABEL[room.mealPlan]}</p>
            <p className="mt-2 font-body text-xs text-navy/80">
              {room.cancellation === "free"
                ? `Free cancellation until ${room.freeCancellationDaysBeforeCheckIn ?? 2} days before check-in`
                : "Non-refundable"}
            </p>
          </div>

          <Button type="button" variant="accent" size="lg" onClick={() => router.push("/book/hotel/payment")}>
            Continue to Payment
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <BookingSummary
            hotelName={hotel.name}
            location={hotel.location}
            checkIn={search.checkIn}
            checkOut={search.checkOut}
            nights={nights}
            adults={search.adults}
            children={search.children}
            roomCount={search.rooms}
            roomName={room.name}
            mealPlanLabel={MEAL_PLAN_LABEL[room.mealPlan]}
            cancellationLabel={
              room.cancellation === "free"
                ? `Free cancellation until ${room.freeCancellationDaysBeforeCheckIn ?? 2} days before check-in`
                : "Non-refundable"
            }
            pricing={pricing}
          />
        </div>
      </div>
    </div>
  );
}
