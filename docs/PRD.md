# PRD: E-Cell KCCEMSR Website v1

| | |
|---|---|
| **Owner** | E-Cell KCCEMSR Web Dev team |
| **Status** | Approved for build |
| **Version** | 1.0 (2026-10-28) |
| **Target launch** | ~6 weeks of effort, planned over 8–9 calendar weeks, **after exams** (see `IMPLEMENTATION_PLAN.md`) |
| **Related** | `IMPLEMENTATION_PLAN.md`, `PAGES.md`, `ADMIN_PANEL.md`, `GAMIFICATION.md` |

---

## 1. Background

E-Cell KCCEMSR was founded in 2016. It has run 100+ events, has 500+ active members, has worked with 20+ industry partners, and has won national results (NEC IIT Bombay 2nd place in 2018, Smart India Hackathon 2025 winners with Hack4Hygiene). The current web presence doesn't show any of that clearly, and every content update needs a developer.

We're rebuilding from zero with two goals: make the site **unforgettable** (it should feel like opening a product, not a club page), and make it **maintainable by non-developers** through a hidden admin panel.

## 2. Goals

| # | Goal | How we know |
|---|---|---|
| G1 | Visitors immediately understand what E-Cell does and its track record | 5-second test: 4 of 5 students can say "they run hackathons, workshops, mentorship; they won SIH" |
| G2 | The site feels distinctly tech + fun, and people share it | Avg. session > 90s on home; ≥ 15% of sessions earn a **meaningful** badge (Explorer / ≥ 2 badges / terminal opened — *not* `first-steps`, which fires on any XP and is near-universal) |
| G3 | Students find and act on upcoming events | Event page → registration link CTR ≥ 30%, measured over the **first real event cycle (Singularity)** — not the 30-day launch window, which may have no upcoming event |
| G4 | Content stays fresh without developers | Every content type editable in admin; median time to publish an event < 5 min |
| G5 | Fast and accessible despite heavy animation | Lighthouse mobile: Perf ≥ 85 home / ≥ 90 others, A11y ≥ 95 |
| G6 | Admin is invisible and secure | Zero public links to admin; no unauthorised access; pen-test checklist passes |

## 3. Non-goals (v1)

- Sponsors page with tiers or deck download. **Deferred** (`ROADMAP.md` v1.1).
- Native event registration or payments. Events link out (Google Form / Devfolio / Luma / Unstop).
- Recruitment / join portal.
- Public user accounts, member login, server-side leaderboards.
- i18n. English only.
- Light theme on the public site (admin has light + dark).

## 4. Audiences (ranked)

1. **Students** at KCCEMSR and nearby colleges: what's happening next, how to take part, is this worth my time.
2. **Industry partners and sponsors**: scale, track record, who to contact. v1 serves them through stats, wall of fame, and the contact form.
3. **College admin, faculty, NAAC/NBA reviewers**: structure, faculty coordinator, documented events and achievements.
4. **Mentors, speakers, founders**: what kind of room this is.
5. **Alumni, press, other E-Cells**: archive, gallery, contact.

When two audiences want different things from the same section, the higher-ranked one wins.

## 5. User stories

### Visitors
- **V1** As a student, I want to see upcoming events with date, venue, and a registration link on the home page.
- **V2** As a student, I want a page per event with the full details, speakers, and photos once it's over.
- **V3** As a sponsor, I want verified numbers (members, events, partners) and proof (achievements, photos) within one scroll.
- **V4** As a reviewer, I want a year-by-year timeline and an archive of past teams and events.
- **V5** As anyone, I want to browse photo albums by event.
- **V6** As anyone, I want to read E-Cell blog posts (event recaps, founder talks, guides).
- **V7** As anyone, I want to contact E-Cell and get a clear reply-time promise.
- **V8** As a curious visitor, I want to discover hidden stuff (terminal, easter eggs, badges) and feel rewarded for exploring.
- **V9** As someone with motion sensitivity or a low-end phone, I want the site to work fully without heavy animation.

### Admins (a few people only)
- **A1** As an admin, I want to get in without any visible login button, through a secret path only the team knows.
- **A2** As an editor, I want to create, edit, schedule, and unpublish events, with a cover upload and a preview.
- **A3** As an editor, I want to manage team members per academic year and mark one year as current.
- **A4** As an editor, I want to upload photos into albums in bulk, with alt text and ordering.
- **A5** As an editor, I want to write blog posts in Markdown with a live preview.
- **A6** As an admin, I want to update stats, socials, contact email, and the timeline without code.
- **A7** As an admin, I want to read and triage contact form messages.
- **A8** As the owner, I want to invite or remove staff (up to the configured cap, default 10 active) and see an audit log of changes.

## 6. Functional requirements

### 6.1 Public site
| ID | Requirement | Priority |
|---|---|---|
| F1 | Pages: Home, About, Events, Event detail, Team, Team archive (by year), Gallery, Album, Wall of Fame, Blog, Post, Contact, 404 | P0 |
| F2 | All content rendered from Supabase, statically cached, revalidated on admin save | P0 |
| F3 | Events split into Upcoming / Live / Past by date; filters by format and year (URL synced) | P0 |
| F4 | Contact form: name, email, topic (general, partnership, speaker, media, other), message; Turnstile; rate limited; email notification to E-Cell inbox; auto-reply | P0 |
| F5 | Founder XP system with badges, HUD, toasts, toggle (`GAMIFICATION.md`) | P0 |
| F6 | Hidden terminal (keyboard shortcut + hidden triggers) with commands (`GAMIFICATION.md#terminal`) | P0 |
| F7 | Signature animations: boot sequence, WebGL hero, scramble text, level-map timeline, trading-card team, pinned event rail, page transitions (`ANIMATIONS.md`) | P0 |
| F8 | 404 mini-game | P1 |
| F9 | SEO: per-page metadata, dynamic OG images, sitemap (public routes only), JSON-LD (Organization, Event, Article) | P0 |
| F10 | Optional UI sound effects, **off by default** | P2 |

### 6.2 Admin
| ID | Requirement | Priority |
|---|---|---|
| A-F1 | Secret entry through the terminal `sudo login` → email OTP (`SECRET_ADMIN_ACCESS.md`) | P0 |
| A-F2 | `/admin/*` 404s without a staff session | P0 |
| A-F3 | CRUD: events (+speakers), team cohorts & members, achievements, timeline milestones, albums & photos, posts, stats, site settings | P0 |
| A-F4 | Image upload to Supabase Storage with client-side resize (max 2400px, WebP) | P0 |
| A-F5 | Draft / published state + "Preview" link for events and posts | P0 |
| A-F6 | Messages inbox with status (new, read, archived) | P0 |
| A-F7 | Staff management (owner only): invite by email, change role, revoke | P0 |
| A-F8 | Audit log of every write | P1 |
| A-F9 | Drag-and-drop ordering for team members, photos, milestones | P1 |

### 6.3 Roles
| Role | Can |
|---|---|
| `owner` (1–2 people) | Everything, incl. staff management and site settings |
| `admin` | All content CRUD, stats, messages, settings |
| `editor` | Content CRUD (events, team, gallery, posts, achievements); no stats, settings, staff |

Hard cap enforced in the DB, **configurable** via the `private.staff_cap` setting (default **10** active staff). A 24-person club with annual turnover and event-time posting outgrows 6 fast, and handover needs headroom for the incoming + outgoing owner to overlap. See `DATABASE.md` §2.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | LCP < 2.5s (mobile 4G), CLS < 0.05, INP < 200ms. Initial JS per route < 180KB gzipped (three.js excluded, lazy). |
| Accessibility | WCAG 2.2 AA. Full keyboard support incl. terminal and game. Reduced motion respected. Contrast ≥ 4.5:1 for body. |
| Security | RLS on every table; service role server-only; OTP rate limits; Turnstile; CSP; security headers; no user enumeration on login. |
| Reliability | Public pages served from cache, so a Supabase outage still serves the last good render. |
| Privacy | Cookieless analytics. XP stored only in localStorage. Contact IPs stored hashed only. |
| Browser support | Last 2 versions of Chrome, Edge, Safari, Firefox; iOS 16+, Android Chrome. WebGL optional. |
| Maintainability | Typed DB (`supabase gen types`), Zod at boundaries, docs updated with code. |

## 8. Success metrics (30 and 90 days after launch)

| Metric | Target |
|---|---|
| Monthly unique visitors | 3,000 (30d) / 6,000 (90d) |
| Avg. engaged time, home | > 90s |
| Sessions earning a meaningful badge (not `first-steps`) | ≥ 15% |
| Event detail → registration CTR (first event cycle) | ≥ 30% |
| Contact form submissions (partnership topic) | ≥ 5 / month |
| Time to publish an event in admin | < 5 min median |
| Lighthouse mobile (home / others) | ≥ 85 / ≥ 90 perf, ≥ 95 a11y |

Tracked with Vercel Analytics custom events: `badge_earned`, `terminal_opened`, `event_register_click`, `contact_submitted`, `game_mode_off`.

## 9. Dependencies and open items

| Item | Owner | Blocking? |
|---|---|---|
| Domain | Sachman / core team | Blocks launch only |
| Official contact email + Instagram + LinkedIn | Core team | Blocks launch |
| Event photos (graded, 30+) | Media team | Blocks gallery, not build |
| IoT Co-Head name + photo | Technical | No |
| Remaining team portraits (14) | Each member | No (illustrated fallback card) |
| Past event data (dates, attendance) | Events team | Blocks archive completeness |
| List of staff emails for admin (≤ configured cap, default 10) | President | Blocks admin go-live |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Heavy animation tanks performance on budget Android phones | Motion tiers, device detection, WebGL lazy + fallback poster, perf budget in CI (Lighthouse CI) |
| Secret admin entry gets discovered | It's obscurity for UX only. Real security is OTP + allowlist + RLS + rate limits. Discovery changes nothing. |
| Gamification feels gimmicky | Every reward ties to real content (read a post, open an event). Toggle off persists. Max 1 toast per 4s. |
| Content goes stale after the current team graduates | Admin panel + handover section in `DEPLOYMENT.md`; staff roles transferable |
| Student team bandwidth during exams | Phases sized to ship incrementally; each phase leaves a deployable site |
