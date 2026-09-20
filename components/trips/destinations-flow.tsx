"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Reorder } from "motion/react";
import {
  CalendarDays,
  Compass,
  MapPinned,
  Navigation,
  Route,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateStepper } from "@/components/trips/create-stepper";
import { RouteMap } from "@/components/trips/route-map";
import { AddDestinationModal } from "@/components/trips/add-destination-modal";
import {
  DestinationStop,
  DestinationStopCard,
  StartStopCard,
} from "@/components/trips/itinerary-stop-card";
import {
  KeralaLocation,
  distanceBetween,
  driveHoursBetween,
  driveTimeBetween,
  formatDuration,
  getKeralaLocation,
} from "@/lib/kerala-locations";

function templateStop(id: string, nights: number): DestinationStop {
  const location = getKeralaLocation(id)!;
  return { ...location, nights, overnight: true };
}

const TEMPLATE_PREFILL: DestinationStop[] = [
  templateStop("munnar", 2),
  templateStop("thekkady", 2),
];

function StatValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="block font-heading text-lg font-bold text-navy"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function DestinationsFlow({
  startId,
  startLabel,
  templateId,
  templateName,
}: {
  startId?: string;
  startLabel?: string;
  templateId?: string;
  templateName?: string;
}) {
  const router = useRouter();

  const start = startId ? getKeralaLocation(startId) : undefined;
  const startLocation: KeralaLocation = start ?? {
    id: "start",
    name: startLabel || "Kochi",
    x: 150,
    y: 220,
    lat: 9.9312,
    lng: 76.2673,
  };

  const fromTemplate = Boolean(templateId);
  const [destinations, setDestinations] = useState<DestinationStop[]>(
    fromTemplate ? TEMPLATE_PREFILL : []
  );
  const [bannerVisible, setBannerVisible] = useState(fromTemplate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quickAddId, setQuickAddId] = useState<string | null>(null);

  const allStops: KeralaLocation[] = useMemo(
    () => [startLocation, ...destinations],
    [startLocation, destinations]
  );

  const nightsTotal = destinations.reduce((sum, d) => sum + d.nights, 0);
  const distanceTotal = useMemo(() => {
    let total = 0;
    for (let i = 0; i < allStops.length - 1; i++) {
      total += distanceBetween(allStops[i], allStops[i + 1]);
    }
    return total;
  }, [allStops]);
  const driveTimeTotal = useMemo(() => {
    let hours = 0;
    for (let i = 0; i < allStops.length - 1; i++) {
      hours += driveHoursBetween(allStops[i], allStops[i + 1]);
    }
    return hours;
  }, [allStops]);

  const editingStop = destinations.find((d) => d.id === editingId);

  function openAddModal() {
    setEditingId(null);
    setQuickAddId(null);
    setModalOpen(true);
  }

  function openEditModal(id: string) {
    setEditingId(id);
    setQuickAddId(null);
    setModalOpen(true);
  }

  function handleQuickAdd(location: KeralaLocation) {
    setEditingId(null);
    setQuickAddId(location.id);
    setModalOpen(true);
  }

  function handleModalSubmit(stop: DestinationStop) {
    setDestinations((current) => {
      if (editingId) {
        return current.map((d) => (d.id === editingId ? stop : d));
      }
      if (current.some((d) => d.id === stop.id)) return current;
      return [...current, stop];
    });
    setModalOpen(false);
    setEditingId(null);
    setQuickAddId(null);
  }

  function handleRemove(id: string) {
    setDestinations((current) => current.filter((d) => d.id !== id));
  }

  const backHref = `/trips/create/location${
    templateId ? `?template=${templateId}` : ""
  }`;

  function handleNext() {
    const params = new URLSearchParams();
    if (templateId) params.set("template", templateId);
    router.push(`/trips/create/services?${params.toString()}`);
  }

  const modalPreviousStop =
    destinations.length > 0
      ? destinations[destinations.length - 1]
      : startLocation;

  return (
    <div className="flex flex-col gap-6 pb-28">
      <CreateStepper activeIndex={1} />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Destinations &amp; Route
        </h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Build the route your group will travel, stop by stop.
        </p>
      </div>

      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 rounded-xl bg-mint/20 px-4 py-3">
              <p className="font-body text-sm text-navy">
                Pre-filled from{" "}
                <span className="font-semibold">
                  {templateName ?? "your selected template"}
                </span>{" "}
                &mdash; adjust anything before continuing.
              </p>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                aria-label="Dismiss"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-navy/60 transition-colors hover:bg-navy/10 hover:text-navy"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">
        <div className="aspect-[2/3] w-full lg:aspect-auto lg:h-[640px]">
          <RouteMap
            stops={allStops}
            onQuickAdd={handleQuickAdd}
            excludeIds={[startLocation.id, ...destinations.map((d) => d.id)]}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-3 rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10 text-orange">
                <MapPinned size={15} />
              </span>
              <StatValue value={String(destinations.length)} />
              <span className="font-body text-[11px] text-text-grey">
                Stops
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/30 text-navy">
                <CalendarDays size={15} />
              </span>
              <StatValue value={String(nightsTotal)} />
              <span className="font-body text-[11px] text-text-grey">
                Nights
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/10 text-navy">
                <Route size={15} />
              </span>
              <StatValue
                value={distanceTotal > 0 ? `~${distanceTotal} km` : "0 km"}
              />
              <span className="font-body text-[11px] text-text-grey">
                Distance
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft text-warning-soft-foreground">
                <Navigation size={15} />
              </span>
              <StatValue
                value={
                  driveTimeTotal > 0
                    ? `~${formatDuration(driveTimeTotal)}`
                    : "0m"
                }
              />
              <span className="font-body text-[11px] text-text-grey">
                Drive Time
              </span>
            </div>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Itinerary Stops
            </p>

            <div className="mt-3 flex flex-col gap-2.5">
              <StartStopCard name={startLocation.name} />

              {destinations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-navy/15 bg-mint/5 px-6 py-10 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/10 text-orange">
                    <Compass size={22} />
                  </span>
                  <p className="font-heading text-sm font-semibold text-navy">
                    Where to next?
                  </p>
                  <p className="font-body text-xs text-text-grey">
                    Add your first destination to start building the route.
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddModal}
                    className={buttonVariants({ variant: "accent", size: "sm" })}
                  >
                    + Add Destination
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <Reorder.Group
                    axis="y"
                    values={destinations}
                    onReorder={setDestinations}
                    className="flex flex-col gap-2.5"
                  >
                    <AnimatePresence initial={false}>
                      {destinations.map((stop, index) => {
                        const prev = index === 0 ? startLocation : destinations[index - 1];
                        return (
                          <DestinationStopCard
                            key={stop.id}
                            stop={stop}
                            travelLabel={`from ${prev.name} · ${driveTimeBetween(prev, stop)}`}
                            onEdit={() => openEditModal(stop.id)}
                            onRemove={() => handleRemove(stop.id)}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </Reorder.Group>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="rounded-xl border border-dashed border-navy/20 px-4 py-3 text-center font-body text-sm font-medium text-navy transition-colors hover:border-orange hover:text-orange"
                  >
                    + Add Another Destination
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddDestinationModal
        open={modalOpen}
        previousStop={modalPreviousStop}
        excludeIds={[startLocation.id, ...destinations.map((d) => d.id)]}
        editingStop={editingStop}
        initialLocationId={quickAddId}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setQuickAddId(null);
        }}
        onSubmit={handleModalSubmit}
      />

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <Link href={backHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back
        </Link>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Next: Services &rarr;
        </motion.button>
      </div>
    </div>
  );
}
