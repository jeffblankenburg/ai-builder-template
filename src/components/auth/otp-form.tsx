"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Method = "email" | "phone";
type Step = "request" | "verify";

/**
 * Passwordless OTP sign-in via Supabase native auth.
 *
 * - Email: `signInWithOtp` sends a 6-digit code (and/or magic link).
 * - Phone: `signInWithOtp` sends an SMS code through the SMS provider
 *   configured in the Supabase dashboard (Twilio Verify).
 *
 * The user enters the code here and we verify it with `verifyOtp`, which sets
 * the session cookies. Email magic links are handled by /auth/confirm instead.
 */
export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [method, setMethod] = useState<Method>("email");
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } =
        method === "email"
          ? await supabase.auth.signInWithOtp({
              email: identifier,
              options: {
                emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
              },
            })
          : await supabase.auth.signInWithOtp({ phone: identifier });

      if (error) throw error;
      setStep("verify");
      toast.success(
        method === "email"
          ? "Check your email for a sign-in code."
          : "Check your phone for a sign-in code.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } =
        method === "email"
          ? await supabase.auth.verifyOtp({
              email: identifier,
              token: code,
              type: "email",
            })
          : await supabase.auth.verifyOtp({
              phone: identifier,
              token: code,
              type: "sms",
            });

      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <form onSubmit={verifyCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Enter the 6-digit code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />
          <p className="text-muted-foreground text-sm">
            Sent to {identifier}
          </p>
        </div>
        <Button type="submit" disabled={loading || code.length < 6}>
          {loading ? "Verifying…" : "Verify & sign in"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep("request");
            setCode("");
          }}
          disabled={loading}
        >
          Use a different {method === "email" ? "email" : "number"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="flex flex-col gap-4">
      <div className="bg-muted flex rounded-lg p-1 text-sm">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMethod(m);
              setIdentifier("");
            }}
            className={`flex-1 rounded-md py-1.5 capitalize transition-colors ${
              method === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="identifier">
          {method === "email" ? "Email address" : "Phone number"}
        </Label>
        <Input
          id="identifier"
          type={method === "email" ? "email" : "tel"}
          inputMode={method === "email" ? "email" : "tel"}
          autoComplete={method === "email" ? "email" : "tel"}
          placeholder={method === "email" ? "you@example.com" : "+15555550123"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoFocus
        />
        {method === "phone" && (
          <p className="text-muted-foreground text-sm">
            Use E.164 format, e.g. +15555550123.
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading || !identifier}>
        {loading ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}
