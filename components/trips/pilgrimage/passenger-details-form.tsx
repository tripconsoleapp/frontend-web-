"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { BookingHeader } from "@/components/trips/pilgrimage/booking-header";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { BookingPassenger, DepartureBooking, getActiveBooking, getBooking, updatePassengers } from "@/lib/pilgrimage-booking";

function emptyPassenger(id: string): BookingPassenger {
  return { id, fullName: "", age: "", gender: "", idType: "", idNumber: "" };
}

export function PassengerDetailsForm({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const router = useRouter();
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [booking, setBooking] = useState<DepartureBooking | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    if (!active) {
      router.replace(`${detailHref}/participants`);
      return;
    }
    setBooking(active);
    setContactPhone(active.contactPhone);
    setPassengers(
      active.passengers.length === active.participantCount
        ? active.passengers
        : Array.from({ length: active.participantCount }, (_, i) => active.passengers[i] ?? emptyPassenger(`pax_${i}`))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return <div className="h-64" />;

  function updatePassenger(index: number, patch: Partial<BookingPassenger>) {
    setPassengers((current) => current.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  const allValid =
    contactPhone.trim().length > 0 &&
    passengers.every((p) => p.fullName.trim() && p.age && p.gender && p.idType && p.idNumber.trim());

  function handleContinue() {
    if (!booking || !allValid) return;
    updatePassengers(booking.id, passengers, contactPhone);
    router.push(`${detailHref}/summary?booking=${booking.id}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <BookingHeader
        title={departure.title}
        imageUrl={template.imageUrl}
        departureDate={departure.departureDate}
        returnDate={departure.returnDate}
        backHref={`${detailHref}/participants`}
        activeIndex={1}
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Passenger Details</h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Details for your {passengers.length} passenger{passengers.length === 1 ? "" : "s"} on this
          departure.
        </p>
      </div>

      <Input
        label="Contact Phone"
        type="tel"
        value={contactPhone}
        onChange={(e) => setContactPhone(e.target.value)}
        placeholder="98765 43210"
        leftElement={<Phone size={18} />}
        hint="Used to reach the primary contact about this booking."
        required
      />

      <div className="flex flex-col gap-6">
        {passengers.map((passenger, index) => (
          <motion.div
            key={passenger.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col gap-4 rounded-2xl border border-navy/10 p-5"
          >
            <p className="flex items-center gap-2 font-heading text-sm font-semibold text-navy">
              <User size={15} className="text-orange" />
              Passenger {index + 1}
            </p>
            <Input
              label="Full Name"
              value={passenger.fullName}
              onChange={(e) => updatePassenger(index, { fullName: e.target.value })}
              placeholder="As on ID"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age"
                type="number"
                value={passenger.age}
                onChange={(e) => updatePassenger(index, { age: e.target.value })}
                placeholder="e.g. 34"
                required
              />
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                  Gender
                </span>
                <select
                  value={passenger.gender}
                  onChange={(e) => updatePassenger(index, { gender: e.target.value as BookingPassenger["gender"] })}
                  className="w-full rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 font-body text-text-dark focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                  ID Proof Type
                </span>
                <select
                  value={passenger.idType}
                  onChange={(e) => updatePassenger(index, { idType: e.target.value as BookingPassenger["idType"] })}
                  className="w-full rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 font-body text-text-dark focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
                >
                  <option value="">Select ID type</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <Input
                label="ID Number"
                value={passenger.idNumber}
                onChange={(e) => updatePassenger(index, { idNumber: e.target.value })}
                placeholder="ID number"
                required
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button"
        whileHover={allValid ? { y: -1 } : undefined}
        whileTap={allValid ? { scale: 0.98 } : undefined}
        onClick={handleContinue}
        disabled={!allValid}
        className={buttonVariants({
          variant: "accent",
          size: "lg",
          className: "w-full disabled:cursor-not-allowed disabled:opacity-40",
        })}
      >
        Continue to Booking Summary &rarr;
      </motion.button>
    </div>
  );
}
