import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AI Builder Template
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Next.js + Supabase auth + Vercel + OTP (SMS/email) + Google Analytics
          + OpenTelemetry. Clone it, fill in <code>.env.local</code>, and build.
        </p>
      </div>
      <div className="flex gap-3">
        <Button render={<Link href="/login">Sign in</Link>} />
        <Button
          variant="outline"
          render={<Link href="/dashboard">Go to dashboard</Link>}
        />
      </div>
    </main>
  );
}
