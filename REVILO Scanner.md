# Revilo — Production Setup & Session Log

Production: https://revilo.design  
Vercel project: revilo-three.vercel.app  
Repo: github.com/olivierboulais/Revilo (main branch)

---

## Environment Variables (Vercel)

| Variable | Status | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ Set | Supabase Postgres — `db.ujffieojxtclwgflkxhb.supabase.co` |
| `SESSION_SECRET` | ✅ Set | |
| `RESEND_API_KEY` | ✅ Set | "Revilo" key, Full access |
| `FROM_EMAIL` | ✅ Set | `noreply@revilo.design` |
| `FIGMA_CLIENT_ID` | ✅ Set | |
| `FIGMA_CLIENT_SECRET` | ✅ Set | |
| `GITHUB_CLIENT_ID` | ✅ Set | |
| `GITHUB_CLIENT_SECRET` | ✅ Set | |
| `ANTHROPIC_API_KEY` | ⚠️ Not confirmed | Needed for real AI recommendations |
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
| GitHub | `https://revilo.design/api/auth/github/callback` | ✅ Already set |
| Figma | `https://revilo.design/api/auth/figma/callback` | ⚠️ Needs confirming |

---

## Supabase Database

- Project: olivierboulais's Project (`ujffieojxtclwgflkxhb`)
- Region: West US (Oregon)
- Tables created: `users`, `sessions`, `verification_tokens`, `sources`, `scans`
- Indexes: `idx_scans_user_scanned`, `idx_sessions_token`
- Tested: signup + login working on production ✅
- Email verification email arriving from `noreply@revilo.design` ✅

---

## Stripe

- Live secret key configured ✅
- Webhook: `https://revilo.design/api/stripe/webhook` — Active ✅
- Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`, `charge.refunded`
- Products (live): Pro Report ($199 one-time), Monthly Monitoring ($99.99/mo)

---

## What's Built

- Signup / Login / Forgot password / Reset password / Email verification
- Dashboard: Overview, Alignment, Adoption, Architecture, Team Insights, Recommendations
- Figma + GitHub OAuth connect flow with real API data
- Scan pipeline: real data when connected, mock data otherwise
- AI recommendations via Claude (falls back to templates without API key)
- PDF export (Pro users)
- Stripe billing: Checkout → webhook → tier upgrade
- Scheduled re-scans + drift alerts (Monitoring tier)
- Settings: workspace name, password, appearance (light/dark/auto), delete account
- Help page
- Marketing site: `public/marketing.html`
- Mobile: bottom tab bar nav, responsive docs, tooltip fixes, chart label fix

---

## Debug / Dev Endpoints (REMOVED)

All removed before launch:
- ~~`/api/debug`~~ — Supabase connection info
- ~~`/api/debug/scan`~~ — scan internals  
- ~~`/api/debug/stripe`~~ — price IDs
- ~~`/api/dev/upgrade`~~ — dev tier shortcut
- ~~`/api/dev/test-emails`~~ — dev email sender

---

## Remaining Before Full Launch

- [ ] Confirm `ANTHROPIC_API_KEY` is set in Vercel (real AI recommendations)
- [ ] Confirm Figma OAuth callback URL is set to `https://revilo.design/api/auth/figma/callback`
- [ ] End-to-end test: connect Figma + GitHub → run scan → get real report
