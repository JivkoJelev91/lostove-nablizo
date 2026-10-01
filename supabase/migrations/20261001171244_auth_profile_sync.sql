-- Account → profile synchronisation.
--
-- Everything the app calls "the user" is two rows in two schemas: an `auth.users` row that
-- Supabase Auth owns and a `public.profiles` row this app owns. `profiles.id` is that same
-- `auth.users.id`, so the two cannot drift apart on identity, but the profile still has to come
-- into existence. This migration makes the database create it, so no client has to remember to:
-- a trigger on `auth.users` inserts the profile row in the same transaction as the account.
--
-- Doing it in the database rather than in the sign-up screen is what makes it reliable. A client
-- can crash, lose its connection or be an entirely different client, and the profile row still
-- exists by the time the account does. The app keeps a repair path for the one case this cannot
-- cover — a profile insert that failed after the account was created — through the
-- "callers can create their own profile" policy in the RLS migration.

-- SECURITY DEFINER, because the row is inserted by the Auth service, which writes `auth.users` as
-- `supabase_auth_admin` and has no rights on `public.profiles` (and would be stopped by RLS even
-- if it did). Running as the function's owner is what lets the account insert and the profile
-- insert be one atomic step. This is the one definer function in the project, and the two things
-- that keep it from being a hole are below it: no caller can reach it, and it writes exactly one
-- row, for the account the Auth service just created.
--
-- `set search_path = ''` pins name resolution to nothing, so every identifier in the body is
-- spelled out in full and a caller cannot shadow `profiles` (or a function it calls) with an
-- object of their own. The mutable `search_path` on `public.set_updated_at` is a security-advisor
-- finding for the same reason.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    -- The app sends the athlete's name as metadata and nothing else, so the handle starts as the
    -- local part of the email — the same thing most people would have typed. `username` is
    -- deliberately not taken from `full_name`: a name is free text and a handle is a tag people
    -- look each other up by. It can be changed later through the profile update policy.
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'атлет'
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), '')
  )
  -- A brand-new account cannot already have a profile, so this is not an upsert: if a row is
  -- somehow already there, it belongs to somebody who existed first and is left alone rather than
  -- overwritten with sign-up metadata.
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the public.profiles row for a new auth.users row, in the same transaction.';

-- Fires only on insert. An update to `auth.users` metadata does not rewrite the profile, because
-- the profile is the app's row: once an athlete edits their username, a later change to the
-- account's metadata must not silently undo it.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Postgres grants EXECUTE on a new function to PUBLIC, and Supabase adds its own direct grant to
-- `anon` and `authenticated` for everything in `public` through default privileges. Revoking only
-- from PUBLIC therefore leaves the direct grants in place, and the security advisor reports the
-- function as callable by both roles through `/rest/v1/rpc/handle_new_user`. Naming all three is
-- what actually closes it. This is safe for the trigger above: the EXECUTE privilege is checked
-- when the trigger is created, not when it fires, so the trigger keeps working while no client can
-- call the function directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
