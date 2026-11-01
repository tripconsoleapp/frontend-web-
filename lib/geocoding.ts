/**
 * Real-world place search for the shared location picker
 * (components/trips/location/shared-location-picker.tsx) — Nominatim
 * (OpenStreetMap) search + reverse geocoding, restricted to Kerala and a
 * little surrounding area, no API key required.
 *
 * Nominatim's usage policy caps anonymous use at ~1 request/second —
 * `throttledFetch` below is the ONE place every request from this picker
 * goes through, so that limit holds globally no matter how many callers
 * (search box, map click, "use my location") fire at once.
 */

export interface GeocodedPlace {
  /** Stable per-place key — the Nominatim place_id for a search/reverse
   *  result, or a coordinate-derived id for a popular/recent entry. */
  id: string;
  name: string;
  /** District/state label shown as a subtitle, e.g. "Ernakulam, Kerala". */
  district: string;
  lat: number;
  lng: number;
}

/** Kerala plus a little padding on every side — used both for the map's
 *  maxBounds and Nominatim's viewbox, so "what counts as nearby" is one
 *  shared definition. */
export const KERALA_BOUNDS = {
  south: 7.9,
  west: 74.5,
  north: 13.0,
  east: 78.5,
};

export const KERALA_CENTER: [number, number] = [10.5, 76.3];

const VIEWBOX = `${KERALA_BOUNDS.west},${KERALA_BOUNDS.north},${KERALA_BOUNDS.east},${KERALA_BOUNDS.south}`;

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

/** Serializes every Nominatim call through here and never lets two land
 *  less than 1000ms apart, queueing instead of racing concurrent callers. */
function throttledFetch(url: string, signal?: AbortSignal): Promise<Response> {
  const run = queue.then(async () => {
    const wait = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return fetch(url, { headers: { "Accept-Language": "en" }, signal });
  });
  // Swallow the chained promise's own rejection so one failed request
  // doesn't poison the shared queue for the next caller.
  queue = run.catch(() => undefined);
  return run;
}

interface NominatimAddress {
  state_district?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  state?: string;
}

function describeDistrict(address: NominatimAddress | undefined, fallback: string): string {
  const district = address?.state_district || address?.county || address?.city || address?.town || fallback;
  const state = address?.state;
  if (!state) return district;
  return district && district !== state ? `${district}, ${state}` : state;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=in&viewbox=${VIEWBOX}&bounded=1&limit=6&addressdetails=1`;
  const res = await throttledFetch(url, signal);
  if (!res.ok) throw new Error("Search request failed");
  const data: NominatimResult[] = await res.json();
  return data.map((d) => ({
    id: String(d.place_id),
    name: d.display_name.split(",")[0],
    district: describeDistrict(d.address, "Kerala"),
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<GeocodedPlace> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await throttledFetch(url, signal);
  if (!res.ok) throw new Error("Reverse geocode request failed");
  const data: NominatimResult & { address?: NominatimAddress & { road?: string }; name?: string } = await res.json();
  const address = data.address;
  const name = address?.village || address?.town || address?.city || address?.suburb || data.name || data.display_name?.split(",")[0] || "Dropped pin";
  return {
    id: String(data.place_id ?? `${lat.toFixed(5)},${lng.toFixed(5)}`),
    name,
    district: describeDistrict(address, "Kerala"),
    lat,
    lng,
  };
}

export function isWithinKeralaBounds(lat: number, lng: number): boolean {
  return lat >= KERALA_BOUNDS.south && lat <= KERALA_BOUNDS.north && lng >= KERALA_BOUNDS.west && lng <= KERALA_BOUNDS.east;
}

export const POPULAR_PLACES: GeocodedPlace[] = [
  { id: "popular-kochi", name: "Kochi", district: "Ernakulam, Kerala", lat: 9.9312, lng: 76.2673 },
  { id: "popular-thiruvananthapuram", name: "Thiruvananthapuram", district: "Thiruvananthapuram, Kerala", lat: 8.5241, lng: 76.9366 },
  { id: "popular-kozhikode", name: "Kozhikode", district: "Kozhikode, Kerala", lat: 11.2588, lng: 75.7804 },
  { id: "popular-thrissur", name: "Thrissur", district: "Thrissur, Kerala", lat: 10.5276, lng: 76.2144 },
  { id: "popular-kollam", name: "Kollam", district: "Kollam, Kerala", lat: 8.8932, lng: 76.6141 },
  { id: "popular-kannur", name: "Kannur", district: "Kannur, Kerala", lat: 11.8745, lng: 75.3704 },
];

const RECENT_KEY = "tripconsole:recent-locations";
const MAX_RECENTS = 5;

export function getRecentLocations(): GeocodedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentLocation(place: GeocodedPlace) {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentLocations().filter((p) => p.id !== place.id);
    const next = [place, ...current].slice(0, MAX_RECENTS);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — recents just
    // don't persist for this session, nothing else depends on it.
  }
}
