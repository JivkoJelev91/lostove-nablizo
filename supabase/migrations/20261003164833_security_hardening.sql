-- Security hardening from the Prompt 68 audit.
--
-- The base RLS pass (20261001140000) reasoned carefully about policies, but two things it could
-- not see have drifted since:
--
--   1. Supabase's default privileges grant EXECUTE on every new function in `public` directly to
--      `anon` and `authenticated`. The later migrations revoked from `public` and granted to
--      `authenticated`, which leaves the direct `anon` grant in place — `revoke ... from public`
--      does not touch it. Every RPC added after the base pass is therefore callable without a
--      session unless it checks `auth.uid()` itself.
--   2. The same default privileges give every new table INSERT/UPDATE/DELETE, so tables added
--      after the base pass (`spot_verifications`) carry write grants no policy allows.
--
-- Neither is exploitable while RLS has no matching write policy — RLS fails closed — but both are
-- grants the product never intended, and a future policy added without this context would make
-- them live. Revoking them is defense in depth, not a change in behaviour.
--
-- Fixed alongside: the PostGIS support tables were world-writable, `spatial_ref_sys` had RLS
-- disabled, and four text columns were bounded only by the UI's `maxLength`, which a hand-crafted
-- request ignores. The bounds below are deliberately generous — they exist to stop a megabyte of
-- text, not to mirror the client's limits, and every one of them is wider than the app's own.

-- ---------------------------------------------------------------------------
-- out of reach: the PostGIS objects
-- ---------------------------------------------------------------------------
--
-- The advisor also reports `spatial_ref_sys` with RLS disabled, `postgis` installed in `public`,
-- and `st_estimatedextent` (a SECURITY DEFINER function the extension grants to PUBLIC) callable
-- through the Data API. None of the three can be fixed from this project's role: the objects are
-- owned by `supabase_admin`, which granted their privileges, and Postgres refuses both a REVOKE
-- and an `alter table ... enable row level security` from anyone else. They are recorded here so
-- the next audit does not rediscover them as oversights, and so the reason they remain is written
-- down where the attempts would have gone. A fresh install could install PostGIS into the
-- `extensions` schema instead and never have either finding; moving an installed extension is a
-- `supabase_admin` operation, not a migration.

-- ---------------------------------------------------------------------------
-- spot_verifications
-- ---------------------------------------------------------------------------
--
-- Verification rows are written by `verify_spot` alone, which runs as its owner and checks
-- `auth.uid()` and the parent spot's state itself. The table's write grants came from default
-- privileges and are unreachable because no write policy exists; removing them means a future
-- policy cannot accidentally open a second writer that skips those checks. The public read stays:
-- a confirmation is public content, gated on the parent spot by its SELECT policy.
revoke insert, update, delete on public.spot_verifications from anon, authenticated;

-- ---------------------------------------------------------------------------
-- reads anon has no use for
-- ---------------------------------------------------------------------------
--
-- `favorites` and `reports` select policies are `to authenticated` only, so the `anon` grants are
-- dead weight. A favourite and a report are athlete-private, and leaving the grant in place means
-- a future policy written as `using (true)` would publish them to guests by accident.
revoke select on public.favorites, public.reports from anon;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
--
-- All three are SECURITY DEFINER and every one checks who is asking inside its body, but two
-- facts still matter: nothing is gained by letting a guest invoke them, and an `anon` execution
-- error is a better signal than a definer body deciding a guest is not a moderator. `execute` is
-- kept for `authenticated` because `is_moderator()` is called by the moderation policies, and
-- `moderate_spot` / `verify_spot` are the app's own write paths. `is_moderator()` is deliberately
-- left executable by `authenticated`: it is a read of the caller's own membership row, and the
-- advisor's remaining warning about it is the price of a private moderator list.
revoke execute on function public.is_moderator() from anon;
revoke execute on function public.moderate_spot(uuid, text) from anon;
revoke execute on function public.verify_spot(uuid) from anon;

-- ---------------------------------------------------------------------------
-- bounded text
-- ---------------------------------------------------------------------------
--
-- Each of these columns had a `maxLength` on the input that writes it and no bound in the
-- database, so a request that skipped the app could store unbounded text: an oversized row, an
-- oversized response for every reader of the feed, and a Storage bill nobody chose. The numbers
-- are wider than the product's own limits (spot name 60, description 200, review 300, report note
-- 300) and wider than anything already stored, because they are an abuse floor rather than a
-- contract: the day the product wants a longer description it changes one UI constant, not a
-- migration.
alter table public.spots
  add constraint spots_name_length_check check (char_length(btrim(name)) between 1 and 120);

alter table public.spots
  add constraint spots_description_length_check
  check (description is null or char_length(description) <= 1000);

alter table public.reviews
  add constraint reviews_comment_length_check
  check (comment is null or char_length(comment) <= 1000);

alter table public.reports
  add constraint reports_description_length_check
  check (description is null or char_length(description) <= 1000);

alter table public.profiles
  add constraint profiles_username_length_check
  check (char_length(btrim(username)) between 1 and 60);

comment on constraint spots_name_length_check on public.spots is
  'Non-empty and at most 120 characters; the client''s own limit is 60.';
comment on constraint spots_description_length_check on public.spots is
  'At most 1000 characters; the client''s own limit is 200.';
comment on constraint reviews_comment_length_check on public.reviews is
  'At most 1000 characters; the client''s own limit is 300.';
comment on constraint reports_description_length_check on public.reports is
  'At most 1000 characters; the client''s own limit is 300.';
comment on constraint profiles_username_length_check on public.profiles is
  'Non-empty and at most 60 characters.';

-- ---------------------------------------------------------------------------
-- residual default grants
-- ---------------------------------------------------------------------------
--
-- Supabase's default privileges hand every new table the full set: INSERT, UPDATE, DELETE, SELECT,
-- TRUNCATE, REFERENCES, TRIGGER, and on Postgres 17 MAINTAIN. The passes above revoked the DML
-- privileges where no policy allows them, but the DDL-ish pair and the maintenance privilege
-- survive on every table. None of them is reachable through PostgREST, and none is wanted:
-- TRUNCATE would be a table wipe if it ever were, REFERENCES and TRIGGER are DDL capabilities no
-- client has any business holding, and MAINTAIN would let a client VACUUM or REINDEX. Removed
-- from every table this role owns; the extension's own tables are left alone because
-- `supabase_admin` owns them and refuses the revoke.
do $$
declare
  target record;
begin
  for target in
    select tablename from pg_tables where schemaname = 'public' and tableowner = current_user
  loop
    execute format(
      'revoke truncate, references, trigger, maintain on public.%I from anon, authenticated',
      target.tablename
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- a photo cap the client cannot forget
-- ---------------------------------------------------------------------------
--
-- The picker offers four photos per spot and `PhotoManager` enforces that in the UI. A
-- hand-crafted request has no such limit: one account could attach thousands of objects to a
-- single approved spot, spending the project's storage and turning every card that lists them
-- into a long download. This moves the rule into the database with headroom over the product's
-- four, so changing the UI constant is not a migration. SECURITY DEFINER so the count sees every
-- row regardless of the caller's RLS view, and trigger-only: the EXECUTE privilege is checked
-- when the trigger is created, so revoking it below does not stop the trigger firing.
--
-- The count is of rows already there, so ten are allowed and the eleventh is refused. Two
-- simultaneous inserts can race past the boundary by one row; for an abuse floor that is the
-- right trade against serialising every photo upload.
create function public.photos_enforce_spot_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select count(*) from public.photos where spot_id = new.spot_id) >= 10 then
    raise exception 'A spot can have at most 10 photos';
  end if;

  return new;
end;
$$;

comment on function public.photos_enforce_spot_limit() is
  'Refuses an 11th photo on a spot. The picker''s own limit is 4.';

create trigger photos_spot_limit
  before insert on public.photos
  for each row
  execute function public.photos_enforce_spot_limit();

revoke execute on function public.photos_enforce_spot_limit() from public, anon, authenticated;
