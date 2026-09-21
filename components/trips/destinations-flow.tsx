"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Reorder, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowLeft,
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
import { AddDestinationDrawer } from "@/components/trips/add-destination-drawer";
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
import { saveDestinationsSummary } from "@/lib/listing-draft";

function templateStop(id: string, nights: number): DestinationStop {
  const location = getKeralaLocation(id)!;
  return { ...location, nights, overnight: true };
}

const TEMPLATE_PREFILL: DestinationStop[] = [
  templateStop("munnar", 2),
  templateStop("thekkady", 2),
];

function MetricValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.18 }}
        className="inline-block font-semibold text-navy"
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
  const shouldReduce = useReducedMotion();

  const start = startId ? getKeralaLocation(startId) : undefined;
  const startLocation: KeralaLocation = start ?? {
    id: "start",
    name: startLabel || "Kochi",
    district: "Kerala",
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allStops: KeralaLocation[] = useMemo(
    () => [startLocation, ...destinations],
    [startLocation, destinations]
  );

  // Downstream steps (Services → Transport/Hotel) show route context like
  // "Kochi → Munnar" and derive which destinations need accommodation from
  // `stops` — real destinations chosen here, never invented. A day visit
  // (nights === 0) needs no stay, so it's left out of `stops`.
  useEffect(() => {
    const lastStop = destinations[destinations.length - 1];
    saveDestinationsSummary({
      routeLabel: lastStop
        ? `${startLocation.name} → ${lastStop.name}`
        : startLocation.name,
      stops: destinations
        .filter((d) => d.nights > 0)
        .map((d) => ({ id: d.id, name: d.name, nights: d.nights })),
      startLocationId: startLocation.id,
      startLocationName: startLocation.name,
    });
  }, [startLocation, destinations]);

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
    setSelectedId(stop.id);
  }

  function handleRemove(id: string) {
    setDestinations((current) => current.filter((d) => d.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function handleMoveUp(id: string) {
    setDestinations((current) => {
      const index = current.findIndex((d) => d.id === id);
      if (index <= 0) return current;
      const next = current.slice();
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function handleMoveDown(id: string) {
    setDestinations((current) => {
      const index = current.findIndex((d) => d.id === id);
      if (index === -1 || index >= current.length - 1) return current;
      const next = current.slice();
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
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

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="-mx-10 -my-10 flex flex-col bg-[#FAF8F4] px-10 py-4 xl:-mx-14 xl:-my-12 xl:px-14 xl:py-6 lg:h-[calc(100vh-2px)] lg:overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3 lg:min-h-0 lg:flex-1"
      >
        <motion.div variants={item} className="shrink-0">
          <CreateStepper activeIndex={1} />
        </motion.div>

        <motion.div variants={item} className="shrink-0 flex flex-col gap-1">
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Destinations &amp; Route
          </h1>
          <p className="font-body text-base text-text-grey">
            Build the route your group will travel, stop by stop.
          </p>
        </motion.div>

        <AnimatePresence>
          {bannerVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 rounded-xl bg-mint/20 px-4 py-3">
                <p className="font-body text-base text-navy">
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

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[65fr_35fr] lg:grid-rows-[minmax(0,1fr)]"
        >
          <div className="relative aspect-[2/3] w-full min-h-0 overflow-hidden rounded-3xl lg:aspect-auto lg:h-full">
            <RouteMap
              stops={allStops}
              onQuickAdd={handleQuickAdd}
              excludeIds={[startLocation.id, ...destinations.map((d) => d.id)]}
              selectedId={selectedId}
              onSelectStop={toggleSelect}
              showFitControl={destinations.length > 0}
            />
          </div>

          <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
            <div className="shrink-0">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                Route Summary
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-navy">
                <span className="flex items-center gap-1.5">
                  <MapPinned size={13} className="text-orange" />
                  <MetricValue value={String(destinations.length)} /> Stops
                </span>
                <span className="text-navy/20" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-navy/60" />
                  <MetricValue value={String(nightsTotal)} /> Nights
                </span>
                <span className="text-navy/20" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <Route size={13} className="text-navy/60" />
                  <MetricValue
                    value={distanceTotal > 0 ? `~${distanceTotal} km` : "—"}
                  />
                </span>
                <span className="text-navy/20" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <Navigation size={13} className="text-navy/60" />
                  <MetricValue
                    value={
                      driveTimeTotal > 0
                        ? `~${formatDuration(driveTimeTotal)}`
                        : "—"
                    }
                  />
                  drive
                </span>
              </div>
            </div>

            <p className="shrink-0 font-heading text-base font-semibold text-navy">
              Itinerary Stops
            </p>

            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
              <StartStopCard
                name={startLocation.name}
                district={startLocation.district}
                selected={selectedId === startLocation.id}
                onSelect={() => toggleSelect(startLocation.id)}
              />

              {destinations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 rounded-xl bg-navy/[0.02] px-4 py-4"
                >
                  <p className="font-body text-sm text-text-grey">
                    No destinations yet. Start building your route by adding
                    your first destination.
                  </p>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-navy/20 px-4 py-3 font-body text-base font-medium text-navy transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange"
                  >
                    <Compass size={16} /> + Add Destination
                  </button>
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
                            index={index + 2}
                            stop={stop}
                            travelLabel={`from ${prev.name} · ~${driveTimeBetween(prev, stop)}`}
                            selected={selectedId === stop.id}
                            canMoveUp={index > 0}
                            canMoveDown={index < destinations.length - 1}
                            onSelect={() => toggleSelect(stop.id)}
                            onEdit={() => openEditModal(stop.id)}
                            onRemove={() => handleRemove(stop.id)}
                            onMoveUp={() => handleMoveUp(stop.id)}
                            onMoveDown={() => handleMoveDown(stop.id)}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </Reorder.Group>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="shrink-0 rounded-xl border border-dashed border-navy/20 px-4 py-3 text-center font-body text-base font-medium text-navy transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange"
                  >
                    + Add Another Destination
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AddDestinationDrawer
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

      <div className="-mx-10 mt-3 flex shrink-0 items-center justify-between border-t border-navy/10 bg-white px-10 py-3 shadow-[0_-2px_8px_-4px_rgba(45,62,80,0.1)] xl:-mx-14 xl:px-14">
        <Link href={backHref} className={buttonVariants({ variant: "outline", size: "md" })}>
          Back
        </Link>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={buttonVariants({ variant: "accent", size: "md" })}
        >
          Next: Services &rarr;
        </motion.button>
      </div>
    </div>
  );
}
