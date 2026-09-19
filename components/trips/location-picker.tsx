"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Link2, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { CreateStepper } from "@/components/trips/create-stepper";
import { MapLocation, StylizedMap } from "@/components/trips/stylized-map";

const LOCATIONS: MapLocation[] = [
  { id: "kochi", name: "Kochi", x: 150, y: 220 },
  { id: "munnar", name: "Munnar", x: 260, y: 260 },
  { id: "alleppey", name: "Alleppey", x: 140, y: 330 },
  { id: "thekkady", name: "Thekkady", x: 235, y: 390 },
  { id: "wayanad", name: "Wayanad", x: 270, y: 90 },
  { id: "kovalam", name: "Kovalam", x: 120, y: 540 },
];

const RECENT_LOCATIONS = ["Kochi International Airport", "Munnar Tea Museum"];

export function LocationPicker({ nextHref }: { nextHref: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importedLabel, setImportedLabel] = useState<string | null>(null);

  const filtered = LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = LOCATIONS.find((loc) => loc.id === selectedId);

  function selectLocation(id: string) {
    setSelectedId(id);
    setImportedLabel(null);
  }

  function handleImport(e: FormEvent) {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setImportedLabel("Pinned location");
    setSelectedId(null);
    setImportUrl("");
  }

  function handleConfirm() {
    router.push(nextHref);
  }

  const hasSelection = Boolean(selected || importedLabel);

  return (
    <div className="flex flex-col gap-6">
      <CreateStepper activeIndex={1} />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Choose Starting Location
        </h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Pick where your group will begin the journey from.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <div className="aspect-[2/3] w-full lg:aspect-auto lg:h-[640px]">
          <StylizedMap
            locations={filtered}
            selectedId={selectedId}
            onSelect={selectLocation}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-grey"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a city or landmark..."
              className="w-full rounded-md border border-navy/15 py-2.5 pl-10 pr-4 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Searching in Kerala
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {filtered.map((loc) => (
                <motion.button
                  key={loc.id}
                  type="button"
                  whileHover={{ x: 2 }}
                  onClick={() => selectLocation(loc.id)}
                  aria-pressed={selectedId === loc.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                    selectedId === loc.id
                      ? "border-orange bg-orange/5"
                      : "border-navy/10 hover:border-navy/25"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      selectedId === loc.id
                        ? "bg-orange text-white"
                        : "bg-navy/5 text-navy"
                    )}
                  >
                    <MapPin size={15} />
                  </span>
                  <span className="font-body text-sm font-medium text-navy">
                    {loc.name}
                  </span>
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <p className="font-body text-sm text-text-grey">
                  No matches in Kerala for &ldquo;{search}&rdquo;.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              <History size={13} /> Recent Locations
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {RECENT_LOCATIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setImportedLabel(label);
                    setSelectedId(null);
                  }}
                  className="flex items-center gap-3 rounded-lg border border-navy/10 px-3.5 py-2.5 text-left transition-colors hover:border-navy/25"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/5 text-navy">
                    <History size={15} />
                  </span>
                  <span className="font-body text-sm text-navy">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleImport}
            className="flex flex-col gap-2 rounded-xl border border-navy/10 bg-white p-4"
          >
            <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              <Link2 size={13} /> Quick Import
            </p>
            <div className="flex gap-2">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste a Google Maps link"
                aria-label="Google Maps link"
                className="flex-1 rounded-md border border-navy/15 px-3 py-2 font-body text-xs text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
              />
              <button
                type="submit"
                className="rounded-md border border-navy/20 px-3 py-2 font-body text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                Import
              </button>
            </div>
          </form>

          <div className="mt-auto flex flex-col gap-2">
            {hasSelection && (
              <p className="font-body text-sm text-text-grey">
                Starting from{" "}
                <span className="font-semibold text-navy">
                  {selected?.name ?? importedLabel}
                </span>
              </p>
            )}
            <motion.button
              type="button"
              whileHover={hasSelection ? { y: -1 } : undefined}
              whileTap={hasSelection ? { scale: 0.98 } : undefined}
              disabled={!hasSelection}
              onClick={handleConfirm}
              className={buttonVariants({
                variant: "accent",
                size: "lg",
                className: "w-full disabled:cursor-not-allowed disabled:opacity-40",
              })}
            >
              Confirm Starting Location
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
