"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HotelBookingStepper } from "./booking-stepper";
import { BookingSummary } from "./booking-summary";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { getHotelDetails } from "@/lib/hotel-booking-api";
import { getHotelBookingDraft, saveGuestDetails } from "@/lib/hotel-booking-state";
import type { Hotel, HotelRoomOption } from "@/lib/hotel-booking-data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s-]{8,15}$/;

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000);
}

export function GuestDetailsForm() {
  const router = useRouter();
  const draft = getHotelBookingDraft();
  const search = draft.search;
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);

  const [firstName, setFirstName] = useState(draft.guestDetails?.firstName ?? "");
  const [lastName, setLastName] = useState(draft.guestDetails?.lastName ?? "");
  const [email, setEmail] = useState(draft.guestDetails?.email ?? "");
  const [phone, setPhone] = useState(draft.guestDetails?.phone ?? "");
  const [specialRequests, setSpecialRequests] = useState(draft.guestDetails?.specialRequests ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search || !draft.selectedHotelId || !draft.selectedRoomId) {
      router.replace("/book/hotel");
      return;
    }
    getHotelDetails(draft.selectedHotelId).then(setHotel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.selectedHotelId || !draft.selectedRoomId) return null;

  if (hotel === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <HotelBookingStepper activeIndex={2} />
        <div className="h-40 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (hotel === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">Hotel information could not be loaded.</p>
        <button type="button" onClick={() => router.push("/book/hotel")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to search
        </button>
      </div>
    );
  }

  const room = hotel.rooms.find((r: HotelRoomOption) => r.id === draft.selectedRoomId)!;
  const nights = nightsBetween(search.checkIn, search.checkOut);

  function handleContinue() {
    if (!firstName.trim()) return setError("Please enter your first name.");
    if (!lastName.trim()) return setError("Please enter your last name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid phone number.");

    setError(null);
    saveGuestDetails({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim(), specialRequests: specialRequests.trim() || undefined });
    router.push("/book/hotel/review");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <HotelBookingStepper activeIndex={2} />

      <button type="button" onClick={() => router.push(`/book/hotel/${hotel.id}`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to room selection
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <h1 className="font-heading text-xl font-bold text-navy">Guest Details</h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Special requests (optional)</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. late check-in, high floor, extra bed"
              rows={3}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
            <p className="mt-1.5 font-body text-xs text-text-grey">Special requests are subject to hotel availability and are not guaranteed.</p>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleContinue}>
            Continue to Review
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
            compact
          />
        </div>
      </div>
    </div>
  );
}
