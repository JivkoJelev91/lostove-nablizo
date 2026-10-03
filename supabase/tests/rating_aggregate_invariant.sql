-- The rating aggregate invariant, checked against a real database.
--
-- The trigger in 20261001120000_review_rating_aggregate.sql maintains the cached average and
-- count on every review insert, edit and delete, and this is the fact it promises: no spot's
-- cached rating disagrees with the reviews actually stored for it. A unit test cannot reach a
-- trigger, and the local stack needs Docker, which this machine does not have — but the linked
-- project is reachable through the CLI, and this check reads only, so running it against the
-- linked database is safe:
--
--   pnpm exec supabase db query --linked --file supabase/tests/rating_aggregate_invariant.sql
--   pnpm exec supabase db query --file supabase/tests/rating_aggregate_invariant.sql   (local, when Docker exists)
--
-- Zero rows means the invariant holds. Any row names a spot whose cached aggregate has drifted,
-- which is the shape a repair script would act on.
select
  s.id,
  s.name,
  s.rating_average,
  s.rating_count,
  coalesce(round(avg(r.rating)::numeric, 2), 0) as computed_average,
  count(r.id) as computed_count
from public.spots as s
left join public.reviews as r on r.spot_id = s.id
group by s.id
having
  s.rating_count <> count(r.id)
  or s.rating_average <> coalesce(round(avg(r.rating)::numeric, 2), 0);
