"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Locate, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { KeralaLocation } from "@/lib/kerala-locations";

const KOCHI_FALLBACK: [number, number] = [9.9312, 76.2673];

function createPinIcon(
  number: number,
  variant: "start" | "stop",
  selected: boolean
) {
  const isStart = variant === "start";
  const bg = isStart ? "#2D3E50" : selected ? "#FF6B35" : "#FFFFFF";
  const fg = isStart || selected ? "#FFFFFF" : "#2D3E50";
  const border = isStart ? "" : selected ? "" : "border:2px solid #2D3E50;";
  const size = selected ? 34 : 28;
  const html = `
    <div class="route-pin-wrap">
      <div class="route-pin-circle" style="background:${bg};color:${fg};${border}width:${size}px;height:${size}px;">${number}</div>
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

// No routing service is configured in this project (see
// shared-location-picker.tsx's header comment) — stops are shown only as
// numbered pins. A straight or curved line between them would imply a
// real route that was never calculated, so none is drawn.

function fitStopsView(map: L.Map, stops: KeralaLocation[]) {
  if (stops.length === 0) return;
  map.invalidateSize();
  if (stops.length === 1) {
    map.setView([stops[0].lat, stops[0].lng], 10, { animate: true });
    return;
  }
  const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
  map.fitBounds(bounds, { padding: [48, 48], animate: true, maxZoom: 11 });
}

function FitToStops({ stops }: { stops: KeralaLocation[] }) {
  const map = useMap();

  useEffect(() => {
    fitStopsView(map, stops);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stops.map((s) => s.id).join("-")]);

  return null;
}

/** Pans to a single selected stop without disturbing the overall route fit. */
function FocusStop({ stop }: { stop: KeralaLocation | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (!stop) return;
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 11), {
      duration: 0.6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stop?.id]);

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

function ZoomControls({
  stops,
  showFit,
}: {
  stops: KeralaLocation[];
  showFit: boolean;
}) {
  const map = useMap();
  return (
    <div className="absolute right-6 top-6 z-[800] flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
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
        className={cn(
          "flex h-9 w-9 items-center justify-center text-navy transition-colors hover:bg-orange/10 hover:text-orange",
          showFit && "border-b border-navy/10"
        )}
      >
        <Minus size={16} />
      </button>
      {showFit && (
        <button
          type="button"
          onClick={() => fitStopsView(map, stops)}
          aria-label="Fit route"
          title="Fit route"
          className="flex h-9 w-9 items-center justify-center text-navy transition-colors hover:bg-orange/10 hover:text-orange"
        >
          <Locate size={15} />
        </button>
      )}
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

interface LeafletRouteMapProps {
  stops: KeralaLocation[];
  compact?: boolean;
  selectedId?: string | null;
  onSelectStop?: (id: string) => void;
  showFitControl?: boolean;
}

export default function LeafletRouteMap({
  stops,
  compact = false,
  selectedId = null,
  onSelectStop,
  showFitControl = true,
}: LeafletRouteMapProps) {
  const focusedStop = stops.find((s) => s.id === selectedId);
  const initialCenter: [number, number] = stops[0]
    ? [stops[0].lat, stops[0].lng]
    : KOCHI_FALLBACK;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[20px] border border-navy/10 shadow-lg shadow-navy/10",
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
        className="h-full w-full bg-[#e8e6df]"
      >
        {/* See location-map-inner.tsx: CARTO's anonymous tiles now
           require an API key, so this falls back to standard OSM tiles. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <AttributionPosition />
        <MapResizeHandler />

        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createPinIcon(
              index + 1,
              index === 0 ? "start" : "stop",
              stop.id === selectedId
            )}
            eventHandlers={
              onSelectStop ? { click: () => onSelectStop(stop.id) } : undefined
            }
          />
        ))}

        {!compact && <FitToStops stops={stops} />}
        {!compact && <FocusStop stop={focusedStop} />}
        {!compact && <ZoomControls stops={stops} showFit={showFitControl} />}
        {compact && stops[0] && <CompactView stop={stops[0]} />}
      </MapContainer>
    </div>
  );
}
