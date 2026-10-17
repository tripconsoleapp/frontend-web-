"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, CreditCard, Landmark, Lock, ShieldAlert } from "lucide-react";
import { HotelBookingStepper } from "./booking-stepper";
import { BookingSummary } from "./booking-summary";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { calculateHotelPrice, createMockBooking, getHotelDetails, type MockPaymentMethod } from "@/lib/hotel-booking-api";
import { getHotelBookingDraft, savePaymentMethod, saveMockBooking, clearHotelBookingDraft } from "@/lib/hotel-booking-state";
import type { Hotel } from "@/lib/hotel-booking-data";

const MEAL_PLAN_LABEL = {
  room_only: "Room only",
  breakfast_included: "Breakfast included",
  half_board: "Breakfast & dinner included",
} as const;

const WELCOME_DISCOUNT = 500;

const METHODS: { id: MockPaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
];

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000);
}

type Phase = "idle" | "processing" | "confirming" | "failed";

export function HotelPayment() {
  const router = useRouter();
  const draft = getHotelBookingDraft();
  const search = draft.search;
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);
  const [method, setMethod] = useState<MockPaymentMethod>(draft.paymentMethod ?? "upi");
  const [phase, setPhase] = useState<Phase>("idle");
  const submitting = useRef(false);

  useEffect(() => {
    if (!search || !draft.selectedHotelId || !draft.selectedRoomId || !draft.guestDetails) {
      router.replace("/book/hotel");
      return;
    }
    getHotelDetails(draft.selectedHotelId).then(setHotel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.selectedHotelId || !draft.selectedRoomId || !draft.guestDetails) return null;
  if (hotel === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <HotelBookingStepper activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (hotel === null) return null;

  const room = hotel.rooms.find((r) => r.id === draft.selectedRoomId)!;
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const pricing = calculateHotelPrice(room, nights, search.rooms, WELCOME_DISCOUNT);

  async function pay(forceFailure = false) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("processing");
    savePaymentMethod(method);

    const booking = await createMockBooking(
      {
        hotelId: hotel!.id,
        hotelName: hotel!.name,
        hotelLocation: hotel!.location,
        roomId: room.id,
        roomName: room.name,
        mealPlan: room.mealPlan,
        cancellation: room.cancellation,
        freeCancellationDaysBeforeCheckIn: room.freeCancellationDaysBeforeCheckIn,
        checkIn: search!.checkIn,
        checkOut: search!.checkOut,
        nights,
        adults: search!.adults,
        children: search!.children,
        childrenAges: search!.childrenAges,
        roomCount: search!.rooms,
        guest: draft.guestDetails!,
        pricing,
        paymentMethod: method,
      },
      { forceFailure }
    );

    saveMockBooking(booking);

    if (booking.status === "CONFIRMED") {
      setPhase("confirming");
      const ref = booking.bookingReference;
      await new Promise((resolve) => setTimeout(resolve, 900));
      clearHotelBookingDraft();
      router.replace(`/book/hotel/success?ref=${ref}`);
      return;
    }

    submitting.current = false;
    setPhase("failed");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <HotelBookingStepper activeIndex={3} />

      {phase !== "processing" && (
        <button type="button" onClick={() => router.push("/book/hotel/review")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back to review
        </button>
      )}

      {phase === "processing" || phase === "confirming" ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <span className="flex h-14 w-14 animate-spin items-center justify-center rounded-full border-2 border-navy/15 border-t-orange" />
          <p className="font-heading text-lg font-semibold text-navy">
            {phase === "processing" ? "Processing your payment…" : "Confirming your booking…"}
          </p>
          <p className="font-body text-sm text-text-grey">Please don&rsquo;t close this window or make another payment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-5">
            <h1 className="font-heading text-xl font-bold text-navy">Choose Payment Method</h1>

            {phase === "failed" && (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3.5">
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
                <div>
                  <p className="font-body text-sm font-semibold text-destructive">Payment unsuccessful</p>
                  <p className="font-body text-xs text-destructive/90">Your hotel booking has not been confirmed. No amount has been charged.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-5">
              {METHODS.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    method === id ? "border-orange bg-orange/[0.04]" : "border-navy/10"
                  )}
                >
                  <input type="radio" name="payment-method" checked={method === id} onChange={() => setMethod(id)} className="h-4 w-4 accent-orange" />
                  <Icon size={18} className="text-navy" />
                  <span className="font-body text-sm text-navy">{label}</span>
                </label>
              ))}
              <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-text-grey">
                <Lock size={12} /> Secure, encrypted transaction.
              </p>
            </div>

            <button
              type="button"
              onClick={() => pay(false)}
              className="rounded-full bg-orange px-6 py-4 font-body text-base font-semibold text-white transition-colors hover:bg-orange/90"
            >
              Pay {formatCurrency(pricing.totalAmount)}
            </button>

            {phase === "failed" && (
              <button type="button" onClick={() => pay(false)} className="self-center font-body text-sm font-semibold text-navy underline underline-offset-2">
                Try Again
              </button>
            )}

            <button
              type="button"
              onClick={() => pay(true)}
              className="self-center font-body text-[11px] text-text-grey/70 underline underline-offset-2"
            >
              Simulate a failed payment (test)
            </button>
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
              pricing={pricing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
