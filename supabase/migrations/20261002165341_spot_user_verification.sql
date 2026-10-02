-- Community verification: one row per athlete who confirmed a spot still exists.
--
-- `spots.verified_at` answers when the spot was last checked. This table answers how many people
-- have checked it and keeps the individual confirmations, so the count is a `count(*)` away and a
-- suspicious or outdated spot is a date comparison over the same rows. Nothing is denormalised:
-- a confirmation counter on `spots` would be one more thing that can drift, and the table is
-- small enough that counting it costs nothing.
--
-- One row per athlete per spot, not one per tap: a second confirmation refreshes the athlete's
-- row and the spot's date rather than inflating the count. "Number of confirmations" therefore
-- means distinct athletes, which is the number that says something.

create table public.spot_verifications (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (spot_id, user_id)
);

comment on table public.spot_verifications is
  'One athlete''s confirmation that a spot still exists with the equipment it lists.';

comment on column public.spot_verifications.created_at is
  'When that athlete last confirmed the spot; a repeat confirmation refreshes this.';

alter table public.spot_verifications enable row level security;

-- Readable wherever the parent spot is readable, for the same reason photos and reviews are: a
-- confirmation row must not disclose that a pending spot exists.
create policy "verifications are public for approved spots, and for your own"
  on public.spot_verifications for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (s.status = 'approved' or s.created_by = (select auth.uid()))
    )
  );

-- No insert, update or delete policy: `verify_spot` below is the only writer, so a client cannot
-- name another athlete as the verifier, backdate a confirmation or delete one. That also keeps
-- the count honest -- every row is one real signed-in confirmation.

-- ---------------------------------------------------------------------------
-- Confirming a spot
-- ---------------------------------------------------------------------------
--
-- Security definer for the same reason `moderate_spot` is: the athlete has no UPDATE grant on
-- `spots`, and the verification columns are exactly what this function writes. The function
-- checks the parent's state itself rather than trusting a policy, because there is no policy
-- path at all -- a signed-in client calls this and nothing else.
create function public.verify_spot(p_spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  verifier_id uuid := auth.uid();
  spot_status text;
begin
  if verifier_id is null then
    raise exception 'Sign in to verify a spot';
  end if;

  select status into spot_status from public.spots where id = p_spot_id;

  if spot_status is null then
    raise exception 'No such spot';
  end if;

  -- Pending and rejected spots are not in front of the public, so nobody can be standing at one
  -- to confirm it; a closed spot is kept out for the same reason it is closed.
  if spot_status <> 'approved' then
    raise exception 'Only approved spots can be verified';
  end if;

  insert into public.spot_verifications (spot_id, user_id)
  values (p_spot_id, verifier_id)
  on conflict (spot_id, user_id) do update set created_at = now();

  update public.spots
  set verified_at = now(),
      verification_source = 'user',
      verified_by = verifier_id
  where id = p_spot_id;
end;
$$;

comment on function public.verify_spot(uuid) is
  'Records that the signed-in athlete confirmed an approved spot, refreshing its verification date.';

revoke execute on function public.verify_spot(uuid) from public;
grant execute on function public.verify_spot(uuid) to authenticated;
