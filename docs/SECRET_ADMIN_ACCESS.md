# Secret Admin Access

**Requirement:** visitors never see a login button. Admins get in through something only the team knows about, and the way in should feel like part of the site's personality.

**Principle:** the secret entry is **UX, not security**. Assume someone will eventually find it. Security comes from email OTP, an allowlist enforced by the database, RLS, rate limits, and Turnstile. Discovering the door changes nothing.

---

## 1. The ritual

1. Open the terminal (⌘K / backtick / pull the `>_` tab on the left edge / click the footer cursor / long-press the logo on mobile).
2. Type `sudo login` and press Enter. It doesn't appear in `help` or in tab-completion.
3. The terminal responds:
   ```
   [sudo] authentication required
   email: _
   ```
4. Enter your staff email. An invisible Turnstile check runs, then a server action is called.
5. The terminal **always** prints the same thing, whether or not the email is staff:
   ```
   > if this address has clearance, a 6-digit code is on its way.
   code: _
   ```
6. Enter the 6-digit code from the email (input masked as `● ● ● ● ● ●`, auto-submits on the 6th digit).
7. On success:
   - The terminal prints `ACCESS GRANTED` in pixel font, character by character.
   - The panel glitches, a lime scanline sweeps the whole screen, and the page "decompiles": the public UI breaks into grid tiles that flip to reveal the admin dashboard (~1.2s, `full` tier; a 200ms fade on `lite`/`off`).
   - Navigates to `/admin`.
8. On failure: `ACCESS DENIED` in red, a shake, and `attempts remaining: N`. After 5 failures: `locked. try again in 60 minutes.`

## 2. Backup door (first-class, not just for emergencies)

The terminal ritual is the **flavour** door. The backup door is the **reliability guarantee** and is treated as first-class — non-dev staff on an unfamiliar event-day phone will fumble `sudo login`, and `⌘K` / backtick collide with browsers and OSes.

Visit:
```
/admin?door=<ADMIN_BACKUP_DOOR_TOKEN>
```
This renders the same OTP UI as a full-screen standalone terminal. The token is a 32-char random env var. **Every active staff member (≤ cap) keeps this URL in their password manager**, not just the owner, and `/admin/help` documents *both* ways in (see `ADMIN_PANEL.md` §6). Without the correct token, `/admin` is a 404 as usual. Rotate the token each academic year.

Security is unchanged by having two doors: both end at the same OTP + allowlist + RLS + rate limits. The door is UX only (`§` principle above) — knowing the URL grants nothing without a staff OTP.

Whatever the entry path, the always-available affordances must keep working even if keybindings don't: the footer's blinking `_` cursor opens the terminal, and `Esc` closes it.

## 3. What the public can observe

| Surface | Contains admin hints? |
|---|---|
| Nav, footer, any page HTML | No |
| `sitemap.xml`, `robots.txt` | No (`/admin` is *not* listed in robots, because a Disallow line advertises it) |
| `/admin` without a session | Public 404 page (same markup as any unknown route) |
| JS bundle | The terminal chunk contains the string `sudo login`. That's acceptable, since it only leads to the OTP prompt. The admin bundle is a separate route chunk and is never loaded on public pages. |
| Response headers on `/admin/*` | `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store` |

## 4. Server flow

```
Terminal (client)
  │ requestOtp(email, turnstileToken)          ← Server Action, lib/actions/auth.ts
  ▼
1. verify Turnstile
2. ratelimit: ip 5/h, email 3/h (Upstash)       → on limit: same generic message, no OTP
3. normalise email (lowercase, trim)
4. lookup profiles (service role) where email = $1 and active
5. if found: supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
6. ALWAYS return { ok: true } after a constant ~600ms delay (timing-safe)

Terminal (client)
  │ verifyOtp(email, code)                      ← Server Action
  ▼
1. ratelimit: ip 10/h, email 5/h
2. supabase.auth.verifyOtp({ email, token: code, type: 'email' })   (server client, sets cookies)
3. re-check profiles.active + role               → else signOut() and return generic failure
4. return { ok: true }  → client plays animation → router.push('/admin')
```

Supabase settings (dashboard → Auth):
- **Disable** "Allow new users to sign up".
- Email OTP length 6, expiry 600s.
- Email template: custom, plain, branded. Subject `ecell.sh · your access code`, body `your code: 123456 · expires in 10 min · if you didn't request this, ignore it.` No magic link.
- Custom SMTP via Resend so mail comes from the E-Cell domain.

## 5. Gatekeeping `/admin`

`middleware.ts`
```ts
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }

export async function middleware(req: NextRequest) {
  const res = await updateSession(req)            // supabase ssr cookie refresh
  if (req.nextUrl.pathname.startsWith('/admin')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    res.headers.set('Cache-Control', 'private, no-store')
    const door = req.nextUrl.searchParams.get('door')
    const hasSession = /* sb-*-auth-token cookie present */
    if (!hasSession && door !== process.env.ADMIN_BACKUP_DOOR_TOKEN) {
      return NextResponse.rewrite(new URL('/__404', req.url), { status: 404 })
    }
  }
  return res
}
```
`app/admin/layout.tsx` (server) does the **real** check:
```ts
const staff = await getStaff()          // reads session + profiles row (active)
if (!staff && !isBackupDoor) notFound()
```
Every admin Server Action starts with `await requireStaff([...roles])`. RLS enforces the same thing at the database.

## 6. Session

- Supabase cookie session, `httpOnly`, `secure`, `sameSite=lax`.
- The admin session idles out after 12h (`refresh` disabled after that via a `last_seen` check in `getStaff()`).
- "Log out" in the admin user menu plays the reverse animation (admin → tiles → public home).
- Terminal command `sudo logout` also works when logged in. If a staff session exists, the terminal prompt changes to `root@ecell:~#` (only visible to staff).

## 7. Staff lifecycle

| Action | Who | How |
|---|---|---|
| Add staff | Owner | `/admin/staff` → invite email + role. Server creates the auth user (service role, `email_confirm: true`) + profile. Cap: 6 active. |
| Change role | Owner | Same screen. Can't demote the last owner (DB trigger). |
| Remove | Owner | Set inactive (keeps the audit trail). Sessions revoked via `auth.admin.signOut(userId)`. |
| Year handover | Outgoing owner | Add the incoming owner → they log in → the outgoing owner deactivates themselves. Rotate `ADMIN_BACKUP_DOOR_TOKEN`. |

## 8. Abuse test checklist (run before launch)

- [ ] `/admin`, `/admin/events`, `/admin/anything` return 404 with an identical body to `/random-404` when logged out
- [ ] A non-staff email gets the same terminal response and timing (±100ms) as a staff email
- [ ] 6th OTP request from the same IP within an hour is silently dropped
- [ ] Wrong code 5× → locked message; the correct code after that still fails until the window resets
- [ ] An authenticated but deactivated staff member gets 404 on `/admin` and 401 on actions
- [ ] Editor calling the `updateStats` action directly → rejected by `requireStaff` **and** by RLS (test both by temporarily removing the app-level check in a branch)
- [ ] No `/admin` string in public HTML responses (`curl` every public route and grep)
