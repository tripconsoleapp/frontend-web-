/**
 * Centralized frontend-only demo/offline mode.
 *
 * Gated by NEXT_PUBLIC_DEMO_MODE — a Next.js NEXT_PUBLIC_ env var is inlined
 * at BUILD time, so unless it is explicitly set to the literal string
 * "true" when the app is built, DEMO_MODE below is `false` and every file
 * that imports it falls through to the real backend path unchanged. This is
 * the only switch: there is no runtime toggle, no cookie, no header — a
 * production build that never sets this var cannot accidentally serve demo
 * data or a demo session.
 *
 * What this module is NOT: it does not weaken, bypass, or replace
 * RequireAuth/AuthProvider's real session gate. A demo session is still a
 * real `status: "authenticated"` React state, reached through the same
 * login()/RequireAuth pipeline — it just never talks to a real backend, and
 * its access token is a plain, human-readable sentinel string
 * (DEMO_ACCESS_TOKEN) rather than anything JWT-shaped, so it can never be
 * mistaken for — or misparsed as — a real backend-issued token. See
 * lib/auth-context.tsx's `toSessionUser`/`refreshSession` for the two small,
 * explicit sentinel checks that route around real JWT decoding for exactly
 * this one value.
 *
 * Every other demo response (organizer profile, trips, destinations,
 * Trip-Builder services) flows through the single `demoApiFetch` dispatcher
 * below, which lib/api-client.ts's `apiFetch` calls instead of a real fetch
 * when DEMO_MODE is on. An endpoint this dispatcher doesn't recognize throws
 * a clearly-labeled ApiError rather than silently no-op'ing or falling
 * through to a real network call.
 */

import { ApiError, type ApiFetchOptions } from "./api-client";
import type { SessionUser, OrganizerProfile } from "./auth-context";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ─────────────────────────────────────────────────────────────
// Demo session identity — never a JWT, never parsed as one.
// ─────────────────────────────────────────────────────────────

export const DEMO_ACCESS_TOKEN = "demo-mode-session-token";

/** Fixed, non-secret credentials the demo login button submits through the
 *  real login() function — not a new auth code path, just a clearly-labeled
 *  shortcut that fills in these values instead of asking the visitor to
 *  type anything. Never validated against anything (demo mode never
 *  reaches a real backend), so there is nothing here to keep private. */
export const DEMO_CREDENTIALS = { identifier: "demo@tripconsole.local", password: "demo-mode" };

export const DEMO_SESSION_USER: SessionUser = {
  userId: "demo-organizer",
  role: "ORGANIZER",
  verificationLevel: "demo",
};

export const DEMO_ORGANIZER_PROFILE: OrganizerProfile = {
  id: "demo-organizer-profile",
  userId: "demo-organizer",
  organizerType: "GROUP",
  displayName: "Demo Organizer",
  contactPerson: "Demo Organizer",
  phone: "9999999999",
  city: "Kochi",
  state: "Kerala",
  organizationName: "TripConsole Demo",
  designation: "Organizer",
  gstin: null,
  groupName: "Demo Group",
  isComplete: true,
};

// ─────────────────────────────────────────────────────────────
// Demo "database" — one trip, its destinations and services,
// persisted to sessionStorage so it survives navigation and a hard
// refresh within the same browser tab (same convention as
// lib/listing-draft.ts and every standalone booking flow's state module).
// ─────────────────────────────────────────────────────────────

const STORE_KEY = "tripconsole:demo-backend-state";

interface DemoDestination {
  id: string;
  tripId: string;
  orderIndex: number;
  locationName: string;
  lat: number | null;
  lng: number | null;
  stayDurationHours: number | null;
  arrivalDay: number | null;
  notes: string | null;
  placeId: string | null;
}

interface DemoService {
  id: string;
  tripId: string;
  serviceType: "DESTINATION" | "HOTEL" | "RESTAURANT" | "VEHICLE" | "ACTIVITY";
  operatorServiceId: string | null;
  internalPlaceId: string | null;
  quantity: number | null;
  metadata: Record<string, unknown> | null;
}

interface DemoTrip {
  id: string;
  organizerId: string;
  title: string;
  tripType: string;
  status: string;
  version: number;
  declarationsConfirmed: boolean;
  costSnapshot: unknown;
  itinerarySnapshot: unknown;
  destinations: DemoDestination[];
  services: DemoService[];
}

interface DemoStore {
  trips: Record<string, DemoTrip>;
}

function readStore(): DemoStore {
  if (typeof window === "undefined") return { trips: {} };
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as DemoStore) : { trips: {} };
  } catch {
    return { trips: {} };
  }
}

function writeStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage unavailable — demo state just won't survive a reload.
  }
}

function genId(prefix: string) {
  return `demo-${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function notFound(path: string): never {
  throw new ApiError(404, `Demo mode: no such resource (${path})`, null);
}

function unsupported(method: string, path: string): never {
  throw new ApiError(
    501,
    `Demo mode: no mock implementation for ${method} ${path} — this endpoint is not simulated in demo mode.`,
    null
  );
}

// ─────────────────────────────────────────────────────────────
// The dispatcher. Mirrors the exact path/method combinations the frontend
// actually calls — see lib/trip-api.ts, lib/destination-api.ts,
// lib/{hotel,vehicle,meal,itinerary}-service-api.ts, lib/auth-context.tsx.
// ─────────────────────────────────────────────────────────────

export async function demoApiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const body = options.body as Record<string, unknown> | undefined;

  // Simulate the same small, realistic latency the real backend/mock
  // flows already use elsewhere in this app, so loading states are
  // exercised instead of resolving instantly every time.
  await new Promise((resolve) => setTimeout(resolve, 250));

  // ---- Auth (only reachable if the real login()/logout() functions are
  // invoked while DEMO_MODE is on — see auth-context.tsx for the primary,
  // non-network sentinel path used by the demo login button) ----
  if (path === "/auth/login" && method === "POST") {
    return { accessToken: DEMO_ACCESS_TOKEN, refreshToken: DEMO_ACCESS_TOKEN } as T;
  }
  if (path === "/auth/refresh" && method === "POST") {
    return { accessToken: DEMO_ACCESS_TOKEN, refreshToken: DEMO_ACCESS_TOKEN } as T;
  }
  if (path === "/auth/logout" && method === "POST") {
    return { message: "Demo session ended." } as T;
  }
  if (path === "/organizer/profile/me" && method === "GET") {
    return DEMO_ORGANIZER_PROFILE as unknown as T;
  }

  const store = readStore();

  // ---- POST /trips ----
  if (path === "/trips" && method === "POST") {
    const id = genId("trip");
    const trip: DemoTrip = {
      id,
      organizerId: DEMO_SESSION_USER.userId,
      title: (body?.title as string) || "Untitled Trip",
      tripType: (body?.tripType as string) || "GROUP",
      status: "DRAFT",
      version: 1,
      declarationsConfirmed: false,
      costSnapshot: null,
      itinerarySnapshot: null,
      destinations: [],
      services: [],
    };
    store.trips[id] = trip;
    writeStore(store);
    return trip as unknown as T;
  }

  // ---- GET /trips/:id ----
  let m = path.match(/^\/trips\/([^/]+)$/);
  if (m && method === "GET") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    return trip as unknown as T;
  }

  // ---- PATCH /trips/:id/status ----
  m = path.match(/^\/trips\/([^/]+)\/status$/);
  if (m && method === "PATCH") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    trip.status = (body?.status as string) ?? trip.status;
    if (typeof body?.declarationsConfirmed === "boolean") trip.declarationsConfirmed = body.declarationsConfirmed;
    trip.version += 1;
    writeStore(store);
    return trip as unknown as T;
  }

  // ---- /trips/:id/destinations[...] ----
  m = path.match(/^\/trips\/([^/]+)\/destinations\/reorder$/);
  if (m && method === "PATCH") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const ordered = (body?.destinations as { id: string; orderIndex: number }[]) ?? [];
    for (const { id, orderIndex } of ordered) {
      const dest = trip.destinations.find((d) => d.id === id);
      if (dest) dest.orderIndex = orderIndex;
    }
    trip.destinations.sort((a, b) => a.orderIndex - b.orderIndex);
    writeStore(store);
    return trip.destinations as unknown as T;
  }

  m = path.match(/^\/trips\/([^/]+)\/destinations$/);
  if (m && method === "GET") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    return trip.destinations as unknown as T;
  }
  if (m && method === "POST") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const dest: DemoDestination = {
      id: genId("dest"),
      tripId: trip.id,
      orderIndex: trip.destinations.length,
      locationName: (body?.locationName as string) ?? "",
      lat: (body?.lat as number) ?? null,
      lng: (body?.lng as number) ?? null,
      stayDurationHours: (body?.stayDurationHours as number) ?? null,
      arrivalDay: null,
      notes: null,
      placeId: null,
    };
    trip.destinations.push(dest);
    writeStore(store);
    return dest as unknown as T;
  }

  m = path.match(/^\/trips\/([^/]+)\/destinations\/([^/]+)$/);
  if (m && method === "PATCH") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const dest = trip.destinations.find((d) => d.id === m![2]);
    if (!dest) notFound(path);
    if (body?.locationName !== undefined) dest.locationName = body.locationName as string;
    if (body?.lat !== undefined) dest.lat = body.lat as number;
    if (body?.lng !== undefined) dest.lng = body.lng as number;
    if (body?.stayDurationHours !== undefined) dest.stayDurationHours = body.stayDurationHours as number;
    writeStore(store);
    return dest as unknown as T;
  }
  if (m && method === "DELETE") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const before = trip.destinations.length;
    trip.destinations = trip.destinations.filter((d) => d.id !== m![2]);
    if (trip.destinations.length === before) notFound(path);
    writeStore(store);
    return { success: true } as unknown as T;
  }

  // ---- /trips/:id/services[...] ----
  m = path.match(/^\/trips\/([^/]+)\/services$/);
  if (m && method === "POST") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const service: DemoService = {
      id: genId("svc"),
      tripId: trip.id,
      serviceType: (body?.serviceType as DemoService["serviceType"]) ?? "DESTINATION",
      operatorServiceId: (body?.operatorServiceId as string) ?? null,
      internalPlaceId: (body?.internalPlaceId as string) ?? null,
      quantity: (body?.quantity as number) ?? null,
      metadata: (body?.metadata as Record<string, unknown>) ?? null,
    };
    trip.services.push(service);
    writeStore(store);
    return service as unknown as T;
  }

  m = path.match(/^\/trips\/([^/]+)\/services\/([^/]+)$/);
  if (m && method === "DELETE") {
    const trip = store.trips[m[1]];
    if (!trip) notFound(path);
    const before = trip.services.length;
    trip.services = trip.services.filter((s) => s.id !== m![2]);
    if (trip.services.length === before) notFound(path);
    writeStore(store);
    return { message: "Deleted (demo)." } as unknown as T;
  }

  unsupported(method, path);
}
