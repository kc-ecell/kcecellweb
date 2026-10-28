# Database (Supabase / Postgres)

Every table lives in `public` and has RLS enabled. Anonymous users can read **published** rows only. Staff (rows in `profiles` with an active role) can write, and some tables are limited by role.

Run as migrations in `supabase/migrations/`. The SQL below is the v1 baseline (`0001_init.sql` … `0004_storage.sql`).

---

## 1. Entity overview

```
profiles ─┐ (staff only; 1:1 auth.users)
          └─ audit_log

departments ─┬─ team_members ── team_cohorts
             │
events ──────┼─ event_speakers
             └─ gallery_albums ── gallery_photos

achievements      timeline_milestones      posts      stats
site_settings     contact_messages
```

---

## 2. Migration 0001: types, helpers, tables

```sql
-- ============ extensions ============
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ============ enums ============
create type staff_role        as enum ('owner', 'admin', 'editor');
create type publish_status    as enum ('draft', 'published');
create type event_format      as enum ('hackathon', 'workshop', 'talk', 'competition', 'bootcamp', 'networking', 'gaming', 'other');
create type member_tier       as enum ('faculty', 'leadership', 'head', 'cohead', 'member');
create type achievement_cat   as enum ('hackathon', 'entrepreneurship', 'innovation', 'award', 'event');
create type message_topic     as enum ('general', 'partnership', 'speaker', 'media', 'other');
create type message_status    as enum ('new', 'read', 'archived');

-- ============ updated_at trigger ============
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ profiles (staff) ============
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         citext not null unique,
  display_name  text not null,
  role          staff_role not null default 'editor',
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

-- Active-staff cap. Configurable via site_settings['private.staff_cap'].max_active_staff
-- (default 10). SECURITY DEFINER so the lookup is unaffected by the caller's RLS.
create or replace function enforce_staff_cap() returns trigger
language plpgsql security definer set search_path = public as $$
declare cap int;
begin
  select coalesce((value->>'max_active_staff')::int, 10) into cap
    from site_settings where key = 'private.staff_cap';
  cap := coalesce(cap, 10);
  if new.active and (select count(*) from profiles where active and id <> new.id) >= cap then
    raise exception 'Staff cap reached (%). Deactivate someone first.', cap;
  end if;
  return new;
end $$;
create trigger trg_profiles_cap before insert or update of active on profiles
  for each row execute function enforce_staff_cap();

-- ============ role helpers (SECURITY DEFINER, stable) ============
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active);
$$;

create or replace function has_role(roles staff_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and active and role = any(roles));
$$;

-- ============ departments ============
create table departments (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  accent      text not null,            -- token name, e.g. 'lime', 'cyan'
  sort        int  not null default 0
);

-- ============ team ============
create table team_cohorts (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,      -- '2026-27'
  start_year  int  not null unique check (start_year between 2016 and 2100),
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index one_current_cohort on team_cohorts (is_current) where is_current;

create table team_members (
  id             uuid primary key default gen_random_uuid(),
  cohort_id      uuid not null references team_cohorts(id) on delete cascade,
  department     text not null references departments(slug),
  tier           member_tier not null,
  name           text not null,
  role           text not null,               -- 'AI/ML Head'
  bio            text,                         -- short, shown on card back
  fun_stat       text,                         -- '4 broken Arduinos'
  skills         text[] not null default '{}',
  photo_path     text,                         -- storage path in 'media'
  photo_w        int,
  photo_h        int,
  photo_focus    text default 'center 20%',    -- object-position
  linkedin_url   text,
  github_url     text,
  instagram_url  text,
  sort           int not null default 0,
  status         publish_status not null default 'published',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on team_members (cohort_id, department, sort);
create trigger trg_team_members_updated before update on team_members for each row execute function set_updated_at();

-- ============ events ============
create table events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title             text not null,
  edition           text,                      -- '2026', 'Season 2'
  format            event_format not null,
  summary           text not null check (char_length(summary) <= 220),
  description_md    text,
  theme             text,
  starts_at         timestamptz,               -- null = date TBA (hidden from Upcoming)
  ends_at           timestamptz,
  venue             text,
  is_online         boolean not null default false,
  registration_url  text,
  registration_deadline timestamptz,
  prize_pool        text,
  attendance        int check (attendance >= 0),
  colleges_count    int check (colleges_count >= 0),
  highlights        jsonb not null default '[]',   -- [{label, value}]
  agenda            jsonb not null default '[]',   -- [{time, title}]
  cover_path        text,
  cover_w           int,
  cover_h           int,
  cover_alt         text,
  is_flagship       boolean not null default false,
  status            publish_status not null default 'draft',
  preview_token     uuid not null default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create index on events (status, starts_at desc);
create trigger trg_events_updated before update on events for each row execute function set_updated_at();

create table event_speakers (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  name        text not null,
  role        text,
  company     text,
  photo_path  text,
  link_url    text,
  sort        int not null default 0
);
create index on event_speakers (event_id, sort);

-- ============ achievements ============
create table achievements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  year          int  not null check (year between 2016 and 2100),
  category      achievement_cat not null,
  organizer     text,
  result        text not null,                  -- '2nd place', 'Winner', 'Grand finalist, 44th of 500+'
  prize         text,                           -- rendered only if present
  team_names    text[] not null default '{}',
  description   text,
  image_path    text,
  image_alt     text,
  is_highlight  boolean not null default false, -- shown on Home
  sort          int not null default 0,
  status        publish_status not null default 'published',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_ach_updated before update on achievements for each row execute function set_updated_at();

-- ============ timeline ============
create table timeline_milestones (
  id           uuid primary key default gen_random_uuid(),
  year_label   text not null,                   -- '2021-23' allowed
  level        int  not null,                   -- 1..n, shown as 'LVL 01'
  title        text not null,
  description  text not null,
  badge_icon   text,                            -- icon key
  sort         int not null default 0,
  status       publish_status not null default 'published'
);

-- ============ gallery ============
create table gallery_albums (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title          text not null,
  event_id       uuid references events(id) on delete set null,
  taken_on       date,
  cover_photo_id uuid,
  status         publish_status not null default 'draft',
  created_at     timestamptz not null default now()
);

create table gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references gallery_albums(id) on delete cascade,
  path        text not null,
  width       int  not null,
  height      int  not null,
  alt         text not null check (char_length(alt) >= 8),
  caption     text,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index on gallery_photos (album_id, sort);
alter table gallery_albums
  add constraint fk_cover foreign key (cover_photo_id) references gallery_photos(id) on delete set null;

-- ============ blog ============
create table posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title            text not null,
  excerpt          text not null check (char_length(excerpt) <= 240),
  body_md          text not null,
  cover_path       text,
  cover_alt        text,
  author_name      text not null,
  author_member_id uuid references team_members(id) on delete set null,
  tags             text[] not null default '{}',
  reading_minutes  int generated always as (greatest(1, (char_length(body_md) / 1200))) stored,
  status           publish_status not null default 'draft',
  published_at     timestamptz,
  preview_token    uuid not null default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on posts (status, published_at desc);
create trigger trg_posts_updated before update on posts for each row execute function set_updated_at();

-- ============ stats ============
create table stats (
  slug         text primary key check (slug ~ '^[a-z0-9-]+$'),
  label        text not null,                    -- 'Active members'
  value        int  not null check (value >= 0),
  suffix       text not null default '+',
  source       text not null,                    -- where the number comes from
  verified_on  date not null,
  sort         int not null default 0
);

-- ============ site settings (key/value) ============
create table site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger trg_settings_updated before update on site_settings for each row execute function set_updated_at();

-- ============ contact messages ============
create table contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  email       citext not null,
  topic       message_topic not null default 'general',
  organisation text,
  message     text not null check (char_length(message) between 10 and 5000),
  status      message_status not null default 'new',
  ip_hash     text,
  created_at  timestamptz not null default now()
);
create index on contact_messages (status, created_at desc);

-- ============ audit log ============
create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,          -- INSERT / UPDATE / DELETE
  table_name  text not null,
  record_id   text,
  diff        jsonb,
  at          timestamptz not null default now()
);

create or replace function write_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, action, table_name, record_id, diff)
  values (
    auth.uid(), tg_op, tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id',
             (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'slug',
             (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'key'),
    case when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
         when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['events','event_speakers','team_cohorts','team_members','achievements',
                           'timeline_milestones','gallery_albums','gallery_photos','posts','stats',
                           'site_settings','profiles']
  loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on %1$s
                    for each row execute function write_audit();', t);
  end loop;
end $$;
```

---

## 3. Migration 0002: RLS

```sql
-- Enable RLS on everything
do $$
declare t text;
begin
  foreach t in array array['profiles','departments','team_cohorts','team_members','events','event_speakers',
                           'achievements','timeline_milestones','gallery_albums','gallery_photos','posts',
                           'stats','site_settings','contact_messages','audit_log']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
  end loop;
end $$;

-- ---------- Public read (published only) ----------
create policy pub_read on departments         for select using (true);
create policy pub_read on team_cohorts        for select using (true);
create policy pub_read on stats               for select using (true);
create policy pub_read on site_settings       for select using (key not like 'private.%');
create policy pub_read on team_members        for select using (status = 'published');
create policy pub_read on events              for select using (status = 'published');
create policy pub_read on event_speakers      for select using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
create policy pub_read on achievements        for select using (status = 'published');
create policy pub_read on timeline_milestones for select using (status = 'published');
create policy pub_read on gallery_albums      for select using (status = 'published');
create policy pub_read on gallery_photos      for select using (exists (select 1 from gallery_albums a where a.id = album_id and a.status = 'published'));
create policy pub_read on posts               for select using (status = 'published' and published_at <= now());

-- ---------- Staff: full read on content tables ----------
create policy staff_read on team_members        for select using (is_staff());
create policy staff_read on events              for select using (is_staff());
create policy staff_read on event_speakers      for select using (is_staff());
create policy staff_read on achievements        for select using (is_staff());
create policy staff_read on timeline_milestones for select using (is_staff());
create policy staff_read on gallery_albums      for select using (is_staff());
create policy staff_read on gallery_photos      for select using (is_staff());
create policy staff_read on posts               for select using (is_staff());
create policy staff_read on site_settings       for select using (is_staff());

-- ---------- Content writes: owner, admin, editor ----------
do $$
declare t text;
begin
  foreach t in array array['team_cohorts','team_members','events','event_speakers','achievements',
                           'timeline_milestones','gallery_albums','gallery_photos','posts']
  loop
    execute format('create policy staff_write_ins on %I for insert with check (has_role(array[''owner'',''admin'',''editor'']::staff_role[]))', t);
    execute format('create policy staff_write_upd on %I for update using (has_role(array[''owner'',''admin'',''editor'']::staff_role[])) with check (has_role(array[''owner'',''admin'',''editor'']::staff_role[]))', t);
    execute format('create policy staff_write_del on %I for delete using (has_role(array[''owner'',''admin'',''editor'']::staff_role[]))', t);
  end loop;
end $$;

-- ---------- Admin-only writes: stats, settings, departments ----------
do $$
declare t text;
begin
  foreach t in array array['stats','site_settings','departments']
  loop
    execute format('create policy admin_write_ins on %I for insert with check (has_role(array[''owner'',''admin'']::staff_role[]))', t);
    execute format('create policy admin_write_upd on %I for update using (has_role(array[''owner'',''admin'']::staff_role[])) with check (has_role(array[''owner'',''admin'']::staff_role[]))', t);
    execute format('create policy admin_write_del on %I for delete using (has_role(array[''owner'',''admin'']::staff_role[]))', t);
  end loop;
end $$;

-- ---------- Contact messages: no anon access; inserted by server (service role) ----------
create policy msg_read   on contact_messages for select using (has_role(array['owner','admin']::staff_role[]));
create policy msg_update on contact_messages for update using (has_role(array['owner','admin']::staff_role[]));
create policy msg_delete on contact_messages for delete using (has_role(array['owner']::staff_role[]));

-- ---------- Profiles ----------
create policy self_read   on profiles for select using (id = auth.uid() or has_role(array['owner','admin']::staff_role[]));
create policy owner_write on profiles for all    using (has_role(array['owner']::staff_role[]))
                                              with check (has_role(array['owner']::staff_role[]));

-- ---------- Audit ----------
create policy audit_read on audit_log for select using (has_role(array['owner','admin']::staff_role[]));
-- no insert/update/delete policies: only the SECURITY DEFINER trigger writes
```

### Guarding the last owner
```sql
create or replace function keep_one_owner() returns trigger
language plpgsql as $$
begin
  if (old.role = 'owner' and (new.role <> 'owner' or not new.active))
     and (select count(*) from profiles where role = 'owner' and active and id <> old.id) = 0 then
    raise exception 'Cannot remove the last active owner.';
  end if;
  return new;
end $$;
create trigger trg_keep_owner before update on profiles for each row execute function keep_one_owner();
```

---

## 4. Migration 0003: views and functions

```sql
-- Derived event phase so the UI never stores it
create or replace view events_public as
select e.*,
  case
    when e.starts_at is null                       then 'tba'
    when now() < e.starts_at                       then 'upcoming'
    when now() between e.starts_at and coalesce(e.ends_at, e.starts_at + interval '1 day') then 'live'
    else 'past'
  end as phase
from events e
where e.status = 'published';
-- views inherit RLS of the base table when created with security_invoker
alter view events_public set (security_invoker = true);

-- Preview fetch (drafts by token), called only from the server with the service role
create or replace function get_event_preview(p_slug text, p_token uuid)
returns setof events language sql stable security definer set search_path = public as $$
  select * from events where slug = p_slug and preview_token = p_token;
$$;
revoke all on function get_event_preview(text, uuid) from public, anon, authenticated;
```

---

## 5. Migration 0004: storage

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;

create policy media_public_read on storage.objects for select
  using (bucket_id = 'media');

create policy media_staff_insert on storage.objects for insert
  with check (bucket_id = 'media' and public.is_staff());

create policy media_staff_update on storage.objects for update
  using (bucket_id = 'media' and public.is_staff());

create policy media_staff_delete on storage.objects for delete
  using (bucket_id = 'media' and public.has_role(array['owner','admin']::public.staff_role[]));
```

Path conventions:

| Resource | Path |
|---|---|
| Team photo | `team/{cohort_label}/{member_id}/{nanoid}.webp` |
| Event cover | `events/{event_id}/cover-{nanoid}.webp` |
| Speaker | `events/{event_id}/speakers/{nanoid}.webp` |
| Gallery | `gallery/{album_id}/{nanoid}.webp` |
| Post cover | `posts/{post_id}/{nanoid}.webp` |
| Achievement | `achievements/{id}/{nanoid}.webp` |

---

## 6. Site settings keys

| Key | Shape | Example |
|---|---|---|
| `org.identity` | `{ name, short, college, city, founded }` | `{ "name": "Entrepreneurship Cell, KCCEMSR", "short": "E-Cell KCCEMSR", "founded": 2016 }` |
| `org.mission` | `{ text }` | see `CONTENT.md` |
| `org.vision` | `{ text }` | see `CONTENT.md` |
| `org.contact` | `{ email, phone?, address, reply_time }` | email TBD |
| `org.socials` | `{ instagram?, linkedin?, x?, youtube?, github? }` | TBD |
| `home.hero` | `{ headline_lines: string[], subline }` | |
| `home.marquee` | `string[]` | |
| `private.notify_emails` | `string[]` | inboxes that get contact notifications (not publicly readable) |
| `private.staff_cap` | `{ max_active_staff }` | active-staff cap read by `enforce_staff_cap()`; default 10 if the row is absent. `private.` prefix keeps it out of public reads |

---

## 7. Seeding

`supabase/seed.sql` is generated from `CONTENT.md`:
- departments (5), cohort `2026-27` (current), 24 team members
- stats (4), timeline (9 milestones), achievements (4), settings
- 1 owner profile (create the auth user first via the dashboard, then insert the `profiles` row with its UUID)

Never seed real staff emails in git. Owners are inserted manually in the production dashboard.

---

## 8. Type generation

```bash
npx supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts
```
Run after every migration (`npm run db:types`). CI fails if the generated file differs from the committed one.

## 9. RLS tests (must pass in CI)

`supabase/tests/rls.test.sql` (pgTAP):
- anon cannot select draft events, draft posts, or contact_messages
- anon cannot insert into any table
- editor cannot update `stats` or `site_settings`, and cannot read `contact_messages`
- admin cannot modify `profiles`
- inactive staff cannot write anything
- an active-staff insert beyond the configured cap fails (set `private.staff_cap` low in the test, e.g. 2, then exceed it)
- demoting the last owner fails
