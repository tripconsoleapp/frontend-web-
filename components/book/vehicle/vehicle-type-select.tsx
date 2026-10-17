"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { listVehicleCategories } from "@/lib/vehicle-booking-api";
import { getVehicleBookingDraft, saveVehicleCategory } from "@/lib/vehicle-booking-state";
import type { VehicleCategoryId } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function VehicleTypeSelect() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;

  useEffect(() => {
    if (!search || draft.transportMode !== "private") router.replace("/book/vehicle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || draft.transportMode !== "private") return null;

  const categories = listVehicleCategories();

  function choose(categoryId: VehicleCategoryId) {
    saveVehicleCategory(categoryId);
    router.push("/book/vehicle/listings");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/vehicle/mode")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to transport mode
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Private Operator</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Choose a vehicle type</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.pickupLabel} &rarr; {search.dropLabel} &middot; {search.passengers} Passenger{search.passengers === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => choose(c.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white text-left transition-shadow hover:shadow-lg">
            <div className="relative h-36 w-full overflow-hidden">
              <Image src={c.image} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col gap-1.5 p-4">
              <p className="font-heading text-base font-semibold text-navy">{c.name}</p>
              <p className="font-body text-xs text-text-grey">{c.capacityRange}</p>
              <p className="font-body text-xs text-text-grey">{c.idealFor}</p>
              <p className="mt-1 font-body text-sm text-navy">
                From <span className="font-semibold">{formatCurrency(c.fromPrice)}</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
