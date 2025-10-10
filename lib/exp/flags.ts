import { cookies as nextCookies } from "next/headers";
import { randomUUID, createHash } from "crypto";
import PostHogClient from "@/posthog";

export type AuthVariant = "alum_only" | "open_google";

const COOKIE_NAME = "ab_auth_flow";
const ANON_COOKIE = "ph_anon_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Minimal cookie store surface to avoid importing internal Next types and to
// support the async cookies() API in Next.js 15.
type CookieValue = { value: string } | undefined;
type CookieStoreAPI = {
  get(name: string): CookieValue;
  set(init: {
    name: string;
    value: string;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
    path?: string;
    maxAge?: number;
  }): void;
};

function computeDeterministicVariant(id: string): AuthVariant {
  const hash = createHash("sha256").update(id).digest("hex");
  // Take first 8 hex chars -> int -> 0..100
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  return bucket < 50 ? "alum_only" : "open_google";
}

function setCookie(cookieStore: CookieStoreAPI, name: string, value: string, maxAgeSeconds: number) {
  try {
    cookieStore.set({
      name,
      value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAgeSeconds,
    });
  } catch {
    // In Server Components, Next forbids cookie mutations.
    // Swallow error and continue; stickiness will be established later
    // when a Route Handler calls this (e.g., during API requests).
  }
}

function getOrCreateAnonId(cookieStore: CookieStoreAPI): string {
  const existing = cookieStore.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  const anon = randomUUID();
  setCookie(cookieStore, ANON_COOKIE, anon, COOKIE_MAX_AGE * 6); // 6 months (best-effort)
  return anon;
}

export async function getAuthVariant(cookieStore?: CookieStoreAPI, distinctId?: string): Promise<AuthVariant> {
  const cookies = cookieStore ?? ((await nextCookies()) as unknown as CookieStoreAPI);

  const cached = cookies.get(COOKIE_NAME)?.value as AuthVariant | undefined;
  if (cached === "alum_only" || cached === "open_google") {
    return cached;
  }

  const id = distinctId || getOrCreateAnonId(cookies);

  // Try PostHog server evaluation first
  try {
    const ph = PostHogClient();
    const value = (await ph.getFeatureFlag("auth_flow_variant", id)) as string | null;
    const mapped: AuthVariant | null =
      value === "alum_only" ? "alum_only" :
      value === "open_google" ? "open_google" :
      value === "control" ? "alum_only" :
      value === "test" ? "open_google" :
      null;
    // We intentionally do not await shutdown to keep cold starts snappy
    if (mapped) {
      setCookie(cookies, COOKIE_NAME, mapped, COOKIE_MAX_AGE);
      return mapped;
    }
  } catch {
    // ignore and fall back
  }

  // Deterministic fallback
  const deterministic = computeDeterministicVariant(id);
  setCookie(cookies, COOKIE_NAME, deterministic, COOKIE_MAX_AGE);
  return deterministic;
}

export async function readAuthVariant(cookieStore?: CookieStoreAPI): Promise<AuthVariant | null> {
  const cookies = cookieStore ?? ((await nextCookies()) as unknown as CookieStoreAPI);
  const v = cookies.get(COOKIE_NAME)?.value;
  return v === "alum_only" || v === "open_google" ? v : null;
}
