-- Searching the directory, in the database.
--
-- A search runs here for the same reason the nearby list does: the client must not download the
-- directory to find one row. `pg_trgm`'s GIN indexes make the substring match cheap — without
-- them `ILIKE '%term%'` is a sequential scan over every spot, which is exactly the client-side
-- filtering this replaces.
--
-- Name and description are both searched: the name is what the athlete remembers, and the
-- description is where „халки“ or „до стадиона“ lives when the name is a generic „Площадка с
-- лост“. There is no city column yet; when the importer starts carrying `addr:city`, that is the
-- third field to add to the predicate and to index.

create extension if not exists pg_trgm with schema extensions;

create index spots_name_trgm_idx on public.spots using gin (name extensions.gin_trgm_ops);
create index spots_description_trgm_idx
  on public.spots using gin (description extensions.gin_trgm_ops);

-- search_spots(term, limit)
-- -------------------------
-- Approved spots whose name or description contains the term, best name match first, each with
-- its equipment and photos embedded in the same shape `nearby_spots` returns — one request per
-- result set, no second fetch per card.
--
-- The term is a substring, not a full-text query: Bulgarian has no stemming configuration that
-- would earn its keep here, and an athlete typing „лост“ expects „Лостове“ to match. The LIKE
-- wildcards in the input are escaped so a `%` cannot turn into "match everything".
--
-- A term shorter than two characters matches nothing rather than everything: one letter is not a
-- search, and returning the whole directory for it would be the client-side scan again.
create or replace function public.search_spots(
  p_query text,
  p_limit integer default 20
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
      or coalesce(s.description, '') ilike search.pattern
    )
  order by similarity(s.name, btrim(p_query)) desc, s.name asc
  limit least(greatest(p_limit, 1), 50);
$$;

comment on function public.search_spots(text, integer) is
  'Approved spots whose name or description contains the term, best match first, with equipment and photos embedded.';

-- The client is the reason this function exists, so it can be called. PUBLIC's default execute is
-- revoked and the roles that should have it are named, so a role added later does not inherit
-- access by accident.
revoke execute on function public.search_spots(text, integer) from public;
grant execute on function public.search_spots(text, integer)
  to anon, authenticated, service_role;
