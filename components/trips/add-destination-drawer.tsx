"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SharedLocationPicker, type GeocodedPlace } from "@/components/trips/location/shared-location-picker";
import { KeralaLocation, driveTimeBetween } from "@/lib/kerala-locations";
import { DestinationStop } from "@/components/trips/itinerary-stop-card";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { FormError } from "@/components/ui/form-error";

interface AddDestinationDrawerProps {
  open: boolean;
  previousStop: KeralaLocation;
  /** The start location plus every destination already on the route
   *  (including the one being edited, if any) — shown on the picker's
   *  map as small numbered markers for context. */
  contextStops: KeralaLocation[];
  editingStop?: DestinationStop;
  onClose: () => void;
  onSubmit: (stop: DestinationStop) => void;
  /** Set while a backend save is in flight (Start-from-Scratch trips only —
   *  see destinations-flow.tsx). Undefined/false everywhere else, so the
   *  drawer behaves exactly as before when there's no backend to wait on. */
  submitting?: boolean;
  submitError?: string | null;
}

export function AddDestinationDrawer({
  open,
  previousStop,
  contextStops,
  editingStop,
  onClose,
  onSubmit,
  submitting,
  submitError,
}: AddDestinationDrawerProps) {
  const [place, setPlace] = useState<GeocodedPlace | null>(null);
  const [days, setDays] = useState(1);
  const [overnight, setOvernight] = useState(true);
  const isDesktop = useIsDesktop();

  const isEditing = Boolean(editingStop);

  useEffect(() => {
    if (!open) return;
    if (editingStop) {
      setPlace({ id: editingStop.id, name: editingStop.name, district: editingStop.district, lat: editingStop.lat, lng: editingStop.lng });
      setDays(Math.max(1, editingStop.nights || 1));
      setOvernight(editingStop.overnight);
    } else {
      setPlace(null);
      setDays(1);
      setOvernight(true);
    }
  }, [open, editingStop]);

  const travelTime = place ? driveTimeBetween(previousStop, { id: place.id, name: place.name, district: place.district, x: 0, y: 0, lat: place.lat, lng: place.lng }) : null;

  // Don't mark the stop currently being edited as a context marker on its
  // own picker — it would just sit exactly under the active pin.
  const markerStops = contextStops.filter((s) => s.id !== editingStop?.id);

  function handleSubmit() {
    if (!place) return;
    onSubmit({
      id: place.id,
      name: place.name,
      district: place.district,
      x: 0,
      y: 0,
      lat: place.lat,
      lng: place.lng,
      nights: overnight ? days : 0,
      overnight,
      backendId: editingStop?.backendId,
    });
  }

  const panelMotion = isDesktop
    ? {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Edit destination" : "Add destination"}
          className="fixed inset-0 z-[1000] isolate flex items-stretch justify-end lg:items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-navy/50"
          />

          <motion.div
            {...panelMotion}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative z-10 flex min-w-0 w-full flex-col overflow-hidden bg-white shadow-xl",
              isDesktop
                ? "h-full max-w-lg rounded-l-2xl"
                : "mt-auto max-h-[90vh] rounded-t-2xl"
            )}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="font-heading text-2xl font-semibold text-navy">
                {isEditing ? "Edit Destination" : "Add Destination"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-grey transition-colors hover:bg-navy/5 hover:text-navy"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
              {!isEditing && (
                <SharedLocationPicker value={place} onChange={setPlace} contextStops={markerStops} showFooter={false} compact />
              )}

              {isEditing && place && (
                <div>
                  <p className="font-heading text-base font-semibold text-navy">{place.name}</p>
                  <p className="font-body text-xs text-text-grey">{place.district}</p>
                </div>
              )}

              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                  How long will you stay here?
                </p>
                <div className="mt-2 flex items-center justify-between rounded-full bg-navy/[0.03] px-2 py-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    disabled={days <= 1}
                    aria-label="Decrease days"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy shadow-sm transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </motion.button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={days}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="font-body text-base font-semibold text-navy"
                    >
                      {days} {days === 1 ? "Day" : "Days"}
                    </motion.span>
                  </AnimatePresence>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDays((d) => Math.min(14, d + 1))}
                    aria-label="Increase days"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-body text-base text-navy">
                  Add overnight stay?
                </span>
                <Switch
                  checked={overnight}
                  onCheckedChange={setOvernight}
                  label="Add overnight stay"
                />
              </div>
              <AnimatePresence>
                {overnight && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden font-body text-xs font-medium text-navy"
                  >
                    Overnight stay included
                  </motion.p>
                )}
              </AnimatePresence>

              {travelTime && (
                <div className="flex items-center gap-2 rounded-lg bg-mint/15 px-4 py-3 font-body text-base text-navy">
                  <Clock size={14} className="shrink-0 text-navy/70" />
                  Estimated travel time from {previousStop.name}:{" "}
                  <span className="font-semibold">~{travelTime}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 bg-navy/[0.02] px-6 py-4">
              {submitError && <FormError message={submitError} />}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-navy/15 py-3 font-body text-base font-medium text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!place || submitting}
                  onClick={handleSubmit}
                  className={buttonVariants({
                    variant: "accent",
                    className: "flex-1 disabled:cursor-not-allowed disabled:opacity-40",
                  })}
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add to Route"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
