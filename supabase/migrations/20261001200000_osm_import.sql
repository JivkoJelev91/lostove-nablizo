-- The keys and reference data the OSM import needs.
--
-- Three things, all required before an import can run, and all of them small.
--
-- 1. The equipment catalogue was never seeded. The table exists and the app resolves equipment
--    by name, but it is empty in the linked project — which means a spot added from the app
--    attaches no equipment either. The seven names below are the ones
--    src/features/spots/equipment-icons.ts knows how to draw.
--
-- 2. `equipment.name` becomes unique. The importer resolves a name to an id, and a second row
--    with the same name would make that lookup ambiguous; the constraint is also what makes the
--    seed below idempotent.
--
-- 3. `spots` gains `osm_type`, and the OSM key becomes (osm_type, osm_id) rather than osm_id
--    alone. An OSM id is only unique within its element type — node 123 and way 123 can both
--    exist — so an idempotent import keyed on the id alone would treat two different places as
--    one. The index is partial because every user-created spot has `osm_id` null, and nulls must
--    not participate in uniqueness.
--
-- This migration does not delete anything. The import only inserts, and it never touches a spot
-- with `source = 'user'`.

alter table public.equipment
  add constraint equipment_name_key unique (name);

comment on constraint equipment_name_key on public.equipment is
  'Equipment is resolved by name; a duplicate name would make that lookup ambiguous.';

insert into public.equipment (name) values
  ('Pull-up'),
  ('Dips'),
  ('Rings'),
  ('Monkey bars'),
  ('Ladder'),
  ('Sit-up bench'),
  ('Push-up bars')
on conflict (name) do nothing;

alter table public.spots
  add column osm_type text check (osm_type in ('node', 'way', 'relation'));

comment on column public.spots.osm_type is
  'The OSM element type the osm_id belongs to. An OSM id is unique per type, not globally.';

create unique index spots_osm_key on public.spots (osm_type, osm_id)
  where osm_id is not null;

comment on index public.spots_osm_key is
  'Makes an OSM import idempotent: the same OSM element cannot be inserted twice.';
