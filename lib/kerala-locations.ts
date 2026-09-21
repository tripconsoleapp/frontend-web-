export interface KeralaLocation {
  id: string;
  name: string;
  /** District/state label shown as a subtitle, e.g. "Idukki, Kerala". */
  district: string;
  /** Legacy 400x600 coordinate space used by the flat illustrated map. */
  x: number;
  y: number;
  /** Real-world coordinates, used by the Leaflet map. */
  lat: number;
  lng: number;
}

export const KERALA_LOCATIONS: KeralaLocation[] = [
  { id: "kochi", name: "Kochi", district: "Ernakulam, Kerala", x: 150, y: 220, lat: 9.9312, lng: 76.2673 },
  { id: "munnar", name: "Munnar", district: "Idukki, Kerala", x: 260, y: 260, lat: 10.0889, lng: 77.0595 },
  {
    id: "alleppey",
    name: "Alleppey",
    district: "Alappuzha, Kerala",
    x: 140,
    y: 330,
    lat: 9.4981,
    lng: 76.3388,
  },
  {
    id: "thekkady",
    name: "Thekkady",
    district: "Idukki, Kerala",
    x: 235,
    y: 390,
    lat: 9.6047,
    lng: 77.1683,
  },
  { id: "wayanad", name: "Wayanad", district: "Wayanad, Kerala", x: 270, y: 90, lat: 11.6854, lng: 76.132 },
  { id: "kovalam", name: "Kovalam", district: "Thiruvananthapuram, Kerala", x: 120, y: 540, lat: 8.4004, lng: 76.9784 },
];

export function getKeralaLocation(id: string) {
  return KERALA_LOCATIONS.find((location) => location.id === id);
}

const AVG_SPEED_KMH = 38;
/** Straight-line distance underestimates Kerala's winding hill roads. */
const ROAD_FACTOR = 1.35;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceBetween(a: KeralaLocation, b: KeralaLocation) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const straightLineKm = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straightLineKm * ROAD_FACTOR);
}

export function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function driveHoursBetween(a: KeralaLocation, b: KeralaLocation) {
  return distanceBetween(a, b) / AVG_SPEED_KMH;
}

export function driveTimeBetween(a: KeralaLocation, b: KeralaLocation) {
  return formatDuration(driveHoursBetween(a, b));
}

/** Quadratic-bezier interpolation so a multi-stop route reads as a gentle curve, not straight segments. */
export function buildCurvedRoutePath(
  stops: KeralaLocation[],
  curvature = 0.12
): [number, number][] {
  if (stops.length < 2) return stops.map((s) => [s.lat, s.lng]);

  const path: [number, number][] = [];
  const steps = 24;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const midLat = (a.lat + b.lat) / 2;
    const midLng = (a.lng + b.lng) / 2;
    const dLat = b.lat - a.lat;
    const dLng = b.lng - a.lng;
    const controlLat = midLat - dLng * curvature;
    const controlLng = midLng + dLat * curvature;

    const start = i === 0 ? 0 : 1;
    for (let s = start; s <= steps; s++) {
      const t = s / steps;
      const lat =
        (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * controlLat + t ** 2 * b.lat;
      const lng =
        (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * controlLng + t ** 2 * b.lng;
      path.push([lat, lng]);
    }
  }

  return path;
}
