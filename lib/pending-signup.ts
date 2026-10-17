"use client";

/**
 * Bridges the multi-step signup wizard (Signup → Choose Role → Verify Email)
 * so the password/mobile captured on the first screen survive the route
 * change to Role Selection, where the actual POST /auth/register fires (the
 * backend requires `role` on registration, and role is only chosen on the
 * second screen). Mirrors the sessionStorage-as-temporary-state pattern
 * already used by lib/listing-draft.ts — this is a separate bucket because
 * it holds auth credentials, not trip-draft data, and is cleared as soon as
 * registration succeeds.
 */

const STORAGE_KEY = "tripconsole:pending-signup";

export interface PendingSignup {
  email: string;
  phone?: string;
  password: string;
}

export function savePendingSignup(data: PendingSignup) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable — Role Selection will have nothing to
    // register with and will surface that as a normal form error.
  }
}

export function getPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingSignup) : null;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — worst case the next signup overwrites this key.
  }
}
