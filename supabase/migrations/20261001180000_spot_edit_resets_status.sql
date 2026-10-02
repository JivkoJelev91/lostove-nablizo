-- Puts an edited spot back under review, without letting the owner approve it themselves.
--
-- Why a trigger rather than a grant
-- ---------------------------------
-- The obvious fix for "an edit must reset the status" is to add `status` to the update grant in
-- 20261001140000_rls_policies.sql. That is a hole. The spots update policy is
--
--   using (created_by = auth.uid()) with check (created_by = auth.uid())
--
-- which answers "is this your spot?" and says nothing about which state it may be moved to. Grant
-- the column and an owner can set their own submission to 'approved' from the client, which is the
-- one thing the pending default and the insert policy's `with check` exist to prevent. RLS cannot
-- close this: a policy can compare columns to constants, but not a new value to the row's previous
-- one, so no policy can say "status may be reset to pending but never raised".
--
-- So the column stays out of the grant and the rule moves into the row itself. Every update that
-- changes what the public reads is forced to 'pending' here, whatever the caller asked for. An
-- owner editing an approved spot therefore un-approves it, and an owner asking for 'approved' gets
-- 'pending' instead. Both requests are answered the same way, which is the only way to answer them
-- without knowing which one to believe.
--
-- service_role is exempt, because that is the moderation pass. A moderator approving or rejecting
-- runs as service_role and passes straight through; a trigger that forced 'pending' there would
-- make the queue impossible to work.
--
-- `security definer` because a security invoker trigger runs as the caller, and the caller has no
-- UPDATE grant on `status`. Without it the trigger raises a permission error and no spot can be
-- edited at all. Revoked from anon and authenticated below: a trigger's EXECUTE privilege is
-- checked when CREATE TRIGGER runs, not when the trigger fires, so revoking afterwards does not
-- break the trigger -- it only stops a caller invoking this function directly to reset any spot's
-- status outside an update it is already allowed to make.

create or replace function public.spots_reset_status_on_edit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Only when something a moderator would want to re-read actually changed. An update that
  -- rewrites the same values -- a retried save, a form submitted twice -- leaves the status alone
  -- rather than bouncing an approved spot back into the queue for no reason.
  if new.name is distinct from old.name
    or new.description is distinct from old.description
    or new.latitude is distinct from old.latitude
    or new.longitude is distinct from old.longitude
  then
    new.status := 'pending';
  end if;

  return new;
end;
$$;

comment on function public.spots_reset_status_on_edit() is
  'Forces spots.status to ''pending'' when an owner edits the content a moderator approves.';

-- BEFORE, because the point is to rewrite the row that is about to be written. AFTER would have
-- to issue a second UPDATE, which writes a second row version and can fail the RLS `with check` on
-- a status the caller was never allowed to set in the first place.
create trigger spots_reset_status_on_edit
  before update on public.spots
  for each row
  execute function public.spots_reset_status_on_edit();

revoke execute on function public.spots_reset_status_on_edit() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- The `spots.status` vocabulary the app shares
-- ---------------------------------------------------------------------------
--
-- The database says 'pending' and the app says 'under_review'. They are the same state described
-- in each side's own language, and the mapping lives in src/features/spots/spots-mappers.ts. This
-- note exists so the next reader who finds the two vocabularies does not assume one of them is a
-- bug and "fix" it: the column constraint is pinned to the database word on purpose, because that
-- is the vocabulary the moderation queue and its queries speak.
