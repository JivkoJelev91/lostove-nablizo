-- The feed loads one page at a time instead of the whole directory.
--
-- V1 has no map: the feed is the spatial surface, and the radius query already carries the
-- spatial work on PostGIS (`ST_DWithin` over the GiST index). What it did not carry was a bound:
-- a dense city could return every approved spot inside 25 km with its equipment and photo rows in
-- one response, and the no-location fallback downloaded the entire directory. The clause that was
-- missing is `limit`.
--
-- `nearby_spots` grows `p_limit`/`p_offset` and stays ordered by distance, so page one is the
-- nearest spots and page two continues outward. OFFSET rather than a keyset cursor: the keyset
-- spelling of "the next nearest after this one" is a distance-and-id tuple whose gain only shows
-- on directories far larger than this one, and the simpler query is the one that stays correct.
-- The cap of 50 bounds a single response regardless of what a caller asks for; the app asks for
-- 20.

drop function public.nearby_spots(double precision, double precision, double precision);

create function public.nearby_spots(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_m double precision,
  p_limit integer default 20,
  p_offset integer default 0
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
  verified_at timestamptz,
  verification_source text,
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
    s.verified_at,
    s.verification_source,
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
  order by distance_m asc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

comment on function public.nearby_spots(double precision, double precision, double precision, integer, integer) is
  'One page of approved spots within radius_m metres of (lat, lng), nearest first, with distance_m, verification, equipment and photos. p_limit is capped at 50.';

revoke execute on function public.nearby_spots(double precision, double precision, double precision, integer, integer) from public;
grant execute on function public.nearby_spots(double precision, double precision, double precision, integer, integer)
  to anon, authenticated, service_role;
