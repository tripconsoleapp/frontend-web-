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

const RECENT_IDS = ["munnar", "thekkady", "wayanad"];

interface AddDestinationModalProps {
  open: boolean;
  previousStop: KeralaLocation;
  excludeIds: string[];
  editingStop?: DestinationStop;
  initialLocationId?: string | null;
  onClose: () => void;
  onSubmit: (stop: DestinationStop) => void;
}

export function AddDestinationModal({
  open,
  previousStop,
  excludeIds,
  editingStop,
  initialLocationId,
  onClose,
  onSubmit,
}: AddDestinationModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [days, setDays] = useState(1);
  const [overnight, setOvernight] = useState(true);

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
      x: selected.x,
      y: selected.y,
      lat: selected.lat,
      lng: selected.lng,
      nights: overnight ? days : 0,
      overnight,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Edit destination" : "Add destination"}
          className="fixed inset-0 z-[1000] isolate flex items-center justify-center bg-navy/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-w-0 max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
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

                  <div className="flex max-h-36 flex-col gap-2 overflow-y-auto">
                    {filtered.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setSelectedId(loc.id)}
                        aria-pressed={selectedId === loc.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                          selectedId === loc.id
                            ? "border-orange bg-orange/5"
                            : "border-navy/10 hover:border-navy/25"
                        )}
                      >
                        <span className="font-body text-base font-medium text-navy">
                          {loc.name}
                        </span>
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
                <div
                  className="w-full shrink-0 overflow-hidden rounded-xl"
                  style={{ height: "9rem" }}
                >
                  <RouteMap stops={[selected]} compact />
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
                  <span className="font-body text-base font-semibold text-navy">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
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

              {travelTime && (
                <div className="flex items-center gap-2 rounded-lg bg-mint/15 px-4 py-3 font-body text-base text-navy">
                  <Clock size={14} className="shrink-0 text-navy/70" />
                  Estimated travel time from {previousStop.name}:{" "}
                  <span className="font-semibold">{travelTime}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 bg-navy/[0.02] px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-navy/15 py-3 font-body text-base font-medium text-navy transition-colors hover:bg-navy/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selected}
                onClick={handleSubmit}
                className={buttonVariants({
                  variant: "accent",
                  className: "flex-1 disabled:cursor-not-allowed disabled:opacity-40",
                })}
              >
                {isEditing ? "Save Changes" : "Add to Route"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
