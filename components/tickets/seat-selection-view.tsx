"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { TICKET_STEPS } from "./ticket-search-view";
import { formatCurrency } from "@/lib/mock-trips";
import { BUS_TYPE_LABELS, type KsrtcScheduledService, type KsrtcSeatLayout } from "@/lib/ksrtc-ticket-data";
import { getScheduledServiceDetails, getServiceSeatLayout, getFareBreakdown } from "@/lib/ksrtc-ticket-api";
import { getTicketDraft, saveSelectedService, saveSelectedSeats, saveBoardingDropping } from "@/lib/ksrtc-ticket-state";

export function SeatSelectionView({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const draft = getTicketDraft();
  const search = draft.search;
  // Only resume a previous seat/boarding selection when returning to the
  // SAME service — seat ids are scoped to a service, so a different
  // service's stale ids must never be mistaken for a current selection.
  const resuming = draft.selectedServiceId === serviceId;

  const [service, setService] = useState<KsrtcScheduledService | null | undefined>(undefined);
  const [layout, setLayout] = useState<KsrtcSeatLayout | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(resuming ? draft.selectedSeatIds ?? [] : []);
  const [boardingId, setBoardingId] = useState(resuming ? draft.boardingPointId ?? "" : "");
  const [droppingId, setDroppingId] = useState(resuming ? draft.droppingPointId ?? "" : "");

  useEffect(() => {
    if (!search) {
      router.replace("/tickets/search");
      return;
    }
    if (!resuming) saveSelectedService(serviceId);
    Promise.all([getScheduledServiceDetails(serviceId), getServiceSeatLayout(serviceId)]).then(([s, l]) => {
      setService(s);
      setLayout(l);
      if (s) {
        setBoardingId((prev) => prev || s.boardingPoints[s.boardingPoints.length - 1].id);
        setDroppingId((prev) => prev || s.droppingPoints[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  if (!search) return null;

  if (service === undefined || (service && layout === null)) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={1} />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This service could no longer be found.</p>
        <button type="button" onClick={() => router.push("/tickets/search")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to search
        </button>
      </div>
    );
  }

  if (!layout) return null;

  const neededSeats = search.passengers;
  const canSelectMore = selectedSeatIds.length < neededSeats;

  function toggleSeat(seatId: string, booked: boolean) {
    if (booked) return;
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) return prev.filter((id) => id !== seatId);
      if (prev.length >= neededSeats) return prev;
      return [...prev, seatId];
    });
  }

  const fare = getFareBreakdown(service.fare, selectedSeatIds.length || 1);
  const ready = selectedSeatIds.length === neededSeats && boardingId && droppingId;

  function handleContinue() {
    if (!ready) return;
    saveSelectedSeats(selectedSeatIds);
    const boardingLabel = service!.boardingPoints.find((b) => b.id === boardingId)?.name ?? "";
    const droppingLabel = service!.droppingPoints.find((d) => d.id === droppingId)?.name ?? "";
    saveBoardingDropping(boardingId, boardingLabel, droppingId, droppingLabel);
    router.push("/tickets/passengers");
  }

  const rowsArray = Array.from({ length: layout.rows }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-8 pb-32">
      <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/tickets/search")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to results
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{BUS_TYPE_LABELS[service.busType]}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
          {search.fromLabel} &rarr; {search.toLabel}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
          <Clock size={13} /> {service.departureTime} &rarr; {service.arrivalTime} &middot; {service.durationLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <div className="mb-4 flex items-center justify-between font-body text-xs text-text-grey">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-navy/20 bg-white" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-navy/20" /> Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-orange" /> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-mint" /> Ladies
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              {rowsArray.map((row) => (
                <div key={row} className="flex items-center gap-2">
                  {[0, 1].map((col) => {
                    const seat = layout.seats.find((s) => s.row === row && s.col === col)!;
                    return <SeatButton key={seat.id} seat={seat} selected={selectedSeatIds.includes(seat.id)} disabled={!selectedSeatIds.includes(seat.id) && !canSelectMore} onClick={() => toggleSeat(seat.id, seat.booked)} />;
                  })}
                  <span className="w-5" />
                  {[2, 3].map((col) => {
                    const seat = layout.seats.find((s) => s.row === row && s.col === col)!;
                    return <SeatButton key={seat.id} seat={seat} selected={selectedSeatIds.includes(seat.id)} disabled={!selectedSeatIds.includes(seat.id) && !canSelectMore} onClick={() => toggleSeat(seat.id, seat.booked)} />;
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Boarding point</p>
              <select value={boardingId} onChange={(e) => setBoardingId(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 font-body text-sm text-navy">
                {service.boardingPoints.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.time} &middot; {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Dropping point</p>
              <select value={droppingId} onChange={(e) => setDroppingId(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 font-body text-sm text-navy">
                {service.droppingPoints.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.time} &middot; {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6">
            <p className="font-heading text-base font-semibold text-navy">Your selection</p>
            <p className="flex items-center gap-1.5 font-body text-sm text-navy">
              <Users size={13} /> {selectedSeatIds.length} of {neededSeats} seat{neededSeats === 1 ? "" : "s"} selected
            </p>
            {selectedSeatIds.length > 0 && (
              <p className="font-body text-sm text-text-grey">Seats: {layout.seats.filter((s) => selectedSeatIds.includes(s.id)).map((s) => s.label).join(", ")}</p>
            )}
            <div className="border-t border-navy/10 pt-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated fare</p>
              <p className="mt-1 font-heading text-xl font-bold text-navy">{formatCurrency(fare.totalAmount)}</p>
              <p className="font-body text-xs text-text-grey">{formatCurrency(service.fare)} &times; {selectedSeatIds.length || neededSeats} seat{(selectedSeatIds.length || neededSeats) === 1 ? "" : "s"} + fees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {ready ? "Ready to continue" : `Select ${neededSeats - selectedSeatIds.length} more seat${neededSeats - selectedSeatIds.length === 1 ? "" : "s"}`}
        </span>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!ready}
          className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  disabled,
  onClick,
}: {
  seat: { id: string; label: string; booked: boolean; category: "general" | "ladies" };
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={seat.booked || disabled}
      aria-label={`Seat ${seat.label}${seat.booked ? " (booked)" : ""}`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg font-body text-[11px] font-semibold transition-colors",
        seat.booked
          ? "cursor-not-allowed bg-navy/20 text-navy/40"
          : selected
            ? "bg-orange text-white"
            : seat.category === "ladies"
              ? "bg-mint text-navy hover:bg-mint/80"
              : "border border-navy/20 bg-white text-navy hover:border-navy/40",
        disabled && !selected && "cursor-not-allowed opacity-40"
      )}
    >
      {seat.label}
    </button>
  );
}
