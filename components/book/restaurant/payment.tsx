"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { PaymentPanel, type MockPaymentMethod, type PaymentPhase } from "@/components/book/shared/payment-panel";
import { RestaurantBookingSummary } from "./booking-summary";
import { formatCurrency } from "@/lib/mock-trips";
import { calculateOrderPrice, createMockBooking, getRestaurantDetails } from "@/lib/restaurant-booking-api";
import { clearRestaurantBookingDraft, getRestaurantBookingDraft, saveMockRestaurantBooking, saveRestaurantPaymentMethod } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 50;

export function RestaurantPayment() {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const selections = draft.guestSelections ?? [];

  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);
  const [method, setMethod] = useState<MockPaymentMethod>(draft.paymentMethod ?? "upi");
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const submitting = useRef(false);

  useEffect(() => {
    if (!search || !draft.selectedRestaurantId || !draft.contact || selections.length !== search.guestCount) {
      router.replace("/book/restaurant");
      return;
    }
    getRestaurantDetails(draft.selectedRestaurantId).then(setRestaurant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.selectedRestaurantId || !draft.contact || selections.length !== search.guestCount) return null;

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={4} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (restaurant === null) return null;

  const pricing = calculateOrderPrice(selections, WELCOME_DISCOUNT);

  async function pay(forceFailure = false) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("processing");
    saveRestaurantPaymentMethod(method);

    const booking = await createMockBooking(
      {
        restaurantId: restaurant!.id,
        restaurantName: restaurant!.name,
        restaurantLocation: restaurant!.locationLabel,
        reservation: {
          destinationId: search!.destinationId,
          destinationLabel: search!.destinationLabel,
          reservationDate: search!.reservationDate,
          reservationTime: search!.reservationTime,
          guestCount: search!.guestCount,
        },
        guestSelections: selections,
        contact: draft.contact!,
        pricing,
        paymentMethod: method,
      },
      { forceFailure }
    );

    saveMockRestaurantBooking(booking);

    if (booking.status === "CONFIRMED") {
      setPhase("confirming");
      const ref = booking.bookingReference;
      await new Promise((resolve) => setTimeout(resolve, 900));
      clearRestaurantBookingDraft();
      router.replace(`/book/restaurant/success?ref=${ref}`);
      return;
    }

    submitting.current = false;
    setPhase("failed");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={4} />

      {phase !== "processing" && phase !== "confirming" && (
        <button type="button" onClick={() => router.push("/book/restaurant/review")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back to review
        </button>
      )}

      {phase === "processing" || phase === "confirming" ? (
        <PaymentPanel
          totalLabel={formatCurrency(pricing.totalAmount)}
          phase={phase}
          method={method}
          onMethodChange={setMethod}
          onPay={() => pay(false)}
          onSimulateFailure={() => pay(true)}
          confirmingLabel="Confirming your table…"
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <h1 className="mb-5 font-heading text-xl font-bold text-navy">Choose Payment Method</h1>
            <PaymentPanel
              totalLabel={formatCurrency(pricing.totalAmount)}
              phase={phase}
              method={method}
              onMethodChange={setMethod}
              onPay={() => pay(false)}
              onSimulateFailure={() => pay(true)}
              confirmingLabel="Confirming your table…"
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <RestaurantBookingSummary
              restaurantName={restaurant.name}
              locationLabel={restaurant.locationLabel}
              reservationDate={search.reservationDate}
              reservationTime={search.reservationTime}
              guestCount={search.guestCount}
              pricing={pricing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
