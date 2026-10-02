-- A moderator is a row, not a flag on a public profile.
--
-- `profiles` is publicly readable, so a boolean there would publish who moderates the directory.
-- Membership in a private table keeps that fact exactly as private as the queue it guards: RLS is
-- on with no policies, so no client can read the list, and the security-definer helper below is
-- the only door, answering one question — "is the caller a moderator?".
--
-- Granting the role is a deliberate, out-of-band act:
--
--   insert into public.moderators (user_id) values ('<the account uuid>') on conflict do nothing;
--
-- There is no client path to that insert, by design.

create table public.moderators (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.moderators is
  'Accounts allowed to triage reports and moderate spots. Granted by hand; never by a client.';

alter table public.moderators enable row level security;

revoke all on public.moderators from anon, authenticated;

create function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.moderators where user_id = (select auth.uid())
  );
$$;

comment on function public.is_moderator() is
  'True when the caller is in public.moderators. The only moderator check a policy or RPC performs.';

revoke execute on function public.is_moderator() from public;
grant execute on function public.is_moderator() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- The moderation policies
-- ---------------------------------------------------------------------------
--
-- Moderators read the whole directory, not just the approved part, and read every report. Those
-- two reads are what a queue is: a report names a spot that may be pending, rejected or closed,
-- and a moderator has to see the row before deciding about it.
create policy "moderators read every spot"
  on public.spots for select
  to authenticated
  using (public.is_moderator());

create policy "moderators read every report"
  on public.reports for select
  to authenticated
  using (public.is_moderator());

-- Content edits reuse the column grants `authenticated` already has (name, description, latitude,
-- longitude). `status` is deliberately not among them: with that grant an owner could approve
-- their own submission, so status changes go through `moderate_spot` below, which can check who
-- is asking.
create policy "moderators edit every spot"
  on public.spots for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- A report's lifecycle is its `status`, the one column a moderator may update. The grant is
-- column-narrow for the same reason the spot grants are, and no reporter-facing update policy
-- exists, so a report cannot be retracted into a state the queue cannot read.
grant update (status) on public.reports to authenticated;

create policy "moderators set report status"
  on public.reports for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

alter table public.reports
  add constraint reports_status_check check (status in ('open', 'resolved', 'dismissed'));

comment on constraint reports_status_check on public.reports is
  'One of open, resolved, dismissed. Only moderation moves a report out of open.';

-- ---------------------------------------------------------------------------
-- Changing a spot's status
-- ---------------------------------------------------------------------------
--
-- `status` is in no UPDATE grant, so this function is the only way an authenticated caller can
-- move it. It checks the moderator table itself rather than trusting a policy, and it is security
-- definer for the same reason the reset trigger is: the caller has no grant on the column, so an
-- invoker function would be refused by the column privilege before the check inside it could run.
--
-- The reset trigger fires on content changes, not on a status-only update, so a moderator
-- approving or closing a spot passes straight through.
create function public.moderate_spot(p_spot_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can change a spot''s status';
  end if;

  if p_status not in ('pending', 'approved', 'rejected', 'closed') then
    raise exception 'Unknown spot status: %', p_status;
  end if;

  update public.spots set status = p_status where id = p_spot_id;
end;
$$;

comment on function public.moderate_spot(uuid, text) is
  'Moves a spot to one of the moderation states. The only path a client has to spots.status.';

revoke execute on function public.moderate_spot(uuid, text) from public;
grant execute on function public.moderate_spot(uuid, text) to authenticated;
