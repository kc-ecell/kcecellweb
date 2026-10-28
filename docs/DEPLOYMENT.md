# Deployment

## 1. Services

| Service | Plan | Used for |
|---|---|---|
| Vercel | Hobby → Pro if needed | Hosting, previews, analytics, image optimisation |
| Supabase | Free (2 projects: staging, production), region `ap-south-1` (Mumbai) | DB, auth, storage |
| Resend | Free (3k emails/month) | Contact notifications, auto-reply, OTP emails via custom SMTP |
| Upstash Redis | Free | Rate limits |
| Cloudflare Turnstile | Free | Bot checks |
| Sentry | Free (developer) | Errors |
| Domain registrar | TBD | DNS (domain to be provided) |

Each account should be owned by an **E-Cell shared Google account** (e.g. `webdev.ecell.kccemsr@…`), not a personal one, so handover is painless.

> **Supabase free-tier gotcha:** a free project **pauses after 7 days of inactivity**. Because the public site is statically cached and rarely hits the DB, a quiet week can pause the project and silently break admin writes and ISR revalidation. Mitigation: a scheduled **keep-warm ping** (see §4) hits a lightweight DB query daily. Budget for Supabase **Pro** before traffic or content volume makes the free tier the bottleneck.

## 2. Environment variables

| Name | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | `https://<domain>` (TBD), previews use `VERCEL_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | all | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | Safe to expose (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **Never** prefixed `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | server | |
| `CONTACT_FROM_EMAIL` | server | `hello@<domain>` once verified |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | server | |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | all | |
| `TURNSTILE_SECRET_KEY` | server | |
| `IP_HASH_SALT` | server | random 32 bytes |
| `ADMIN_BACKUP_DOOR_TOKEN` | server | random 32 chars, rotate yearly |
| `SENTRY_DSN` / `SENTRY_AUTH_TOKEN` | server/build | |
| `NEXT_PUBLIC_AGENTATION_ENDPOINT` | **local `.env.local` only** | Never set on Vercel |

`.env.example` lists every key with an empty value and a comment. `lib/env.ts` validates them with Zod at boot, so the server fails loudly on a missing key.

## 3. First-time setup

1. **Supabase (staging + prod)**
   - Create the project in `ap-south-1`.
   - Auth → disable signups. Enable Email OTP, length 6, expiry 600s. Set the custom SMTP (Resend). Paste the OTP email template from `SECRET_ADMIN_ACCESS.md`.
   - Auth → URL config: site URL = domain; additional redirect URLs = preview pattern.
   - `npx supabase link --project-ref <ref>` → `npx supabase db push`.
   - Run the seed (staging only): `psql < supabase/seed.sql`. In prod, run the content parts of the seed but **not** test users.
   - Create the first owner: Auth → Users → "Add user" (email, auto-confirm) → copy the UUID → `insert into profiles (id, email, display_name, role) values (...,'owner')`.
2. **Vercel**
   - Import the GitHub repo. Framework: Next.js. Node 20.
   - Add env vars per environment (Preview → staging Supabase, Production → prod Supabase).
   - Enable Analytics + Speed Insights.
3. **Resend**: add the domain, set DNS (SPF, DKIM, DMARC), and wait for verification.
4. **Turnstile**: create an invisible widget for the domain + `*.vercel.app`.
5. **Upstash**: create the Redis DB (region closest to Mumbai).
6. **GitHub**: branch protection, required checks (`lint`, `typecheck`, `test`, `build`, `lighthouse`), Dependabot.

## 4. CI (GitHub Actions)

`.github/workflows/ci.yml` on every PR:
1. `npm ci`
2. `npm run lint && npm run typecheck`
3. `npm run test`
4. `npx supabase start && npx supabase test db` (RLS pgTAP tests)
5. `npm run build` (includes `check:devtools`)
6. On the Vercel preview URL: Playwright e2e + Lighthouse CI with budgets from `ARCHITECTURE.md`
7. Type drift check: regenerate Supabase types and `git diff --exit-code`

Migrations to production: a manual GitHub Action `db-deploy` (workflow_dispatch) running `supabase db push` against prod, approved by an owner.

**Keep-warm:** a scheduled Action `keep-warm.yml` (cron, ~daily) runs a trivial read (e.g. `select 1` / a count on `stats`) against **both** Supabase projects so the free tier never pauses from inactivity (see §1).

## 5. Launch checklist

**Build-complete ≠ launch-ready.** The build is done when Phases 0–3 pass CI on seeded/placeholder-flagged content. Launch is gated **only** on the hard items below; everything with a built-in fallback (missing portraits → pixel avatar, empty gallery → empty state, unentered past events → added via admin post-launch, undated Singularity → stays draft) ships absent and is filled in later. Do **not** let the photo/past-event backlog block launch.

**Content (hard launch gates)**
- [ ] Domain, official contact email, and at least Instagram + LinkedIn confirmed
- [ ] Hero headline and mission/vision picked (President / VP)
- [ ] Identity line human-verified: college name, address, University of Mumbai affiliation
- [ ] Staff emails (≤ cap) collected for admin go-live
- [ ] **Soft gate:** at least one *upcoming* event live (even "save the date, registration soon") — an entrepreneurship site with zero upcoming events reads as dead and undercuts G1/G3
- [ ] Remaining `TBD`/`VERIFY` in `CONTENT.md` resolved or consciously deferred (deferred ones have a working fallback)
- [ ] Every published photo has alt text; no `COPY-PENDING` on published content

**Tech**
- [ ] Domain connected, HTTPS, `www` → apex redirect
- [ ] `NEXT_PUBLIC_SITE_URL` = final domain; sitemap and OG URLs correct
- [ ] Supabase auth URLs updated to the domain
- [ ] Resend domain verified; OTP and contact emails land in Gmail inbox (not spam)
- [ ] Security checklist in `ARCHITECTURE.md` all ticked
- [ ] Abuse tests in `SECRET_ADMIN_ACCESS.md` all ticked
- [ ] `check:devtools` green on the production build
- [ ] Lighthouse mobile targets met on Home, Events, Event detail, Team
- [ ] 404 page + game works; `error.tsx` tested
- [ ] Sentry receiving events; analytics custom events visible
- [ ] Google Search Console + Bing verified, sitemap submitted

**People**
- [ ] All staff (≤ configured cap, default 10) logged in once via the terminal ritual
- [ ] `/admin/help` reviewed by a non-developer
- [ ] Backup door token stored in the owner's password manager

## 6. Rollback

- Vercel → Deployments → promote the previous deployment (instant).
- DB: every migration has a down script in `supabase/migrations/down/`. Supabase daily backups (free tier: 7 days). Take a manual backup before each prod migration.

## 7. Yearly handover (every academic year)

1. The new Web Dev Head is added as an owner; they log in.
2. Transfer ownership of the shared accounts (Vercel team, Supabase org, Resend, Upstash, domain) to the new owner's access.
3. Create the new `team_cohorts` row and members; set it as current.
4. Rotate `ADMIN_BACKUP_DOOR_TOKEN`, `IP_HASH_SALT` (optional), and the service role key if anyone leaving had it.
5. The outgoing staff deactivate themselves.
6. Update `README.md` with the maintainers' names for the year.
