# Gamification: Founder XP, Terminal, Easter Eggs

The game layer rewards visitors for **exploring real E-Cell content**. It never gates content, never asks for an account, and can be switched off with one click.

---

## 1. Founder XP

### Levels (named after startup stages)
| Level | Name | XP needed | Unlock flavour |
|---|---|---|---|
| 1 | Idea | 0 | "Everyone starts with a napkin." |
| 2 | Validate | 100 | "Someone else thinks it's a good idea too." |
| 3 | MVP | 250 | "It's ugly. It works." |
| 4 | Launch | 500 | "Shipped." |
| 5 | Scale | 900 | "Now do it again, bigger." |
| 6 | Unicorn | 1500 | "Okay, show-off." Unlocks the lime-to-holo HUD skin. |

### XP sources
Each source is awarded **once per key** (deduped), so refreshing doesn't farm XP.

| Event key | XP | Trigger |
|---|---|---|
| `visit:<route>` | 20 | First visit to each public route (index pages + each detail page counts separately, detail pages capped at 10 awards) |
| `event:open:<slug>` | 15 | Open an event detail page |
| `event:register:<slug>` | 40 | Click a registration link |
| `post:read:<slug>` | 40 | Reach 90% scroll depth on a post with ≥ 20s on page |
| `card:flip:<id>` | 5 | Flip a team card (cap 20 cards) |
| `gallery:album:<slug>` | 15 | Open an album |
| `timeline:complete` | 60 | Unlock all timeline nodes on About |
| `stage:scale` | 30 | Reach SCALE on the progress bar on any page |
| `terminal:open` | 25 | Open the terminal for the first time |
| `terminal:cmd:<name>` | 10 | First use of each public command (cap 10) |
| `egg:<id>` | 100–150 | Find an easter egg (see §4) |
| `game:404:<tier>` | 50 / 100 | Score ≥ 500 / ≥ 2000 in Pivot or Perish |
| `contact:sent` | 50 | Submit the contact form |
| `email:copy` | 5 | Copy the E-Cell email |

### Badges
16 badges, each with a 16×16 pixel icon.

| ID | Name | How |
|---|---|---|
| `first-steps` | First Steps | Earn any XP |
| `explorer` | Explorer | Visit all 8 top-level pages |
| `event-hunter` | Event Hunter | Open 5 event pages |
| `committed` | Committed | Click a registration link |
| `bookworm` | Bookworm | Read 3 posts |
| `card-collector` | Card Collector | Flip 10 team cards |
| `full-deck` | Full Deck | Flip every current-team card |
| `historian` | Historian | Complete the timeline |
| `scaled` | Scaled | Reach SCALE on the progress bar |
| `root` | Root Access | Open the terminal |
| `power-user` | Power User | Use 8 different terminal commands |
| `konami` | ↑↑↓↓←→←→BA | Konami code |
| `glitch` | Glitch in the Matrix | 7-click logo egg |
| `pivot-master` | Pivot Master | 2000+ in the 404 game |
| `say-hi` | Said Hi | Send the contact form |
| `unicorn` | Unicorn | Reach level 6 |

### UI
- **HUD** (bottom-left, `--z-hud`): a compact pill `LVL 2 · VALIDATE ▰▰▰▱▱ 160 XP`. Click opens the drawer. It's hidden for the first 3 seconds of a first visit and while the boot sequence plays.
- **Toast:** pixel font, slides up from the HUD: `+40 XP · Bookworm unlocked`. Max one every 4s, queued, max 3 queued (extras are merged into "+N more").
- **Level up:** a full-width 1.2s banner across the top under the progress bar, `LEVEL UP → MVP`, pixel confetti (≤ 40 DOM squares, CSS). On `off`: just the toast.
- **Drawer** (`/` → HUD click or terminal `xp`): level card, XP bar, badge grid (locked badges show a silhouette + hint), and toggles: **Game mode** (on/off), **Motion** (auto/lite/off), **Sound** (off/on), plus "Reset progress".
- **Game mode off:** hides the HUD, toasts and banners, and stops awarding XP. Easter eggs still *work* (they're fun) but stay silent. This preference persists.

### Storage
```ts
// localStorage key: 'ecell:founder:v1'
type FounderState = {
  v: 1
  xp: number
  awarded: string[]          // event keys already counted
  badges: string[]
  counters: Record<string, number> // e.g. { 'card:flip': 7 }
  prefs: { game: boolean; motion: 'auto' | 'lite' | 'off'; sound: boolean }
  firstSeen: string          // ISO
}
```
- Validated with Zod on read. If it's invalid, back it up to `ecell:founder:corrupt` and reset.
- Wrapped in try/catch. If storage is unavailable (private mode), keep the state in memory only.
- No server sync in v1. A leaderboard is a v2 idea (`ROADMAP.md`).

### Engine API
```ts
// lib/game/engine.ts
award(key: string, opts?: { xp?: number; counter?: string }): void
useFounder(): { state, level, nextLevelAt, award, setPref, reset }
// Badge rules are pure functions of state: (s) => boolean, re-evaluated after each award
```
Analytics: `track('badge_earned', { id })` and `track('level_up', { level })` (no personal data).

---

## 2. Terminal: `ecell.sh`

A fake shell that's actually a navigation tool, a fact sheet, and the secret door to admin.

### Opening it
| Trigger | Device |
|---|---|
| `Ctrl/⌘ + K` or `` ` `` (backtick) | Keyboard |
| Clicking the blinking `_` cursor at the end of the footer line `© E-Cell KCCEMSR_` | Any |
| Long-press the nav logo for 1.5s | Touch |
| Typing `help` anywhere on the page (not in an input) | Keyboard |

A small `Kbd` hint "Press ⌘K" appears once in the hero's meta row. That's the only public hint.

### Look
A `Panel` titled `guest@ecell:~$` that drops down from the top (Quake-console style) over 280ms, 60vh tall on desktop and full-screen on mobile. The input is a real `<input>` with an `aria-label`, and output is a `role="log"` with `aria-live="polite"`. Tab-completion, ↑/↓ history (sessionStorage), and Esc to close.

### Public commands (listed by `help`)
| Command | Output / action |
|---|---|
| `help` | Lists commands |
| `whoami` | `guest · level 2 (validate) · 160 xp` |
| `about` | 3-line E-Cell summary + link |
| `ls` | Lists routes as directories (`events/ team/ gallery/ …`) |
| `cd <page>` | Navigates (`cd events`) |
| `events` | Next 3 upcoming events with dates; `events --past` for last 5 |
| `team [dept]` | Leadership names; `team technical` lists the dept |
| `stats` | The 4 stats with sources |
| `fame` | Achievement highlights |
| `socials` | Links |
| `contact` | Email + opens /contact |
| `xp` | Opens the XP drawer |
| `game on\|off`, `motion auto\|lite\|off`, `sound on\|off` | Prefs |
| `clear` | Clears output |
| `exit` | Closes |

### Hidden commands (not in `help`)
| Command | Effect |
|---|---|
| `sudo login` | Starts the **secret admin login** (see `SECRET_ADMIN_ACCESS.md`) |
| `sudo <anything else>` | `guest is not in the sudoers file. This incident will be reported.` (+ `egg:sudo`, 100 XP) |
| `matrix` | Green code rain over the page for 6s (canvas) |
| `hire me` | Prints the "join E-Cell" message + contact route |
| `pitch` | Prints a random 1-line startup idea generator ("Uber for ___ but on the blockchain") |
| `coffee` | `418 I'm a teapot` |
| `rm -rf /` | Fake panic: screen "crashes" (glitch + BSOD-style panel), then `just kidding. nice try.` |
| `singularity` | Wormhole shader transition to the Singularity event page |
| `credits` | Scrolls the Web Dev team credits |

Unknown command: `command not found: <x>. try 'help'.` plus an error blip.

---

## 3. Pivot or Perish (404 game)

An endless runner on the 404 page. You're a small pixel founder running through a market. Jump (space/tap) over obstacles labelled `NO PMF`, `BURN RATE`, `COMPETITOR`, `VISA DELAY`. Collect coins labelled `FUNDING`. Speed ramps up. Each time you crash: `PIVOT? (press space)`.

- Canvas 2D, ≤ 15KB JS, loaded only on the 404 route.
- High score in localStorage.
- Copy above it: `404 · this page pivoted out of existence.` Links: Home, Events, Contact.
- `off` tier: the game doesn't autostart. The "Play" button is still available (the user opted in).
- Keyboard and touch. Pauses on blur.

---

## 4. Easter eggs

| ID | How to find | Reward |
|---|---|---|
| `konami` | ↑↑↓↓←→←→BA anywhere | 150 XP; the page flips to an 8-bit palette for 10s and the WebGL particles turn into pixel squares |
| `glitch` | Click the nav logo 7 times within 3s | 100 XP; RGB-split glitch, then the logo turns into a tiny rocket that flies off and comes back |
| `sudo` | Any `sudo` command except `sudo login` | 100 XP |
| `console` | Open devtools: the console prints ASCII art of the E-Cell logo + `we're hiring builders. type ecell.join() here.`; calling `ecell.join()` | 100 XP + link to contact |
| `night-owl` | Visit between 00:00 and 04:00 local | 50 XP; footer reads "go to sleep. or ship something." |
| `idle` | Leave the home page idle for 60s | The particles slowly spell `STILL THERE?`, then return; 50 XP |
| `speedrun` | Reach the footer of Home within 5s of load | 50 XP · "speedrunner" toast |

Rules: eggs never block navigation, never trigger on `off` if they involve motion (they award silently instead), and never collect any data.

---

## 5. Guardrails

- Game UI never covers primary content or CTAs. The HUD avoids the bottom-right where cookie-less analytics and chat widgets usually sit.
- Every game element is reachable and dismissable by keyboard.
- Nothing game-related loads before LCP. `XPProvider` hydrates lazily.
- Copy stays kind. No mocking the visitor except in the obvious-joke commands.
- Total game-layer JS (excluding the 404 game) ≤ 25KB gz.
