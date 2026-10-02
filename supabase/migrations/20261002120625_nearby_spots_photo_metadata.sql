-- `nearby_spots` returns each spot's photos as JSON, and the app now edits and deletes those
-- photos, so the embedded photos need the same fields the table has: row id, uploader, and the
-- stored dimensions. Without them, the mapper could still render the gallery but the edit form
-- would have no row to point at.
--
-- Replaced rather than redefined: the signature, `security invoker`, the `status = 'approved'`
-- filter and the GiST-backed `ST_DWithin` are all unchanged. Only the photos object grows.

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
