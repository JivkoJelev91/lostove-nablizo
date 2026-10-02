-- PostGIS for geographic queries (Prompt 38)
--
-- Decision
-- --------
-- The constraint migration deliberately deferred PostGIS to when radius queries ("within N km")
-- become the common case. This is that case, so the extension arrives now and spots get a
-- `geography(Point, 4326)` representation beside the `latitude`/`longitude` numerics.
--
-- Why both, rather than replacing the numerics
-- --------------------------------------------
-- The numerics stay the canonical, human-readable coordinate: the client already reads them for
-- forms, mappers and the add/edit flow, and they are what a person sees in the table. `location`
-- is the spatial representation the index and the distance functions operate on. A generated
-- column keeps the second derived from the first, so the two cannot drift: there is no trigger to
-- remember, no backfill to re-run, and no way for a direct SQL write to update one and not the
-- other.
--
-- Why geography and not geometry
-- ------------------------------
-- `geography` measures on the sphere, so `ST_Distance` and `ST_DWithin` take and return metres
-- without a projection or a units argument. That is the same model the client-side haversine in
-- src/features/spots/distance.ts uses, so a distance shown from the database and one computed in
-- the app agree to within a rounding step.
--
-- The `set search_path` at the top is not decoration: PostGIS lives in `extensions` on a hosted
-- Supabase project and under the migration's own schema locally, and this makes every unqualified
-- `ST_` call below resolve in either. The generated expression is parsed once at DDL time and
-- stored as an expression tree, so only *this* migration needs the wider path for it; the
-- function re-declares its own.

set search_path = public, extensions, pg_temp;

create extension if not exists postgis;

-- A stored generated column, so it is part of the row and can carry an index. `geography` is
-- computed from the numerics in the same order `ST_MakePoint` expects: longitude first, then
-- latitude. Getting that pair the wrong way round puts Sofia in the Indian Ocean, so it is worth
-- reading twice.
alter table public.spots
  add column location geography(Point, 4326)
  generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) stored;

comment on column public.spots.location is
  'Spatial representation of (latitude, longitude), generated and indexed for radius queries.';

-- GiST is the index type geography's operators support; without it `ST_DWithin` degrades to a
-- sequential scan over every spot. This is the index `nearby_spots` is built to use, and the same
-- one a future viewport query will use for its bounding box.
create index spots_location_gist on public.spots using gist (location);

-- nearby_spots(lat, lng, radius_m)
-- --------------------------------
-- The prompt's function, with the radius in metres.
--
-- `security invoker`, so the caller's RLS applies: an anonymous caller sees approved spots and
-- nothing else, exactly as if they had queried the table. `security definer` was the first
-- version of this and was wrong twice over — it would have needed its `status = 'approved'` filter
-- as the only thing between a guest and the moderation queue, and it is a privilege escalation
-- waiting for the filter to be edited without the comment beside it being read.
--
-- It returns the equipment and the photos as embedded JSON, not just the spot's own columns.
-- A card needs all three, and the alternative — return ids, then fetch the relations in a second
-- request — passes every id through a URL query string, which has an 8 kB ceiling at the proxy.
-- That is roughly 150 spots, and a 25 km radius over imported OSM data will pass it. One function
-- that returns the card is the shape that survives its own data volume.
--
-- `stable` because it reads without writing, which lets the planner inline it.
create or replace function public.nearby_spots(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_m double precision
)
returns table (
  id uuid,
  name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  description text,
  rating_average numeric(3, 2),
  rating_count integer,
  status text,
  created_by uuid,
  spot_equipment jsonb,
  photos jsonb,
  distance_m double precision
)
language sql
security invoker
set search_path = public, extensions, pg_temp
stable
as $$
  select
    s.id,
    s.name,
    s.latitude,
    s.longitude,
    s.description,
    s.rating_average,
    s.rating_count,
    s.status,
    s.created_by,
    -- The same shape PostgREST embeds for a relation, built by hand because a function's return
    -- columns are flat. `coalesce` to an empty array rather than null: the mapper treats a missing
    -- relation and an empty one differently, and a spot with no equipment is the empty case.
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'condition', se.condition,
            'quantity', se.quantity,
            'equipment', jsonb_build_object('name', e.name)
          )
          order by e.name
        )
        from public.spot_equipment as se
        join public.equipment as e on e.id = se.equipment_id
        where se.spot_id = s.id
      ),
      '[]'::jsonb
    ) as spot_equipment,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('created_at', p.created_at, 'storage_path', p.storage_path)
          order by p.created_at
        )
        from public.photos as p
        where p.spot_id = s.id
      ),
      '[]'::jsonb
    ) as photos,
    ST_Distance(
      s.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) as distance_m
  from public.spots as s
  where s.status = 'approved'
    -- A non-positive radius asks for nothing, so answer nothing. Letting it through would return
    -- the caller's own position for a negative number, which reads as "here" rather than "bad
    -- argument", and no caller can act on that.
    and p_radius_m > 0
    -- The origin is built the same way the column is, which is what lets the GiST index answer
    -- the radius instead of scanning. `ST_DWithin` is the index-aware form; `ST_Distance < r` is
    -- not, and silently costs a full scan on a table of any size.
    and ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_m
    )
  order by distance_m asc;
$$;

comment on function public.nearby_spots(double precision, double precision, double precision) is
  'Approved spots within radius_m metres of (lat, lng), nearest first, each with distance_m, equipment and photos.';

-- The client is the reason this function exists, so it can be called. PUBLIC's default execute is
-- revoked and the three roles that should have it are named, so a role added later does not
-- inherit access by accident.
revoke execute on function public.nearby_spots(double precision, double precision, double precision) from public;
grant execute on function public.nearby_spots(double precision, double precision, double precision)
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Deliberately absent: a viewport function
-- ---------------------------------------------------------------------------
-- A map viewport is a bounding box, not a radius, and the honest way to answer it is a bbox
-- predicate that uses the same GiST index:
--
--   where s.location && ST_MakeEnvelope(west, south, east, north, 4326)::geography
--
-- It is not built here because there is no map screen to call it. Adding an unused function now
-- would fix its parameter list before anything exercises it, and the `&&` predicate above
-- demonstrates the index is already in place for the day the screen exists.
