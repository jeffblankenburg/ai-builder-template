import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Reads/writes auth cookies via Next's `cookies()` store.
 *
 * Must be created per-request (do not cache the returned client across
 * requests) because it is bound to the current request's cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` was called from a Server Component, where cookies are
          // read-only. This is safe to ignore when session refresh runs in
          // middleware (see src/lib/supabase/middleware.ts).
        }
      },
    },
  });
}
