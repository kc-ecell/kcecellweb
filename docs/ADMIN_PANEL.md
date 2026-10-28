# Admin Panel Spec (`/admin`)

Hidden. For a small staff (configured cap, default 10 — see `DATABASE.md` §2). Entry is described in `SECRET_ADMIN_ACCESS.md`.

The design goal is **boring on purpose**. The public site is the show, and the admin is a fast, clear tool. It uses shadcn/ui (Radix + Tailwind), light/dark toggle, lime as `--primary`, Geist fonts. The only playful part is the entry and exit animation.

---

## 1. Layout

```
┌──────────────┬───────────────────────────────────────────────┐
│ E-CELL ADMIN │  Breadcrumb            ⌘K   ☀/☾   [avatar ▾]  │
│──────────────│───────────────────────────────────────────────│
│ ▸ Dashboard  │                                               │
│ ▸ Events     │   page content                                │
│ ▸ Team       │                                               │
│ ▸ Achievements│                                              │
│ ▸ Timeline   │                                               │
│ ▸ Gallery    │                                               │
│ ▸ Blog       │                                               │
│ ─────────    │                                               │
│ ▸ Messages ③ │                                               │
│ ▸ Stats      │   (admin+)                                    │
│ ▸ Settings   │   (admin+)                                    │
│ ▸ Staff      │   (owner)                                     │
│ ▸ Audit log  │   (admin+)                                    │
│ ─────────    │                                               │
│ ↗ View site  │                                               │
└──────────────┴───────────────────────────────────────────────┘
```
- Items the role can't access are hidden, not just disabled.
- ⌘K command menu: jump to any screen, "New event", "New post", search events/members by name.
- Mobile: the sidebar becomes a sheet. Every screen works at 375px (editors will post from phones at events).

## 2. Shared patterns

| Pattern | Spec |
|---|---|
| `ResourceTable` | Search, filter chips (status, year), sortable columns, pagination 25, row actions (Edit, Duplicate, Publish/Unpublish, Delete), bulk publish/delete |
| `ResourceForm` | RHF + Zod (shared schema with the server action), sectioned cards, sticky footer with **Save draft** / **Publish** / **Preview**, unsaved-changes guard, `⌘S` saves |
| Slug field | Auto from title, editable, validated `^[a-z0-9-]+$`, uniqueness checked on blur |
| `ImageUploader` | Drag-drop or pick; client resize to max 2400px WebP; shows dimensions; **alt text required** before save; replace/remove |
| Markdown editor | Split view (textarea + live preview using the public renderer); toolbar for bold, link, heading, list, code, image upload |
| Date/time | Local IST picker, stored as `timestamptz` |
| Toasts | Success: "Saved. Live on the site in a few seconds." Error: the field errors listed |
| Delete | Confirm dialog that requires typing the item's name for events and albums |
| Empty states | Every table: one sentence + primary action ("No events yet. [Create the first one]") |

## 3. Screens

### 3.1 Dashboard
- Cards: upcoming events (next 3), drafts waiting (events + posts), new messages count, last 5 audit entries.
- "Content health" checklist: events missing a cover, photos missing alt text, team members without photos, stats older than 6 months (`verified_on`), past events missing attendance.
- Quick actions: New event · New post · Upload photos.

### 3.2 Events
- Table columns: title, format, date, phase (derived), status, updated.
- Form sections:
  1. **Basics**: title, slug, edition, format, flagship toggle, summary (220 chars, live counter), theme
  2. **When & where**: starts_at, ends_at, venue, online toggle
  3. **Registration**: URL, deadline
  4. **Details**: description (Markdown), prize pool, agenda (repeater: time + title)
  5. **Cover**: image + alt
  6. **Speakers**: repeater (name, role, company, photo, link), drag order
  7. **After the event**: attendance, colleges count, highlights (repeater: label + value), linked album (select)
- Preview opens `/events/<slug>?preview=<token>`.
- Validation: a past event can't be published without `attendance` (warning, overridable by admin+).

### 3.3 Team
- Cohort switcher at the top (`2026-27 ▾`), "New cohort" (copies the department structure, optionally copying members to edit), and "Set as current".
- Grouped by department, drag-to-reorder within a department.
- Member form: name, role, department, tier, bio (160 chars), fun stat (40 chars), skills (tags), photo + focus point picker (click on the image to set `photo_focus`), LinkedIn / GitHub / Instagram, status.
- Live preview of the trading card (front/back) next to the form.

### 3.4 Achievements
Table + form: title, year, category, organizer, result, prize, team names (tags), description, image + alt, highlight toggle (max 3 highlighted, enforced in the action), order.

### 3.5 Timeline
Ordered list of milestones with drag reorder; form: year label, level number, title, description, badge icon (picker from the pixel icon set).

### 3.6 Gallery
- Albums table; album form: title, slug, linked event, date, status, cover (pick from its photos).
- Album detail: **bulk upload** (up to 50 at once, parallel 4, progress per file), grid of photos with drag reorder, inline alt/caption editing, multi-select delete. Publishing an album is blocked while any photo lacks alt text.

### 3.7 Blog
Table: title, author, status, published_at. Form: title, slug, excerpt, cover + alt, author (pick a team member or free text), tags, body (Markdown editor), schedule (published_at in the future = scheduled).

### 3.8 Messages (admin+)
- Inbox list: status dot, topic tag, name, organisation, first line, time.
- Detail: full message, "Reply" (opens `mailto:` with a prefilled subject), mark read/archived. Partnership messages are pinned at the top.
- New messages also email `private.notify_emails` (Resend).

### 3.9 Stats (admin+)
Editable table: label, value, suffix, source, verified_on. Saving a value requires updating `verified_on` and `source` (a forced field). That keeps the numbers honest.

### 3.10 Settings (admin+)
Forms for each settings key: identity, mission, vision, contact, socials, home hero (headline lines + subline), marquee items.

### 3.11 Staff (owner)
Table: name, email, role, active, last login. Invite (email, name, role), change role, deactivate. Banner showing "N / cap seats used" (cap from `private.staff_cap`, default 10).

### 3.12 Audit log (admin+)
Filterable feed: who, what table, action, when; expand to see a diff (JSON, old → new highlighted).

## 4. Permissions matrix

| Screen | owner | admin | editor |
|---|:-:|:-:|:-:|
| Dashboard, Events, Team, Achievements, Timeline, Gallery, Blog | ✓ | ✓ | ✓ |
| Messages | ✓ | ✓ | |
| Stats, Settings | ✓ | ✓ | |
| Audit log | ✓ | ✓ | |
| Staff | ✓ | | |
| Delete photos from storage | ✓ | ✓ | |

Enforced three times: hidden in the UI, rejected by `requireStaff(roles)` in the action, and denied by RLS.

## 5. Server action contract

```ts
// lib/actions/admin/events.ts
'use server'
export async function upsertEvent(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const staff = await requireStaff(['owner', 'admin', 'editor'])
  const parsed = EventInput.safeParse(input)
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createServerSupabase()          // user session → RLS applies
  const { data, error } = await supabase.from('events').upsert(toRow(parsed.data)).select('id, slug').single()
  if (error) return { ok: false, message: humanise(error) }
  revalidateTag('events'); revalidateTag(`event:${data.slug}`); revalidateTag('home')
  return { ok: true, data }
}
```

## 6. Onboarding doc for staff (ship with launch)

A one-page `/admin/help` route (static) covering how to log in (the ritual), how to post an event, how to upload photos (alt text tips), how to write a recap post, and who to ask. It's written in plain language for non-developers.
