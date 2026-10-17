"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MapPin, Wifi, ParkingCircle, Waves, UtensilsCrossed, Coffee, Snowflake } from "lucide-react";
import { HotelBookingStepper } from "./booking-stepper";
import { ImageGallery } from "./image-gallery";
import { RoomCard } from "./room-card";
import { getHotelDetails } from "@/lib/hotel-booking-api";
import { getHotelBookingDraft, saveRoomSelection } from "@/lib/hotel-booking-state";
import type { Hotel } from "@/lib/hotel-booking-data";

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  Parking: ParkingCircle,
  Pool: Waves,
  Restaurant: UtensilsCrossed,
  Breakfast: Coffee,
  AC: Snowflake,
};

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000);
}

export function HotelDetails({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const draft = getHotelBookingDraft();
  const search = draft.search;

  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(draft.selectedRoomId ?? null);

  useEffect(() => {
    if (!search) {
      router.replace("/book/hotel");
      return;
    }
    getHotelDetails(hotelId).then(setHotel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  if (!search) return null;

  if (hotel === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <HotelBookingStepper activeIndex={1} />
        <div className="h-80 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-navy/[0.06]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-navy/[0.06]" />
      </div>
    );
  }

  if (hotel === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">Hotel information could not be loaded.</p>
        <button type="button" onClick={() => router.push("/book/hotel/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to listings
        </button>
      </div>
    );
  }

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const totalGuests = search.adults + search.children;
  const selectedRoom = hotel.rooms.find((r) => r.id === selectedRoomId) ?? null;
  const selectedFits = selectedRoom ? selectedRoom.maxGuests * search.rooms >= totalGuests : false;

  function selectRoom(roomId: string) {
    setSelectedRoomId(roomId);
    saveRoomSelection(roomId);
  }

  function handleContinue() {
    if (!selectedRoom || !selectedFits) return;
    router.push("/book/hotel/guest-details");
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      <HotelBookingStepper activeIndex={1} />

      <button
        type="button"
        onClick={() => router.push("/book/hotel/listings")}
        className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy"
      >
        <ArrowLeft size={14} /> Back to listings
      </button>

      <ImageGallery images={hotel.images} alt={hotel.name} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy">{hotel.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
              <MapPin size={14} /> {hotel.location}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-md bg-navy/5 px-2.5 py-1">
                <Star size={13} className="fill-orange text-orange" />
                <span className="font-body text-xs font-semibold text-navy">{hotel.guestRating.toFixed(1)}</span>
              </span>
              <span className="font-body text-xs text-text-grey">{hotel.reviewCount} reviews</span>
              <span className="font-body text-xs text-text-grey">
                {"★".repeat(hotel.starRating)}
                {"☆".repeat(5 - hotel.starRating)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-navy/[0.03] px-4 py-3">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your search</p>
            <p className="mt-1 font-body text-sm text-navy">
              {new Date(`${search.checkIn}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &rarr;{" "}
              {new Date(`${search.checkOut}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &middot; {nights} night
              {nights === 1 ? "" : "s"}
            </p>
            <p className="font-body text-sm text-navy">
              {search.adults} Adult{search.adults === 1 ? "" : "s"}
              {search.children > 0 ? ` · ${search.children} Child${search.children === 1 ? "" : "ren"}` : ""} &middot; {search.rooms} Room
              {search.rooms === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">About</p>
            <p className="mt-2 font-body text-sm text-navy">{hotel.description}</p>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amenities</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {hotel.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a];
                return (
                  <span key={a} className="flex items-center gap-1.5 rounded-full border border-navy/10 px-3 py-1.5 font-body text-xs text-navy">
                    {Icon && <Icon size={14} />} {a}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 font-body text-xs text-text-grey">
              Check-in {hotel.checkInTime} &middot; Check-out {hotel.checkOutTime}
            </p>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Reviews</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {hotel.reviews.map((r) => (
                <div key={r.author} className="rounded-xl border border-navy/10 p-3">
                  <p className="font-body text-xs font-semibold text-navy">{r.author}</p>
                  <p className="font-body text-[11px] text-text-grey">{r.date}</p>
                  <p className="mt-1.5 font-body text-xs text-navy/80">{r.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-body text-[11px] text-text-grey">Sample reviews shown for demonstration.</p>
          </div>

          <div>
            <p className="font-heading text-base font-semibold text-navy">Select a Room</p>
            <div className="mt-3 flex flex-col gap-3">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  nights={nights}
                  roomCount={search.rooms}
                  selected={room.id === selectedRoomId}
                  fitsParty={room.maxGuests * search.rooms >= totalGuests}
                  onSelect={() => selectRoom(room.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-4 lg:left-60">
          <div>
            <p className="font-body text-sm font-semibold text-navy">{selectedRoom.name}</p>
            {!selectedFits && (
              <p className="font-body text-xs text-destructive">Doesn&rsquo;t fit your party — choose another room.</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedFits}
            className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
