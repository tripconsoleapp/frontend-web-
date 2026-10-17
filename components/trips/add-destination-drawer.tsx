"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Minus, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RouteMap } from "@/components/trips/route-map";
import {
  KERALA_LOCATIONS,
  KeralaLocation,
  driveTimeBetween,
} from "@/lib/kerala-locations";
import { DestinationStop } from "@/components/trips/itinerary-stop-card";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { FormError } from "@/components/ui/form-error";

const RECENT_IDS = ["munnar", "thekkady", "wayanad"];

interface AddDestinationDrawerProps {
  open: boolean;
  previousStop: KeralaLocation;
  excludeIds: string[];
  editingStop?: DestinationStop;
  initialLocationId?: string | null;
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
  excludeIds,
  editingStop,
  initialLocationId,
  onClose,
  onSubmit,
  submitting,
  submitError,
}: AddDestinationDrawerProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState(1);
  const [overnight, setOvernight] = useState(true);
  const isDesktop = useIsDesktop();

  const isEditing = Boolean(editingStop);

  useEffect(() => {
    if (!open) return;
    if (editingStop) {
      setSelectedId(editingStop.id);
      setDays(Math.max(1, editingStop.nights || 1));
      setOvernight(editingStop.overnight);
    } else {
      setSelectedId(initialLocationId ?? null);
      setDays(1);
      setOvernight(true);
    }
    setSearch("");
  }, [open, editingStop, initialLocationId]);

  const available = useMemo(
    () =>
      KERALA_LOCATIONS.filter(
        (loc) => isEditing || !excludeIds.includes(loc.id)
      ),
    [excludeIds, isEditing]
  );

  const filtered = available.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  const recentChips = available.filter((loc) => RECENT_IDS.includes(loc.id));

  // Look up against the full list, not the exclude-filtered `available` —
  // a selection (e.g. from the map's quick-add search) must stay valid
  // even if it isn't in the browsable list, otherwise the button below
  // can get stuck disabled despite a location being chosen.
  const selected = KERALA_LOCATIONS.find((loc) => loc.id === selectedId);
  const travelTime = selected
    ? driveTimeBetween(previousStop, selected)
    : null;

  function handleSubmit() {
    if (!selected) return;
    onSubmit({
      id: selected.id,
      name: selected.name,
      district: selected.district,
      x: selected.x,
      y: selected.y,
      lat: selected.lat,
      lng: selected.lng,
      nights: overnight ? days : 0,
      overnight,
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
                ? "h-full max-w-md rounded-l-2xl"
                : "mt-auto max-h-[85vh] rounded-t-2xl"
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

            <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
              {!isEditing && (
                <>
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-grey"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search destination..."
                      className="w-full rounded-xl border border-navy/10 bg-navy/[0.03] py-3 pl-9 pr-3 font-body text-base text-navy placeholder:text-text-grey/60 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
                    />
                  </div>

                  {recentChips.length > 0 && (
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                        Recent
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recentChips.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => setSelectedId(loc.id)}
                            className={cn(
                              "rounded-full border px-4 py-2 font-body text-base font-medium transition-colors",
                              selectedId === loc.id
                                ? "border-orange bg-orange/10 text-orange"
                                : "border-navy/15 text-navy hover:border-navy/30"
                            )}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                    {filtered.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setSelectedId(loc.id)}
                        aria-pressed={selectedId === loc.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          selectedId === loc.id
                            ? "border-orange bg-orange/5"
                            : "border-navy/10 hover:border-navy/25"
                        )}
                      >
                        <div>
                          <span className="block font-body text-base font-medium text-navy">
                            {loc.name}
                          </span>
                          <span className="block font-body text-xs text-text-grey">
                            {loc.district}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="px-1 py-2 font-body text-base text-text-grey">
                        No matches for &ldquo;{search}&rdquo;.
                      </p>
                    )}
                  </div>
                </>
              )}

              {selected && (
                <div className="flex flex-col gap-1">
                  {!isEditing && (
                    <div>
                      <p className="font-heading text-base font-semibold text-navy">
                        {selected.name}
                      </p>
                      <p className="font-body text-xs text-text-grey">
                        {selected.district}
                      </p>
                    </div>
                  )}
                  <div
                    className="w-full shrink-0 overflow-hidden rounded-xl"
                    style={{ height: "9rem" }}
                  >
                    <RouteMap stops={[selected]} compact />
                  </div>
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
                  disabled={!selected || submitting}
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
