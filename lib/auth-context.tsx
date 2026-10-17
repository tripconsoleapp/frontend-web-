"use client";

/**
 * Real session state for the TripConsole backend (JWT access + refresh).
 *
 * Storage strategy (see the Phase 1 integration report for the full
 * rationale): the backend returns both tokens in the JSON response body —
 * it does not set an httpOnly cookie — so there is no way for this SPA-style
 * frontend to hold the refresh token without some client-side exposure.
 * Given that constraint:
 *   - accessToken lives only in React state (memory) — never written to any
 *     storage, so it disappears on a hard reload/tab close on its own.
 *   - refreshToken lives in sessionStorage (survives a reload within the
 *     same tab, cleared when the tab closes) — smaller exposure window than
 *     localStorage, and consistent with how the rest of this app already
 *     uses sessionStorage for draft state (see lib/listing-draft.ts).
 * A genuine httpOnly-cookie refresh flow would require the backend to set
 * the cookie itself; that's a backend change and out of scope for Phase 1.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, ApiError, type ApiFetchOptions } from "@/lib/api-client";
import { DEMO_MODE, DEMO_ACCESS_TOKEN, DEMO_SESSION_USER } from "@/lib/demo-backend";

const REFRESH_TOKEN_KEY = "tripconsole:auth-refresh-token";

export type UserRole = "ORGANIZER" | "OPERATOR" | "FIELD_COORDINATOR" | "ADMIN";

export interface SessionUser {
  userId: string;
  role: UserRole;
  verificationLevel?: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  organizerType: string;
  displayName: string;
  contactPerson?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  organizationName?: string | null;
  designation?: string | null;
  gstin?: string | null;
  groupName?: string | null;
  isComplete: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  profile: OrganizerProfile | null;
  /** True only when the current session was created by demo mode's
   *  sentinel token, never a real backend-issued one — see
   *  lib/demo-backend.ts. Lets any component clearly label a demo session
   *  (e.g. a "Demo Mode" badge) without re-deriving it from the token. */
  isDemoSession: boolean;
  login(identifier: string, password: string): Promise<void>;
  register(input: { email?: string; phone?: string; password: string; role: UserRole }): Promise<void>;
  logout(): Promise<void>;
  /** Authenticated fetch — attaches the current access token and retries
   *  once via /auth/refresh on a 401 before giving up. Use this (never
   *  apiFetch directly) for any call that requires a logged-in user. */
  authedFetch<T>(path: string, options?: ApiFetchOptions): Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // sessionStorage unavailable (private browsing / quota) — the session
    // simply won't survive a reload; in-memory state still works.
  }
}

/** Decodes a JWT payload without verifying the signature — verification is
 *  the backend's job. This is only used to read non-secret claims (role,
 *  sub) that the UI needs synchronously, e.g. to gate the profile fetch to
 *  organizers. Never trust this for authorization decisions server-side. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function toSessionUser(accessToken: string): SessionUser | null {
  // Demo mode never issues a JWT — this is an exact-match check against a
  // plain, non-JWT sentinel string, not an attempt to parse or trust
  // arbitrary token shapes. See lib/demo-backend.ts.
  if (DEMO_MODE && accessToken === DEMO_ACCESS_TOKEN) return DEMO_SESSION_USER;
  const payload = decodeJwtPayload(accessToken);
  if (!payload || typeof payload.sub !== "string" || typeof payload.role !== "string") return null;
  return {
    userId: payload.sub,
    role: payload.role as UserRole,
    verificationLevel:
      typeof payload.verificationLevel === "string" ? payload.verificationLevel : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [isDemoSession, setIsDemoSession] = useState(false);
  // Access token lives in a ref (not just state) so authedFetch's retry
  // logic always reads the latest value, even mid-render.
  const accessTokenRef = useRef<string | null>(null);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    writeStoredRefreshToken(null);
    setUser(null);
    setProfile(null);
    setIsDemoSession(false);
    setStatus("unauthenticated");
  }, []);

  const applyTokens = useCallback((tokens: TokenPair) => {
    accessTokenRef.current = tokens.accessToken;
    writeStoredRefreshToken(tokens.refreshToken);
    const sessionUser = toSessionUser(tokens.accessToken);
    setUser(sessionUser);
    setIsDemoSession(DEMO_MODE && tokens.accessToken === DEMO_ACCESS_TOKEN);
    setStatus(sessionUser ? "authenticated" : "unauthenticated");
    return sessionUser;
  }, []);

  const fetchProfile = useCallback(async (sessionUser: SessionUser | null) => {
    if (!sessionUser || sessionUser.role !== "ORGANIZER") {
      setProfile(null);
      return;
    }
    try {
      const data = await apiFetch<OrganizerProfile>("/organizer/profile/me", {
        accessToken: accessTokenRef.current,
      });
      setProfile(data);
    } catch {
      // No profile created yet (404) or a transient error — not fatal to
      // the session itself, the organizer just hasn't completed onboarding.
      setProfile(null);
    }
  }, []);

  /** Attempts a silent refresh using the stored refresh token. Returns the
   *  new access token on success, or null (and clears the session) on
   *  failure. Never throws. */
  const refreshSession = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = readStoredRefreshToken();
    if (!storedRefreshToken) {
      clearSession();
      return null;
    }
    // Demo mode: resume the demo session directly, with no network call —
    // the stored "refresh token" is the same plain sentinel, never a real
    // backend-issued value. See lib/demo-backend.ts.
    if (DEMO_MODE && storedRefreshToken === DEMO_ACCESS_TOKEN) {
      accessTokenRef.current = DEMO_ACCESS_TOKEN;
      setUser(DEMO_SESSION_USER);
      setIsDemoSession(true);
      setStatus("authenticated");
      return DEMO_ACCESS_TOKEN;
    }
    try {
      const tokens = await apiFetch<TokenPair>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: storedRefreshToken },
      });
      const sessionUser = applyTokens(tokens);
      return sessionUser ? tokens.accessToken : null;
    } catch {
      clearSession();
      return null;
    }
  }, [applyTokens, clearSession]);

  const authedFetch = useCallback(
    async <T,>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, accessToken: accessTokenRef.current });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refreshSession();
          if (refreshed) {
            return apiFetch<T>(path, { ...options, accessToken: refreshed });
          }
        }
        throw error;
      }
    },
    [refreshSession]
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      const tokens = await apiFetch<TokenPair>("/auth/login", {
        method: "POST",
        body: { identifier, password },
      });
      const sessionUser = applyTokens(tokens);
      await fetchProfile(sessionUser);
    },
    [applyTokens, fetchProfile]
  );

  const register = useCallback(
    async (input: { email?: string; phone?: string; password: string; role: UserRole }) => {
      await apiFetch("/auth/register", { method: "POST", body: input });
      // register() returns only a confirmation message, no tokens — log in
      // immediately afterward with the same credentials to establish a session.
      await login(input.email ?? input.phone ?? "", input.password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await authedFetch("/auth/logout", { method: "POST" });
    } catch {
      // Best-effort — even if this fails (token already expired, network
      // down), the local session must still be cleared below.
    }
    clearSession();
  }, [authedFetch, clearSession]);

  // On mount: try to silently resume a session from the stored refresh
  // token. If there isn't one, resolve straight to "unauthenticated" — no
  // network call needed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedRefreshToken = readStoredRefreshToken();
      if (!storedRefreshToken) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      const accessToken = await refreshSession();
      if (cancelled) return;
      if (accessToken) {
        await fetchProfile(toSessionUser(accessToken));
      }
    })();
    return () => {
      cancelled = true;
    };
    // Runs exactly once on mount — refreshSession/fetchProfile are stable
    // callbacks (useCallback with stable deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, profile, isDemoSession, login, register, logout, authedFetch }),
    [status, user, profile, isDemoSession, login, register, logout, authedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
