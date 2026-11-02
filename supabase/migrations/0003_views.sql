-- 0003_views: derived event phase + draft preview fetch. See docs/DATABASE.md §4.

-- Derived event phase so the UI never stores it.
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
-- Views inherit the base table's RLS when created with security_invoker.
alter view events_public set (security_invoker = true);

-- Preview fetch (drafts by token), called only from the server with the service role.
create or replace function get_event_preview(p_slug text, p_token uuid)
returns setof events language sql stable security definer set search_path = public as $$
  select * from events where slug = p_slug and preview_token = p_token;
$$;
revoke all on function get_event_preview(text, uuid) from public, anon, authenticated;
