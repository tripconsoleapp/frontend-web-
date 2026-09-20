"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { animate } from "motion";
import { Minus, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  KERALA_LOCATIONS,
  KeralaLocation,
  buildCurvedRoutePath,
} from "@/lib/kerala-locations";

const KOCHI_FALLBACK: [number, number] = [9.9312, 76.2673];

function createPinIcon(number: number, variant: "start" | "stop") {
  const bg = variant === "start" ? "#2D3E50" : "#FF6B35";
  const html = `
    <div class="route-pin-wrap">
      <div class="route-pin-circle" style="background:${bg}">${number}</div>
      <div class="route-pin-point" style="border-top-color:${bg}"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "route-pin-icon",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

function RouteLine({ stops }: { stops: KeralaLocation[] }) {
  const map = useMap();
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    lineRef.current?.remove();
    lineRef.current = null;

    if (stops.length < 2) return;

    const path = buildCurvedRoutePath(stops);
    const line = L.polyline(path, {
      color: "#FF6B35",
      weight: 3.5,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
    }).addTo(map);
    lineRef.current = line;

    const pathEl = (line as unknown as { _path?: SVGPathElement })._path;
    if (pathEl) {
      const length = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;
      animate(
        pathEl,
        { strokeDashoffset: [length, 0] },
        { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
      );
    }

    return () => {
      line.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stops.map((s) => s.id).join("-")]);

  return null;
}

function FitToStops({ stops }: { stops: KeralaLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;
    map.invalidateSize();
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 10, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [48, 48], animate: true, maxZoom: 11 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stops.map((s) => s.id).join("-")]);

  return null;
}

/**
 * The compact preview map (Add Destination modal) skips FitToStops, so
 * it needs its own re-assertion of center/zoom once the container has
 * its real size — otherwise a container that's briefly 0-height at
 * mount time can leave Leaflet's initial view miscalculated.
 */
function CompactView({ stop }: { stop: KeralaLocation }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.setView([stop.lat, stop.lng], 11, { animate: false });
  }, [map, stop.id]);

  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[800] flex flex-col overflow-hidden rounded-lg border border-navy/10 bg-white shadow-lg">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center border-b border-navy/10 text-navy transition-colors hover:bg-orange/10 hover:text-orange"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center text-navy transition-colors hover:bg-orange/10 hover:text-orange"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

function AttributionPosition() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPosition("bottomleft");
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}

/**
 * The map container's height comes from an aspect-ratio or a
 * breakpoint-specific fixed height, which can settle after Leaflet's
 * first measurement. Without this, tiles can render at a stale size
 * (e.g. right after the layout reflows on scroll or resize).
 */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    // ResizeObserver always fires once immediately on observe() with the
    // current size — that's not a real resize, and invalidating then can
    // race with an in-flight fitBounds animation. Only react to changes
    // after that initial report.
    let isInitialReport = true;
    const observer = new ResizeObserver(() => {
      if (isInitialReport) {
        isInitialReport = false;
        return;
      }
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function MapSearchOverlay({
  excludeIds,
  onSelect,
}: {
  excludeIds: string[];
  onSelect: (location: KeralaLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = KERALA_LOCATIONS.filter(
    (loc) =>
      !excludeIds.includes(loc.id) &&
      loc.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute left-4 top-4 z-[800] w-64">
      <div className="flex items-center gap-2 rounded-full border border-navy/10 bg-white px-4 py-2.5 shadow-lg">
        <Search size={15} className="shrink-0 text-text-grey" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Add a destination..."
          className="w-full bg-transparent font-body text-sm text-navy placeholder:text-text-grey/60 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="shrink-0 text-text-grey hover:text-navy"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {focused && query && (
        <div className="mt-2 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 font-body text-xs text-text-grey">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            results.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(loc);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-navy transition-colors hover:bg-orange/5"
              >
                {loc.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface LeafletRouteMapProps {
  stops: KeralaLocation[];
  compact?: boolean;
  onQuickAdd?: (location: KeralaLocation) => void;
  excludeIds?: string[];
}

export default function LeafletRouteMap({
  stops,
  compact = false,
  onQuickAdd,
  excludeIds = [],
}: LeafletRouteMapProps) {
  const initialCenter: [number, number] = stops[0]
    ? [stops[0].lat, stops[0].lng]
    : KOCHI_FALLBACK;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl border border-navy/10 shadow-lg shadow-navy/10",
        compact && "shadow-none"
      )}
    >
      <MapContainer
        center={initialCenter}
        zoom={compact ? 11 : 9}
        minZoom={6}
        zoomControl={false}
        scrollWheelZoom={!compact}
        dragging={!compact}
        doubleClickZoom={!compact}
        touchZoom={!compact}
        className="h-full w-full bg-mint/10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AttributionPosition />
        <MapResizeHandler />

        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createPinIcon(index + 1, index === 0 ? "start" : "stop")}
          />
        ))}

        {!compact && <RouteLine stops={stops} />}
        {!compact && <FitToStops stops={stops} />}
        {!compact && <ZoomControls />}
        {compact && stops[0] && <CompactView stop={stops[0]} />}
      </MapContainer>

      {!compact && onQuickAdd && (
        <MapSearchOverlay excludeIds={excludeIds} onSelect={onQuickAdd} />
      )}
    </div>
  );
}
