/**
 * Centralized, typed access to environment variables.
 *
 * `NEXT_PUBLIC_*` vars are inlined into the client bundle at build time and are
 * safe to read in the browser. Everything else is server-only — reading a
 * server var in a client component will return `undefined`.
 *
 * Keep this file as the single source of truth for env access so missing
 * configuration fails loudly and in one place.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Public config — available in the browser. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  /** GA4 Measurement ID, e.g. "G-XXXXXXXXXX". Analytics is disabled when unset. */
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  /** Public site URL, used for building auth redirect links. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/**
 * Supabase credentials, asserted non-null. Call from code paths that cannot
 * function without Supabase (all auth flows).
 */
export function getSupabaseConfig() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", publicEnv.supabaseUrl),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicEnv.supabaseAnonKey),
  };
}
