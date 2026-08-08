# EZCut — Native App (App Store / Google Play) Plan

## Context

EZCut is currently a working Next.js 16 web app (repo: `A7asaf-cloud/ezcut`, private) with Supabase
auth/DB/storage and a Gemini 2.5 Flash coaching feature. It runs locally via `npm run dev` and has
not been deployed anywhere public yet.

The owner (Asaf) wants to open this up so other people can use it too, and wants it distributed as
a **real native app in the App Store and Google Play** — not just a website. He is on **Windows**
(no Mac), which is the central constraint this plan works around.

An agent picking this up should treat this as a multi-week, multi-account, real-money project
(developer program fees, possible cloud Mac build minutes), not a single coding session. Confirm
budget/timeline expectations with Asaf before spending money on his behalf, and never create paid
accounts or submit anything to app review without his explicit go-ahead at that step.

## Decisions already made by Asaf

- Backend: Supabase (already built).
- Multi-user: yes, other people will sign up. RLS already isolates each user's rows/files by
  `auth.uid()`, so this is already safe — no schema changes needed for multi-tenancy itself.
- Signup: stays **open** (anyone can sign up with email/password) — no invite-only allowlist for now.
- Distribution: wants it in the actual app stores, not just "add to home screen" (this was
  explicitly chosen over the lighter PWA-only option).

## Decisions NOT yet confirmed — ask Asaf before committing to them

The last two clarifying questions to Asaf did not get answered before this hand-off (a tool error
interrupted the conversation). Recommended defaults are below — **do not skip asking, just proceed
with the default if he has no objection**, but do surface the trade-off explicitly since money and
multi-week timelines are involved:

1. **Which platforms first?**
   - **Recommended default: Android only, to start.** Buildable entirely from Windows, Google Play
     Developer account is a one-time $25, no Mac needed anywhere in the pipeline.
   - Alternative: do iOS too, via a cloud Mac build service (see iOS section) — needs the $99/year
     Apple Developer Program on top, and adds real complexity (certificates, provisioning
     profiles, TestFlight).
2. **How to wrap the app natively?**
   - **Recommended default: Capacitor**, pointed at the deployed web app's URL (see Architecture
     below). Reuses 100% of the existing Next.js code, cheap to try, easy to abandon if it doesn't
     feel native enough.
   - Alternative: rewrite in React Native/Expo. Feels more native, but throws away the working
     Next.js app and is a much bigger project. Do not do this unless Asaf explicitly asks for it
     after seeing the Capacitor version.

## Architecture

Capacitor does not statically bundle a Next.js app with API routes, auth cookies, and a proxy —
that requires a real Node server. The correct pattern here is:

1. **Deploy the existing Next.js app as a normal website first** (Vercel — the repo already has a
   `next.config.ts` with no special adapter needed; Vercel supports the App Router, Route Handlers,
   and the renamed `proxy.ts` middleware out of the box).
2. **Wrap that live URL in a thin native shell with Capacitor.** `capacitor.config.ts` points
   `server.url` at the production URL (e.g. `https://ezcut.vercel.app` or a custom domain). The
   native app is then effectively "Chrome/Safari in an app icon" pointed at your real server — this
   is a legitimate, common, App-Store-accepted pattern (lots of published apps work exactly this
   way), not a hack.
3. The web app itself does not need to change architecturally. What it does need: PWA-style icons
   splash screens, and a couple of App Store compliance features (see Store compliance below).

This means steps 1 (deploy) and the PWA polish are valuable regardless of which platform decision
Asaf makes, so do them first.

## Step-by-step

### Phase 0 — Deploy the web app (do this regardless of native-app decisions)

1. Push already exists at `A7asaf-cloud/ezcut` (private). Connect it to Vercel
   (`vercel.com` → New Project → import from GitHub → select `A7asaf-cloud/ezcut`).
2. In Vercel's project settings, set the four env vars from `.env.local.example`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `GEMINI_API_KEY`) — same values Asaf put in his local `.env.local`.
3. In the Supabase dashboard → Authentication → URL Configuration, add the Vercel URL (and any
   custom domain) to "Site URL" / "Redirect URLs" so auth flows work from the deployed domain, not
   just `localhost`.
4. Deploy, then run through the smoke test already documented in `README.md` against the live URL
   instead of localhost.
5. Confirm `src/proxy.ts` (route protection) and `/api/daily-log` behave correctly in production
   (Vercel runs proxy/middleware as Node functions per the Next.js 16 docs bundled in
   `node_modules/next/dist/docs` — re-read the proxy.md file there if anything behaves unexpectedly,
   since this is a framework version newer than most training data).

### Phase 1 — Store compliance work on the web app itself

These are required by app store review, independent of which wrapper technology is used:

1. **Privacy policy page.** Add a `/privacy` route to the Next.js app describing what data is
   collected (email, body weight, physique photos, meal screenshots) and that photos/weight data
   are sent to Google's Gemini API for analysis. Both Apple and Google require a live privacy
   policy URL in the store listing, and this app handles sensitive personal data (photos of the
   user's body, health-adjacent weight data), so this is not optional.
2. **Account deletion.** Apple App Store Review Guideline 5.1.1(v) requires that any app supporting
   account creation also let the user delete their account from inside the app. Add a "Delete my
   account" action (e.g., on a settings/profile screen) that:
   - deletes the user's rows from `daily_logs`,
   - deletes their objects from both storage buckets,
   - deletes the `auth.users` row itself — this last part requires the service-role admin client
     (`src/lib/supabase/admin.ts` already exists) calling `supabase.auth.admin.deleteUser(userId)`
     from a server route, since the browser/anon client cannot delete auth users.
   This is a real, enforced requirement — Google Play has an equivalent policy for apps with
   in-app account creation. Do this before submitting to either store.
3. **App icon + splash + manifest.** Add a `public/manifest.json`, app icons in multiple sizes, and
   `theme-color`/`apple-mobile-web-app-*` meta tags in `src/app/layout.tsx`. Capacitor's asset
   generator (`@capacitor/assets`) can derive native icons/splash screens from one source image
   later, but the source image needs to exist first.

### Phase 2 — Capacitor wrapper

1. `npm install @capacitor/core @capacitor/cli` in the `ezcut` repo, then `npx cap init` (app name
   "EZCut", app ID something like `com.a7asaf.ezcut` — reverse-DNS style, needed by both stores).
2. Add a minimal static `www/` shell (Capacitor needs *some* local web root even when using a
   remote URL) or configure `webDir` per Capacitor's remote-URL guidance.
3. In `capacitor.config.ts`, set `server: { url: "<the Vercel production URL>", cleartext: false }`.
4. `npx cap add android` (works fully on Windows with Android Studio installed).
5. Generate icons/splash from the Phase 1 source image via `@capacitor/assets`.
6. Open in Android Studio (`npx cap open android`), build a signed APK/AAB.

### Phase 3 — Android release

1. Create a Google Play Console account ($25 one-time) — **Asaf must do this himself**, it needs
   his identity/payment details.
2. Fill in the store listing (needs the Phase 1 privacy policy URL, screenshots, description,
   content rating questionnaire — flag that physique photos may affect content rating answers).
3. Upload the signed AAB, submit for review.

### Phase 4 — iOS (only if Asaf confirms he wants this now, given the cost/complexity)

1. Asaf creates an Apple Developer Program account himself ($99/year, needs his Apple ID).
2. Since there's no local Mac, use a cloud Mac build service that supports Capacitor iOS builds —
   **Codemagic** or **Ionic Appflow** are the standard choices (unlike Expo EAS Build, which is
   Expo/React-Native-specific and doesn't apply to a plain Capacitor project). Both can build,
   sign, and even submit to TestFlight/App Store Connect without Asaf ever touching Xcode directly.
3. `npx cap add ios` locally (this just generates the Xcode project files into the repo — it does
   not require a Mac to *generate*, only to *open/build* them, which is why the cloud service is
   needed for the actual build step).
4. Configure code signing in the cloud build service using the Apple Developer account from step 1.
5. Submit for App Review. Expect Apple's review to specifically probe the account-deletion flow
   (Phase 1) and the privacy policy — have both solid before submitting.

## Verification checkpoints

- After Phase 0: the live Vercel URL works end-to-end (signup → log a day with photos → AI feedback
  → dashboard), exactly like the localhost smoke test in `README.md`.
- After Phase 1: `/privacy` renders, and a test account can fully delete itself (verify the row is
  gone from `auth.users` in the Supabase dashboard, not just `daily_logs`).
- After Phase 2: the Android build opens and shows the live app inside the native shell, with the
  correct icon on the home screen and no visible browser chrome.
- Before Phase 3/4 submission: confirm with Asaf that he has completed the developer account
  signup(s) himself and is ready for the (non-refundable) submission step.
