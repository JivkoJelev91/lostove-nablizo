-- The city a spot sits in, and the search that reads it.
--
-- OSM carries `addr:city` on some elements; the importer copies it when present and leaves the
-- column null when it is not. Null is the honest value: most imported stations are unnamed
-- equipment pins, and inventing the nearest city would put a fact in the row that OSM did not
-- state.

alter table public.spots add column city text;

comment on column public.spots.city is
  'The city or town the spot is in, from OSM addr:city when the element carried it.';

create index spots_city_trgm_idx on public.spots using gin (city extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- nearby_spots and search_spots grow a `city` column
-- ---------------------------------------------------------------------------
--
-- A return-type change cannot go through `create or replace`, so both functions are dropped and
-- rebuilt. Their signatures, filters and index-backed predicates are unchanged; only the returned
-- card grows the new column, and the grants are re-added below.

drop function public.nearby_spots(double precision, double precision, double precision);

create function public.nearby_spots(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_m double precision
)
returns table (
  id uuid,
  name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  city text,
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
    s.city,
    s.description,
    s.rating_average,
    s.rating_count,
    s.status,
    s.created_by,
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
          jsonb_build_object(
            'id', p.id,
            'created_at', p.created_at,
            'storage_path', p.storage_path,
            'user_id', p.user_id,
            'width', p.width,
            'height', p.height
          )
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
    and p_radius_m > 0
    and ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_m
    )
  order by distance_m asc;
$$;

comment on function public.nearby_spots(double precision, double precision, double precision) is
  'Approved spots within radius_m metres of (lat, lng), nearest first, each with distance_m, equipment and photos.';

revoke execute on function public.nearby_spots(double precision, double precision, double precision) from public;
grant execute on function public.nearby_spots(double precision, double precision, double precision)
  to anon, authenticated, service_role;

drop function public.search_spots(text, integer);

create function public.search_spots(
  p_query text,
  p_limit integer default 20
)
returns table (
  id uuid,
  name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  city text,
  description text,
  rating_average numeric(3, 2),
  rating_count integer,
  status text,
  created_by uuid,
  spot_equipment jsonb,
  photos jsonb
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
    s.city,
    s.description,
    s.rating_average,
    s.rating_count,
    s.status,
    s.created_by,
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
          jsonb_build_object(
            'id', p.id,
            'created_at', p.created_at,
            'storage_path', p.storage_path,
            'user_id', p.user_id,
            'width', p.width,
            'height', p.height
          )
          order by p.created_at
        )
        from public.photos as p
        where p.spot_id = s.id
      ),
      '[]'::jsonb
    ) as photos
  from public.spots as s
  cross join lateral (
    select
      '%'
        || replace(replace(replace(btrim(p_query), '\', '\\'), '%', '\%'), '_', '\_')
        || '%' as pattern
  ) as search
  where s.status = 'approved'
    and length(btrim(p_query)) >= 2
    and (
      s.name ilike search.pattern
      or s.city ilike search.pattern
      or coalesce(s.description, '') ilike search.pattern
    )
  order by similarity(s.name, btrim(p_query)) desc, s.name asc
  limit least(greatest(p_limit, 1), 50);
$$;

comment on function public.search_spots(text, integer) is
  'Approved spots whose name, city or description contains the term, best match first, with equipment and photos embedded.';

revoke execute on function public.search_spots(text, integer) from public;
grant execute on function public.search_spots(text, integer)
  to anon, authenticated, service_role;
