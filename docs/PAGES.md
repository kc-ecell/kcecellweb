# Pages: Public Site Spec

Section-by-section spec. Read it alongside `DESIGN_SYSTEM.md` and `ANIMATIONS.md`. "Data" says where each piece comes from (`DATABASE.md`).

## Global shell (every public page)

- **Navbar** (sticky, `--z-nav`, 64px): logo (`E-CELL` mono wordmark + LED dot) · links `Events · Team · About · Wall of Fame · Gallery · Blog` · `Contact` button (secondary). No login, no admin, no account icon.
  - Scrolling down hides the nav; scrolling up shows it. Gets a background blur-free solid `ink-900` after 40px of scroll.
  - Mobile: a full-screen menu with links as big Unbounded text that scramble in, socials at the bottom, and the terminal hint `long-press the logo`.
- **Stage progress bar** under the nav (`ANIMATIONS.md#4`).
- **XP HUD** bottom-left (`GAMIFICATION.md`).
- **Terminal** (hidden until triggered).
- **Footer:**
  - Row 1: 4 columns. *Explore* (pages), *Do* (upcoming events: next 3), *Reach us* (email, address KCCEMSR Kopri Thane, reply time), *Follow* (socials as mono labels).
  - Row 2: giant reactive `E-CELL` wordmark.
  - Row 3: `© 2026 E-Cell KCCEMSR_` with the blinking cursor (terminal trigger), `Built by the E-Cell Web Dev team`, `v26.10` version tag.
- **Masthead pattern** (all inner pages): eyebrow `[03] // EVENTS`, H1 with ScrambleText, a right-aligned mono "readout" aside (counts, ranges), and a hairline below. No hero images on inner pages.

---

## 1. Home `/`

Order is chosen so a student and a sponsor both get what they need in one scroll.

### 1.1 Hero
- **Full-viewport.** WebGL particle wordmark (poster fallback) fills the right 60% on desktop and sits behind the copy on mobile.
- Left, bottom-aligned (not centered):
  - Eyebrow: `[00] // ENTREPRENEURSHIP CELL · KCCEMSR, THANE`
  - H1 (Unbounded 800, `--text-display`), 2 lines. Default, editable in `home.hero`:
    ```
    Ideas in.
    Startups out.
    ```
    Alt options for the team to pick: "Build what's next." / "We ship founders." / "Build That." (a cleaned-up nod to the old site's "Build That Shit")
  - Subline (`--text-lead`, `fg-muted`): "We help students move from intent to execution through ventures, hackathons, mentorship, and visible outcomes."
  - CTAs: **See upcoming events** (primary) · **Meet the team** (secondary).
  - Meta row (mono, 4 cells with hairlines): `EST. 2016 · 500+ MEMBERS · NEXT: <event> <date> · press ⌘K`.
- Scroll cue: mono `scroll to build ↓` with a pixel arrow bob.
- Data: `site_settings.home.hero`, `stats`, the next upcoming event.

### 1.2 Ticker marquee
Data: `site_settings.home.marquee`.

### 1.3 Stats `stats.json`
4 odometer panels: **500+** Active members · **100+** Events and workshops · **20+** Industry partners · **10+** Student-led initiatives. Footer per panel: source + verified month. Data: `stats` (ordered by `sort`).

### 1.4 What we do (IDE tabs)
Tabs: Hackathons · Workshops & Bootcamps · Mentorship & Incubation · Competitions. Each tab: typed pseudo-code + a real photo thumbnail + "See related events →" (filters `/events?format=`). Copy in `CONTENT.md#programs`.

### 1.5 Upcoming events (pinned rail)
- Title: `[02] // NEXT UP`, counter `01 / 0N`.
- `EventCartridge` per upcoming event: cover, title, date, venue, format tag, status pill, "Register" (external) + "Details".
- Last cartridge: "All events →" (the archive).
- Empty: Panel `> no upcoming events scheduled` / "We announce new events on Instagram first. Usually 2–3 weeks ahead." / [Follow on Instagram] [See past events].

### 1.6 Level map teaser
4 nodes: 2016 (founded), 2018 (NEC 2nd), 2025 (SIH win), 2026 (Singularity, boss). Then "Play the full timeline →" `/about#timeline`.

### 1.7 Wall of Fame highlights
3 trophy cards (`achievements.is_highlight`) with tilt: year · result (big) · title · organizer. "Full wall of fame →".

### 1.8 Team deck
Fanned deck of the 4 leadership cards + 3 random heads (re-randomised daily via ISR). Copy: "24 people run E-Cell this year. Flip a card." · "Meet the full team →".

### 1.9 Gallery strip
Drag strip of 10 photos from the latest albums, with plate captions `PLATE 07 / SINGULARITY / 2026`. "Open gallery →".

### 1.10 From the blog (only if ≥ 1 post)
3 latest posts as `DataRow`s.

### 1.11 Partner / contact CTA
Lime band (one of the few large lime fills allowed):
"Want to run something with 500+ student builders? Talk to us." · [Partner with us] → `/contact?topic=partnership` · [Email us] (copies the email). This is the only sponsor surface in v1.

### 1.12 Footer

SEO: title `E-Cell KCCEMSR · Entrepreneurship Cell, K.C. College of Engineering, Thane`. JSON-LD `Organization` + `CollegeOrUniversity` parent.

---

## 2. Events `/events`

- Masthead: H1 "Events" · aside `100+ EVENTS · 2016 → 2026`.
- **Upcoming / Live**: full-width `EventCartridge` rows (bigger than on home), live ones first with a pulsing red pill.
- Divider `── ARCHIVE ──`.
- **Archive**: numbered `DataRow` index, newest first: `#042 · 2026 · Singularity · Hackathon · 300 attendees →`.
- **Filters** (mono pill toggles): format (all enum values) · year (detected). Client-side over server-fetched data, URL-synced (`?format=hackathon&year=2025`), back-button safe, no loading state.
- Search (`/` focuses it): fuzzy match on title/theme.
- Empty filter result: `> 0 matches` · "Nothing fits those filters. Clear them or try another year." · [Clear filters].
- XP: `visit:/events`.

## 3. Event detail `/events/[slug]`

1. Masthead: title (scramble), edition, status pill, date range, venue (or "Online"), theme. CTA: **Register** (external, `rel="noopener"`, tracked) if upcoming and `registration_url`; if past and an album exists, **See photos**.
2. Cover: full-bleed, plate caption.
3. Two columns: description (Markdown) at measure | **fact panel** `event.json`: format, dates, venue, registration deadline (countdown if < 7 days), prize pool, attendance, colleges. Fields are omitted when empty, never printed blank.
4. Agenda (if present): numbered rows with mono times.
5. Speakers (if present): grid of photo, name, role, company.
6. Highlights (past events): up to 5 `label/value` rows ("Teams: 64", "Projects shipped: 41").
7. Gallery preview (if an album is linked): 6 photos → album.
8. Prev / next event navigation.

SEO: `Event` JSON-LD (startDate, endDate, location, eventStatus, organizer). OG image generated from the cover + title + date.
Preview: `?preview=<token>` renders drafts with a `DRAFT PREVIEW` banner (server-validated token).

## 4. Team `/team`

- Masthead: H1 "The Team" · aside `COHORT 2026-27 · 24 PEOPLE · 5 DEPARTMENTS`.
- Department tabs (sticky sub-nav): All · Faculty · Leadership · Technical · Events & Ops · Media & Comms.
- Sections per department, each with an accent-coloured eyebrow, then a grid of `TradingCard`s (sort order from DB).
  - Faculty card: single, larger, violet trim, "Faculty Coordinator".
- Below: `── PAST TEAMS ──` year chips → `/team/[year]`.
- Card back: bio, fun stat, skills, LinkedIn / GitHub / Instagram as mono labels.
- Missing photo → pixel avatar.

## 5. Team archive `/team/[year]`

Compact list grouped by department: name · role. No photos (lighter page). Year switcher. 404 if the cohort doesn't exist.

## 6. About `/about`

1. Masthead: H1 "About E-Cell" · aside `EST. 2016 · KCCEMSR, THANE`.
2. Statement band: one line at `--text-display`: "We've been around since 2016. We're still building what's next."
3. **Mission** and **Vision** as two `Panel`s (`mission.md`, `vision.md`) side by side; text from settings.
4. **What we do**: prose ≤ 250 words (from `CONTENT.md`).
5. **Level map timeline**: the full 9 levels (`#timeline`). Completing it earns `Historian`.
6. **Structure**: a diagram of 5 departments as a node graph (SVG, accents), each with its remit in one line.
7. **Faculty & institution**: Faculty Coordinator (name, designation), college name and address, affiliation (University of Mumbai, verify).
8. Stats strip (reuse) + contact CTA.

## 7. Wall of Fame `/wall-of-fame`

- Masthead: H1 "Wall of Fame" · aside `N WINS · 2018 → 2025`.
- Filters: category (hackathon, entrepreneurship, innovation, award, event) and year.
- Top: the 3 highlight trophies (big).
- Then a numbered `DataRow` index: year · title · organizer · result. Expanding a row (accordion, Motion height via `layout`) shows the description, team names, image, and prize (only if present).
- Empty: "No wins match. Yet."

## 8. Gallery `/gallery` and `/gallery/[slug]`

- Index: album grid. Each tile is the cover + title + date + photo count; hover pixel-shimmers it.
- Album: masonry, lightbox, download disabled (no right-click blocking though), plate captions, alt text required.
- Album linked to an event shows an "About this event →" link.

## 9. Blog `/blog` and `/blog/[slug]`

- Index: `DataRow` table: date (mono) · title · author · reading time · tags. Tag filter chips.
- Post: masthead (title, author with mini avatar, date, reading time), optional cover, Markdown body at measure, sticky TOC on desktop (from h2/h3), code blocks highlighted by Shiki in a Panel, prev/next. Reaching 90% depth awards `post:read`.
- `Article` JSON-LD, OG image from the cover or a generated one.
- Empty index (v1 launch may have 0 posts): "No posts yet. The first recap drops after Singularity." · [See events].

## 10. Contact `/contact`

- Masthead: H1 "Contact" · aside `REPLY IN ≤ 2 WORKING DAYS`.
- Left: contact table (`Panel` `contact.json`): email (click to copy), Instagram, LinkedIn, address `K.C. College of Engineering and Management Studies and Research, Kopri, Thane (E)`, each with its response time.
- Right: form: name, email, topic (select; pre-filled from `?topic=`), organisation (shown for partnership/speaker/media), message, hidden honeypot, invisible Turnstile. Submit animates as "compiling…".
- Success: `✓ sent. We read this inbox daily and reply within 2 working days. Can't wait? Email <address>.` + `contact:sent` XP.
- Errors are inline per field. Server error: "That didn't send. Try again, or email us directly at <address>."
- Map: static image of the campus area (no third-party embed), linking to Google Maps.

## 11. 404 and errors

- `not-found.tsx`: void ground, giant `404` in pixel font, "this page pivoted out of existence.", the **Pivot or Perish** game canvas, links Home · Events · Contact.
- `error.tsx`: "Something broke on our side. It's been logged." · [Try again] [Home]. No game.

---

## Shared acceptance criteria (every page)

- Works at 375 / 768 / 1280 / 1920px with no horizontal scroll.
- All three motion tiers usable.
- Headings in order, one H1, landmarks (`header`, `nav`, `main`, `footer`).
- Every data-driven section has empty + loading (skeleton) states.
- Metadata: title, description, canonical, OG image.
- No `/admin` reference in the HTML.
