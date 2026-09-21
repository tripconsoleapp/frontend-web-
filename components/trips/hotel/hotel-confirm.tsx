"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import {
  DestinationStay,
  PendingHotelSelection,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { buildStayPricing, nightsLabel } from "@/lib/hotel-stays";
import { HotelContextHeader } from "./hotel-context-header";

export function HotelConfirm({ destinationId, template }: { destinationId: string; template?: string }) {
  const router = useRouter();
  const templateQuery = template ? `?template=${template}` : "";

  const [pending, setPending] = useState<PendingHotelSelection | null>(null);
  const [stay, setStay] = useState<DestinationStay | null>(null);

  useEffect(() => {
    const draft = getServicesDraft();
    if (draft.hotel.pending?.destinationId === destinationId) {
      setPending(draft.hotel.pending);
    }
    setStay(draft.hotel.stays.find((s) => s.destinationId === destinationId) ?? null);
  }, [destinationId]);

  if (!pending || !stay) {
    return (
      <div className="flex flex-col gap-6">
        <HotelContextHeader backHref={`/trips/create/services/hotel${templateQuery}`} eyebrow="Select Hotels · Confirm" />
        <div className="h-32 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const pricing = buildStayPricing(pending.rooms, stay.nights);
  const roomCount = pending.rooms.reduce((sum, r) => sum + r.quantity, 0);
  const guestsCovered = pending.rooms.reduce((sum, r) => sum + r.quantity * r.capacity, 0);

  function handleAddToTrip() {
    const draft = getServicesDraft();
    const next = draft.hotel.stays.map((s) =>
      s.destinationId === destinationId
        ? { ...s, status: "booked" as const, hotel: pending!.hotel, rooms: pending!.rooms, total: pricing.total }
        : s
    );
    const nextPending = next.find((s) => s.status === "pending");
    saveServicesDraft({
      ...draft,
      hotel: {
        ...draft.hotel,
        stays: next,
        pending: null,
        configured: next.every((s) => s.status !== "pending"),
      },
    });
    router.push(
      nextPending
        ? `/trips/create/services/hotel${templateQuery}`
        : `/trips/create/services/hotel/summary${templateQuery}`
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <HotelContextHeader
        backHref={`/trips/create/services/hotel/${destinationId}/${pending.hotel.id}/rooms${templateQuery}`}
        backLabel="Back to rooms"
        eyebrow="Select Hotels · Confirm"
        stay={{ destinationName: stay.destinationName, checkIn: stay.checkIn, checkOut: stay.checkOut, nights: stay.nights }}
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Hotel cost confirmation</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{pending.hotel.name}</h1>
        <p className="mt-0.5 font-body text-sm text-text-grey">{stay.destinationName}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <div className="relative h-48 w-full overflow-hidden rounded-2xl">
            <Image src={pending.hotel.imageUrl} alt={pending.hotel.name} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-navy/10 p-5 sm:grid-cols-4">
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">Check-in</p>
              <p className="font-body text-sm font-semibold text-navy">{new Date(stay.checkIn).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">Check-out</p>
              <p className="font-body text-sm font-semibold text-navy">{new Date(stay.checkOut).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">Rooms</p>
              <p className="font-body text-sm font-semibold text-navy">{roomCount}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">Guests covered</p>
              <p className="font-body text-sm font-semibold text-navy">{guestsCovered}</p>
            </div>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Rooms</p>
            <div className="mt-2 flex flex-col gap-2">
              {pending.rooms.map((r) => (
                <div key={r.roomId} className="flex items-center justify-between rounded-xl bg-navy/[0.03] px-4 py-3">
                  <p className="font-body text-sm text-navy">
                    {r.quantity} &times; {r.roomName}
                  </p>
                  <p className="font-body text-sm font-semibold text-navy">{formatCurrency(r.pricePerNight * r.quantity)}/night</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Fare breakdown</p>
            <div className="mt-3 flex flex-col gap-2 font-body text-sm text-navy">
              <div className="flex items-center justify-between">
                <span className="text-text-grey">Room charges</span>
                <span className="font-medium">{formatCurrency(pricing.roomCharges)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-grey">Taxes &amp; fees</span>
                <span className="font-medium">{formatCurrency(pricing.taxesAndFees)}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
              <span className="font-body text-sm font-semibold text-navy">Total</span>
              <span className="font-heading text-xl font-bold text-navy">{formatCurrency(pricing.total)}</span>
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToTrip}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              <Check size={15} /> Add to Trip &mdash; {formatCurrency(pricing.total)}
            </motion.button>
            <button
              type="button"
              onClick={() => router.push(`/trips/create/services/hotel/${destinationId}/${pending.hotel.id}/rooms${templateQuery}`)}
              className="mt-2 flex w-full items-center justify-center gap-1 font-body text-sm font-medium text-navy underline underline-offset-2 transition-colors hover:text-orange"
            >
              Choose a Different Room <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
