# Member accounts: implementation plan

Visitors sign in through the terminal to save their settings and track their progress across devices.

**Status: not started. Blocked on step 0 (the website needs its own Supabase project).** Nothing in this plan has been applied to any database.

## Decisions already made

| Question | Decision |
|---|---|
| How visitors sign in | Terminal only, with an email code. No visible login button anywhere. |
| What gets saved | XP and badges, settings, saved events, personal progress. |
| Where data lives | A new Supabase project for the website (see step 0). |
| Staff login | Unchanged. `sudo login` stays separate from visitor `login`. |

## Step 0: fix the database first

### Do not use the current keys

The Supabase keys in the current local `.env.local` belong to a different live app, not to this website. Never run `supabase db push`, `db reset` or `seed.sql` with them. Its schema collides with `0001_init.sql`, and its signup rules would block visitor sign-in anyway.

Before writing to any Supabase project, list what's already in it.

### Set up the new project

1. Create a new project at supabase.com, in the region closest to Mumbai.
2. Put its URL, anon key and service role key in `.env.local`, replacing the current values. Keep `IP_HASH_SALT`.
3. Run these, checking the dry run first:

   ```bash
   npx supabase link --project-ref <new-ref>
   npx supabase migration list --linked   # all local, nothing remote
   npx supabase db push --linked --dry-run
   npx supabase db push --linked
   psql "$DATABASE_URL" < supabase/seed.sql   # staging only, see docs/DEPLOYMENT.md
   ```

4. Generate types with `npm run db:types`. The script uses `--local`, so for a remote project run `npx supabase gen types typescript --linked > lib/supabase/types.ts`.
5. Insert your owner row manually, as `docs/DATABASE.md` §7 describes.

**Done when:** `/team` and `/events` show seeded data, and `sudo login` reaches `/admin`.

### Auth settings on the new project

| Setting | Value | Why |
|---|---|---|
| Allow new users to sign up | **On** | Visitors need accounts. This reverses `SECRET_ADMIN_ACCESS.md`, see "Docs to update". |
| Email OTP length | 6 | Matches the terminal prompt. |
| Email OTP expiry | 600s | Same as staff. |
| Custom SMTP | Resend | Supabase's built-in email has a very low hourly limit and won't survive real visitors. Check the current limit in the dashboard. |
| `before_user_created` hook | None | A signup hook would block visitors. |

## Why signup can be on safely

Audited against `supabase/migrations/`:

- Staff access depends on `is_staff()` and `has_role()`, which need a row in `profiles`. A visitor has no row, so they get nothing.
- No policy uses `authenticated`, `auth.role()` or `auth.uid() is not null`. The only `authenticated` reference is a `revoke`.
- Storage writes are staff-only.
- `proxy.ts` checks `profiles`, so a visitor session still gets the real 404 on `/admin`.

Any future policy must keep this true. **"Signed in" no longer means "staff".**

## Step 1: migration `supabase/migrations/0005_member_data.sql`

```sql
-- Visitor data. Each row is readable and writable only by its owner.

-- Whole FounderState (lib/game/types.ts). XP is self-reported and there is no
-- leaderboard, so it is stored as one document, not trusted as a score.
create table member_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  founder    jsonb not null check (pg_column_size(founder) < 32768),
  updated_at timestamptz not null default now()
);
create trigger trg_member_state_updated before update on member_state
  for each row execute function set_updated_at();

create table member_saved_events (
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_id   uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table member_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind    text not null check (kind in ('page', 'event_attended')),
  ref     text not null check (char_length(ref) <= 120),
  done_at timestamptz not null default now(),
  primary key (user_id, kind, ref)
);

do $$
declare t text;
begin
  foreach t in array array['member_state','member_saved_events','member_progress']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy owner_all on %I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()));', t);
  end loop;
end $$;
```

Also add `supabase/migrations/down/0005_member_data.sql` dropping the three tables. `docs/DEPLOYMENT.md` requires a down script for every migration, and the `down/` folder doesn't exist yet.

Check the trigger name `set_updated_at` against `0001_init.sql`, and confirm that function is usable here before pushing.

**Done when:** a two-user test proves user A can't read or write user B's rows through the anon key.

## Step 2: server actions, `lib/actions/member.ts`

Keep these apart from `lib/actions/auth.ts`. Staff `verifyOtp` signs out anyone who isn't staff, so reusing it would break visitors.

| Action | Notes |
|---|---|
| `requestMemberCode(email)` | Zod-validate, then `signInWithOtp` with `shouldCreateUser: true`. Same response and minimum delay every time, like `requestOtp`. |
| `verifyMemberCode(email, code)` | `verifyOtp` with the server client, which sets the session cookie. Returns `{ ok }`. |
| `signOutMember()` | Ends the session. |
| `getMemberSnapshot()` | Returns email, `founder`, saved events and progress, or `null`. |
| `saveFounderState(state)` | Zod-validate against `FounderState`, then upsert. |
| `saveEvent(slug)` / `unsaveEvent(slug)` | Look up by slug. Published events only, which RLS already enforces. |
| `markProgress(kind, ref)` / `unmarkProgress(kind, ref)` | |
| `deleteMemberAccount()` | Calls `auth.admin.deleteUser` through `lib/supabase/admin.ts`. The foreign keys cascade. |

Add `requireMember()` in `lib/auth/member.ts`, mirroring `requireStaff()`. Every action except the first two starts with it.

Rule 6 applies with one change: (a) verifies the member session instead of the staff session. Skip `revalidateTag`, because this data is per-user and never cached.

**Rate limits are required before real visitors use this.** `requestOtp` doesn't implement the Upstash limits or Turnstile yet, and this action creates accounts and sends email to any address. Use the limits from `SECRET_ADMIN_ACCESS.md` (IP 5/hour, email 3/hour). Both need `UPSTASH_*` and Turnstile keys, which aren't set.

## Step 3: sync the game state

**Keep localStorage as the source of truth for the page.** The game stays instant and works signed out. The server is a backup that follows the visitor.

Add `lib/game/merge.ts`, a pure function:

| Field | Rule on sign-in |
|---|---|
| `xp` | Higher of the two |
| `awarded`, `badges` | Union |
| `counters` | Higher value per key |
| `prefs` | Server wins, because those are the saved settings |
| `firstSeen` | Earlier of the two |

Add `lib/game/sync.ts`:

- After sign-in, fetch the snapshot, merge, store locally, then push the merged state back.
- On change, debounce `saveFounderState` by about 2 seconds and flush on `pagehide`.
- On sign-out, reset local state. People use shared college lab computers.
- If a save fails, retry on the next change. Never interrupt the visitor.

### Keep public pages static

Public pages use `"use cache"` and partial prerendering, so **never read cookies or the session while rendering them**, or they all become dynamic. Everything member-related loads on the client, after hydration.

Store a flag, `ecell:member:v1`, in localStorage at sign-in. Only call `getMemberSnapshot()` on load when that flag exists, so anonymous visitors make no extra server calls.

`proxy.ts` only matches `/admin`, so it won't refresh visitor sessions. The Server Actions refresh them through `createServerSupabase()`. Test that a session survives past the access token's expiry. If it doesn't, widen the approach without running `getUser()` on every public request.

## Step 4: terminal commands

Add to `PUBLIC_COMMANDS` and `help` in `components/terminal/Terminal.tsx`.

| Command | Does |
|---|---|
| `login` | Asks for email, then the code. Reuses the `loginStep` machine, with a `mode` of `member` or `staff`. |
| `logout` | Signs out and resets local state. |
| `whoami` | Add the signed-in email and last sync time. |
| `save <event>` / `unsave <event>` | Save by slug, with tab completion. |
| `saved` | Lists saved events, upcoming first. |
| `progress` | Shows the checklist and percent complete. |
| `done <event>` | Marks an event attended. |
| `delete account` | Asks the visitor to type `delete` to confirm. |

- Signed-out visitors using `save` or `progress` get: `type 'login' to keep this across devices.` Saved events need an account. Nothing else in the game does (`GAMIFICATION.md`: it never gates content).
- The prompt changes from `guest@ecell:~$` to the part of the email before the `@`. Keep it in the header too.
- Never write the email or code to history. The current login flow already avoids this.
- Keep the message identical whether or not the address already has an account.

Mark pages automatically: the existing `award()` calls for exploring pages also write `member_progress` when signed in.

## Step 5: show what's tracked

- `components/game/FounderDrawer.tsx`: add a "saved events" list and a progress section. When signed out, show one line: `open the terminal and type login to keep this on every device`. It's text, not a button or link, so it stays inside rule 1.
- Event cards: don't add a save button in this version. Saving stays in the terminal.

Every new list needs a designed empty state and a loading state.

## Docs to update in the same PR

| File | Change |
|---|---|
| `docs/PRD.md` §3 | Remove "Public user accounts, member login" from non-goals. Keep leaderboards there. |
| `docs/PRD.md` privacy row | "XP stored only in localStorage" is no longer true for signed-in visitors. |
| `docs/ROADMAP.md` | Move member accounts into scope. Update the Google-sign-in note. |
| `docs/GAMIFICATION.md` | Replace "No server sync in v1". Keep "never asks for an account" for the game itself. |
| `docs/SECRET_ADMIN_ACCESS.md` | Change "Disable Allow new users to sign up", and add the rule that signed in doesn't mean staff. |
| `docs/DATABASE.md` | Add the three tables. |
| `docs/DEPLOYMENT.md` | Add the auth settings and Resend SMTP. |
| `AGENTS.md` | Rule 1 stays, but clarify visitor `login` is terminal-only too. Add this doc to the table in §2. Edit `AGENTS.md` only, `CLAUDE.md` follows on commit. |

A privacy notice is also needed, because the site will store emails and activity. There's no privacy page today. Write it before launch and link it from the footer. Have the faculty coordinator or the college confirm what's required.

## Tests

`package.json` has no `test` script, although `AGENTS.md` expects `npm run test`. Add one with Node's built-in test runner, which needs no new dependency.

- **Unit:** `mergeFounderState`, including an empty side, conflicting prefs and a duplicate badge.
- **RLS:** user A can't read, change or delete user B's rows.
- **Security:** a visitor session gets a 404 on `/admin` and `/admin/stats`, and a failed `requireStaff()` in every admin action.
- **End to end:** sign in on browser 1, earn XP, save an event. Sign in on browser 2 and see both. Sign out, and the local state is gone.
- **Regression:** `sudo login` still works, and a staff email using `login` doesn't lose access.
- **Static check:** `npm run build` still shows the public routes as static or partial prerender. Any route turning fully dynamic is a bug.
- **Definition of done:** the usual checks in `AGENTS.md` §5, on all three motion tiers.

## Build order

| # | Task | Needs |
|---|---|---|
| 0 | New project, migrate, seed, auth settings | You |
| 1 | Migration 0005 and the RLS test | 0 |
| 2 | Server actions, `requireMember` | 1 |
| 3 | Rate limits, Turnstile, Resend | Upstash, Turnstile and Resend keys |
| 4 | Merge and sync, with tests | 2 |
| 5 | Terminal commands | 2, 4 |
| 6 | Drawer UI | 5 |
| 7 | Docs and privacy notice | Alongside the above |

Step 3 has to finish before real visitors get `login`. Local testing can continue without it.

## Open questions

- **Google sign-in:** the roadmap suggested it for students, and it's a stronger fit if most users have `@kccemsr.edu.in` accounts. This plan uses email codes because you chose them for the terminal. Adding Google later is a small change.
- **Attendance:** `done <event>` is self-reported. That's fine for personal tracking, but it must not count as proof of attendance anywhere.
- **Retention:** decide how long inactive accounts are kept, for the privacy notice.

## Other cleanup found along the way

- **Mono font:** `public/fonts/ibm-plex-mono-*.woff2` are 4KB subsets with only a few glyphs. The terminal falls back to the system mono font. Replace them with full files.
- **Local dev:** port 3000 is in use by another project, so this site currently runs on 3001, and `NEXT_PUBLIC_SITE_URL` in `.env.local` still says 3000.
- **Turbopack cache:** if `app/globals.css` changes don't appear in dev, stop the server and delete `.next/dev/cache/turbopack`.
