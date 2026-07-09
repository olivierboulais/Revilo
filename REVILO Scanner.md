# Revilo — Production Setup & Session Log

Production: https://revilo.design  
Vercel project: revilo-three.vercel.app  
Repo: github.com/olivierboulais/Revilo (main branch)

---

## Environment Variables (Vercel)

| Variable | Where to get it | Status |
|---|---|---|
| `DATABASE_URL` | Supabase → Project → Settings → Database → Connection string | ⚠️ Not set — ephemeral SQLite, signups don't persist across deploys |
| `SESSION_SECRET` | Any random 32-char string | Set |
| `RESEND_API_KEY` | resend.com | ⚠️ Not set — emails log to console only |
| `FROM_EMAIL` | e.g. `Revilo <noreply@revilo.design>` | ⚠️ Not set |
| `FIGMA_CLIENT_ID` | figma.com/developers/apps | ⚠️ Not set |
| `FIGMA_CLIENT_SECRET` | figma.com/developers/apps | ⚠️ Not set |
| `GITHUB_CLIENT_ID` | github.com/settings/developers | ⚠️ Not set |
| `GITHUB_CLIENT_SECRET` | github.com/settings/developers | ⚠️ Not set |
| `ANTHROPIC_API_KEY` | console.anthropic.com | ⚠️ Not set — uses template recommendations |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys → live secret | ✅ Set (live) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys → live publishable | ✅ Set |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → revilo-production → Signing secret | ✅ Set |
| `STRIPE_PRO_PRICE_ID` | `price_1TquscCNet93AuXhwSWHZv8d` | ✅ Set |
| `STRIPE_MONITORING_PRICE_ID` | `price_1Tqut9CNet93AuXhNIuU3AJ7` | ✅ Set |
| `NEXT_PUBLIC_BASE_URL` | `https://revilo.design` | Set |

OAuth redirect URIs to register:
- Figma: `https://revilo.design/api/auth/figma/callback`
- GitHub: `https://revilo.design/api/auth/github/callback`

---

## Stripe

- Live secret key configured
- Webhook: `https://revilo.design/api/stripe/webhook` — Active, 0% error rate
- Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`, `charge.refunded`
- Products (live): Pro Report ($199 one-time), Monthly Monitoring ($99.99/mo)

---

## What's Built

- Signup / Login / Google OAuth / Forgot password / Reset password
- Email verification (Resend-backed, logs to console without API key)
- Dashboard: Overview, Alignment, Adoption, Architecture, Team Insights, Recommendations
- Figma + GitHub OAuth connect flow with real API data
- Scan pipeline: uses real Figma/GitHub data when connected, mock data otherwise
- AI recommendations via Claude (falls back to templates without API key)
- PDF export (Pro users)
- Stripe billing: Checkout → webhook → tier upgrade
- Scheduled re-scans + drift alerts (Monitoring tier)
- Settings: workspace name, password, appearance (light/dark/system), delete account
- Help page (FAQ)
- Marketing site: `public/marketing.html`

---

## Bugs Fixed This Session

- **Verified badge dark mode** — added CSS overrides in `globals.css`
- **Sidebar hamburger at ≤900px** — added media query in `marketing.html`
- **Hamburger right-aligned** — `flex:1; justify-content:space-between` on `.nav-pill`
- **Mobile menu Log in invisible** — scoped CTA styles to `:first-child`/`:last-child`
- **Theme picker active state** — purple checkmark badge on active button
- **Theme buttons neutral** — all three buttons use `transparent` bg + `currentColor`
- **Email buttons had circle+arrow** — removed from `lib/email.ts` and `lib/drift/alert.ts`
- **Verification email hero squished** — widened Figma/GitHub cards to `42%/16%/42%`
- **Upgrade page JSON crash** — `getSession()` now catches DB errors; checkout route wrapped in try/catch
- **Sidebar tooltip behind content** — changed `lg:z-auto` to `lg:z-10` on sidebar `aside`
- **Stripe price ID mismatch** — live key needs `price_1Tqusc...` / `price_1Tqut9...`, not sandbox prices

---

## Known Limitations

- No `DATABASE_URL` → ephemeral SQLite → signups reset on every Vercel deploy
- Without `RESEND_API_KEY`, no emails are sent in production
- Without Figma/GitHub OAuth apps, connect flow shows error
- Figma usage signals (detached instances) not yet implemented — returns `[]`
- Debug endpoints at `/api/debug/stripe` and `/api/debug/scan` should be removed before public launch
