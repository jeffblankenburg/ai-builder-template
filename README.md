# AI Builder Template

An opinionated starter for the stack I build on repeatedly:

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, TypeScript, `src/`) |
| Auth | **Supabase** native OTP — passwordless **email** _and_ **SMS** |
| SMS provider | **Twilio Verify** (configured behind Supabase) |
| UI | **Tailwind CSS v4** + **shadcn/ui** |
| Analytics | **Google Analytics 4** (`@next/third-parties`) |
| Observability | **OpenTelemetry** (`@vercel/otel`, OTLP → any backend) |
| Hosting | **Vercel** |
| AI-session capture | **Entire.io** (git-linked agent checkpoints — dev tooling) |

---

## Quick start

```bash
./scripts/setup.sh      # installs deps, creates .env.local, offers Entire setup
# then fill in .env.local and:
npm run dev
```

Or manually:

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000. The flow: **/** → **/login** (send + verify OTP) →
**/dashboard** (protected).

---

## Environment variables

See [`.env.example`](./.env.example) for the full annotated list. The minimum to
boot:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | same page |
| `NEXT_PUBLIC_SITE_URL` | ✅ (prod) | your deployed URL; used for auth redirects |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | — | blank disables analytics entirely |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | point traces at any OTLP backend |

---

## Authentication (Supabase native OTP)

Passwordless, two-step: request a code → verify it. Both channels go through
Supabase's built-in OTP:

- **Email** — `signInWithOtp({ email })` sends a 6-digit code + magic link.
  Codes are verified in [`otp-form.tsx`](./src/components/auth/otp-form.tsx);
  magic links land on [`/auth/confirm`](./src/app/auth/confirm/route.ts).
- **Phone / SMS** — `signInWithOtp({ phone })` sends an SMS code via the
  provider configured in Supabase. Verified with `verifyOtp({ type: "sms" })`.

Session management lives in the SSR clients and middleware:

- [`src/lib/supabase/client.ts`](./src/lib/supabase/client.ts) — browser client
- [`src/lib/supabase/server.ts`](./src/lib/supabase/server.ts) — server client
- [`src/lib/supabase/middleware.ts`](./src/lib/supabase/middleware.ts) — refreshes
  the session on every request and guards `/dashboard`

### Configure Twilio Verify

Twilio is configured **in Supabase**, not in this app's env (so no Twilio
secrets live in the repo):

1. In the Supabase dashboard → **Authentication → Providers → Phone**.
2. Set **SMS provider → Twilio** (or **Twilio Verify**).
3. Paste your Twilio **Account SID**, **Auth Token**, and **Verify Service SID**.
4. Enable the **Email** provider too (for email OTP).

Locally, `supabase start` prints SMS/email codes to its logs and Inbucket
(http://localhost:54324), so you can test without a real Twilio account.

---

## Database

A starter schema lives in [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql):
a `profiles` table keyed to `auth.users`, row-level security scoped to the
owner, and a trigger that auto-creates a profile on sign-up.

```bash
supabase start          # local stack (needs Docker + Supabase CLI)
supabase db reset       # apply migrations locally
supabase link --project-ref <ref> && supabase db push   # push to hosted project
```

Generate types after schema changes:

```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

---

## Analytics (GA4)

[`src/components/analytics.tsx`](./src/components/analytics.tsx) renders GA only
when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Pageviews are automatic; send custom
events with `sendGAEvent` from `@next/third-parties/google`.

## Observability (OpenTelemetry)

[`instrumentation.ts`](./instrumentation.ts) registers `@vercel/otel`. It's
vendor-neutral — traces export over OTLP, so point `OTEL_EXPORTER_OTLP_ENDPOINT`
/ `OTEL_EXPORTER_OTLP_HEADERS` at Honeycomb, Grafana Tempo, Dash0, SigNoz,
Jaeger, etc. On Vercel, traces also appear in the dashboard with no config.

---

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel (or `vercel`).
2. Add the env vars from `.env.example` in **Project → Settings → Environment
   Variables** (set `NEXT_PUBLIC_SITE_URL` to the production domain).
3. In Supabase → **Authentication → URL Configuration**, add your Vercel domain
   and `https://<domain>/auth/confirm` to the redirect allow-list.

[`vercel.json`](./vercel.json) pins the framework and limits auto-deploys to
`main`.

---

## Entire.io — AI coding session capture

[Entire](https://entire.io) records Claude Code / agent sessions, prompts, and
tool calls as git-linked checkpoints, so the reasoning behind each change is
preserved alongside the commit. It's **developer tooling**, not an app runtime
dependency — nothing ships to production.

```bash
# install the CLI
brew install --cask entireio/tap/entire     # macOS
# curl -fsSL https://entire.com/install.sh | bash   # Linux

entire enable        # install git hooks for this repo
entire agent setup   # capture Claude Code transcripts & tool calls
```

Useful commands: `entire status`, `entire checkpoint`, `entire explain`,
`entire search`, `entire blame`. `./scripts/setup.sh` runs the two setup steps
for you if the CLI is installed.

---

## Project structure

```
instrumentation.ts            OpenTelemetry registration
middleware.ts                 Supabase session refresh + route guards
vercel.json                   Vercel project config
scripts/setup.sh              local bootstrap + Entire setup
supabase/
  config.toml                 local-dev config (auth, SMS, email)
  migrations/0001_init.sql    profiles table + RLS + triggers
src/
  app/
    page.tsx                  landing
    login/page.tsx            OTP sign-in
    dashboard/page.tsx        protected example route
    auth/confirm/route.ts     email magic-link / OTP confirmation
    auth/signout/route.ts     sign out
  components/
    analytics.tsx             GA4 (env-gated)
    auth/otp-form.tsx         email/SMS OTP form
    ui/                       shadcn/ui components
  lib/
    env.ts                    typed env access
    supabase/                 browser/server/middleware clients
```
