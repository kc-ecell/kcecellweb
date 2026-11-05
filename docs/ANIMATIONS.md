# Animations

The site is meant to feel unhinged in a good way, and it still has to load fast on a ₹12k Android phone. This file is the contract for every signature animation: what it does, how to build it, and what it does on each motion tier.

## 0. Motion tiers

| Tier | Who gets it | What runs |
|---|---|---|
| `full` | Capable desktop and modern phones | Everything: WebGL, Lenis, GSAP pins, cursor, page transitions |
| `lite` | Low memory/cores, Save-Data, no WebGL2, small touch screens | Motion + CSS only. No WebGL, no Lenis, no pinning. Reveals, flips, counters stay. |
| `off` | `prefers-reduced-motion`, or the user toggled motion off | No movement. Final states rendered. Opacity fades ≤ 160ms allowed. |

Implementation: `lib/motion/tier.ts` + `MotionProvider`. Components read `useMotionTier()`. GSAP code is wrapped in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)` so the OS setting wins even before hydration.

Testing: `?motion=full|lite|off`.

---

## 1. Boot sequence

**Where:** first page load per browser session (`sessionStorage['ecell:booted']`).
**Duration:** ≤ 1.8s. Skippable with any key, click, or tap. Never shown to crawlers (UA check) or on `off`.

**Storyboard**
1. Black screen. Mono lines type in fast (12ms/char) in the bottom-left:
   ```
   > booting ecell.os v26.10
   > mounting /founders ........ 500+ found
   > loading /events ........... 100+ ok
   > linking /partners ......... 20+ ok
   > status: ready to build_
   ```
   (Numbers pulled from the `stats` table at build time.)
2. The cursor blinks twice. The screen splits horizontally along the last line into two halves that slide up and down (clip-path), revealing the hero underneath.
3. The hero WebGL starts its morph exactly as the split opens.

**Build:** a server-rendered overlay (so no flash), animated with a GSAP timeline. It removes itself from the DOM after it finishes. LCP is measured on the hero headline **under** the overlay, so the overlay uses `opacity` and `clip-path` only, with no layout changes.

**lite:** step 1 at 2× speed, then a fade.  **off:** never shown.

---

## 2. WebGL hero: "Particle Founders"

**Concept:** about 6,000 particles drift as a noisy field (ideas). On load they converge into the **E-CELL** wordmark (structure). The cursor pushes particles away and they spring back. On scroll, the wordmark disperses upward like a launch exhaust while the page moves on.

**Build**
- `components/three/HeroScene.tsx` uses R3F `<Canvas dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: 'high-performance' }}>`.
- Target positions are sampled from an offscreen 2D canvas rendering "E-CELL" in FK Grotesk 900. Particles are a `THREE.Points` geometry with a custom `ShaderMaterial`.
- Vertex shader: `mix(noisePos, targetPos, uProgress)` + curl noise + cursor repulsion (`uMouse`, radius 0.25, falloff smoothstep) + `uScroll` dispersal.
- Fragment shader: round soft point. Colour is lime for about 8% of particles (seeded), `fg` at 70% for the rest.
- `uProgress` 0 → 1 over 1.6s `ease-out` after the boot split. `uScroll` is bound to ScrollTrigger progress of the hero (scrub).
- Pauses with `frameloop="demand"` when off-screen (IntersectionObserver) or the tab is hidden.
- Mobile: 2,500 particles. Touch drag stands in for the cursor.

**Loading:** `next/dynamic` with `ssr: false`, mounted in `requestIdleCallback` after LCP. Before then, and on `lite`/`off`, a **static poster** (`/hero-poster.webp`, a pre-rendered frame of the formed wordmark, ≈ 40KB) is shown, and that poster is also the LCP image. On swap, the canvas fades in over the poster within 280ms.

**Fallback:** if the WebGL context is lost or init throws → keep the poster, log to Sentry, drop to tier `lite` for the session.

---

## 3. Scramble / decode text

**Where:** every page masthead H1, section eyebrows on first reveal, terminal output, stat labels.
**Effect:** characters cycle through `!<>-_\/[]{}—=+*^?#01` and resolve left to right (~28ms per char, 3–6 cycles each).
**Build:** `components/motion/ScrambleText.tsx`, a small custom rAF loop (≈ 1KB, no dependency). The real string is **server-rendered as the visible text** and sits in `aria-label` and an SR-only span from the first render; the scramble only overwrites already-painted text after hydration. The element has a fixed width from a hidden ghost copy, so there's zero layout shift.

**Perf rule (per `AGENTS.md` Rule 0):** scramble text must **never be the LCP element** and must never delay first paint. On the home hero the LCP element is the static poster (§2); on inner pages the masthead H1 paints its final string server-side, and the scramble is a post-paint enhancement on `full`/`lite` only.
**lite:** runs. **off:** final text immediately.

---

## 4. Startup-stage scroll progress

A thin bar fixed at the top under the nav, split into five labelled segments: `IDEA · VALIDATE · BUILD · LAUNCH · SCALE`. It fills with lime as you scroll the page. When a segment completes, its label flips to pixel font with a blip and the bar pulses once.

Bound to `document` scroll progress (ScrollTrigger on `full`, a passive scroll listener with rAF on `lite`). On `off` it's a static bar that still fills, with no pulse. It also fires XP: reaching SCALE on any page for the first time awards the `Scaled` badge.

---

## 5. Stats odometer + live readout

Four stats in `Panel`s titled `stats.json`. Each number rolls like an odometer (per-digit vertical strips, translateY) from 0 to its value when it enters the viewport. Each panel then shows a tiny "live" sparkline that draws in, which is decorative, and a mono footer: `src: <source> · verified <month year>`.

The server renders the final values. JS only animates from 0 to them, so no-JS and `off` both show the real numbers.

---

## 6. "What we do" IDE tabs

A big `Panel` styled as an editor with tabs `hackathons.ts`, `workshops.ts`, `mentorship.ts`, `competitions.ts`. Switching tabs:
- The tab underline slides (Motion `layoutId`).
- The editor content types in as syntax-highlighted pseudo-code that's actually the description, e.g.
  ```ts
  export const hackathons = {
    flagship: "Singularity",
    format: "24h, teams of 2–4",
    youGet: ["mentors", "prizes", "a demo on stage"],
  }
  ```
- Line numbers count up and a fake cursor follows the typing.
- Auto-advances every 6s until the user interacts. Pauses on hover/focus.

Keyboard: arrow keys between tabs (ARIA tabs pattern). **off:** content shown instantly.

---

## 7. Pinned event rail

Desktop, `full`: the section pins and vertical scroll drives horizontal movement through upcoming events, rendered as `EventCartridge`s. Each cartridge tilts slightly toward the centre based on its x-position (perspective 1200px) and scales to 1.04 at the centre. The section title counts `01 / 04` as you pass each one.

`lite` and mobile: native horizontal scroll with `scroll-snap-type: x mandatory`. `off`: same as lite.

If there are no upcoming events, the rail is replaced by an `EmptyState` that points at past events.

---

## 8. Level-map timeline

Used as a 4-node teaser on Home and the full 9-node map on About.

- An SVG path snakes down the page (desktop) or straight down (mobile). It draws itself with `DrawSVG`/`stroke-dashoffset` scrubbed to scroll.
- Each milestone is a `LevelNode` (`LVL 01 · 2016`). It's locked (dim, pixel padlock) until the path reaches it, then **unlocks**: the padlock bursts into 8 pixel squares, the node flips to lime, the card slides out with its title and description, and an optional blip plays.
- The final node (2026: Singularity) is a "boss level" with a slow pulsing border and a link to the Singularity event page.

`off`: the path is fully drawn and every node is unlocked, as a static list.

---

## 9. Trading cards (team)

- **Idle:** 3D tilt following the pointer (max 10°), with a holographic sheen overlay (CSS `conic-gradient` + `mix-blend-mode: color-dodge`, position tracked from the pointer). The sheen is the only gradient allowed outside WebGL.
- **Click / Enter / Space:** flips 180° (Motion, `--ease-snap`, 520ms) to the back: bio, fun stat, skills tags, socials.
- **Rarity:** leadership cards get a gold-foil rare sheen; heads get stars ★★★, co-heads ★★. This is purely cosmetic and fun.
- **Home "deck":** 7 cards fanned like a poker hand; hovering a card raises it. Dragging lets you throw cards and they spring back (Motion drag + spring).
- **Grid entrance on /team:** cards deal in from a stack, staggered 40ms.

A11y: each card is a `button` with `aria-pressed` for the flipped state. Back content is in the DOM (not `display:none`) and announced on flip. `off`: no tilt or sheen, and flipping is an instant swap.

---

## 10. Gallery

- Home strip: horizontal drag with inertia (Motion `drag="x"` + `dragTransition` power 0.2). Photos go from greyscale to colour on hover.
- Album page: masonry (CSS columns), images reveal with a pixelated-to-sharp effect (CSS `image-rendering: pixelated` on a tiny blurred placeholder, cross-faded into the full image). That ties in with the game theme.
- Lightbox: shared-element transition (Motion `layoutId`) from thumbnail to fullscreen. Swipe, arrow keys, Esc.

---

## 11. Page transitions

- Uses the View Transitions API where supported (Chrome/Edge/Safari 18+), via Next's `unstable_ViewTransition` or a small `startViewTransition` router wrapper.
- Effect: a lime scanline wipes top to bottom (~360ms) while the old page fades to 0 and the new masthead H1 scrambles in.
- Shared element: event cartridge → event masthead cover; trading card → nothing (team has no detail pages in v1).
- Fallback (Firefox): Motion `AnimatePresence` fade of 200ms.
- `off`: none.

---

## 12. Magnetic buttons and custom cursor

- Primary buttons pull up to 8px toward the pointer within a 60px radius.
- Custom cursor (desktop `full` only): a 10px lime square that becomes a bracket `[ ]` around interactive elements and shows a mono label on special targets (`drag`, `flip`, `open`). The system cursor stays visible over inputs and text.

---

## 13. Marquee ticker

A stock-ticker style band between Hero and Stats:
`SIH 2025 WINNER ▲  NEC IIT-B 2ND PLACE (2018) ▲  500+ MEMBERS ▲  100+ EVENTS ▲  SINGULARITY 2026 ▲ …`
Constant velocity CSS animation (`--ease-linear`), duplicated content with `aria-hidden`, pauses on hover. Scroll velocity skews it slightly (`full` only). `off`: static and wraps.

---

## 14. Footer wordmark

Cut. The footer leads with a static statement instead (`PAGES.md` Footer). Its headline and `©26` use `Reveal`; there is no reactive wordmark.

---

## 15. Micro-interactions

| Element | Interaction |
|---|---|
| Nav links | Text scrambles on hover (fast, 6 chars max) |
| Data rows | Lime left bar grows from 0 to 4px, row shifts 6px right |
| Tags | Border brightens, slight lift |
| Copy email | Click copies, button text changes to `copied ✓` and plays a coin blip, +5 XP the first time |
| Form submit | Button turns into a progress "compile" bar, then `✓ sent` |
| Logo | Hover glitches (RGB split via 3 stacked copies, 120ms). The 7-click easter egg lives here. |

---

## 16. Performance rules for all animations

- Animate only `transform`, `opacity`, `clip-path`, and `filter` (sparingly). Never animate width, height, top, or left.
- `will-change` only while animating, removed after.
- Every ScrollTrigger is created inside `useGSAP()` with a scoped context and is killed on unmount.
- No animation loop runs off-screen. Use IntersectionObserver to pause it.
- Total main-thread animation work < 4ms per frame on a mid laptop (check with the Performance panel).
- Lighthouse CI must still pass (`ARCHITECTURE.md#10-performance-budget`).
