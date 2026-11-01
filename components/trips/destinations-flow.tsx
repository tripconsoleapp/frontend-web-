"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Reorder, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  MapPinned,
  Navigation,
  Route,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
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
import { PILGRIMAGE_DESTINATIONS } from "@/lib/pilgrimage-destinations";
import { getBackendTripId, getReviewReturnHref, saveDestinationsSummary } from "@/lib/listing-draft";
import { useTripMode } from "@/lib/use-trip-mode";
import { resolveTemplateRouteById } from "@/lib/template-route";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { FormError } from "@/components/ui/form-error";
import {
  backendDestinationToStop,
  createDestination,
  deleteDestination,
  listDestinations,
  reorderDestinations as reorderDestinationsApi,
  updateDestination,
} from "@/lib/destination-api";

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
  startDistrict,
  startLat,
  startLng,
  templateId,
  templateName,
}: {
  /** Legacy path: a KERALA_LOCATIONS id, still sent by Template Review's
   *  "Edit Route" link (lib/template-route.ts resolves templates against
   *  that fixed list). Takes priority when present. */
  startId?: string;
  /** Real path: a freely geocoded place from the shared location picker
   *  (components/trips/location-picker.tsx) — used whenever `startId`
   *  isn't, i.e. every fresh "Start from Scratch" visit. */
  startLabel?: string;
  startDistrict?: string;
  startLat?: number;
  startLng?: number;
  templateId?: string;
  templateName?: string;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { mode } = useTripMode();
  const { authedFetch } = useAuth();

  // Only set for a Start-from-Scratch trip that already has a real backend
  // Trip (see trip-basics-form.tsx) — null for Template/Pilgrimage/Join
  // Scheduled Trip drafts, which never persist destinations in this phase
  // and behave exactly as before every `backendTripId &&` guard below.
  const [backendTripId, setBackendTripId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const reorderSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const legacyStart = startId ? getKeralaLocation(startId) : undefined;
  const startLocation: KeralaLocation = legacyStart ?? {
    id: "start",
    name: startLabel || "Kochi",
    district: startDistrict || "Kerala",
    x: 0,
    y: 0,
    lat: startLat ?? 9.9312,
    lng: startLng ?? 76.2673,
  };

  const fromTemplate = Boolean(templateId);
  const [destinations, setDestinations] = useState<DestinationStop[]>(
    fromTemplate ? (resolveTemplateRouteById(templateId)?.stops ?? []) : []
  );
  const [bannerVisible, setBannerVisible] = useState(fromTemplate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Backend is the authoritative source once a trip has been created — on
  // mount, recover whatever was already persisted (e.g. after a refresh) and
  // hydrate the visible list from it. No-op for template/pilgrimage/
  // scheduled drafts (no backendTripId), so this never touches their
  // in-memory-only behavior.
  useEffect(() => {
    const tripId = getBackendTripId();
    setBackendTripId(tripId);
    if (!tripId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await listDestinations(tripId, authedFetch);
        if (!cancelled && rows.length > 0) {
          setDestinations(rows.map(backendDestinationToStop));
        }
      } catch {
        // A failed background hydration isn't shown as a user-facing error —
        // the organizer just continues with an empty/local list and any
        // subsequent add/edit/remove still reports its own success/failure.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setModalOpen(true);
  }

  function openEditModal(id: string) {
    setEditingId(id);
    setModalOpen(true);
  }

  async function handleModalSubmit(stop: DestinationStop) {
    if (backendTripId) {
      setDrawerSubmitting(true);
      setSyncError(null);
      try {
        if (editingId) {
          const editing = destinations.find((d) => d.id === editingId);
          if (editing?.backendId) {
            await updateDestination(backendTripId, editing.backendId, stop, authedFetch);
          }
          stop = { ...stop, backendId: editing?.backendId };
        } else {
          const created = await createDestination(backendTripId, stop, authedFetch);
          stop = { ...stop, backendId: created.id };
        }
      } catch (err) {
        setDrawerSubmitting(false);
        setSyncError(
          err instanceof ApiError ? err.message : "Could not save this destination. Please try again."
        );
        // Leave the drawer open and local state untouched — never apply a
        // change locally that the backend rejected.
        return;
      }
      setDrawerSubmitting(false);
    }

    setDestinations((current) => {
      if (editingId) {
        return current.map((d) => (d.id === editingId ? stop : d));
      }
      if (current.some((d) => d.id === stop.id)) return current;
      return [...current, stop];
    });
    setModalOpen(false);
    setEditingId(null);
    setSelectedId(stop.id);
  }

  async function handleRemove(id: string) {
    const stop = destinations.find((d) => d.id === id);
    if (backendTripId && stop?.backendId) {
      try {
        await deleteDestination(backendTripId, stop.backendId, authedFetch);
      } catch (err) {
        setSyncError(
          err instanceof ApiError ? err.message : "Could not remove this destination. Please try again."
        );
        return; // never remove locally when the backend didn't confirm it
      }
    }
    setSyncError(null);
    setDestinations((current) => current.filter((d) => d.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  // Curated shrine chips add/remove straight from the same `destinations`
  // state a custom stop would — order of selection is preserved, and a
  // shrine already on the route (added via chip or custom search) can be
  // removed again from either place.
  async function toggleShrine(id: string) {
    if (destinations.some((d) => d.id === id)) {
      await handleRemove(id);
      return;
    }
    const shrine = PILGRIMAGE_DESTINATIONS.find((d) => d.id === id);
    if (!shrine || shrine.id === startLocation.id) return;
    const stop: DestinationStop = {
      id: shrine.id,
      name: shrine.name,
      district: shrine.district,
      x: shrine.x,
      y: shrine.y,
      lat: shrine.lat,
      lng: shrine.lng,
      nights: 1,
      overnight: true,
    };
    if (backendTripId) {
      try {
        const created = await createDestination(backendTripId, stop, authedFetch);
        setSyncError(null);
        setDestinations((current) => [...current, { ...stop, backendId: created.id }]);
      } catch (err) {
        setSyncError(
          err instanceof ApiError ? err.message : "Could not add this destination. Please try again."
        );
      }
      return;
    }
    setDestinations((current) => [...current, stop]);
  }

  /** Reordering (drag or the up/down buttons) must stay optimistic — Reorder
   *  .Group's drag gesture needs local state to move immediately, and
   *  blocking on the network would break it. The backend sync is debounced
   *  in the background instead; on failure, the authoritative order is
   *  re-fetched rather than guessed, so a failed save never leaves the UI
   *  silently wrong. */
  function scheduleReorderSync(order: DestinationStop[]) {
    if (!backendTripId) return;
    const tripId = backendTripId;
    if (reorderSyncTimer.current) clearTimeout(reorderSyncTimer.current);
    reorderSyncTimer.current = setTimeout(async () => {
      const backendIds = order.map((d) => d.backendId);
      if (backendIds.some((id) => !id)) return; // an add/remove is still in flight
      try {
        await reorderDestinationsApi(tripId, backendIds as string[], authedFetch);
        setSyncError(null);
      } catch (err) {
        setSyncError(
          err instanceof ApiError ? err.message : "Could not save the new order. Please try again."
        );
        try {
          const rows = await listDestinations(tripId, authedFetch);
          setDestinations(rows.map(backendDestinationToStop));
        } catch {
          // Reconciliation failed too (e.g. offline) — the error banner
          // above already told the organizer the order didn't save.
        }
      }
    }, 600);
  }

  function handleMoveUp(id: string) {
    setDestinations((current) => {
      const index = current.findIndex((d) => d.id === id);
      if (index <= 0) return current;
      const next = current.slice();
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      scheduleReorderSync(next);
      return next;
    });
  }

  function handleMoveDown(id: string) {
    setDestinations((current) => {
      const index = current.findIndex((d) => d.id === id);
      if (index === -1 || index >= current.length - 1) return current;
      const next = current.slice();
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      scheduleReorderSync(next);
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
    router.push(getReviewReturnHref(`/trips/create/services?${params.toString()}`, templateId));
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

            {mode === "pilgrimage" && (
              <div className="shrink-0">
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                  Sacred Destinations
                </p>
                <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                  {PILGRIMAGE_DESTINATIONS.map((shrine) => {
                    const active = destinations.some((d) => d.id === shrine.id);
                    return (
                      <button
                        key={shrine.id}
                        type="button"
                        onClick={() => toggleShrine(shrine.id)}
                        aria-pressed={active}
                        className="group relative w-28 shrink-0 overflow-hidden rounded-xl text-left"
                      >
                        <div className="relative h-20 w-full overflow-hidden">
                          <Image
                            src={shrine.imageUrl}
                            alt={shrine.name}
                            fill
                            sizes="112px"
                            className={cn(
                              "object-cover transition-all duration-300",
                              !active && "opacity-90 group-hover:opacity-100"
                            )}
                          />
                          <div
                            className={cn(
                              "absolute inset-0 transition-colors",
                              active ? "bg-navy/20 ring-2 ring-inset ring-orange" : "bg-navy/10"
                            )}
                          />
                          {active && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-white">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 font-body text-xs font-medium leading-snug text-navy">
                          {shrine.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                    onReorder={(next) => {
                      setDestinations(next);
                      scheduleReorderSync(next);
                    }}
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
        contextStops={allStops}
        editingStop={editingStop}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleModalSubmit}
        submitting={drawerSubmitting}
        submitError={syncError}
      />

      <div className="-mx-10 mt-3 flex shrink-0 flex-col gap-2 border-t border-navy/10 bg-white px-10 py-3 shadow-[0_-2px_8px_-4px_rgba(45,62,80,0.1)] xl:-mx-14 xl:px-14">
        {syncError && !modalOpen && <FormError message={syncError} />}
        <div className="flex items-center justify-between">
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
    </div>
  );
}
