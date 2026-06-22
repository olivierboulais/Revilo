# Revilo App

This is the product app behind the Revilo Scanner marketing site — sign up, connect Figma + GitHub, run a scan, see the Alignment Report, and subscribe to unlock the full report. It's separate from the marketing site (which stays a static HTML page); this is what the marketing site's CTAs link into.

## Running it

```
npm install
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/signup` if you don't have a session yet.

## The flow

```
/signup or /login  →  /connect  →  /scan  →  /dashboard  →  /upgrade
```

1. **Signup/Login** — mock auth, sets a session cookie. No password check yet.
2. **Connect** — mock Figma + GitHub "OAuth" (a timed fake-connect, no real redirect).
3. **Scan** — shows the exact progress states from the build spec while the scan pipeline runs in the background, then redirects to the dashboard.
4. **Dashboard** — the Alignment Report: scores, findings, team insights, recommendations. Free-tier accounts see the Alignment Score and one finding; everything else is blurred with an upgrade prompt.
5. **Upgrade** — mirrors the marketing site's pricing tiers exactly (Pro Report $199 one-time, Monthly Monitoring $49/mo). "Paying" just flips the session's tier — there's no real billing yet.

## What's real vs. mocked

The **scoring pipeline is real**. Everything from normalization through matching, scoring, findings generation, and recommendation generation is genuine logic that runs against the mock data and would run identically against real data. This was deliberate — that's the actual product, and faking it would mean rebuilding the important part later.

What's mocked is now down to the **three external API calls** and **billing** — auth and the database are real as of this pass, since both were security/data-integrity gaps that had to be closed before any real user could safely sign up:

| What | File | Status |
|---|---|---|
| Figma ingest | `lib/mock/figma.ts` | Still mocked — needs real Figma OAuth + API calls |
| GitHub ingest | `lib/mock/github.ts` | Still mocked — needs real GitHub OAuth + API calls |
| AI recommendations | `lib/recommendations.ts` (`callAIForRecommendation`) | Still mocked — needs a real OpenAI/Claude call |
| Auth | `lib/auth/session.ts`, `lib/db/users.ts`, `lib/db/sessions.ts` | **Real.** bcrypt password hashing, signed opaque session tokens (not user data in the cookie), real signup/login validation including duplicate-email and generic-error anti-enumeration handling. |
| Database | `lib/db/client.ts`, `prisma/...` removed (see below) | **Real**, with a dev/prod driver swap. Local dev runs against Node's built-in `node:sqlite` (this sandbox can't install Prisma's binary engine or compile `better-sqlite3` — both need network access to domains outside this environment's allowlist). Production runs against Postgres via `pg`. Same schema (`lib/db/schema.sql`), same query interface either way — only `lib/db/client.ts` branches on `DATABASE_URL`. |
| Billing | `app/upgrade/page.tsx` (`upgrade` action) | Still mocked — needs real Stripe checkout + webhook instead of directly setting the tier |

Every mocked item has a comment at the top marked "Swap point" explaining what to replace and what shape the replacement needs to return. The function signatures (`RawComponent[]`, `RawToken[]`, `Recommendation[]`, etc.) are designed so swapping the implementation doesn't require touching anything downstream.

### Going to real Postgres in production

1. Provision a Postgres database (e.g. Supabase) and get its connection string.
2. Set `DATABASE_URL=postgres://...` in the production environment — `lib/db/client.ts` detects the `postgres://`/`postgresql://` prefix and switches drivers automatically; no code change needed.
3. Run `lib/db/schema.sql` against that database once (the SQLite branch runs it automatically on every connection via `CREATE TABLE IF NOT EXISTS`; for Postgres, run it manually via the Supabase SQL editor or a migration tool, since the `pg` driver here doesn't auto-apply it).
4. Remove the local `dev.db` file from version control if it was ever committed (it shouldn't be — check `.gitignore`).

## Architecture

```
lib/types.ts            Normalized data model (Component, Token, Finding, scores)
lib/mock/figma.ts        Mock Figma ingest — swap point
lib/mock/github.ts       Mock GitHub ingest — swap point
lib/normalize.ts         Raw → normalized entities, primitive/semantic tier classification
lib/match.ts             Deterministic comparison logic (the spec requires rules-first, AI-second)
lib/score.ts             Heuristic Alignment/Adoption/Architecture scoring
lib/findings.ts          Turns match results into Finding objects
lib/recommendations.ts   Findings → Recommendation objects — AI swap point
lib/team-insights.ts     Design vs. engineering insight generation
lib/run-scan.ts          Orchestrates all of the above into one ScanReport
lib/auth/session.ts      Real session handling — reads/writes against lib/db
lib/db/client.ts         SQLite (dev) / Postgres (prod) driver swap point
lib/db/schema.sql        Real schema — users, sessions, sources, scans
lib/db/users.ts          User CRUD, password hashing happens in callers
lib/db/sessions.ts       Session token create/lookup/delete
lib/db/scans.ts          Real scan persistence + history (replaces old in-memory store.ts)
lib/store.ts             Compatibility wrapper — same email-keyed interface, now backed by lib/db/scans.ts with KV/memory as fallback

app/signup, app/login    Mock auth pages
app/connect              Mock OAuth connect flow
app/scan                 Progress animation + triggers the real (mock-backed) scan
app/api/scan             Runs the pipeline, persists the report
app/dashboard            The report itself, with tier-based gating
app/upgrade               Pricing tiers, mirrors the marketing site exactly
```

## Verification

`scripts/integration-test.ts` runs the actual pipeline end-to-end (scan → save → retrieve → gating logic → score-range sanity check) without going through the HTTP layer. Run it with:

```
npx tsx scripts/integration-test.ts
```

This is what was used to confirm the scoring/findings/recommendations logic is correct before building the UI on top of it, and again after, since it's the fastest way to catch a regression in the actual product logic.

## Deploying (Vercel free tier)

The repo is already initialized and committed (`git log` shows one commit). Two steps are left, and they have to happen in your own accounts — I can't create a GitHub repo or a Vercel account on your behalf:

**1. Push to GitHub.** Create an empty repo on github.com (no README/license — this folder already has one), then:
```
git remote add origin <your-new-repo-url>
git push -u origin main
```

**2. Click deploy.** Go to your repo on GitHub and click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-new-repo-url>)

(Replace `<your-new-repo-url>` in that link with your actual repo URL once you have it, or just go to vercel.com/new and import the repo manually — same result.)

That single click handles account creation if needed, project import, and the build — no configuration required, since Vercel auto-detects Next.js.

**3. Database.** Real persistence now runs through `lib/db/client.ts` — set `DATABASE_URL` to a Postgres connection string in the Vercel project's environment variables (see "Going to real Postgres in production" above) and everything (users, sessions, scans) persists correctly across server instances. Vercel KV is still wired in as a secondary fallback for any caller whose email doesn't resolve to a real user record, but it's no longer the primary mechanism.

Nothing else needs an env var yet — Figma, GitHub, and AI credentials only matter once those mock files get swapped for real API calls (see the table above).


## Known gaps

Server-action form submissions (signup, login, upgrade) were verified by exercising the underlying functions and database operations directly — real bcrypt hashing, real duplicate-email detection, real session create/lookup/delete, real tier updates, all tested against an actual database (see `scripts/integration-test.ts` and the ad hoc test scripts used during development, e.g. for password verification and session lifecycle). Every route's auth guard was also confirmed to correctly redirect/reject unauthenticated requests. What wasn't click-tested is the literal browser-driven form submission — typing into the actual password field and clicking submit in a real browser — since Next.js server actions invoked from client components use a `Next-Action` header-based protocol that can't be reproduced over plain HTTP. Worth a manual click-through (signup → login → logout → login again) before this goes live.

A few things to know before connecting a real production database:
- The `DATABASE_URL` for SQLite (`file:./dev.db`) is local-dev only and gitignored — never commit `dev.db`.
- `lib/db/schema.sql`'s `CREATE TABLE IF NOT EXISTS` statements run automatically against SQLite on every connection, but won't auto-run against Postgres — run that file once manually against the production database before the app's first real signup.
- Password reset and email verification tables exist in the schema (`verification_tokens`) but nothing in the app currently sends or checks those tokens — that's the next real gap, not yet built.
