-- Business rules the first migration deliberately left out, plus the coordinate index.
--
-- CHECK constraints rather than enum types. A CHECK is a row that already exists in the schema,
-- it can be dropped and re-added in one statement when the rules change, and it costs nothing to
-- read. The trade-off is that `supabase gen types` still types these columns as `string`, because
-- Postgres does not infer the value list. An enum would give TypeScript a real union type, but
-- deleting an enum value means recreating the type and every column using it, which is a
-- disproportionate price for a set of values that will grow.
--
-- Every constraint below is added validated. That is the default for `alter table ... add
-- constraint`, and it is stated here because `add constraint ... not valid` exists and would let
-- a bad row already in the table survive.

-- ── One review per athlete per spot ────────────────────────────────────────────────────────
-- Before this, a user could post any number of reviews for the same spot and every one of them
-- counted towards the rating, which made the aggregate trivially gameable: repeat a 5-star review
-- until the average is 5.00. The unique index also covers the `spot_id` lookup that the separate
-- reviews_spot_id_idx existed for, which is why that index is dropped at the end.
alter table public.reviews
  add constraint reviews_spot_id_user_id_key unique (spot_id, user_id);

comment on constraint reviews_spot_id_user_id_key on public.reviews is
  'An athlete has one rating per spot. Also the index for looking up a spot''s reviews.';

-- ── Valid rating ───────────────────────────────────────────────────────────────────────────
-- The aggregate is a cached average over this column, so an out-of-range rating does not produce
-- a visibly wrong spot, it produces a plausible wrong number. rating_average's own 0-5 check does
-- not help: a rating of 500 makes the average exceed 5 and the trigger then fails on the spots
-- row, so the review would be accepted and the rating write would be the thing that errors.
alter table public.reviews
  add constraint reviews_rating_check check (rating between 1 and 5);

comment on constraint reviews_rating_check on public.reviews is
  'Stars, 1 to 5. Zero is not a rating: a spot with no reviews has rating_count 0 instead.';

-- ── Valid spot status ──────────────────────────────────────────────────────────────────────
-- pending   submitted by a user, not yet visible to anyone else
-- approved  passed review and public
-- rejected  refused; kept rather than deleted so it is not resubmitted
-- closed    was real once and is now gone
alter table public.spots
  add constraint spots_status_check check (status in ('pending', 'approved', 'rejected', 'closed'));

comment on constraint spots_status_check on public.spots is
  'One of pending, approved, rejected, closed. A submitted spot is pending until a moderator approves it.';

-- ── Valid source ───────────────────────────────────────────────────────────────────────────
-- user   added by an athlete in the app
-- osm    imported from OpenStreetMap
-- import imported from a file rather than from the OSM API
alter table public.spots
  add constraint spots_source_check check (source in ('user', 'osm', 'import'));

comment on constraint spots_source_check on public.spots is
  'One of user, osm, import. An imported spot carries an osm_id; a user-submitted one does not.';

-- ── Valid report reason ───────────────────────────────────────────────────────────────────
-- A fixed list so that reports can be triaged and counted by reason. A free-text column makes
-- "spots reported as closed" unanswerable, since the same reason arrives spelled five ways.
alter table public.reports
  add constraint reports_reason_check check (
    reason in ('wrong_location', 'does_not_exist', 'equipment_wrong', 'closed', 'duplicate', 'inappropriate')
  );

comment on constraint reports_reason_check on public.reports is
  'One of wrong_location, does_not_exist, equipment_wrong, closed, duplicate, inappropriate.';

-- ── Valid equipment condition ─────────────────────────────────────────────────────────────
-- Pinned to the union already declared in src/components/EquipmentList.tsx, so the database and
-- the UI cannot disagree about what a worn bar is.
alter table public.spot_equipment
  add constraint spot_equipment_condition_check check (condition in ('good', 'worn', 'damaged'));

comment on constraint spot_equipment_condition_check on public.spot_equipment is
  'One of good, worn, damaged. Mirrors EquipmentCondition in src/components/EquipmentList.tsx.';

-- ── Index for spot coordinates ────────────────────────────────────────────────────────────
-- The map asks for the spots inside the current viewport, which is a bounding box on both
-- coordinates. A composite btree with latitude leading serves that: the range on latitude
-- narrows the scan and longitude filters within it, so one index covers both bounds instead of
-- needing two single-column indexes that Postgres cannot combine.
--
-- This is deliberately not PostGIS. Radius search wants `geography` plus a GiST index, which means
-- enabling an extension and changing the column types, and the generated client types change with
-- it. A bounding box over plain numeric is what a pan-and-zoom map actually sends, so it is the
-- right size of answer for now. Reach for PostGIS when the query becomes "within N kilometres",
-- which a bounding box answers badly near the poles and for large radii.
--
-- `status` is not part of the key. The map will filter to approved spots, and a low-cardinality
-- leading column adds nothing to selectivity here. If that filter turns out to be the common
-- case, the index becomes (status, latitude, longitude).
create index spots_latitude_longitude_idx on public.spots (latitude, longitude);

-- ── Redundant index, now covered ──────────────────────────────────────────────────────────
-- reviews_spot_id_idx was the only index starting with reviews.spot_id. The unique constraint
-- above is on (spot_id, user_id), and a btree can serve any lookup on its leading column, so the
-- old index is now strictly redundant: it costs an extra write and storage per review and buys
-- nothing. Dropping it also leaves the one rule this migration should not break intact, which is
-- that Postgres does not index the referencing side of a foreign key and on delete cascade would
-- otherwise scan reviews.
drop index public.reviews_spot_id_idx;