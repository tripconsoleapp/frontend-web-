"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { VehicleCard } from "./vehicle-card";
import { CapacityStatus } from "./capacity-status";
import { formatCurrency } from "@/lib/mock-trips";
import { searchVehiclesByCategory, calculateCombinationPrice, type PrivateVehicleResult } from "@/lib/vehicle-booking-api";
import { getCategoryById } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft, toggleSelectedVehicle } from "@/lib/vehicle-booking-state";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function VehicleListings() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const categoryId = draft.vehicleCategoryId;

  const [results, setResults] = useState<PrivateVehicleResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(draft.selectedVehicleIds ?? []);

  useEffect(() => {
    if (!search || draft.transportMode !== "private" || !categoryId) {
      router.replace("/book/vehicle");
      return;
    }
    searchVehiclesByCategory(categoryId, search)
      .then(setResults)
      .catch(() => setError("We couldn't load vehicles right now. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || draft.transportMode !== "private" || !categoryId) return null;

  const category = getCategoryById(categoryId);
  const selectedResults = (results ?? []).filter((r) => selectedIds.includes(r.vehicle.id));
  const combined = selectedResults.reduce((sum, r) => sum + r.vehicle.seatingCapacity, 0);
  const sufficient = combined >= search.passengers && selectedIds.length > 0;
  const distanceKm = results?.[0]?.distanceKm ?? 0;
  const pricing = selectedResults.length > 0 ? calculateCombinationPrice(selectedResults.map((r) => r.vehicle), distanceKm, search.isRoundTrip) : null;

  function toggle(vehicleId: string) {
    const next = toggleSelectedVehicle(vehicleId);
    setSelectedIds(next);
  }

  function handleContinue() {
    if (!sufficient) return;
    router.push("/book/vehicle/confirm");
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/vehicle/type")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to vehicle types
      </button>

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{category?.name}</h1>
        <p className="font-body text-sm text-text-grey">
          {search.pickupLabel} &rarr; {search.dropLabel} &middot; {search.passengers} Passenger{search.passengers === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {error && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
              <p className="font-body text-sm text-text-grey">{error}</p>
            </div>
          )}

          {!error && results === null && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex h-40 w-full animate-pulse flex-col overflow-hidden rounded-2xl border border-navy/10 bg-navy/[0.03] sm:flex-row" />
              ))}
            </div>
          )}

          {!error && results !== null && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
              <p className="font-heading text-base font-semibold text-navy">No vehicles available in this category.</p>
              <button type="button" onClick={() => router.push("/book/vehicle/type")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
                Choose another vehicle type
              </button>
            </div>
          )}

          {!error && results !== null && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((r) => (
                <VehicleCard
                  key={r.vehicle.id}
                  result={r}
                  selected={selectedIds.includes(r.vehicle.id)}
                  onToggle={() => toggle(r.vehicle.id)}
                  onViewDetails={() => router.push(`/book/vehicle/${r.vehicle.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:h-fit">
          <CapacityStatus combined={combined} required={search.passengers} />
          {pricing && (
            <div className="rounded-2xl border border-navy/10 bg-white p-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Selected vehicles ({selectedResults.length})</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {selectedResults.map((r) => (
                  <div key={r.vehicle.id} className="flex items-center justify-between font-body text-xs text-navy">
                    <span>
                      {r.vehicle.name} ({r.vehicle.seatingCapacity} seats)
                    </span>
                    <span>{formatCurrency(r.estimatedPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-navy/10 pt-2 font-body text-sm font-semibold text-navy">
                <span>Estimated total</span>
                <span>{formatCurrency(pricing.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-4 lg:left-60">
        <div>
          <p className="font-body text-sm font-semibold text-navy">
            {selectedIds.length} vehicle{selectedIds.length === 1 ? "" : "s"} selected
          </p>
          <p className="font-body text-xs text-text-grey">Combined capacity: {combined}</p>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!sufficient}
          className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
