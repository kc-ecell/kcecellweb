# AGENTS.md

Operating manual for anyone building this site, human or AI. Read it at the start of every session.

`CLAUDE.md` is a **generated copy** of this file, kept identical by a pre-commit hook (`npm run sync:docs`), so Claude Code, Cursor, Codex and friends all read the same rules. This checkout can't use a real symlink (`core.symlinks=false`), so edit **`AGENTS.md`** only — `CLAUDE.md` follows on commit. CI runs `npm run check:docs` to catch drift.

---

## 1. The project in one paragraph

A from-scratch website for E-Cell KCCEMSR, Thane. Public site is dark, tech-flavoured, animation-heavy, and gamified (Founder XP, a hidden terminal, easter eggs). Content (events, team, achievements, gallery, blog, stats) lives in Supabase and is edited through a **hidden** admin panel by a handful of people. There is **no login button anywhere on the public site**. Next.js 16 App Router on Vercel.

## 2. Which doc to read

| Task | Read |
|---|---|
| Scope or "should we build X?" | `docs/PRD.md`, `docs/ROADMAP.md` |
| What to build next | `docs/IMPLEMENTATION_PLAN.md` |
| Any code | `docs/ARCHITECTURE.md` |
| Anything touching data | `docs/DATABASE.md` |
| Anything visual | `docs/DESIGN_SYSTEM.md`, `docs/ANIMATIONS.md` |
| XP, badges, terminal, easter eggs | `docs/GAMIFICATION.md` |
| Admin entry or auth | `docs/SECRET_ADMIN_ACCESS.md` |
| Building a page | `docs/PAGES.md` |
| Admin screens | `docs/ADMIN_PANEL.md` |
| Copy or real data | `docs/CONTENT.md` |

One decision lives in one doc. If two docs disagree, fix the stale one in the same PR.

## 3. Hard rules

A PR that breaks one of these gets rejected, however good the rest of it is.

**Rule 0 — the tiebreaker.** When "unforgettable" fights clarity, performance, or the ship date, **clarity / perf / date win**. Animation exists to make real content land harder, never to replace or delay it. The 5-second comprehension test (`PRD.md` G1) and the Lighthouse budget (`PRD.md` G5) are gates. The "could this be a Vercel template?" test in `DESIGN_SYSTEM.md` is taste guidance, subordinate to those gates. **Phase 4 (WebGL hero, game layer, boot sequence) is progressive enhancement:** the site must be excellent, clear, and launchable with every Phase 4 item absent. See `IMPLEMENTATION_PLAN.md` Phase 4 for the cut order.

### Product
1. **No visible login / admin link on the public site.** Not in the nav, footer, sitemap, robots.txt, or page source comments. Entry is only via the terminal (`sudo login`) as specified in `docs/SECRET_ADMIN_ACCESS.md`.
2. **`/admin/*` returns a real 404 to anyone without a staff session.** Never a redirect to a login page.
3. **Sponsors page, event registration, recruitment are out of v1.** Don't build them. A "Partner with us" CTA that goes to `/contact?topic=partnership` is the only sponsor surface.
4. **Stats come from the `stats` table only.** No hardcoded numbers in components.

### Engineering
5. **Server Components by default.** `"use client"` only for interactivity, motion, WebGL, game state.
6. **All DB writes go through Server Actions** that (a) verify the staff session server-side, (b) validate with Zod, (c) rely on RLS as the last line of defence, (d) call `revalidateTag`.
7. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client. It's imported only from `lib/supabase/admin.ts`, which has `import "server-only"`.
8. **Every animation has three tiers**: `full`, `lite`, `off` (see `docs/ANIMATIONS.md`). `prefers-reduced-motion` always forces `off`. No exceptions.
9. **WebGL is lazy.** Three.js never lands in the initial bundle. It loads after LCP on the home page only, and only on `full` tier.
10. **No hardcoded colours, radii, durations or z-indexes in components.** Use tokens from `docs/DESIGN_SYSTEM.md`.
11. **Images**: `next/image` with width/height or `fill` + `sizes`. Every image has real alt text. Zero CLS.
12. **No new dependency** without a line in the PR saying why the platform or an existing dep isn't enough.

### Dev tools
13. **Agentation is dev-only, and not set up yet.** When the team adds it: `npm install agentation -D` (devDependency), imported in exactly one file, `components/dev/DevTools.tsx`, rendered only when `process.env.NODE_ENV === "development"`. `npm run build` runs `check:devtools`, which fails if the string `agentation` appears anywhere in `.next/static`. Don't remove that check. Details: `docs/CONTRIBUTING.md#dev-tools`.

### Content and copy
14. No lorem ipsum. Missing copy gets written for real and flagged `COPY-PENDING:` in the PR.
15. No stock photos. Our own photos, illustrations, or nothing.
16. Copy voice: direct, specific, a little playful. Numbers beat adjectives. Banned: "empower", "unleash", "synergy", "cutting-edge", "world-class", "vibrant community", "like-minded individuals", "journey".

## 4. Workflow per task

1. Find the task in `docs/IMPLEMENTATION_PLAN.md`. Tick it in the PR, not before.
2. Read the relevant section of `PAGES.md` / `ADMIN_PANEL.md` / `ANIMATIONS.md`.
3. Build it. Server first, then client islands, then motion last.
4. Check all three motion tiers (DevTools → Rendering → emulate reduced motion; and `?motion=lite`).
5. Check 375px, 768px, 1280px, 1920px.
6. `npm run lint && npm run typecheck && npm run test && npm run build`.
7. Open a PR using the template in `docs/CONTRIBUTING.md`.

## 5. Definition of done

- Matches spec, or the spec was updated in the same PR.
- Works with keyboard only. Visible focus ring. Correct landmarks and headings.
- `full`, `lite`, `off` motion tiers all usable.
- No console errors or hydration warnings.
- Lighthouse (mobile) on the changed route: Performance ≥ 90 (home ≥ 85), Accessibility ≥ 95, SEO 100.
- Data-driven UI has a designed empty state and a loading state.
- `check:devtools` passes.

## 6. Folder map (short)

```
app/(site)/…        public routes
app/admin/…         hidden admin (404 without staff session)
components/site     public sections
components/motion   animation primitives
components/three    WebGL (lazy)
components/game     XP, badges, 404 game
components/terminal hidden terminal + secret login
components/admin    admin UI
components/dev      DevTools.tsx (Agentation), dev only
lib/                supabase clients, data queries, actions, schemas, game engine
supabase/           migrations + seed.sql
```

Full map: `docs/ARCHITECTURE.md#folder-structure`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
