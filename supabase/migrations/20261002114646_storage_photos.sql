-- The Storage bucket that holds spot photos, and the policies that decide who may write to it.
--
-- One public bucket, one folder per uploader. The folder is the security boundary: the app writes
-- every object to `{user_id}/{spot_id}/{unique}.jpg`, and the write policies below compare the
-- first path segment with `auth.uid()`, so a signed-in athlete cannot replace or delete another
-- athlete's file even by guessing its path. Reads are public because a photo belongs to a spot and
-- an approved spot is public content — the `public.photos` row stays the access-aware record, and
-- its RLS hides the photos of a spot still under review from everyone but the owner.
--
-- JPEG only, matching the picker pipeline, which resizes and re-encodes every photo before it
-- reaches this bucket. The 5 MiB cap is generous beside that pipeline's few-hundred-kilobyte
-- output; it exists to stop a hand-crafted request, not to constrain the app.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880,
  array['image/jpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "spot photos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

create policy "athletes upload spot photos into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "athletes delete spot photos from their own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
