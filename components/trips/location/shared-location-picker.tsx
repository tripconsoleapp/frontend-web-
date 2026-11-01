"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { LocationMap } from "./location-map";
import { LocationPickerPanel } from "./location-picker-panel";
import type { FlyToRequest } from "./location-map-inner";
import { GeocodedPlace, reverseGeocode } from "@/lib/geocoding";

export type { GeocodedPlace } from "@/lib/geocoding";

export interface SharedLocationPickerProps {
  value: GeocodedPlace | null;
  onChange: (place: GeocodedPlace) => void;
  /** Already-chosen stops (destination-picker mode) shown as small
   *  numbered markers for context — never interactive, never part of a
   *  drawn route (see the limitations note in this file's header). */
  contextStops?: { id: string; name: string; lat: number; lng: number }[];
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  /** False when the caller (the Add Destination drawer) renders its own
   *  footer/submit button below this picker instead. */
  showFooter?: boolean;
  /** Forces a single stacked column regardless of viewport width — for
   *  embedding inside a narrow modal/drawer, where the usual "map fills
   *  most of a wide page" layout would otherwise try to go side-by-side
   *  inside a 448px-wide panel. */
  compact?: boolean;
  className?: string;
}

/**
 * The one shared "choose a real place in Kerala" experience — a Leaflet
 * map (CARTO Positron tiles, OpenStreetMap data) plus a side panel with
 * search, popular chips and recents. Used by Choose Starting Location,
 * the Add Destination drawer, and the standalone Vehicle search's
 * pickup/drop-off fields.
 *
 * No routing service is configured in this project, so when
 * `contextStops` is passed, this never draws a line between them —
 * only the numbered markers. Wiring a real routing API (e.g. OSRM) later
 * only needs to replace that one "no line" decision below.
 */
export function SharedLocationPicker({
  value,
  onChange,
  contextStops,
  confirmLabel = "Confirm",
  onConfirm,
  confirmDisabled,
  showFooter = true,
  compact = false,
  className,
}: SharedLocationPickerProps) {
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [flyTo, setFlyTo] = useState<FlyToRequest | null>(null);
  const flyKeyRef = useRef(0);

  const pin = value ? { lat: value.lat, lng: value.lng } : pendingPin;

  async function handlePinMove(lat: number, lng: number) {
    setPendingPin({ lat, lng });
    setGeocoding(true);
    try {
      const place = await reverseGeocode(lat, lng);
      setPendingPin(null);
      onChange(place);
    } catch {
      // The pin stays exactly where it was dropped even if reverse
      // geocoding failed — the organizer can still see where they
      // clicked and retry, or use search instead.
    } finally {
      setGeocoding(false);
    }
  }

  function handlePanelSelect(place: GeocodedPlace) {
    setPendingPin(null);
    onChange(place);
    flyKeyRef.current += 1;
    setFlyTo({ lat: place.lat, lng: place.lng, key: flyKeyRef.current });
  }

  const popupText = value ? { name: value.name, district: value.district } : geocoding ? { name: "Locating...", district: "" } : null;

  return (
    <div className={cn("grid grid-cols-1 gap-6", !compact && "lg:grid-cols-[65fr_35fr]", className)}>
      <div className={cn("relative isolate overflow-hidden rounded-[20px] border border-navy/10", compact ? "h-64" : "h-[360px] lg:h-full")}>
        <LocationMap pin={pin} popupText={popupText} onPinMove={handlePinMove} flyTo={flyTo} contextStops={contextStops} />
      </div>

      <LocationPickerPanel
        value={value}
        onSelect={handlePanelSelect}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        confirmDisabled={confirmDisabled}
        showFooter={showFooter}
      />
    </div>
  );
}
