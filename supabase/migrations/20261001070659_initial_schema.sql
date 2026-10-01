-- Initial schema for the street fitness app.
--
-- Scope: tables, keys, referential integrity, structural integrity and timestamps. Business
-- rules — one review and one favourite per user per spot, the 1-5 rating bound on a review, and
-- the allowed values for `spots.status`, `spots.source`, `reports.reason` and
-- `spot_equipment.condition` — are deliberately left to the constraints pass that follows.
--
-- The line between "structural" and "business" here: a check that rejects a value the world
-- cannot produce (a negative width, a latitude outside the globe) belongs here, because the
-- column is wrong regardless of what the app decides to allow. A check that encodes a product
-- decision (which statuses exist, what a rating may be) belongs in the next pass, because those
-- are answers about the domain rather than about the data's physical shape.
--
-- Two decisions worth knowing before changing anything here:
--
--   * Primary keys are UUIDs rather than bigint because every one of these ids is handed to
--     the client and appears in URLs. A sequential id would let anyone enumerate another
--     user's reviews, photos or reports just by counting. `gen_random_uuid()` is v4, which
--     scatters inserts across the index; at this table size that is irrelevant, and if the
--     tables ever grow large enough for it to matter, switching the defaults to `uuidv7()`
--     (Postgres 18, or the `pg_uuidv7` extension on 17) is a drop-in change.
--
--   * RLS is enabled on every table below with no policies attached, so the Data API returns
--     zero rows rather than everything. This is deliberate: `auto_expose_new_tables` defaults
--     to true in supabase/config.toml, which grants `anon` and `authenticated` access to every
--     new table in `public`, and `create table` does not enable RLS by itself. Enabling it here
--     means the window between this migration and the policies pass is closed rather than wide
--     open. The policies and the grants that go with them arrive in the RLS pass.

-- Keeps `updated_at` honest on every table that carries one, so no application code has to
-- remember to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- One row per person who has used the app. `clerk_user_id` is the external identity from
-- Clerk, so it is what the sign-up sync matches on and it is unique; `id` is this app's own
-- key, and it is what everything else in the schema refers to.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per app user, keyed by their Clerk user id.';

-- A place to train. `rating_average` and `rating_count` are a cached aggregate over
-- `reviews`; they are maintained by a trigger, never written by the client.
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- numeric rather than double precision so a coordinate round-trips through JSON unchanged.
  -- 6 decimal places is roughly 11 cm at the equator, which is finer than we can place a pin.
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  description text,
  rating_average numeric(3, 2) not null default 0 check (rating_average between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  -- A submitted spot is 'pending' until it is approved, so nothing reaches the public map
  -- unreviewed. The valid values are pinned by a constraint in the pass after this one.
  status text not null default 'pending',
  -- Set to null if the author is deleted: a missing attribution is better than either losing
  -- a public spot or blocking account deletion.
  created_by uuid references public.profiles (id) on delete set null,
  source text not null default 'user',
  osm_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.spots is 'Places to train, with a cached rating aggregate over reviews.';

create trigger spots_set_updated_at
  before update on public.spots
  for each row
  execute function public.set_updated_at();

-- The fixed catalogue of equipment the app knows how to draw. `icon` is a name the client
-- resolves to a component, never an image path, so a rename cannot break rendering.
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text
);

comment on table public.equipment is 'Catalogue of equipment types. Rows are reference data.';

-- Which equipment a spot has, and in what quantity and state. A pure join table, so it has a
-- composite primary key and no surrogate id: the pair is the identity, and the natural key
-- also makes re-sending the same equipment idempotent.
create table public.spot_equipment (
  spot_id uuid not null references public.spots (id) on delete cascade,
  equipment_id uuid not null references public.equipment (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  condition text not null default 'good',
  primary key (spot_id, equipment_id)
);

comment on table public.spot_equipment is 'Equipment present at a spot, with quantity and condition.';

-- A photo in Supabase Storage. `storage_path` is the key inside the bucket, never a public
-- URL: serving it through the Storage API is what lets RLS decide who may read the bytes.
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  size integer not null check (size > 0),
  created_at timestamptz not null default now()
);

comment on table public.photos is 'Photos of a spot, stored in Supabase Storage.';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reviews is 'One athlete''s rating and comment for a spot.';

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at();

-- A user's saved spots. Pure join table, so the pair is the primary key — which also makes
-- saving the same spot twice a no-op instead of a duplicate.
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  spot_id uuid not null references public.spots (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

comment on table public.favorites is 'Spots a user has saved.';

-- A moderation report against a spot. Private to the reporter and moderators; `status` tracks
-- it through moderation.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  description text,
  created_at timestamptz not null default now(),
  status text not null default 'open'
);

comment on table public.reports is 'User reports against a spot, for moderation.';

-- Postgres does not index the referencing side of a foreign key, so every one of these is
-- needed to keep joins and `on delete cascade` from scanning the whole table. Where a
-- primary key already covers the column it is not repeated:
--
--   profiles.clerk_user_id   unique constraint already indexes it
--   spot_equipment.spot_id   leading column of the composite primary key
--   favorites.user_id        leading column of the composite primary key
create index spots_created_by_idx on public.spots (created_by);
create index spot_equipment_equipment_id_idx on public.spot_equipment (equipment_id);
create index photos_spot_id_idx on public.photos (spot_id);
create index photos_user_id_idx on public.photos (user_id);
create index reviews_spot_id_idx on public.reviews (spot_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index favorites_spot_id_idx on public.favorites (spot_id);
create index reports_spot_id_idx on public.reports (spot_id);
create index reports_user_id_idx on public.reports (user_id);

-- Close the tables rather than leaving them open until the policies arrive. See the note at
-- the top of this migration: with `auto_expose_new_tables` on, no policy means no rows.
alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.equipment enable row level security;
alter table public.spot_equipment enable row level security;
alter table public.photos enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;