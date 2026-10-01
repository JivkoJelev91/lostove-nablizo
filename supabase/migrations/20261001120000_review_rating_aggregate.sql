-- Keeps spots.rating_average and spots.rating_count in step with reviews, so no client has to
-- compute or trust a number of its own.
--
-- The aggregate is recomputed from the review rows rather than adjusted by the review's rating.
-- A delta update looks cheaper, but it needs the previous average to be exactly right: one bad
-- round, one retried write, or one row changed outside the trigger puts the value permanently
-- out of step with the reviews, and nothing would ever correct it. Recomputing reads the reviews
-- that are actually there, so the value cannot drift, and it is naturally idempotent — running it
-- twice changes nothing the second time.
--
-- `security definer` because reviews have RLS enabled (with no policies yet). A security invoker
-- trigger would run as the caller, and the caller's UPDATE on spots would be rejected by RLS, so
-- every rating a user submitted would fail. The function is revoked from anon and authenticated
-- below: without that, anyone able to insert a review could call it directly and write to any
-- spot. Trigger functions are permission-checked when the trigger is created, not when it fires,
-- so revoking afterwards does not stop the trigger working.
--
-- `set search_path` is required, not decorative: without it this function resolves `spots` and
-- `reviews` through whatever search_path the caller set, so a caller who controls it can point
-- the function at their own table.

create or replace function public.recompute_spot_rating(target_spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Take the spot's row lock before reading the reviews, in its own statement. This is what
  -- makes two concurrent ratings of the same spot safe. Under READ COMMITTED each statement gets
  -- a fresh snapshot, so the aggregate below is read after the lock is held; anyone else rating
  -- this spot is blocked on the lock and commits before this reads. Locking and recomputing in a
  -- single statement would not do it: the blocked statement keeps the snapshot it took before
  -- waiting, so it can read a reviews table that is missing the other transaction's row and
  -- write an average for one rating as though it were the whole set.
  perform 1
  from public.spots
  where id = target_spot_id
    for update;

  update public.spots as s
  set rating_average = aggregate.average,
      rating_count = aggregate.total
  from (
    select
      count(*)::integer as total,
      -- avg() over zero rows is NULL, not 0, and rating_average is NOT NULL. With no GROUP BY
      -- this subquery always returns exactly one row, so a spot whose last review was deleted
      -- lands on 0 rather than on nothing.
      coalesce(round(avg(r.rating)::numeric, 2), 0) as average
    from public.reviews as r
    where r.spot_id = target_spot_id
  ) as aggregate
  where s.id = target_spot_id
    -- Skip the write when nothing moved. An UPDATE produces a new row version even when it writes
    -- identical values, so recomputing unconditionally would churn every rating row's row version,
    -- WAL and index entries for no change, and restamp updated_at in any transaction that does move
    -- the clock. Recompute is meant to be safely repeatable, including from a repair job.
    and (s.rating_average <> aggregate.average or s.rating_count <> aggregate.total);
end;
$$;

comment on function public.recompute_spot_rating(uuid) is
  'Recomputes a spot''s cached rating from its reviews. Called by trigger; not for clients.';

create or replace function public.reviews_keep_spot_rating_in_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recompute_spot_rating(new.spot_id);

  elsif tg_op = 'DELETE' then
    perform public.recompute_spot_rating(old.spot_id);

  elsif new.rating is distinct from old.rating and new.spot_id = old.spot_id then
    -- An edit that only changes the rating, comment or anything else: one spot to fix.
    perform public.recompute_spot_rating(new.spot_id);

  elsif new.spot_id is distinct from old.spot_id then
    -- The review was moved to another spot. Both are now wrong, and the old spot is the one
    -- callers are least likely to remember, so it is fixed first.
    perform public.recompute_spot_rating(old.spot_id);
    perform public.recompute_spot_rating(new.spot_id);
  end if;
  -- Reached by an UPDATE that changed neither rating nor spot_id, such as editing the comment.
  -- The aggregate is already correct, so there is nothing to do and no lock to take.
  return null;
end;
$$;

comment on function public.reviews_keep_spot_rating_in_sync() is
  'Keeps spots.rating_average and rating_count in step with reviews on insert, edit and delete.';

-- AFTER, not BEFORE: the aggregate is read from the reviews table, so the row has to be written
-- first. BEFORE would read the reviews without this row and write the value it had before.
create trigger reviews_sync_spot_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.reviews_keep_spot_rating_in_sync();

-- The trigger keeps working after this because a trigger function's EXECUTE privilege is checked
-- when CREATE TRIGGER runs, not when the trigger fires.
revoke execute on function public.recompute_spot_rating(uuid) from public, anon, authenticated;
revoke execute on function public.reviews_keep_spot_rating_in_sync() from public, anon,
  authenticated;