/**
 * Minimal fetch wrapper for the TripConsole backend (NestJS, `/api/v1/...`).
 *
 * Base URL is configurable via NEXT_PUBLIC_API_BASE_URL (see .env.local.example)
 * — never hardcode a deployment target here. This module has no knowledge of
 * auth state; token attachment and refresh-on-401 live in auth-context.tsx.
 */

// Demo/offline mode — see lib/demo-backend.ts for the full explanation.
// DEMO_MODE is a NEXT_PUBLIC_ env var, inlined at build time: unless it is
// explicitly "true" at build time, this import changes nothing below.
import { DEMO_MODE, demoApiFetch } from "./demo-backend";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  /** HTTP status, or 0 when the request never reached the server (network/DNS failure). */
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string | null;
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return `Request failed (${status})`;
}

/** Low-level call — does not know about tokens beyond attaching the one
 *  it's given, and never attempts a refresh itself. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (DEMO_MODE) return demoApiFetch<T>(path, options);

  const { accessToken, headers, body, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure, DNS failure, backend not running, CORS rejection, etc.
    // Surfaced as status 0 so callers can distinguish "never reached the
    // server" from a real HTTP error response.
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.", null);
  }

  const text = await response.text();
  let parsedBody: unknown = null;
  if (text) {
    try {
      parsedBody = JSON.parse(text);
    } catch {
      parsedBody = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(parsedBody, response.status), parsedBody);
  }

  return parsedBody as T;
}
