-- A moderator can remove a rejected spot for good.
--
-- Deleting the row cascades every child row — equipment, photos, reviews, favourites, reports,
-- verifications — but the uploaded bytes live in Storage, outside the database's reach. So the
-- app needs three permissions, one per step of the cleanup:
--
--   1. read the photo rows of a spot the public cannot see, to learn the object paths;
--   2. delete those objects from the bucket;
--   3. delete the spot row itself.
--
-- The order in the app is objects first, then the row: a failure then leaves a row that still
-- names its bytes, which is recoverable by trying again, rather than bytes no row can find.

create policy "moderators read every photo"
  on public.photos for select
  to authenticated
  using (public.is_moderator());

create policy "moderators delete any spot photo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and public.is_moderator());

create policy "moderators delete spots"
  on public.spots for delete
  to authenticated
  using (public.is_moderator());
