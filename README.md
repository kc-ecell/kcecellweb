# E-Cell KCCEMSR — Website (2026 rebuild)

The official website of the **Entrepreneurship Cell of K.C. College of Engineering and Management Studies and Research (KCCEMSR), Kopri, Thane**.

Built from scratch in 2026. Codename: **Build Mode**. A tech-first, slightly unhinged, game-flavoured site that still tells a sponsor, a fresher, and a NAAC reviewer exactly what E-Cell does.

> Content came from the previous `kc-ecell/Ecell-2026-27` repo. Nothing else did: no design, no components, no code.

---

## What's in here

| Path | What it is |
|---|---|
| `AGENTS.md` (`CLAUDE.md` = generated copy, synced by a pre-commit hook) | Rules for every human and AI working on this repo. Read first. |
| `docs/PRD.md` | Product requirements: goals, audiences, scope, success metrics |
| `docs/IMPLEMENTATION_PLAN.md` | Phase-by-phase build plan with tasks and acceptance criteria |
| `docs/ARCHITECTURE.md` | Stack, folders, routing, data flow, auth, caching, security, performance |
| `docs/DATABASE.md` | Supabase schema, RLS policies, storage, seed strategy (full SQL) |
| `docs/DESIGN_SYSTEM.md` | Art direction, tokens, type, components, motion system |
| `docs/ANIMATIONS.md` | Every signature animation, how it's built, and its fallbacks |
| `docs/GAMIFICATION.md` | Founder XP, badges, easter eggs, terminal, 404 game |
| `docs/SECRET_ADMIN_ACCESS.md` | How admins get in without a login button anywhere on the site |
| `docs/PAGES.md` | Section-by-section spec for every public page |
| `docs/ADMIN_PANEL.md` | Spec for the hidden admin dashboard |
| `docs/CONTENT.md` | All real E-Cell content, ready to seed |
| `docs/CONTRIBUTING.md` | Git flow, conventions, dev tools (Agentation), PR checklist |
| `docs/DEPLOYMENT.md` | Vercel + Supabase setup, env vars, launch checklist |
| `docs/ROADMAP.md` | What ships in v1, what's deferred (sponsors, registration, recruitment) |

---

## Stack at a glance

- **Next.js 16** (App Router, RSC, Server Actions) + **TypeScript** (strict)
- **Tailwind CSS v4** (tokens in CSS via `@theme`)
- **Supabase**: Postgres, Auth (email OTP), Storage, RLS
- **Motion** (UI state), **GSAP + ScrollTrigger** (scroll set pieces), **Lenis** (smooth scroll)
- **React Three Fiber + drei** (hero WebGL, lazy-loaded)
- **Zod**, **React Hook Form**, **Resend** (email), **Upstash** (rate limits), **Cloudflare Turnstile**
- **Vercel** hosting + Analytics
- **Agentation** (planned, not set up yet): a **dev-only** visual feedback tool, never shipped to production

---

## Quick start

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env.local      # fill in Supabase keys etc. (see docs/DEPLOYMENT.md)

# 3. Database (Supabase CLI)
npx supabase start               # local stack
npx supabase db reset            # runs migrations + seed.sql

# 4. Run
npm run dev                      # http://localhost:3000
```

Agentation (dev-only UI feedback for AI agents) is **not set up yet**. When the team wants it, follow `docs/CONTRIBUTING.md#dev-tools`.

### Scripts

| Script | Does |
|---|---|
| `dev` | Next dev server |
| `build` | Production build, then `check:devtools` |
| `check:devtools` | Fails if `agentation` appears in the production bundle |
| `lint` / `typecheck` / `test` / `test:e2e` | Quality gates, all run in CI |
| `db:types` | Regenerates `lib/supabase/types.ts` from the schema |

---

## Status

Docs complete. **Phase 0 underway:** Next.js 16 + TS (strict) app scaffolded, ESLint (strict + Agentation import guard), Prettier, Husky + lint-staged + commitlint, the `check:devtools` and `check:docs` guards, the `components/dev/DevTools.tsx` slot, and a minimal CI workflow are all in place and the "Hello E-Cell" build is green locally. Remaining Phase 0 tasks need accounts: Supabase project (0.5), Vercel link (0.6), full CI on previews (0.7), branch protection (0.8). See `docs/IMPLEMENTATION_PLAN.md`.

Pending inputs from the team: domain, official contact email and socials, event photos, IoT Co-Head name. See `docs/CONTENT.md#open-items`.
