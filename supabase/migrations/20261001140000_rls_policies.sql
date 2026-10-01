-- Row Level Security policies for every table, plus the identity helper they all share.
--
-- Why this pass is not a formality: the initial migration left RLS enabled with no policies
-- because `auto_expose_new_tables` had already granted `anon` and `authenticated` full
-- select/insert/update/delete on all eight tables. Verified before writing this file:
--
--   relname        anon_sel  auth_sel  auth_ins  auth_upd  auth_del
--   spots          true      true      true      true      true
--   reviews        true      true      true      true      true
--   ...            (same for all eight tables)
--
-- So the grants are wide open and these policies are the only thing between the publishable key
-- and the database. The saving grace is that RLS fails closed: a table with RLS on and no matching
-- policy denies the operation. Omitting a policy here means "nobody", never "everyone".
--
-- ---------------------------------------------------------------------------
-- Who is the caller
-- ---------------------------------------------------------------------------
--
-- Supabase Auth is the identity provider, and `profiles.id` is its `auth.users.id`, so the
-- principal is simply `auth.uid()`: the subject of the caller's JWT, which is exactly the id
-- every table below refers to. There is no mapping step and no helper function, because there is
-- nothing to map — a row's `user_id` *is* the caller's auth id.
--
-- Every policy wraps the call in `(select ...)` so the planner evaluates it once per query as an
-- InitPlan instead of once per row, which is what Supabase recommends for `auth.uid()`.
--
-- What that means for a caller with no profile row yet: `auth.uid()` still resolves, because it
-- reads the token rather than `profiles`. A signed-in athlete whose profile sync has not landed
-- yet therefore passes the ownership comparison but fails the policies that require a profile row
-- to exist (the foreign keys do the rest), rather than being locked out of everything. The
-- trigger in the sync migration is what guarantees the row is there.

-- ---------------------------------------------------------------------------
-- existing trigger helper
-- ---------------------------------------------------------------------------
--
-- The security advisor reports `set_updated_at` for a mutable search_path: the definition in the
-- initial migration sets none, so it resolves names against whatever the caller's path happens to
-- be. It touches no tables at all -- only `now()` and `NEW` -- so an empty search_path is safe, and
-- pg_catalog is still searched implicitly so `now()` resolves. Fixed here because this is the
-- security pass and it is the last remaining security finding in the project.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------
--
-- Table-level UPDATE/INSERT grants let a client name any column, which is how "edit appropriate
-- spot fields" and "must not manipulate rating aggregates directly" would both be violated: a
-- caller could send `rating_average = 5` in the same statement as `name = 'x'`, and RLS alone
-- cannot express "this column yes, that column no". Postgres column privileges can, so writes are
-- narrowed to the columns the product actually exposes. Everything revoked here is either
-- maintained by a trigger or belongs to a moderation flow that runs as service_role.
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.spots from anon, authenticated;
revoke insert, update, delete on public.equipment from anon, authenticated;
revoke insert, update, delete on public.spot_equipment from anon, authenticated;
revoke insert, update, delete on public.photos from anon, authenticated;
revoke insert, update, delete on public.reviews from anon, authenticated;
revoke insert, update, delete on public.favorites from anon, authenticated;
revoke insert, update, delete on public.reports from anon, authenticated;

-- `status` and `source` are absent on purpose: a submitted spot must land as 'pending' from the
-- column default, so self-approval is impossible even before the policy's `with check` is read.
-- `rating_average` / `rating_count` are absent because the trigger owns them.
grant insert (name, latitude, longitude, description, created_by) on public.spots to authenticated;
grant update (name, description, latitude, longitude) on public.spots to authenticated;

grant insert (id, username, avatar_url) on public.profiles to authenticated;
grant update (username, avatar_url) on public.profiles to authenticated;

grant insert (spot_id, user_id, storage_path, width, height, size) on public.photos to authenticated;

-- No update grant: a review is edited in place at the same spot and author. Not being able to
-- retarget `spot_id` or `user_id` is what makes "one review per user per spot" hold under update,
-- not just insert.
grant insert (spot_id, user_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;

grant insert (user_id, spot_id) on public.favorites to authenticated;
grant insert (spot_id, equipment_id, quantity, condition) on public.spot_equipment to authenticated;
grant update (quantity, condition) on public.spot_equipment to authenticated;

-- DELETE is granted at table level on exactly the three tables with a delete policy, and left
-- revoked everywhere else. RLS decides which rows, so a table-level grant is enough here and keeps
-- the column list out of it. The omission is the mechanism: `spots`, `reports` and `profiles` have
-- no delete policy, so leaving the grant revoked makes them unreachable through the Data API
-- regardless of what a policy is added later -- there is no grant for a policy to unlock.
grant delete on public.reviews to authenticated;
grant delete on public.favorites to authenticated;
grant delete on public.photos to authenticated;
grant delete on public.spot_equipment to authenticated;

-- `status` and `id` absent: a filed report starts 'open' and gets its own uuid.
grant insert (spot_id, user_id, reason, description) on public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
--
-- Own row only. A profile is private to its owner: the columns here are an identity, not
-- something to publish, and the app resolves an author's name through the spot and review rows it
-- already gates. These policies compare `id` to `auth.uid()` directly rather than going through a
-- helper, which is both one lookup cheaper and immune to the recursion a table-reading helper
-- would cause on this very table.
create policy "callers can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- The sign-up trigger creates the row, so this policy is for the repair path: an athlete whose
-- account exists but whose profile insert failed can create it from the app. Pinning `id` to the
-- caller's own id is what stops a caller from creating a profile that claims to be somebody else.
create policy "callers can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "callers can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- NOTE: a public view of author identity (username, avatar) was tried here and removed. Reviews and
-- photos are publicly readable, so something has to resolve an author name for anonymous callers,
-- and `profiles` is own-row-only -- but the obvious fix is a view that bypasses the profiles policy
-- and projects just the safe columns. It is wrong for two reasons: the security advisor flags any
-- security definer view as an external-facing ERROR, and the projection still returns *every*
-- registered user, including accounts that have never posted a review or a photo. Publishing a
-- user directory the product never asked for is a privacy cost paid for speculative convenience;
-- no client reads it yet. Revisit with the review-submission work, where the requirement is real and
-- a narrower shape (an author resolved per review, rather than the whole table) can be chosen on
-- purpose rather than inherited.

-- ---------------------------------------------------------------------------
-- spots
-- ---------------------------------------------------------------------------
--
-- Approved spots are public; a caller additionally sees their own submissions so a pending spot is
-- not invisible to the person who just made it. `created_by` is nullable (author deleted), and
-- `= null` is not true, so a spot whose author is gone is simply not shown to anyone but the public.
create policy "approved spots are public, and callers see their own submissions"
  on public.spots for select
  to anon, authenticated
  using (
    status = 'approved'
    or created_by = (select auth.uid())
  );

create policy "authenticated callers can submit spots"
  on public.spots for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'pending'
    and source = 'user'
    and osm_id is null
    and rating_average = 0
    and rating_count = 0
  );

-- `with check` repeats `created_by` so ownership cannot be handed to another account mid-update.
-- There is deliberately no delete policy: the product does not offer user-initiated spot deletion,
-- and an absent policy means only service_role (the moderation pass) can remove one.
create policy "owners can edit their own spots"
  on public.spots for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- equipment (reference data)
-- ---------------------------------------------------------------------------
--
-- The catalogue is written by seed/migration, never by a client, so reads only.
create policy "equipment is public"
  on public.equipment for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- spot_equipment
-- ---------------------------------------------------------------------------
--
-- Gated on the parent spot rather than `using (true)`. A plain true would publish the equipment
-- list of spots that are still pending, which leaks the existence of the very submissions the
-- spots policy exists to hide. The subquery is itself evaluated under the spots select policy, so
-- it can only ever match approved spots or the caller's own.
create policy "spot equipment is public for approved spots, and for your own"
  on public.spot_equipment for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (s.status = 'approved' or s.created_by = (select auth.uid()))
    )
  );

-- The prompt's write list does not mention equipment, but the add-spot flow collects it, so
-- without these policies a spot could never be created with any equipment. Scoped to owned spots.
create policy "owners can add equipment to their own spots"
  on public.spot_equipment for insert
  to authenticated
  with check (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and s.created_by = (select auth.uid())
    )
  );

create policy "owners can edit equipment on their own spots"
  on public.spot_equipment for update
  to authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and s.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and s.created_by = (select auth.uid())
    )
  );

create policy "owners can remove equipment from their own spots"
  on public.spot_equipment for delete
  to authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and s.created_by = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- photos
-- ---------------------------------------------------------------------------
--
-- Same parent-spot gating as spot_equipment: a readable photo row would otherwise disclose that
-- a pending spot exists. Note this governs the row only. Serving the bytes is a Storage policy on
-- the bucket and is not part of this pass, so `storage_path` is currently public metadata with no
-- corresponding access control on the object itself.
create policy "photos are public for approved spots, and for your own"
  on public.photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (s.status = 'approved' or s.created_by = (select auth.uid()))
    )
  );

create policy "callers can add photos to approved spots, or their own"
  on public.photos for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (s.status = 'approved' or s.created_by = (select auth.uid()))
    )
  );

create policy "callers can delete their own photos"
  on public.photos for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- No update policy: a photo's storage path and dimensions describe an immutable object. Editing it
-- in place is a delete plus an insert.

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
--
-- Publicly readable per the prompt, but gated on the parent spot for the same reason as photos: a
-- public review row for a pending spot discloses the spot. `anon` therefore cannot review either.
create policy "reviews are public for approved spots, and for your own"
  on public.reviews for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (s.status = 'approved' or s.created_by = (select auth.uid()))
    )
  );

-- Rating bounds (1-5) and one-review-per-user-per-spot are database constraints from the previous
-- pass, not policies, so they hold no matter which client sends the row. The aggregate columns
-- live on `spots` and are trigger-owned, so a review insert cannot forge a rating.
create policy "callers can review approved spots"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.spots s
      where s.id = spot_id
        and s.status = 'approved'
    )
  );

-- `using` decides whose rows may be updated, `with check` what they may become. Both are needed:
-- without `with check` a caller could retarget `user_id` to another account. The column grant
-- above separately prevents changing `spot_id`/`user_id` at all.
create policy "authors can edit their own reviews"
  on public.reviews for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "authors can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
--
-- Private to their owner. The prompt does not list favourites as publicly readable, and a saved
-- list is exactly the sort of thing that should not leak.
create policy "callers can read their own favorites"
  on public.favorites for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "callers can save spots for themselves"
  on public.favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "callers can remove their own favorites"
  on public.favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- No update policy, on purpose. A favourite is a pure (user, spot) membership row: changing it is
-- expressed as delete + insert, so there is no "edit someone else's favourite" to guard against.

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
--
-- Private to the reporter. Moderation reads these as service_role, which bypasses RLS, so there is
-- no need to expose a report to any other authenticated caller.
create policy "callers can read their own reports"
  on public.reports for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "callers can report spots"
  on public.reports for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No update or delete policy: a report's lifecycle belongs to moderation, and the reporter has no
-- reason to retract it into a state the moderation queue cannot interpret.