import { Suspense } from "react";
import type { Metadata } from "next";
import { OtpForm } from "@/components/auth/otp-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            We&apos;ll send a one-time code to your email or phone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <OtpForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
