# Contributing

## 1. Setup

Requirements: Node 20 LTS+, npm 10+, Docker (for local Supabase), Git.

```bash
git clone <repo> && cd <repo>
npm install
cp .env.example .env.local
npx supabase start && npx supabase db reset
npm run dev
```

## 2. Branches and commits

- `main` is production. It's protected and needs 1 review plus green CI.
- Branch names: `feat/<area>-<thing>`, `fix/<thing>`, `chore/<thing>`, `docs/<thing>`. Example: `feat/home-event-rail`.
- Conventional Commits: `feat(events): pinned rail on home`, `fix(terminal): history on mobile`.
- One task from `IMPLEMENTATION_PLAN.md` per PR where possible. Keep PRs under ~400 changed lines (excluding generated files).

## 3. Code conventions

- TypeScript strict. No `any`; use `unknown` + Zod at boundaries.
- Server Components by default. Client components go in files with `"use client"` at the top and stay as small as possible ("islands").
- File names: `PascalCase.tsx` for components, `kebab-case.ts` for libs.
- Data access only in `lib/data/*` (reads) and `lib/actions/*` (writes). Components never call Supabase directly, except the terminal OTP flow, which calls server actions anyway.
- Styling: Tailwind utilities + tokens. No inline hex. `cn()` for conditional classes.
- Motion: always through `components/motion/*` primitives or `useGSAP` with a scope. Always handle all three tiers.
- Imports: `@/` alias, grouped (react/next → external → internal → relative → styles).
- Tests: unit tests for `lib/game/*`, `lib/schemas/*`, terminal command parser; e2e for contact form, secret login (with a test OTP via Supabase local Inbucket), `/admin` 404, events filter.

## 4. PR template

```md
## What
<one or two lines>

## Plan task
IMPLEMENTATION_PLAN.md › Phase X › X.Y

## Checks
- [ ] Matches PAGES/ADMIN/ANIMATIONS spec (or spec updated here)
- [ ] 375 / 768 / 1280 / 1920 checked
- [ ] Motion tiers full / lite / off checked
- [ ] Keyboard-only + focus visible
- [ ] Empty + loading states
- [ ] No hardcoded colours/sizes; no em-dash marketing filler; no banned words
- [ ] No /admin reference in public UI
- [ ] lint, typecheck, test, build (incl. check:devtools) pass
- [ ] New dependency? Why: …

## Screenshots / recording
```

## 5. Dev tools

### Agentation (dev-only, **not set up yet**)

[Agentation](https://www.npmjs.com/package/agentation) is a visual feedback toolbar. In dev you can click elements on the page and leave annotations that an AI coding agent (Claude Code, Cursor, etc.) reads, which makes UI iteration much faster.

**Status:** not installed. The team will add it when ready. These are the rules for when it is.

**Hard rule:** it must never reach the deployed website.

#### How to add it (when the team decides)

1. Install it as a **devDependency** only:
   ```bash
   npm install agentation -D
   ```
2. Create `components/dev/DevTools.tsx`. This is the **only** file allowed to import it:
   ```tsx
   'use client'
   import dynamic from 'next/dynamic'

   const Agentation = dynamic(
     () => import('agentation').then((m) => m.Agentation),
     { ssr: false },
   )

   export function DevTools() {
     if (process.env.NODE_ENV !== 'development') return null
     return <Agentation endpoint={process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT} />
   }
   ```
   Omit `endpoint` (leave the env var unset) for copy-paste mode with no server.
3. Render it last inside `<body>` in `app/layout.tsx`, behind the same check:
   ```tsx
   {process.env.NODE_ENV === 'development' && <DevTools />}
   ```
   Next.js inlines `NODE_ENV` at build time, so in production the branch is dead code and the import is tree-shaken.
4. Optional: live sync with an AI agent via MCP:
   ```bash
   npx -y agentation-mcp server               # serves http://localhost:4747
   claude mcp add agentation -- npx -y agentation-mcp server
   # .env.local
   NEXT_PUBLIC_AGENTATION_ENDPOINT=http://localhost:4747
   ```
   Check with `npx agentation-mcp doctor`.

#### Guards that keep it out of production (these already exist from Phase 0)

- **ESLint** `no-restricted-imports`: importing `agentation` anywhere except `components/dev/**` is an error.
- **Build check** `scripts/check-devtools.mjs`, run automatically after `next build`:
  ```js
  // fails the build if any dev-only tool leaked into client bundles
  import { readdir, readFile } from 'node:fs/promises'
  import { join } from 'node:path'
  const BANNED = ['agentation', 'agentation-mcp']
  async function* walk(d) { for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (p.endsWith('.js')) yield p } }
  let leaks = []
  for await (const f of walk('.next/static')) {
    const src = await readFile(f, 'utf8')
    for (const b of BANNED) if (src.includes(b)) leaks.push(`${b} → ${f}`)
  }
  if (leaks.length) { console.error('Dev tools leaked into production bundle:\n' + leaks.join('\n')); process.exit(1) }
  console.log('check:devtools ✓ no dev tools in production bundle')
  ```
  `package.json`: `"build": "next build && node scripts/check-devtools.mjs"`.
- **CSP** in production has no `connect-src` for `localhost:4747`, so even a leak couldn't sync.
- **Never** set `NEXT_PUBLIC_AGENTATION_ENDPOINT` in Vercel.

### Other dev-only helpers
- `/dev/kit`: component gallery (route excluded in production via `notFound()` when `NODE_ENV !== 'development'`).
- Motion tier overlay: shows the current tier in a corner in dev.
- `?motion=full|lite|off` works in every environment, which is intentional for QA.

## 6. Working with AI agents

- Agents read `AGENTS.md` (`CLAUDE.md` is a generated copy, synced by the pre-commit hook — edit `AGENTS.md` only) first. Keep it short and current.
- Give agents one plan task at a time and point at the spec section.
- Review agent PRs like any other PR. Agents don't get to skip the checklist.
