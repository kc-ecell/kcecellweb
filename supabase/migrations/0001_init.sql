-- 0001_init: extensions, enums, helpers, tables, audit. See docs/DATABASE.md §2.

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

-- site_settings is created below; the cap reads private.staff_cap from it.
-- ============ site settings (key/value) ============
create table site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger trg_settings_updated before update on site_settings for each row execute function set_updated_at();

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
  accent      text not null,
  sort        int  not null default 0
);

-- ============ team ============
create table team_cohorts (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,
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
  role           text not null,
  bio            text,
  fun_stat       text,
  skills         text[] not null default '{}',
  photo_path     text,
  photo_w        int,
  photo_h        int,
  photo_focus    text default 'center 20%',
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
  edition           text,
  format            event_format not null,
  summary           text not null check (char_length(summary) <= 220),
  description_md    text,
  theme             text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  venue             text,
  is_online         boolean not null default false,
  registration_url  text,
  registration_deadline timestamptz,
  prize_pool        text,
  attendance        int check (attendance >= 0),
  colleges_count    int check (colleges_count >= 0),
  highlights        jsonb not null default '[]',
  agenda            jsonb not null default '[]',
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
  result        text not null,
  prize         text,
  team_names    text[] not null default '{}',
  description   text,
  image_path    text,
  image_alt     text,
  is_highlight  boolean not null default false,
  sort          int not null default 0,
  status        publish_status not null default 'published',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_ach_updated before update on achievements for each row execute function set_updated_at();

-- ============ timeline ============
create table timeline_milestones (
  id           uuid primary key default gen_random_uuid(),
  year_label   text not null,
  level        int  not null,
  title        text not null,
  description  text not null,
  badge_icon   text,
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
  label        text not null,
  value        int  not null check (value >= 0),
  suffix       text not null default '+',
  source       text not null,
  verified_on  date not null,
  sort         int not null default 0
);

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
  action      text not null,
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
