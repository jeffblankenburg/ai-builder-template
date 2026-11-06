import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

// This route is per-user: it reads auth cookies via the Supabase server client,
// so it can't be prerendered. With Cache Components enabled, opt it out of the
// static prerender and render it on request (block mode).
export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already guards this route, but we re-check here so the page
  // is safe even if the matcher changes.
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You&apos;re signed in</CardTitle>
          <CardDescription>
            This is a protected route. Replace it with your app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="font-mono break-all">{user.id}</dd>
            {user.email && (
              <>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </>
            )}
            {user.phone && (
              <>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{user.phone}</dd>
              </>
            )}
          </dl>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
