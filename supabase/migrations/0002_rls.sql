-- 0002_rls: row-level security on every table. See docs/DATABASE.md §3.

-- Enable + force RLS on everything.
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

-- ---------- Guard the last owner ----------
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
