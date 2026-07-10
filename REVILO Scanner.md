# Revilo — Production Setup & Session Log

Production: https://revilo.design  
Vercel project: revilo-three.vercel.app  
Repo: github.com/olivierboulais/Revilo (main branch)

Last updated: 2026-07-10

---

## Current Status

**App is live and ready to share.** Users can sign up, log in, connect GitHub, and run scans.  
Figma connect is pending Figma app approval (submitted 2026-07-10).

---

## Environment Variables (Vercel)

| Variable | Status | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ Set | Supabase Postgres — `db.ujffieojxtclwgflkxhb.supabase.co` |
| `SESSION_SECRET` | ✅ Set | |
| `RESEND_API_KEY` | ✅ Set | "Revilo" key, Full access — emails verified working |
| `FROM_EMAIL` | ✅ Set | `noreply@revilo.design` |
| `FIGMA_CLIENT_ID` | ✅ Set | |
| `FIGMA_CLIENT_SECRET` | ✅ Set | |
| `GITHUB_CLIENT_ID` | ✅ Set | |
| `GITHUB_CLIENT_SECRET` | ✅ Set | |
| `ANTHROPIC_API_KEY` | ✅ Set | Real AI recommendations active |
| `STRIPE_SECRET_KEY` | ✅ Set (live) | |
| `STRIPE_PUBLISHABLE_KEY` | ✅ Set | |
| `STRIPE_WEBHOOK_SECRET` | ✅ Set | |
| `STRIPE_PRO_PRICE_ID` | ✅ `price_1TquscCNet93AuXhwSWHZv8d` | |
| `STRIPE_MONITORING_PRICE_ID` | ✅ `price_1Tqut9CNet93AuXhNIuU3AJ7` | |
| `NEXT_PUBLIC_BASE_URL` | ✅ `https://revilo.design` | |

---

## OAuth Redirect URIs

| Provider | Callback URL | Status |
|---|---|---|
| GitHub | `https://revilo.design/api/auth/github/callback` | ✅ Set and working |
| Figma | `https://revilo.design/api/auth/figma/callback` | ✅ Set — awaiting Figma app approval |

---

## Supabase Database

- Project: olivierboulais's Project (`ujffieojxtclwgflkxhb`)
- Region: West US (Oregon), Nano compute
- Tables: `users`, `sessions`, `verification_tokens`, `sources`, `scans`
- Indexes: `idx_scans_user_scanned`, `idx_sessions_token`
- RLS: disabled (app connects via Postgres password, not anon key)
- Tested: signup + login + session persistence confirmed ✅
- Email verification arriving from `noreply@revilo.design` ✅

---

## Stripe

- Live secret key configured ✅
- Webhook: `https://revilo.design/api/stripe/webhook` — Active ✅
- Events handled: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`, `charge.refunded`
- Products (live): Pro Report ($199 one-time), Monthly Monitoring ($99.99/mo)

---

## Scan Rate Limits

| Tier | Limit | Window |
|---|---|---|
| Free | 5 scans | per day |
| Pro / Monitoring | 20 scans | per day |

Cost per scan: ~$0.004 (Claude Haiku). At 1,000 scans/day = ~$4/day.

---

## What's Built

- Signup / Login / Forgot password / Reset password / Email verification
- Dashboard: Overview, Alignment, Adoption, Architecture, Team Insights, Recommendations
- Figma + GitHub OAuth connect flow with real API data
- Scan pipeline: real data when connected, mock data otherwise
- AI recommendations via Claude Haiku
- PDF export (Pro users)
- Stripe billing: Checkout → webhook → tier upgrade
- Scheduled re-scans + drift alerts (Monitoring tier)
- Settings: workspace name, password, appearance (light/dark/auto), delete account
- Help page
- Marketing site: `public/marketing.html`
- Mobile: bottom tab bar nav, responsive layout, chart label fix, scan pill fix

---

## Mobile Navigation

- Desktop: collapsible sidebar (220px expanded, 68px collapsed)
- Mobile: fixed bottom tab bar — Overview, Alignment, Actions, Sources, More
- More sheet: Adoption, Architecture, Team, Settings, Help, Log out + Upgrade CTA for free users
- Upgrade CTA hidden for paid users

---

## Debug / Dev Endpoints (REMOVED before launch)

- ~~`/api/debug`~~ — Supabase connection info  
- ~~`/api/debug/scan`~~ — scan internals  
- ~~`/api/debug/stripe`~~ — price IDs  
- ~~`/api/dev/upgrade`~~ — dev tier shortcut  
- ~~`/api/dev/test-emails`~~ — dev email sender  

---

## Pending

- [ ] **Figma app approval** — submitted 2026-07-10, typically 3–7 days. Once approved, Figma OAuth works for all users.
- [ ] End-to-end test: connect Figma + GitHub → run scan → real report (do after Figma approval)
