"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMapEvents, useMap } from "react-leaflet";
import { animate } from "motion";
import { KERALA_BOUNDS, KERALA_CENTER } from "@/lib/geocoding";

// Custom navy pin + orange dot — replaces react-leaflet's default marker
// image entirely (the classic "marker icon missing" bug under Next.js/
// webpack is caused by Leaflet's default icon trying to load image
// assets that bundlers don't resolve the same way; a divIcon sidesteps
// that completely rather than patching L.Icon.Default's URLs).
const PIN_SVG = `
  <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.9 13.2 23.3 14.3 24.3a1 1 0 0 0 1.4 0C16.8 38.3 30 25.9 30 15 30 6.7 23.3 0 15 0z" fill="#2D3E50"/>
    <circle cx="15" cy="14" r="6.5" fill="#FF6B35"/>
  </svg>`;

function createPinIcon() {
  return L.divIcon({
    html: `<div class="location-pin-drop">${PIN_SVG}</div>`,
    className: "location-pin-icon",
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -36],
  });
}

function createContextIcon(index: number) {
  const html = `
    <div class="route-pin-wrap">
      <div class="route-pin-circle" style="background:#2D3E50;color:#FFFFFF;width:24px;height:24px;">${index}</div>
      <div class="route-pin-point" style="border-top-color:#2D3E50"></div>
    </div>`;
  return L.divIcon({ html, className: "route-pin-icon", iconSize: [26, 36], iconAnchor: [13, 36] });
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface FlyToRequest {
  lat: number;
  lng: number;
  /** Bumped on every request, even to the same coordinates, so the
   *  effect below re-fires (e.g. re-selecting a popular chip). */
  key: number;
}

function FlyToHandler({ request, markerRef }: { request: FlyToRequest | null | undefined; markerRef: React.RefObject<L.Marker | null> }) {
  const map = useMap();

  useEffect(() => {
    if (!request) return;
    const reduced = prefersReducedMotion();
    map.flyTo([request.lat, request.lng], Math.max(map.getZoom(), 12), {
      duration: reduced ? 0 : 0.8,
    });

    const marker = markerRef.current;
    if (!marker || reduced) return;
    // A small bounce once the marker lands — purely cosmetic, so any
    // failure to find the DOM element just skips it silently.
    const el = (marker as unknown as { _icon?: HTMLElement })._icon;
    if (!el) return;
    const delay = 800;
    const timer = setTimeout(() => {
      animate(el, { transform: ["translateY(0px)", "translateY(-14px)", "translateY(0px)"] }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.key]);

  return null;
}

function AttributionSetup() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
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

export interface LocationMapInnerProps {
  pin: { lat: number; lng: number } | null;
  popupText?: { name: string; district: string } | null;
  onPinMove: (lat: number, lng: number) => void;
  flyTo?: FlyToRequest | null;
  contextStops?: { id: string; name: string; lat: number; lng: number }[];
}

const southWest: L.LatLngTuple = [KERALA_BOUNDS.south - 0.5, KERALA_BOUNDS.west - 0.5];
const northEast: L.LatLngTuple = [KERALA_BOUNDS.north + 0.5, KERALA_BOUNDS.east + 0.5];
const MAX_BOUNDS = L.latLngBounds(southWest, northEast);

export default function LocationMapInner({ pin, popupText, onPinMove, flyTo, contextStops = [] }: LocationMapInnerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  return (
    <MapContainer
      center={pin ? [pin.lat, pin.lng] : KERALA_CENTER}
      zoom={pin ? 11 : 7}
      minZoom={7}
      maxZoom={17}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={1.0}
      zoomControl={false}
      className="h-full w-full bg-[#e8e6df]"
    >
      {/* CARTO Positron (basemaps.cartocdn.com) was the intended light,
         low-noise basemap here, but CARTO's anonymous raster tiles now
         return an "API key required" placeholder (confirmed live — a
         recent CARTO policy change, not a bug in this code). Standard
         OpenStreetMap tiles are the fallback: still no key, and already
         relied on elsewhere in this codebase (leaflet-route-map.tsx,
         activity-map-inner.tsx), but not the light/muted style asked
         for — see the location-picker section of this session's report. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      <AttributionSetup />
      <MapResizeHandler />
      <ClickToPlace onPick={onPinMove} />
      <FlyToHandler request={flyTo} markerRef={markerRef} />

      {contextStops.map((stop, i) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={createContextIcon(i + 1)} />
      ))}

      {pin && (
        <Marker
          ref={markerRef}
          position={[pin.lat, pin.lng]}
          icon={createPinIcon()}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = (e.target as L.Marker).getLatLng();
              onPinMove(latlng.lat, latlng.lng);
            },
          }}
        >
          {popupText && (
            <Popup>
              <p className="font-body text-sm font-semibold text-navy">{popupText.name}</p>
              <p className="font-body text-xs text-text-grey">{popupText.district}</p>
            </Popup>
          )}
        </Marker>
      )}
    </MapContainer>
  );
}
