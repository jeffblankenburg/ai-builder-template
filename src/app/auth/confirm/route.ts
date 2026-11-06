import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the email magic-link / OTP confirmation redirect.
 *
 * Supabase sends links of the form:
 *   /auth/confirm?token_hash=...&type=email&next=/dashboard
 *
 * We verify the token, which sets the session cookies, then redirect onward.
 * Phone (SMS) codes are verified client-side in the OTP form instead.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const errorUrl = new URL("/login", request.url);
  errorUrl.searchParams.set("error", "Invalid or expired confirmation link.");
  return NextResponse.redirect(errorUrl);
}
