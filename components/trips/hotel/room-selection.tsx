"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { Hotel, RoomType } from "@/lib/mock-hotel-catalog";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import {
  RoomSelectionItem,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { roomsRequired, stayTotal, totalGuestsCovered, totalRoomsCount, nightsLabel } from "@/lib/hotel-stays";
import { CounterInput } from "@/components/ui/counter-input";
import { CapacityBar } from "@/components/trips/transport/capacity-bar";
import { HotelContextHeader } from "./hotel-context-header";

export function RoomSelection({
  destinationId,
  hotel,
  template,
}: {
  destinationId: string;
  hotel: Hotel;
  template?: string;
}) {
  const router = useRouter();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const stay = trip.ready ? getServicesDraft().hotel.stays.find((s) => s.destinationId === destinationId) : undefined;
  const nights = stay?.nights ?? 1;
  const guests = trip.passengerCount;

  const [rooms, setRooms] = useState<RoomSelectionItem[]>([]);

  useEffect(() => {
    if (!trip.ready) return;
    const draft = getServicesDraft();
    const existingPending =
      draft.hotel.pending?.destinationId === destinationId && draft.hotel.pending.hotel.id === hotel.id
        ? draft.hotel.pending.rooms
        : null;
    const existingBooked = draft.hotel.stays.find(
      (s) => s.destinationId === destinationId && s.hotel?.id === hotel.id
    )?.rooms;
    if (existingPending && existingPending.length > 0) {
      setRooms(existingPending);
      return;
    }
    if (existingBooked && existingBooked.length > 0) {
      setRooms(existingBooked);
      return;
    }
    const defaultRoom = hotel.rooms[0];
    const quantity = Math.max(1, roomsRequired(guests || 1, defaultRoom.sleeps));
    setRooms([
      {
        roomId: defaultRoom.id,
        roomName: defaultRoom.name,
        pricePerNight: defaultRoom.pricePerNight,
        capacity: defaultRoom.sleeps,
        quantity,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.ready, destinationId, hotel.id]);

  const covered = totalGuestsCovered(rooms);
  const roomCount = totalRoomsCount(rooms);
  const total = stayTotal(rooms, nights);
  const fits = guests === 0 || covered >= guests;

  function updateQuantity(roomId: string, quantity: number) {
    setRooms((current) => {
      if (quantity <= 0) return current.filter((r) => r.roomId !== roomId);
      const exists = current.find((r) => r.roomId === roomId);
      if (exists) return current.map((r) => (r.roomId === roomId ? { ...r, quantity } : r));
      const roomType = hotel.rooms.find((r) => r.id === roomId);
      if (!roomType) return current;
      return [
        ...current,
        { roomId: roomType.id, roomName: roomType.name, pricePerNight: roomType.pricePerNight, capacity: roomType.sleeps, quantity },
      ];
    });
  }

  function addRoomType(roomType: RoomType) {
    updateQuantity(roomType.id, (rooms.find((r) => r.roomId === roomType.id)?.quantity ?? 0) + 1);
  }

  function removeRoomLine(roomId: string) {
    setRooms((current) => current.filter((r) => r.roomId !== roomId));
  }

  function handleContinue() {
    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      hotel: {
        ...draft.hotel,
        pending: {
          destinationId,
          hotel: {
            id: hotel.id,
            name: hotel.name,
            propertyType: hotel.propertyType,
            location: hotel.locationLabel,
            rating: hotel.rating,
            imageUrl: hotel.heroImage,
          },
          rooms,
        },
      },
    });
    router.push(`/trips/create/services/hotel/${destinationId}/confirm${templateQuery}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <HotelContextHeader
        backHref={`/trips/create/services/hotel/${destinationId}/${hotel.id}${templateQuery}`}
        backLabel="Back to hotel"
        eyebrow="Select Hotels · Rooms"
        stay={stay ? { destinationName: stay.destinationName, checkIn: stay.checkIn, checkOut: stay.checkOut, nights: stay.nights } : undefined}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{hotel.name}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Choose which rooms cover your group.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {rooms.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your selection</p>
              <AnimatePresence initial={false}>
                {rooms.map((r) => (
                  <motion.div
                    key={r.roomId}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 rounded-xl border border-orange/30 bg-orange/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-navy">{r.roomName}</p>
                      <p className="font-body text-xs text-text-grey">
                        {r.capacity} guests/room &middot; {formatCurrency(r.pricePerNight)}/night
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CounterInput label={`${r.roomName} rooms`} value={r.quantity} onChange={(v) => updateQuantity(r.roomId, v)} min={0} />
                      <button
                        type="button"
                        onClick={() => removeRoomLine(r.roomId)}
                        aria-label={`Remove ${r.roomName}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {guests > 0 && <CapacityBar covered={covered} required={guests} />}
            </div>
          )}

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Available room types</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hotel.rooms.map((r) => {
                const selectedQty = rooms.find((x) => x.roomId === r.id)?.quantity ?? 0;
                return (
                  <div
                    key={r.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
                  >
                    <div className="relative h-32 w-full overflow-hidden">
                      <Image src={r.imageUrl} alt={r.name} fill sizes="(min-width: 640px) 45vw, 100vw" className="object-cover" />
                      {selectedQty > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-navy px-2 py-0.5 font-body text-[10px] font-semibold text-white">
                          {selectedQty} selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <h3 className="font-heading text-sm font-semibold text-navy">{r.name}</h3>
                      <p className="font-body text-xs text-text-grey">
                        Sleeps {r.sleeps} &middot; {r.beds}
                        {r.view ? ` · ${r.view}` : ""}
                      </p>
                      <p className="font-body text-xs text-text-grey">
                        {r.breakfastIncluded ? "Breakfast included" : "Room only"} &middot;{" "}
                        {r.cancellation === "free" ? "Free cancellation" : "Non-refundable"}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <p className="font-body text-sm font-bold text-navy">{formatCurrency(r.pricePerNight)}/night</p>
                        <button
                          type="button"
                          onClick={() => addRoomType(r)}
                          className="rounded-full border border-navy/20 px-3.5 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:border-orange hover:text-orange"
                        >
                          {selectedQty > 0 ? "Add another" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl bg-navy/[0.02] p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Stay summary</p>
            {stay && <p className="mt-2 font-body text-sm font-semibold text-navy">{stay.destinationName}</p>}
            {stay && (
              <p className="font-body text-xs text-text-grey">
                {nightsLabel(stay.nights)} &middot; {guests} guests
              </p>
            )}
            <p className="mt-2 font-body text-sm text-navy">{roomCount} {roomCount === 1 ? "room" : "rooms"}</p>
            <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
              <span className="font-body text-sm font-semibold text-navy">Estimated</span>
              <span className="font-heading text-lg font-bold text-navy">{formatCurrency(total)}</span>
            </div>
            <motion.button
              type="button"
              whileHover={roomCount === 0 ? undefined : { y: -1 }}
              whileTap={roomCount === 0 ? undefined : { scale: 0.98 }}
              disabled={roomCount === 0 || !fits}
              onClick={handleContinue}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to Confirmation <ArrowRight size={14} />
            </motion.button>
            {!fits && guests > 0 && (
              <p className="mt-2 font-body text-xs text-orange">Add more rooms to cover all {guests} guests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
