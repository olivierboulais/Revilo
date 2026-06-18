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

What's mocked is specifically the **three external API calls** and **auth/billing**, because those need real credentials that don't exist yet:

| What | File | What a real version would do |
|---|---|---|
| Figma ingest | `lib/mock/figma.ts` | Call the Figma API for components, variants, tokens, styles |
| GitHub ingest | `lib/mock/github.ts` | Call the GitHub API, parse component/token files in a real repo |
| AI recommendations | `lib/recommendations.ts` (`callAIForRecommendation`) | Send grouped findings to OpenAI/Claude, parse structured output |
| Auth | `lib/auth/session.ts` | Real auth provider (NextAuth, Clerk, etc.) instead of a JSON cookie |
| Billing | `app/upgrade/page.tsx` (`upgrade` action) | Real Stripe checkout + webhook instead of directly setting the tier |
| Database | `lib/store.ts` | Postgres/Supabase instead of an in-process Map (per spec's tech stack) |

Every one of these has a comment at the top marked "Swap point" explaining what to replace and what shape the replacement needs to return. The function signatures (`RawComponent[]`, `RawToken[]`, `Recommendation[]`, etc.) are designed so swapping the implementation doesn't require touching anything downstream.

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
lib/auth/session.ts      Mock session — swap point
lib/store.ts             In-memory report storage — swap point (real DB)

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

**3. Add KV storage (so reports actually persist).** In the new Vercel project: Storage tab → Create Database → KV → connect it to this project. That's the only manual step after deploy, and it's what switches `lib/store.ts` from its local-only fallback to real persistence. Without it, the app still runs, but reports can vanish or go inconsistent across server instances — the exact problem this swap was meant to fix.

Nothing else needs an env var yet — Figma, GitHub, and AI credentials only matter once those mock files get swapped for real API calls (see the table above).


Server-action form submissions (signup, login, upgrade) were verified by exercising the underlying functions directly (see `scripts/integration-test.ts`) and by confirming every route's auth guard correctly redirects/rejects unauthenticated requests. The literal browser-driven form submission wasn't click-tested in a real browser as part of this build — worth a manual click-through before shipping, though the route guards and underlying logic are confirmed working.
