"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { RestaurantBookingSummary } from "./booking-summary";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { calculateOrderPrice } from "@/lib/restaurant-booking-api";
import { getRestaurantDetails } from "@/lib/restaurant-booking-api";
import { getNextIncompleteGuestIndex, getRestaurantBookingDraft, saveContactDetails } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s-]{8,15}$/;

export function ReservationReview() {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);
  const [name, setName] = useState(draft.contact?.name ?? "");
  const [email, setEmail] = useState(draft.contact?.email ?? "");
  const [phone, setPhone] = useState(draft.contact?.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  const guestCount = search?.guestCount ?? 0;
  const selections = draft.guestSelections ?? [];
  const allGuestsDone = guestCount > 0 && getNextIncompleteGuestIndex(draft) >= guestCount;

  useEffect(() => {
    if (!search || !draft.selectedRestaurantId) {
      router.replace("/book/restaurant");
      return;
    }
    if (!allGuestsDone) {
      const next = getNextIncompleteGuestIndex(draft);
      router.replace(`/book/restaurant/guests/${next}/identify`);
      return;
    }
    getRestaurantDetails(draft.selectedRestaurantId).then(setRestaurant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.selectedRestaurantId || !allGuestsDone) return null;

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (restaurant === null) return null;

  const pricing = calculateOrderPrice(selections, WELCOME_DISCOUNT);

  function handleConfirm() {
    if (!name.trim()) return setError("Please enter the reservation holder's name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid phone number.");
    setError(null);
    saveContactDetails({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    router.push("/book/restaurant/payment");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={3} />

      <button
        type="button"
        onClick={() => router.push(`/book/restaurant/guests/${guestCount - 1}/dish`)}
        className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy"
      >
        <ArrowLeft size={14} /> Back to guest selection
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Reservation Review</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{restaurant.name}</h1>
            <p className="font-body text-sm text-text-grey">{restaurant.locationLabel}</p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guest Selections</p>
            <div className="mt-3 flex flex-col gap-2">
              {selections.map((s) => (
                <div key={s.guestId} className="flex items-center justify-between gap-3 border-b border-navy/5 pb-2 font-body text-sm text-navy last:border-b-0 last:pb-0">
                  <span className="font-semibold">{s.guestName}</span>
                  <span className="text-text-grey">{s.dishName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Reservation Contact</p>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
              </div>
              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
              </div>
            </div>
            {error && <FormError message={error} />}
          </div>

          <Button type="button" variant="accent" size="lg" onClick={handleConfirm}>
            Confirm Reservation &amp; Continue to Payment
          </Button>
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
    </div>
  );
}
