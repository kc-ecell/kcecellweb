# Design System: "Build Mode"

## 1. Art direction

**One line:** an IDE booted inside an arcade, run by people who ship startups.

Three ingredients, always in this ratio:

| Ingredient | Share | Shows up as |
|---|---|---|
| **Tech** | 60% | Dark ground, grid lines, monospace labels, terminal chrome, code tokens, status LEDs, version numbers |
| **Play** | 25% | Pixel font for game UI, XP, badges, level map, trading cards, playful microcopy, easter eggs |
| **E-Cell** | 15% | Startup language (Idea → Scale), pitch energy, rocket/launch metaphors used sparingly, real faces and real results |

It's **not** a generic dark SaaS landing page. The test is to screenshot any section and ask "could this be a Vercel template?" If the answer is yes, it isn't done.

### Mood references (study, never copy)
- Linear / Vercel changelogs: type discipline and grid
- Teenage Engineering: hardware UI labels, LED dots, utility colour
- Hack Club / MLH: hackathon warmth
- Pokémon / NBA Top Shot cards: the trading-card team section
- Retro arcade HUDs: XP bar, badge toasts
- Bruno Simon / Active Theory: the ambition level of the hero, not its style

### Anti-patterns
- Purple-to-blue gradient blobs, glassmorphism cards over gradients
- Three equal icon cards in a row
- Centered hero with two pill buttons and nothing else
- Stock 3D rockets, lightbulbs, handshake illustrations
- Neon glow on everything. Glow is allowed only on **one** element per viewport: the active/primary one.

---

## 2. Colour tokens

Dark is the canonical theme for the public site.

```css
@theme {
  /* Ground */
  --color-void:     #06070A;  /* page background */
  --color-ink-900:  #0C0E13;  /* section alt */
  --color-ink-800:  #12151C;  /* panels, cards */
  --color-ink-700:  #1A1E28;  /* raised, hover */
  --color-line:     #232837;  /* hairlines, grid */
  --color-line-hi:  #343B4F;  /* focused borders */

  /* Text */
  --color-fg:       #ECEFF6;  /* primary text  (16.9:1 on void) */
  --color-fg-muted: #9AA2B8;  /* secondary     (7.6:1) */
  --color-fg-dim:   #626A80;  /* labels, meta  (3.6:1, never for body) */

  /* Signal: the E-Cell colour. Primary CTA, active states, XP. */
  --color-lime:     #16A85A;
  --color-lime-ink: #061008;  /* text on lime */

  /* Accents: one per department, used as tags and card trims */
  --color-cyan:     #3DE8FF;  /* Technical */
  --color-orange:   #FF7A2F;  /* Events & Ops */
  --color-pink:     #FF4FA8;  /* Media & Comms */
  --color-violet:   #8E7BFF;  /* Faculty */
  /* Leadership uses lime */

  /* States */
  --color-ok:       #3DFF9A;
  --color-warn:     #FFC93D;
  --color-err:      #FF4F5E;
}
```

**Rules**
- Lime covers ≤ 10% of any viewport. It marks *the* thing to do.
- Accents are for tags, card trims, chart lines, and the department LED. Never body text, never large fills.
- Gradients are allowed only inside WebGL/shader output and the holo sheen on trading cards. Never as CSS section backgrounds.
- Admin panel: shadcn neutral palette (light + dark), lime as `--primary`.

### Department map
| Department slug | Name | Accent |
|---|---|---|
| `faculty` | Faculty | violet |
| `leadership` | Leadership | lime |
| `technical` | Technical | cyan |
| `events` | Events & Operations | orange |
| `media` | Media & Communications | pink |

---

## 3. Typography

| Role | Family | Use |
|---|---|---|
| Primary | **FK Grotesk** (licensed, files pending) | Headlines, big numbers, wordmark, paragraphs, UI |
| Sub | **Outfit** (variable, 100–900) | Sub-headings (`h3`–`h6`, `.subheading`) |
| Mono | **IBM Plex Mono** | Eyebrows, labels, meta, code, terminal, stats |

Self-hosted from `public/fonts` with `@font-face` in `app/globals.css`, `font-display: swap`. Tokens: `--font-display`, `--font-heading`, `--font-body`, `--font-subheading`, `--font-mono`. Open Sauce Sans is the fallback in the FK Grotesk stacks until the licensed files are added.

### Scale (fluid, clamp)
```css
--text-mega:   clamp(3.5rem, 11vw, 11rem);   /* hero */
--text-display:clamp(2.75rem, 7vw, 6.5rem);
--text-h1:     clamp(2.25rem, 5vw, 4.25rem);
--text-h2:     clamp(1.75rem, 3.4vw, 3rem);
--text-h3:     clamp(1.25rem, 2vw, 1.75rem);
--text-lead:   clamp(1.125rem, 1.4vw, 1.375rem);
--text-body:   1rem;          /* 16px min, line-height 1.6 */
--text-small:  0.875rem;
--text-label:  0.75rem;       /* mono, uppercase, tracking 0.08em */
```

Headlines: FK Grotesk 600, tracking −0.015em, line-height 1.04.
Measure: body text max `68ch`.

### Eyebrow pattern
`[01] // WHAT WE RUN`: mono, label size, `fg-dim`, with the index in lime.

---

## 4. Space, grid, shape

- Base unit 4px. Spacing tokens `--space-1 … --space-32` (4 → 128px).
- Section padding: `clamp(4rem, 10vw, 9rem)` vertical.
- Container: 12 columns, max 1440px, gutters `clamp(1rem, 3vw, 2rem)`, side margin 16px minimum on mobile.
- **Background grid:** a 64px CSS grid of `--color-line` at 40% opacity, masked with a radial fade. It's pure CSS and every section shares it.
- Radii: `--radius-0: 0` (default for panels and tables), `--radius-sm: 6px` (buttons, inputs), `--radius-md: 14px` (trading cards), `--radius-pill: 999px` (tags).
- Borders do the work of shadows. 1px `--color-line`; on hover, `--color-line-hi`; when active, lime.
- Corner ticks: panels can carry 8px L-shaped corner marks (`::before/::after`). That's the signature detail.

### Z-index tokens
`--z-base 0 · --z-raised 10 · --z-sticky 40 · --z-nav 50 · --z-hud 60 · --z-overlay 80 · --z-terminal 90 · --z-toast 100 · --z-boot 110`

---

## 5. Components (public)

| Component | Anatomy | Notes |
|---|---|---|
| `Button` | Primary: lime fill, `lime-ink` text, mono label, 48px tall, `radius-sm`. Secondary: 1px line border, fg text. Ghost: text + arrow. | Primary is magnetic on `full`. Label = verb + object ("See upcoming events"). |
| `Panel` | Terminal chrome: top bar with 3 status dots (not mac traffic lights, use square LEDs), a file name in mono (`events.tsx`), and a body. | Used for stats, IDE tabs, terminal. |
| `Tag` | Mono, pill, 1px border in accent, accent text. | Department, format, stack. |
| `StatusPill` | LED dot + mono label: `UPCOMING` lime, `LIVE` red with pulse, `PAST` dim, `TBA` warn. | |
| `EventCartridge` | Card shaped like a game cartridge: notch top-right, label area with cover, mono meta strip (date / venue / format). | Events rail and grid. |
| `TradingCard` | 3:4, `radius-md`, department-coloured trim, photo, name, role, tier badge, rarity stars. Back: bio, fun stat, skills, socials. | See `ANIMATIONS.md#trading-cards`. |
| `LevelNode` | Pixel-font `LVL 03`, year, title; locked/unlocked states. | Timeline. |
| `DataRow` | Bordered row: index · title · meta · arrow. Hover inverts to `ink-700` with a lime left bar. | Wall of fame, blog index, archives. |
| `EmptyState` | Panel with a mono "`> no results`" line, one sentence on when it changes, one action. | |
| `Toast` (XP) | Pixel font, lime border, badge icon, "+50 XP". Bottom-left. | |
| `Kbd` | Mono key cap. | Shortcut hints ("Press ⌘K"). |

### Iconography
- Lucide icons at 1.5px stroke for UI.
- **Custom pixel icons** (16×16 grid, SVG) for badges and levels. They're drawn in-house, about 20 of them.
- No emoji in UI.

### Imagery
- Real E-Cell photos only. Grade them: slight contrast lift, −10% saturation. On hover they go to full colour.
- Duotone treatment (void + accent) for photos used as section backgrounds.
- Team portraits: cut-outs on department colour are preferred; otherwise, crop at the shoulders with `photo_focus`.
- Missing portrait: generated pixel-avatar from initials + department colour (deterministic), never a grey silhouette.

---

## 6. Motion tokens

```css
--dur-instant: 80ms;
--dur-fast:    160ms;
--dur-base:    280ms;
--dur-slow:    520ms;
--dur-epic:    1100ms;

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);     /* default */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-snap:   cubic-bezier(0.2, 1.4, 0.4, 1);    /* playful overshoot, game UI only */
--ease-linear: linear;                            /* marquees, scrubs */
```

Principles:
1. **Motion explains.** Every animation either shows hierarchy, shows cause and effect, or rewards an action.
2. **One hero per viewport.** If the WebGL is moving, the copy doesn't bounce.
3. **Fast in, slower out.** UI responds in ≤ 160ms. Reveals take 520ms.
4. **Never block.** Content is readable before animations finish. No scroll-jacking except on pinned set pieces, and those can always be scrolled past.
5. **Three tiers** (`full / lite / off`). See `ANIMATIONS.md`.

---

## 7. Sound (opt-in, off by default)

A tiny set of UI blips (≤ 6 files, ≤ 30KB total, `.webm` + `.mp3`): keypress (terminal), unlock (level/badge), card flip, error (wrong command), boot chime, coin (XP). Toggle lives in the XP drawer and in the terminal (`sound on`). Muted under `prefers-reduced-motion`.

---

## 8. Accessibility rules baked into the system

- Focus ring: 2px lime outline + 2px void offset, on everything.
- Body contrast ≥ 4.5:1; `fg-dim` is for labels ≥ 12px uppercase mono only.
- Hit targets ≥ 44×44px.
- Every decorative animation element gets `aria-hidden="true"`. Scramble text sets the final string in `aria-label` immediately.
- The custom cursor never replaces the system cursor on inputs or text.
- Pixel font is never used for anything longer than 24 characters.
