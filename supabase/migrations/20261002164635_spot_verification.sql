-- Spot verification: when a spot was last checked, by what kind of source, and by whom.
--
-- A spot's worth decays with its information: equipment rusts, gets removed, or a station is
-- demolished. The app shows that decay as a colour, so the database has to remember the facts
-- behind the colour rather than a stored tone. Three columns answer the three questions a reader
-- (and the badge) asks: when, from what kind of check, and, when a signed-in person did it, who.
--
-- `verified_at` is null until something checks the spot. Null is not an error state: a spot that
-- no one has confirmed simply has no recency to show, and the badge is hidden rather than
-- claiming a date the row does not carry.

alter table public.spots
  add column verified_at timestamptz,
  add column verification_source text,
  add column verified_by uuid references public.profiles (id) on delete set null;

alter table public.spots
  add constraint spots_verification_source_check
  check (verification_source in ('import', 'moderator', 'user'));

comment on column public.spots.verified_at is
  'When the spot was last checked as still existing with the equipment it lists. Null: never checked.';

comment on column public.spots.verification_source is
  'How the last check happened: the OSM import, a moderator review, or an athlete on the spot.';

comment on column public.spots.verified_by is
  'The account that performed the last check, when a signed-in person did it. Null for imports.';

comment on constraint spots_verification_source_check on public.spots is
  'One of import, moderator, user. Null while verified_at is null.';

-- ---------------------------------------------------------------------------
-- Backfill
-- ---------------------------------------------------------------------------
--
-- The two kinds of spot that already exist each have an honest date to inherit. An imported row
-- was checked by definition when the import read it from OSM, so its creation date is the
-- verification date. An approved user row was last moved to 'approved' by moderation -- approval
-- is the act that put it in front of the public -- and its `updated_at` is when that happened.
-- Nothing is invented for rows that were never approved; they stay null until a real check.

update public.spots
set verified_at = created_at, verification_source = 'import'
where source in ('osm', 'import') and verified_at is null;

update public.spots
set verified_at = updated_at, verification_source = 'moderator'
where source = 'user' and status = 'approved' and verified_at is null;

-- ---------------------------------------------------------------------------
-- An edit invalidates the verification
-- ---------------------------------------------------------------------------
--
-- Replaces the status-reset trigger with one that also clears the verification. The two belong
-- together: the status goes back to pending because the content a moderator approved changed, and
-- the verification date described that same content, so keeping it would let an edited spot wear
-- a fresh badge for facts nobody checked. `moderate_spot` re-stamps on the next approval.

create or replace function public.spots_reset_status_on_edit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.name is distinct from old.name
    or new.description is distinct from old.description
    or new.latitude is distinct from old.latitude
    or new.longitude is distinct from old.longitude
  then
    new.status := 'pending';
    new.verified_at := null;
    new.verification_source := null;
    new.verified_by := null;
  end if;

  return new;
end;
$$;

comment on function public.spots_reset_status_on_edit() is
  'Forces spots.status to ''pending'' and clears the verification when the content a moderator approved changes.';

-- ---------------------------------------------------------------------------
-- Approval is a verification
-- ---------------------------------------------------------------------------
--
-- Only the approval transition stamps: a moderator who moves a spot to 'approved' has just read
-- its content against the listing, which is the check the columns record. Closing or rejecting a
-- spot leaves the previous verification alone -- the history of when it was last true is still
-- the truth about the spot, and an approval later stamps over it.

create or replace function public.moderate_spot(p_spot_id uuid, p_status text)
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

  update public.spots
  set status = p_status,
      verified_at = case when p_status = 'approved' then now() else verified_at end,
      verification_source = case when p_status = 'approved' then 'moderator' else verification_source end,
      verified_by = case when p_status = 'approved' then auth.uid() else verified_by end
  where id = p_spot_id;
end;
$$;

comment on function public.moderate_spot(uuid, text) is
  'Moves a spot to one of the moderation states, stamping a moderator verification on approval. The only path a client has to spots.status.';

-- ---------------------------------------------------------------------------
-- nearby_spots and search_spots grow the verification columns
-- ---------------------------------------------------------------------------
--
-- The cards on the discovery and search lists colour their verification badge, so both functions
-- return the date and its source. As with `city`, a return-type change cannot go through
-- `create or replace`: both are dropped and rebuilt with unchanged filters and predicates.

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
  order by distance_m asc;
$$;

comment on function public.nearby_spots(double precision, double precision, double precision) is
  'Approved spots within radius_m metres of (lat, lng), nearest first, each with distance_m, verification, equipment and photos.';

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
  verified_at timestamptz,
  verification_source text,
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
  'Approved spots whose name, city or description contains the term, best match first, with verification, equipment and photos embedded.';

revoke execute on function public.search_spots(text, integer) from public;
grant execute on function public.search_spots(text, integer)
  to anon, authenticated, service_role;
