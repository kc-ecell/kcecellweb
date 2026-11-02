-- 0004_storage: the public `media` bucket + policies. See docs/DATABASE.md §5.

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
