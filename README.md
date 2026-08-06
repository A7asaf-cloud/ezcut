# EZCut

A personal cutting-phase tracker: log a daily physique photo, meal-plan screenshot, and body weight, and get AI coaching feedback from Gemini 2.5 Flash. Weight trend chart + photo gallery on the dashboard.

**Stack**: Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Auth, Postgres, Storage) · Gemini 2.5 Flash (`@google/genai`)

## How it works

1. Sign in (Supabase Auth, email/password).
2. On `/log`, upload today's physique photo + meal-plan screenshot and enter your weight.
3. Photos upload directly to private Supabase Storage buckets. The form then calls `/api/daily-log`, which:
   - verifies your session server-side,
   - upserts a row in `daily_logs`,
   - downloads both images and sends them + your weight to `gemini-2.5-flash` in a single call, using the embedded coaching system prompt,
   - saves the AI's feedback back onto the row.
4. `/dashboard` shows your weight-trend chart, photo gallery, and latest AI feedback.

The Gemini API key lives only in a server-side environment variable (`GEMINI_API_KEY`) — it is never sent to the browser and there is no per-user key setup.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Open the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
   - the `daily_logs` table with row-level security (each user only sees their own rows),
   - two private Storage buckets, `physique-photos` and `meal-screenshots`, with storage policies scoping each user to their own folder.
4. In **Authentication → Providers**, email/password sign-in is enabled by default — nothing else to configure for a single personal account. If you don't want an email-confirmation step, you can turn off "Confirm email" under **Authentication → Sign In / Providers → Email**.

### 2. Gemini API key (paid tier)

1. Go to [Google AI Studio](https://aistudio.google.com/) and create an API key.
2. Enable the paid tier and prepay the $10 minimum. At roughly one request/day with `gemini-2.5-flash`, cost is negligible — and the paid tier guarantees your photos/data are not used to train Google's models (the free tier does not).
3. Copy the key into `GEMINI_API_KEY`.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in the four values from steps 1–2.

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up with your personal account, and log your first day.

## Smoke test

1. Sign up on `/login`, confirm the account if email confirmation is on.
2. On `/log`, pick a physique photo, a menu screenshot, enter a weight, submit.
3. Confirm a row appears in Supabase under **Table Editor → daily_logs**, and that AI feedback text is returned and shown on the page.
4. Visit `/dashboard` — the weight point should appear on the chart and the photo in the gallery.
5. Log a second day to see the trend line and gallery grow, and to confirm re-logging the same date upserts rather than duplicates.

## Project structure

```
supabase/schema.sql         Table, RLS policies, storage buckets — run once in the Supabase SQL editor
src/proxy.ts                Route protection (Next.js 16 renamed "middleware" to "proxy")
src/lib/supabase/           Browser, server (cookie-based), and admin (service-role) Supabase clients
src/lib/gemini.ts           Gemini client + embedded coaching system prompt
src/app/login/              Sign in / sign up
src/app/log/                Daily input form
src/app/dashboard/          Weight chart, photo gallery, latest AI feedback
src/app/api/daily-log/      Server route: upsert log + single multimodal Gemini call
```
