import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for use in Client Components (the browser).
 *
 * Safe to call on every render — `createBrowserClient` is memoized internally,
 * so repeated calls return the same underlying client.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
