# Architecture

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16**, App Router, React 19 | RSC + static caching + Server Actions, first-class on Vercel. Turbopack is the default dev + build bundler; Cache Components + Partial Prefetching enabled |
| Language | TypeScript, `strict`, `noUncheckedIndexedAccess` | Typed DB rows end to end |
| Styling | Tailwind CSS v4, tokens in `@theme` | No runtime CSS-in-JS; tokens enforceable |
| Admin UI | shadcn/ui (Radix) inside `/admin` only | Fast, accessible forms/tables; never bundled into public routes |
| Data | **Supabase** Postgres + RLS | Real DB, auth, storage in one; free tier fits |
| Auth | Supabase Auth, **email OTP**, signups disabled | No passwords to leak; fits the terminal login |
| Storage | Supabase Storage bucket `media` | Images served via `next/image` loader |
| Validation | Zod | One schema shared by forms and server actions |
| Forms | React Hook Form + `@hookform/resolvers/zod` | |
| UI motion | `motion` (Framer Motion) | Toggles, drawers, toasts, layout, shared elements |
| Scroll motion | GSAP + ScrollTrigger + `@gsap/react` | Pinning, scrubbing, timelines |
| Smooth scroll | Lenis | Full tier only |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | Hero only, lazy |
| Email | Resend + React Email | Contact notifications, auto-reply |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | OTP and contact form |
| Bot protection | Cloudflare Turnstile (invisible) | Login + contact |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings` + Shiki | Blog, event descriptions |
| Drag order | `@dnd-kit/core` | Admin only |
| Analytics | Vercel Analytics + Speed Insights | Cookieless |
| Errors | Sentry (free tier) | Client + server |
| Testing | Vitest + Testing Library; Playwright e2e; Lighthouse CI | |
| Dev-only tooling | Agentation (devDependency, later, see `CONTRIBUTING.md#dev-tools`) | Visual UI feedback for AI agents; never in prod |

Rejected for v1: a headless CMS, Redux/Zustand (use React context and URL state), Prisma/Drizzle (supabase-js plus generated types is enough), any component library on public routes.

---

## 2. Routes

```
PUBLIC  (app/(site)/…)                     rendering
/                         Home              static, tags: events, stats, achievements, team, gallery
/about                    About             static, tags: settings, timeline, team
/events                   Events index      static, tag: events  (filters client-side, URL-synced)
/events/[slug]            Event detail      static (generateStaticParams), tag: event:<slug>
/team                     Current team      static, tag: team
/team/[year]              Past cohort       static, tag: team
/gallery                  Albums            static, tag: gallery
/gallery/[slug]           Album             static, tag: album:<slug>
/wall-of-fame             Achievements      static, tag: achievements
/blog                     Posts             static, tag: posts
/blog/[slug]              Post              static, tag: post:<slug>
/contact                  Contact           static + server action
not-found                 404 + game        static

HIDDEN (app/admin/…)  → 404 without staff session, noindex
/admin                    Dashboard
/admin/events[/new|/[id]]
/admin/team  /admin/team/cohorts
/admin/achievements
/admin/timeline
/admin/gallery[/[albumId]]
/admin/posts[/new|/[id]]
/admin/stats
/admin/messages
/admin/settings
/admin/staff              owner only
/admin/audit              owner/admin

API
/api/revalidate           (optional) secured webhook for manual revalidation
/api/og/*                 handled by opengraph-image.tsx files
```

There's no `/login` route. Login happens inside the terminal component (see `SECRET_ADMIN_ACCESS.md`).

---

## 3. Folder structure

```
.
├── AGENTS.md  CLAUDE.md -> AGENTS.md  README.md
├── docs/
├── app/
│   ├── layout.tsx                  html, fonts, providers (Motion tier, XP), DevTools (dev only)
│   ├── globals.css                 @theme tokens, base, utilities
│   ├── not-found.tsx               404 + Pivot or Perish
│   ├── error.tsx  global-error.tsx
│   ├── sitemap.ts  robots.ts  opengraph-image.tsx  manifest.ts
│   ├── (site)/
│   │   ├── layout.tsx              Navbar, Footer, Terminal, XPHud, Lenis, PageTransition, BootSequence
│   │   ├── page.tsx
│   │   ├── about/  events/  events/[slug]/  team/  team/[year]/
│   │   ├── gallery/  gallery/[slug]/  wall-of-fame/  blog/  blog/[slug]/  contact/
│   └── admin/
│       ├── layout.tsx              server: requireStaff() → notFound()
│       ├── page.tsx
│       └── events/ team/ achievements/ timeline/ gallery/ posts/ stats/ messages/ settings/ staff/ audit/
├── components/
│   ├── ui/                         public primitives (Button, Tag, Panel…)
│   ├── site/                       sections: home/*, events/*, team/*, about/*…
│   ├── motion/                     Reveal, ScrambleText, CountUp, Magnetic, Marquee, Tilt, StageProgress
│   ├── three/                      HeroScene.tsx (lazy), particles, shaders/
│   ├── game/                       XPProvider, XPHud, BadgeToast, BadgeDrawer, PivotOrPerish
│   ├── terminal/                   Terminal.tsx, commands/*, SecretLogin.tsx
│   ├── admin/                      shadcn-based admin components
│   └── dev/                        DevTools.tsx (dev only)
├── lib/
│   ├── supabase/
│   │   ├── server.ts               createServerClient (cookies) for RSC/actions
│   │   ├── client.ts               createBrowserClient (terminal OTP only)
│   │   ├── admin.ts                service-role client, `import "server-only"`
│   │   ├── static.ts               cookie-less anon client for cached public reads
│   │   └── types.ts                generated
│   ├── data/                       events.ts, team.ts, stats.ts … (cached reads)
│   ├── actions/                    admin/*.ts, contact.ts, auth.ts
│   ├── schemas/                    zod schemas per resource
│   ├── auth/                       requireStaff(), getStaff(), roles
│   ├── game/                       xp engine, badge registry, storage
│   ├── motion/                     tier detection, gsap setup, easings
│   ├── security/                   ratelimit.ts, turnstile.ts, hash.ts
│   └── utils.ts  seo.ts  markdown.ts  images.ts
├── middleware.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/                 0001_init.sql … (from DATABASE.md)
│   ├── seed.sql
│   └── tests/                      rls.test.sql
├── public/                         favicons, poster images, sounds/
├── scripts/
│   └── check-devtools.mjs          fails build if dev tools leak into .next/static
└── tests/                          unit/, e2e/
```

---

## 4. Data flow

### Reads (public)
```
RSC page → lib/data/events.ts → unstable_cache(fetchEvents, ['events'], { tags: ['events'] })
         → Supabase (anon key, cookie-less static client, RLS: published rows only)
```
- Public reads use the **static** anon client with no cookies, so pages stay static.
- Each query is tagged. Cache lives until an admin action revalidates the tag. A safety `revalidate: 86400` covers anything that slips through.
- Event status (`upcoming/live/past`) is **derived at render** from `starts_at/ends_at` plus a daily revalidate, so an event flips to "past" even if nobody edits it.
- The **visible `StatusPill` recomputes phase on the client** from the same `starts_at/ends_at`, so `UPCOMING / LIVE / PAST` is accurate to the minute without waiting for revalidation (a hackathon shouldn't show the wrong pill for hours). Cached server data is unchanged; only the label is recomputed.
- The home `/` route uses a **time-based `revalidate: 86400`** in addition to tag revalidation, so the daily-randomised team deck (`PAGES.md` §1.8) actually rotates even if no admin edit occurs.

### Writes (admin)
```
Admin form (client) → Server Action
   1. const staff = await requireStaff(['admin','editor'])   // server-side session + role
   2. const data = EventSchema.parse(formData)                // Zod
   3. supabase (user session client) .insert/.update          // RLS enforces again
   4. audit log (DB trigger)
   5. revalidateTag('events'); revalidateTag(`event:${slug}`)
   6. return { ok: true } | { ok: false, fieldErrors }
```

### Uploads
Client resizes the image (max 2400px long edge, WebP q≈0.82) → `supabase.storage.from('media').upload()` with the staff session. Storage RLS allows staff only. Path pattern: `{resource}/{id}/{nanoid}.webp`. Width and height are stored in the row for zero-CLS rendering.

---

## 5. Auth and the hidden admin

Full spec in `SECRET_ADMIN_ACCESS.md`. Summary:

- Supabase email OTP with `shouldCreateUser: false`. Public signups are disabled in the dashboard.
- A user counts as staff only if a `profiles` row has `role in ('owner','admin','editor')` and `active = true`.
- `middleware.ts`: refreshes the session cookie; for `/admin/:path*` it checks for a session cookie, and if there isn't one it **rewrites** to `/_not-found` (status 404) and sets `X-Robots-Tag: noindex, nofollow`.
- `app/admin/layout.tsx` calls `requireStaff()` **again** server-side (the middleware alone isn't trusted) → `notFound()`.
- RLS is the final gate: even a forged request with a non-staff session can't write.

---

## 6. Motion architecture

- `MotionProvider` computes a **tier** once on mount:
  - `off`: `prefers-reduced-motion: reduce`, or the user turned motion off in the XP drawer
  - `lite`: `navigator.deviceMemory < 4` or `hardwareConcurrency < 4` or `connection.saveData`, or no WebGL2, or a coarse pointer with a viewport under 768px
  - `full`: everything else
  - Override with `?motion=full|lite|off` (persisted to sessionStorage) for testing.
- GSAP is registered once in `lib/motion/gsap.ts` (ScrollTrigger, SplitText, DrawSVG). It's all free since GSAP 3.13.
- Lenis runs only on `full`, driven by `gsap.ticker`.
- WebGL hero: `dynamic(() => import('@/components/three/HeroScene'), { ssr: false })`, mounted after `requestIdleCallback` following LCP, only on `full`. The poster image is the LCP element.
- Details per animation: `ANIMATIONS.md`.

---

## 7. Game architecture

- Client-only `XPProvider` (context) wrapping `(site)/layout.tsx`.
- State in `localStorage['ecell:founder:v1']`, versioned, Zod-validated on read, reset on parse failure.
- Event bus: `emitXP('visit:/events')`. The engine dedupes by event key, awards XP, unlocks badges, and queues toasts.
- No server, no cookies, no PII.
- Full spec: `GAMIFICATION.md`.

---

## 8. Caching and revalidation map

| Admin action | Tags revalidated |
|---|---|
| Event create/update/delete | `events`, `event:<slug>`, `home` |
| Team member / cohort | `team`, `home` |
| Achievement | `achievements`, `home` |
| Timeline milestone | `timeline` |
| Album / photo | `gallery`, `album:<slug>`, `home` |
| Post | `posts`, `post:<slug>` |
| Stats | `stats`, `home` |
| Settings | `settings` (layout-level: footer, contact) |

---

## 9. Security checklist

- [ ] RLS enabled on **every** table (CI query fails if any public table has RLS off)
- [ ] Service role key only in `lib/supabase/admin.ts` with `server-only`
- [ ] `requireStaff()` in every admin Server Action and the admin layout
- [ ] OTP request: Turnstile + rate limit (5/hour per IP, 3/hour per email); identical response for allowed and unknown emails
- [ ] OTP verify: rate limit (10/hour per IP); Supabase OTP expiry 10 min
- [ ] Contact form: Turnstile + 5/hour per IP + honeypot field; IP stored as salted SHA-256 only
- [ ] Security headers in `next.config.ts`: CSP (nonce-based scripts), HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`
- [ ] `/admin` absent from sitemap, robots.txt, nav, footer, and any public HTML. `grep -r "/admin" .next/server/app/(site)` returns nothing
- [ ] Markdown rendered without raw HTML (`rehype-sanitize`)
- [ ] Uploads: MIME + size validated (≤ 8MB pre-resize), only image types
- [ ] Dependabot + `npm audit` in CI
- [ ] `check:devtools` passes (no dev tooling in production bundle)

---

## 10. Performance budget

| Metric | Budget |
|---|---|
| Initial JS, public route (gz) | ≤ 180 KB |
| Three.js chunk (lazy, home only) | ≤ 220 KB gz |
| LCP (mobile, 4G) | < 2.5 s (home), < 2.0 s (others) |
| CLS | < 0.05 |
| INP | < 200 ms |
| Fonts | ≤ 4 files preloaded, `display: swap`, subset Latin |
| Images above the fold | ≤ 250 KB total |

**LCP rule (per `AGENTS.md` Rule 0):** the LCP element is the static hero **poster**. The boot overlay and scramble text must never be the LCP element or delay first paint — the hero poster and final H1 text are server-rendered; boot and scramble are applied *after* paint, `full` tier only. See `ANIMATIONS.md` §1–3.

Lighthouse CI fails the PR if a budget is exceeded on the preview deploy.

---

## 11. Environments

| Env | Supabase | URL |
|---|---|---|
| Local | `supabase start` (Docker) | localhost:3000 |
| Preview | Staging project | `*.vercel.app` |
| Production | Production project | domain TBD |

Env vars are listed in `DEPLOYMENT.md`.
