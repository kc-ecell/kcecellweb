# Implementation Plan

Six phases. The work is ~6 weeks of ideal effort, but the team is 3–5 **part-time student devs**, so plan for **8–9 calendar weeks** and set the launch date **after exams**, not during them. Every phase ends with a deployable site on a Vercel preview, so nothing waits on the last week.

Legend: **[P0]** must ship in v1 · **[P1]** should ship · **[P2]** nice to have.
Owner column is a suggestion. Reassign freely.

---

## Phase 0: Setup (≈ 3 days)

**Goal:** an empty but production-shaped repo. CI is green, a preview deploy works, and the DB is reachable.

| # | Task | Owner | Done when |
|---|---|---|---|
| 0.1 | `npx create-next-app@latest` with TS, Tailwind, App Router, `src/` **off**, import alias `@/*` | Web | App runs locally |
| 0.2 | Add `AGENTS.md`, generate `CLAUDE.md` copy via the sync hook (no symlinks on Windows), copy `docs/` in | Web | Files committed; `npm run check:docs` green |
| 0.3 | ESLint (next + `@typescript-eslint/strict`), Prettier, `tsconfig` strict + `noUncheckedIndexedAccess` | Web | `npm run lint && npm run typecheck` pass |
| 0.4 | Husky + lint-staged pre-commit; commitlint (conventional commits) | DevOps | Bad commit message rejected |
| 0.5 | Create Supabase project (Mumbai region `ap-south-1`); install Supabase CLI; `supabase init` | DevOps | `supabase start` works locally |
| 0.6 | Vercel project linked to GitHub; preview deploys per PR; env vars set (see `DEPLOYMENT.md`) | DevOps | PR shows preview URL |
| 0.7 | GitHub Actions: lint, typecheck, unit tests, build, Lighthouse CI on preview | DevOps | All jobs green on an empty PR |
| 0.8 | Branch protection on `main`: 1 review, CI required | DevOps | Direct push blocked |
| 0.9 | Add `components/dev/DevTools.tsx` slot and the `check:devtools` script **(Agentation itself is installed later, only when the team decides; see `CONTRIBUTING.md#dev-tools`)** | Web | Script exists and passes |

**Exit:** a "Hello E-Cell" page deployed on a preview URL.

---

## Phase 1: Design system and shell (week 1)

**Goal:** tokens, type, primitives, the global layout, and the motion engine skeleton.

| # | Task | Pri | Done when |
|---|---|---|---|
| 1.1 | Tokens in `app/globals.css` via `@theme` (colours, spacing, radii, z, durations, easings) per `DESIGN_SYSTEM.md` | P0 | No raw hex in components (lint rule) |
| 1.2 | Self-hosted fonts: FK Grotesk (primary), Outfit (sub-headings), IBM Plex Mono (mono) | P0 | No FOUT/CLS |
| 1.3 | Primitives: `Button`, `Link`, `Tag`, `Pill`, `Card` (bordered), `Panel` (terminal chrome), `Section`, `Container`, `Eyebrow`, `Kbd`, `Skeleton`, `EmptyState` | P0 | Storybook-lite page at `/dev/kit` (dev only) |
| 1.4 | `useMotionTier()` hook + `MotionProvider` (full / lite / off) with `?motion=` override | P0 | Tier visible in dev overlay |
| 1.5 | Motion primitives: `Reveal`, `RevealGroup`, `ScrambleText`, `CountUp`, `Magnetic`, `Marquee`, `Tilt` | P0 | Each works in all 3 tiers |
| 1.6 | Lenis smooth scroll provider (full tier only), synced with GSAP ticker | P0 | No double scrollbars, anchor links work |
| 1.7 | Site layout: `Navbar` (desktop + mobile sheet), `Footer` (giant wordmark), skip link, `PageTransition` | P0 | Keyboard and screen reader pass |
| 1.8 | Custom cursor (desktop full tier only) | P1 | Hides over inputs, never hides the system cursor for a11y |
| 1.9 | Background grid + noise layer (CSS only) | P0 | 0 JS cost |

**Exit:** every route renders the shell with a placeholder masthead.

---

## Phase 2: Data layer and hidden admin (weeks 2–3)

**Goal:** the schema exists, content is seeded, and staff can log in through the terminal and edit everything.

| # | Task | Pri | Done when |
|---|---|---|---|
| 2.1 | Migrations from `DATABASE.md` (tables, enums, indexes, triggers) | P0 | `supabase db reset` clean |
| 2.2 | RLS policies + `is_staff()` / `has_role()` helpers + staff cap trigger | P0 | pgTAP / SQL tests for anon vs staff pass |
| 2.3 | Storage bucket `media` + policies | P0 | Anon can read, can't write |
| 2.4 | `seed.sql` from `CONTENT.md` (team 2026–27, timeline, stats, achievements, mission/vision, departments) | P0 | Seeded DB renders real content |
| 2.5 | `lib/supabase/{server,client,admin}.ts`; generated types; `lib/data/*` cached queries with tags | P0 | Typed queries, tagged cache |
| 2.6 | Terminal component (public), with commands except `sudo login` | P0 | Opens with `Ctrl/⌘+K` and `` ` `` |
| 2.7 | Secret login flow in terminal: `sudo login` → email → OTP → ACCESS GRANTED → `/admin` | P0 | Matches `SECRET_ADMIN_ACCESS.md` |
| 2.8 | `middleware.ts`: refresh session; `/admin/*` rewrites to 404 without staff role; `X-Robots-Tag: noindex` | P0 | Anonymous `/admin` shows the public 404 page |
| 2.9 | Upstash rate limits on OTP request/verify + Turnstile (invisible) | P0 | 6th request in an hour blocked |
| 2.10 | Admin shell: sidebar, topbar, theme toggle, command menu, toasts (shadcn/ui inside `/admin` only) | P0 | |
| 2.11 | Generic `ResourceTable` + `ResourceForm` (RHF + Zod) + `ImageUploader` (client resize → Storage) | P0 | Reused by every resource |
| 2.12 | CRUD screens: Events (+speakers), Team (cohorts, members), Achievements, Timeline, Gallery (albums, bulk photos), Posts (MD editor + preview), Stats, Settings, Messages | P0 | Each saves, validates, revalidates |
| 2.13 | Drag ordering (dnd-kit) for members, photos, milestones | P1 | Order persists |
| 2.14 | Staff management (owner): invite, role, revoke | P0 | Configured cap enforced (default 10) |
| 2.15 | Audit log trigger + viewer | P1 | Every write logged |
| 2.16 | Preview mode for drafts (`/events/[slug]?preview=<token>`) | P1 | Draft visible only with token |

**Exit:** staff can publish a real event and see it on the (still plain) public event page.

---

## Phase 3: Public pages (weeks 3–5)

Build in this order. Each page lands **functionally complete without signature animation**, and motion comes in Phase 4. Specs are in `PAGES.md`.

| # | Page | Pri | Notes |
|---|---|---|---|
| 3.1 | Home (sections 1–11 static versions) | P0 | Stats from DB, upcoming events, highlights |
| 3.2 | Events index (filters, URL sync, upcoming/past split) | P0 | |
| 3.3 | Event detail (fact panel, agenda, speakers, gallery link, JSON-LD Event) | P0 | |
| 3.4 | Team (current cohort, departments, trading cards static) | P0 | |
| 3.5 | Team archive `/team/[year]` | P0 | Compact list |
| 3.6 | About (mission, vision, timeline static, faculty, structure) | P0 | |
| 3.7 | Wall of Fame (filters, expandable rows) | P0 | |
| 3.8 | Gallery index + album (masonry, lightbox) | P0 | |
| 3.9 | Blog index + post (MD → HTML, TOC, reading time, JSON-LD Article) | P0 | |
| 3.10 | Contact (form, server action, Resend, Turnstile, auto-reply) | P0 | |
| 3.11 | 404 (static version) + `error.tsx` | P0 | |
| 3.12 | SEO: metadata, `opengraph-image.tsx` per route, sitemap, robots, JSON-LD Organization | P0 | robots.txt must **not** mention `/admin` |

**Exit:** the whole site is usable, content-complete, and accessible with motion off.

---

## Phase 4: Make it crazy (week 5)

Signature animations and the game layer, built on the stable pages. Specs are in `ANIMATIONS.md` and `GAMIFICATION.md`.

**This phase is progressive enhancement (per `AGENTS.md` Rule 0).** The site shipped at the end of Phase 3 is already launchable, clear, and fast. The `[P0]` marks below mean "do these first within Phase 4," **not** "launch blocks on them." If the date or the Lighthouse budget is at risk, cut from the bottom of this list up:

`4.16 sound → 4.15 404 game → 4.12 footer wordmark → 4.10 gallery drag-inertia → 4.2 WebGL hero (the static poster is the permanent fallback) → 4.7 pinned rail (native scroll-snap is the fallback) → 4.9 trading-card 3D tilt (flip-only is the fallback)`

Keep to the end regardless (cheap, and they carry the identity): **4.3 scramble mastheads, 4.5 stats odometer, 4.4 stage progress, 4.8 level-map (static is acceptable), 4.11 page transitions, and the terminal** (needed for admin login anyway). LCP must never depend on any Phase 4 item — see `ANIMATIONS.md` §2–3 and `ARCHITECTURE.md` §10.

| # | Task | Pri |
|---|---|---|
| 4.1 | Boot sequence (first visit per session, skippable) | P0 |
| 4.2 | WebGL hero: particle field → "E-CELL" morph, cursor repel; poster fallback | P0 |
| 4.3 | Scramble/decode headlines on every masthead | P0 |
| 4.4 | Startup-stage scroll progress bar (Idea → Scale) | P0 |
| 4.5 | Stats odometer + live "terminal readout" panel | P0 |
| 4.6 | "What we do" IDE tabs with typing code animation | P0 |
| 4.7 | Pinned horizontal event rail (event "cartridges") | P0 |
| 4.8 | Level-map timeline (SVG path draw, node unlock) on Home teaser + About | P0 |
| 4.9 | Trading cards: 3D tilt, flip, holo sheen (CSS), fan-out deck on Home | P0 |
| 4.10 | Gallery drag-inertia strip + shared-element lightbox | P1 |
| 4.11 | Page transitions (View Transitions API with Motion fallback) | P0 |
| 4.12 | Footer wordmark reacting to cursor (variable font weight / distortion) | P1 |
| 4.13 | Founder XP engine, HUD, toasts, badges drawer, toggle | P0 |
| 4.14 | Easter eggs (Konami, logo 7-click, hidden terminal commands, console message) | P0 |
| 4.15 | 404 runner game "Pivot or Perish" | P1 |
| 4.16 | Sound effects (opt-in) | P2 |

**Exit:** every animation passes the three-tier check, and Lighthouse budgets still hold.

---

## Phase 5: QA and launch (week 6)

| # | Task | Done when |
|---|---|---|
| 5.1 | Real content entry via admin: all events, all photos, alt text | No `COPY-PENDING` left |
| 5.2 | Accessibility audit: axe, keyboard-only run, VoiceOver + TalkBack pass | 0 serious issues |
| 5.3 | Performance: Lighthouse CI budgets, WebPageTest on Moto G-class profile | Targets in `PRD.md` §8 |
| 5.4 | Security pass (`ARCHITECTURE.md#security-checklist`): RLS tests, header scan, OTP abuse test, `/admin` 404 check, bundle check for secrets | All green |
| 5.5 | Cross-browser: Safari iOS, Chrome Android, Firefox, Edge | No blockers |
| 5.6 | Domain + DNS + HTTPS; Supabase auth redirect URLs updated; Resend domain verified | Mail lands in inbox, not spam |
| 5.7 | Analytics events verified | Visible in dashboard |
| 5.8 | Staff onboarding: each admin logs in via terminal once; 10-min walkthrough doc | All staff confirmed |
| 5.9 | Launch, then announce on Instagram/LinkedIn with an easter-egg teaser | |
| 5.10 | 2-week hypercare: fix-forward, watch errors | |

---

## Dependency graph

```
P0 Setup ─► P1 Design system ─► P3 Public pages ─► P4 Motion+Game ─► P5 Launch
                 │                    ▲
                 └─► P2 Data + Admin ─┘
```

Phase 2 and Phase 1 can run in parallel with two people. Phase 3 needs both.

## Suggested split (5 people)

| Person | Focus |
|---|---|
| Web Dev Head | Shell, public pages, SEO |
| Web Dev Co-Head | Admin panel, forms, reviews |
| DevOps Head / Co-Head | Supabase, CI, Vercel, security, perf budgets |
| AI/ML or Cyber | Terminal, secret login, rate limits, security review |
| Anyone with design taste | WebGL hero, animations, game layer |

## Weekly rhythm

- Monday: pick tasks, update this file's checkboxes in a PR.
- Wednesday: preview review with the President / VP.
- Friday: merge to `main` and deploy to production behind a `Coming soon` gate until launch.
