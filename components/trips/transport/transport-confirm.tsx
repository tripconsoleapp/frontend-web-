"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import {
  VehicleSelectionItem,
  getBackendTripId,
  getReviewReturnHref,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { totalCapacity, totalPrice } from "@/lib/transport";
import { useTripContext } from "@/lib/use-trip-context";
import { TransportContextHeader } from "./transport-context-header";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { replaceVehicleServices } from "@/lib/vehicle-service-api";
import { FormError } from "@/components/ui/form-error";

export function TransportConfirm({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, routeLabel, dateRangeLabel } = useTripContext();
  const { authedFetch } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleSelectionItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setVehicles(getServicesDraft().vehicle.pending);
  }, []);

  const templateQuery = template ? `?template=${template}` : "";
  const servicesHref = `/trips/create/services${templateQuery}`;
  const backHref = `/trips/create/services/vehicle/pricing${templateQuery}`;

  const covered = totalCapacity(vehicles);
  const total = totalPrice(vehicles);

  async function handleConfirm() {
    let confirmedVehicles = vehicles;

    const backendTripId = getBackendTripId();
    if (backendTripId) {
      setSubmitting(true);
      setSyncError(null);
      const previousVehicles = getServicesDraft().vehicle.vehicles;
      try {
        // Replaces whatever transport configuration already exists on the
        // trip with this one — this is demo/config persistence (see
        // lib/vehicle-service-api.ts), never a real booking, so a clean
        // replace-on-reconfirm is safe. One TripService per vehicle; the
        // backend has no grouping relation between them (documented there).
        confirmedVehicles = await replaceVehicleServices(
          backendTripId,
          previousVehicles,
          vehicles,
          authedFetch
        );
      } catch (err) {
        setSubmitting(false);
        setSyncError(
          err instanceof ApiError
            ? err.message
            : "Could not save this transport selection. Please try again."
        );
        // Never mark transport as configured locally when the backend
        // rejected it — the in-progress selection is left untouched so the
        // organizer can retry without re-picking vehicles.
        return;
      }
      setSubmitting(false);
    }

    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      vehicle: {
        enabled: true,
        configured: confirmedVehicles.length > 0,
        vehicles: confirmedVehicles,
        pending: [],
      },
    });
    router.push(getReviewReturnHref(servicesHref, template));
  }

  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader backHref={backHref} eyebrow="Services · Transport · Confirm" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Confirm Your Transport
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Review your selection before returning to Services.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={item}
        className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6"
      >
        {routeLabel && (
          <p className="font-heading text-lg font-semibold text-navy">{routeLabel}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
          {dateRangeLabel && <span>{dateRangeLabel}</span>}
          {passengerCount > 0 && <span>{passengerCount} passengers</span>}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-navy/10 pt-4">
          {vehicles.map((v, i) => (
            <div key={`${v.id}-${i}`} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-navy">
                  {vehicles.length > 1 ? `Vehicle ${i + 1}: ` : ""}
                  {v.name} &mdash; {v.capacity} seats
                </p>
                <p className="font-body text-xs text-text-grey">{v.provider}</p>
              </div>
              <span className="shrink-0 font-body text-sm font-semibold text-navy">
                {formatCurrency(v.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-navy/10 pt-4">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-text-grey">
              Total capacity
            </p>
            <p className="flex items-center gap-1.5 font-heading text-base font-semibold text-navy">
              <Check size={14} className="text-navy" /> {covered} seats for{" "}
              {passengerCount} passengers
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs uppercase tracking-wide text-text-grey">Total</p>
            <p className="font-heading text-xl font-bold text-navy">{formatCurrency(total)}</p>
          </div>
        </div>
      </motion.div>

      {syncError && (
        <div className="fixed inset-x-0 bottom-20 z-10 px-10 lg:left-60">
          <FormError message={syncError} />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} selected
        </span>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={vehicles.length === 0 || submitting}
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "disabled:cursor-not-allowed disabled:opacity-40",
          })}
        >
          {submitting ? "Saving..." : "Confirm Transport →"}
        </motion.button>
      </div>
    </div>
  );
}
