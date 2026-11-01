"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { History, Loader2, MapPin, Navigation, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import {
  GeocodedPlace,
  POPULAR_PLACES,
  addRecentLocation,
  getRecentLocations,
  isWithinKeralaBounds,
  reverseGeocode,
  searchPlaces,
} from "@/lib/geocoding";

const DEBOUNCE_MS = 400;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-text-grey">{children}</p>;
}

function PlaceRow({
  place,
  selected,
  distanceKm,
  onSelect,
  active,
}: {
  place: GeocodedPlace;
  selected: boolean;
  distanceKm: number | null;
  onSelect: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 border-b border-navy/10 py-3 text-left transition-colors last:border-b-0",
        active && "bg-mint/10"
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{selected && <MapPin size={15} className="text-orange" />}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-body text-sm font-medium text-navy">{place.name}</span>
        <span className="block truncate font-body text-xs text-text-grey">{place.district}</span>
      </span>
      {distanceKm !== null && <span className="shrink-0 font-body text-xs text-text-grey">{distanceKm} km</span>}
    </button>
  );
}

export function LocationPickerPanel({
  value,
  onSelect,
  confirmLabel = "Confirm",
  onConfirm,
  confirmDisabled,
  showFooter = true,
}: {
  value: GeocodedPlace | null;
  onSelect: (place: GeocodedPlace) => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  showFooter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedPlace[] | null>(null);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "error" | "empty" | "done">("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recents, setRecents] = useState<GeocodedPlace[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecents(getRecentLocations());
  }, []);

  function runSearch(q: string) {
    abortRef.current?.abort();
    if (!q.trim()) {
      setResults(null);
      setSearchState("idle");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchState("loading");
    searchPlaces(q, controller.signal)
      .then((places) => {
        setResults(places);
        setSearchState(places.length === 0 ? "empty" : "done");
        setActiveIndex(-1);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setSearchState("error");
      });
  }

  function handleQueryChange(next: string) {
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(next), DEBOUNCE_MS);
  }

  function pick(place: GeocodedPlace) {
    onSelect(place);
    addRecentLocation(place);
    setRecents(getRecentLocations());
    setQuery("");
    setResults(null);
    setSearchState("idle");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!results || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(results[activeIndex]);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser doesn't support location access — try searching instead.");
      return;
    }
    setLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isWithinKeralaBounds(latitude, longitude)) {
          setLocating(false);
          setLocationMessage("Your current location looks like it's outside Kerala — try searching instead.");
          return;
        }
        try {
          const place = await reverseGeocode(latitude, longitude);
          pick(place);
        } catch {
          setLocationMessage("Couldn't identify a place at your location. Try searching instead.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationMessage("We couldn't access your location — check your browser's permission, or search instead.");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-grey" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search a city, town, or landmark in Kerala..."
            aria-label="Search for a place in Kerala"
            className="w-full rounded-xl border border-navy/15 bg-white py-3 pl-9 pr-3 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
          {searchState === "loading" && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-grey" />}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy underline-offset-2 hover:text-orange hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Navigation size={12} />
          {locating ? "Locating..." : "Use my current location"}
        </button>
        {locationMessage && <p className="font-body text-xs text-text-grey">{locationMessage}</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
        {query.trim() && (
          <div>
            <SectionLabel>Search</SectionLabel>
            <div className="mt-2">
              {searchState === "error" && (
                <p className="py-2 font-body text-sm text-text-grey">
                  Something went wrong searching.{" "}
                  <button type="button" onClick={() => runSearch(query)} className="font-semibold text-orange underline underline-offset-2">
                    Try again
                  </button>
                </p>
              )}
              {searchState === "empty" && <p className="py-2 font-body text-sm text-text-grey">No place found in Kerala. Try a nearby town.</p>}
              {searchState === "done" &&
                results?.map((place, i) => (
                  <PlaceRow
                    key={place.id}
                    place={place}
                    selected={value?.id === place.id}
                    active={i === activeIndex}
                    distanceKm={value ? haversineKm(value, place) : null}
                    onSelect={() => pick(place)}
                  />
                ))}
            </div>
          </div>
        )}

        {!query.trim() && (
          <>
            <div>
              <SectionLabel>Popular</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {POPULAR_PLACES.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => pick(place)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 font-body text-sm transition-colors",
                      value?.id === place.id ? "border-orange text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                    )}
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            </div>

            {recents.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-text-grey">
                  <History size={12} /> Recent
                </p>
                <div className="mt-1">
                  {recents.map((place) => (
                    <PlaceRow
                      key={place.id}
                      place={place}
                      selected={value?.id === place.id}
                      distanceKm={value ? haversineKm(value, place) : null}
                      onSelect={() => pick(place)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showFooter && (
        <div className="flex shrink-0 flex-col gap-3 border-t border-navy/10 pt-5">
          {value ? (
            <div>
              <p className="font-serif text-xl text-navy">{value.name}</p>
              <p className="mt-0.5 font-body text-xs text-text-grey">
                {value.district} &middot; {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
              </p>
            </div>
          ) : (
            <p className="font-body text-sm text-text-grey">Tap the map, search, or pick a place to continue.</p>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={!value || confirmDisabled}
              className={buttonVariants({ variant: "accent", size: "lg", className: "w-full disabled:cursor-not-allowed disabled:opacity-40" })}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
