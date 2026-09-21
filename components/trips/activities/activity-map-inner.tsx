"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/** Same divIcon marker language as the route map (numbered pins in navy/
 *  orange) — here adapted to three POI treatments: selected activity
 *  (orange, per spec), other activities (neutral outline), hidden gems
 *  (mint, sparkle-tinted) — so the two discovery layers stay visually
 *  distinct on the same map. */
function poiIcon(kind: "activity" | "activity-selected" | "gem") {
  const bg = kind === "activity-selected" ? "#FF6B35" : kind === "gem" ? "#A8D5C5" : "#FFFFFF";
  const fg = kind === "activity-selected" ? "#FFFFFF" : "#2D3E50";
  const border = kind === "gem" ? "" : kind === "activity-selected" ? "" : "border:2px solid #2D3E50;";
  const size = kind === "activity-selected" ? 16 : 12;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};${border}box-shadow:0 1px 4px rgba(45,62,80,0.35);"></div>`;
  return L.divIcon({ html, className: "activity-poi-icon", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [32, 32], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.map((p) => p.id).join("-")]);
  return null;
}

function FocusPoint({ point }: { point: MapPoint | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 13), { duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, point?.id]);
  return null;
}

export default function ActivityMapInner({
  activities,
  hiddenGems = [],
  selectedId,
  onSelectActivity,
}: {
  activities: MapPoint[];
  hiddenGems?: MapPoint[];
  selectedId?: string | null;
  onSelectActivity?: (id: string) => void;
}) {
  const allPoints = [...activities, ...hiddenGems];
  const center: [number, number] = allPoints[0] ? [allPoints[0].lat, allPoints[0].lng] : [10.0889, 77.0595];
  const selected = activities.find((a) => a.id === selectedId);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer center={center} zoom={12} minZoom={9} zoomControl={false} className="h-full w-full bg-mint/10">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} />
        <FocusPoint point={selected} />

        {activities.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={poiIcon(a.id === selectedId ? "activity-selected" : "activity")}
            eventHandlers={onSelectActivity ? { click: () => onSelectActivity(a.id) } : undefined}
          />
        ))}
        {hiddenGems.map((g) => (
          <Marker key={g.id} position={[g.lat, g.lng]} icon={poiIcon("gem")} />
        ))}
      </MapContainer>
    </div>
  );
}
