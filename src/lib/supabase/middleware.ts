import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/env";

/** Route prefixes that require an authenticated user. */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes an authenticated user should be bounced away from (e.g. login). */
const AUTH_ROUTES = ["/login"];

/**
 * Refreshes the Supabase auth session on every request and enforces route
 * protection. Wire this up from the root `middleware.ts`.
 *
 * Important: this returns a response whose cookies have been synced with the
 * refreshed session. Always return THIS response (or copy its cookies) so the
 * browser receives the rotated tokens.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser(). A simple mistake
  // here can make it very hard to debug random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
