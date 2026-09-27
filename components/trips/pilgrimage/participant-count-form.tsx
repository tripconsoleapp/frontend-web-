"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { BookingHeader } from "@/components/trips/pilgrimage/booking-header";
import { formatCurrency } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture, departureStatus, isDepartureBookable, remainingSlots } from "@/lib/pilgrimage-departures";
import { confirmedSeatsForDeparture, createBooking, getActiveBooking, heldSeatsForDeparture } from "@/lib/pilgrimage-booking";

export function ParticipantCountForm({
  departure,
  template,
}: {
  departure: PilgrimageDeparture;
  template: Template;
}) {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [available, setAvailable] = useState<number | null>(null);
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;

  useEffect(() => {
    const active = getActiveBooking(departure.id);
    const excludeId = active?.id;
    const remaining = remainingSlots(
      departure,
      confirmedSeatsForDeparture(departure.id) + heldSeatsForDeparture(departure.id, excludeId)
    );
    setAvailable(remaining);
    if (active) setCount(Math.min(active.participantCount, Math.max(1, remaining)));

    const status = departureStatus(departure, confirmedSeatsForDeparture(departure.id));
    if (!isDepartureBookable(status)) router.replace(detailHref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overCapacity = available !== null && count > available;
  const total = count * departure.pricePerPerson;

  function handleContinue() {
    if (available === null || overCapacity || count < 1) return;
    const booking = createBooking(departure.id, count, departure.pricePerPerson);
    router.push(`/pilgrimage/scheduled/${departure.id}/passengers?booking=${booking.id}`);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <BookingHeader
        title={departure.title}
        imageUrl={template.imageUrl}
        departureDate={departure.departureDate}
        returnDate={departure.returnDate}
        backHref={detailHref}
        activeIndex={0}
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          How many are joining?
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Each participant will need their own passenger details on the next
          step.
        </p>
      </div>

      <CounterInput label="Participants" value={count} onChange={setCount} min={1} max={available ?? 1} />

      {overCapacity && available !== null && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-destructive-soft px-4 py-3 font-body text-sm font-medium text-destructive"
        >
          <AlertCircle size={15} className="shrink-0" />
          Only {available} spot{available === 1 ? "" : "s"} remain for this
          departure.
        </motion.p>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-navy/[0.02] px-5 py-4">
        <span className="font-body text-sm text-text-grey">
          {count} &times; {formatCurrency(departure.pricePerPerson)}
        </span>
        <span className="font-heading text-xl font-bold text-navy">
          {formatCurrency(total)}
        </span>
      </div>

      <motion.button
        type="button"
        whileHover={overCapacity ? undefined : { y: -1 }}
        whileTap={overCapacity ? undefined : { scale: 0.98 }}
        onClick={handleContinue}
        disabled={overCapacity || available === null}
        className={buttonVariants({
          variant: "accent",
          size: "lg",
          className: "w-full disabled:cursor-not-allowed disabled:opacity-40",
        })}
      >
        Continue to Passenger Details &rarr;
      </motion.button>
    </div>
  );
}
