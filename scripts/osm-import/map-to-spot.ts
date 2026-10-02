import type { OsmCandidate, SpotImport } from './types.ts';

/**
 * The mapping layer: an OSM candidate to a row our schema can hold.
 *
 * Prompt 41 asks for a clear mapping and for unknown fields to stay unknown. This file is that
 * mapping, and the rules it applies are:
 *
 * - Coordinates pass through unchanged. OSM's WGS 84 and ours are the same system.
 * - The name passes through. Normalization has already substituted the generic default for the
 *   97% of Bulgarian stations OSM does not name, and that default is visible via `nameFromOsm`.
 * - `source` is `'osm'` and `status` is `'approved'`. Both are the import's whole point: an
 *   imported spot is visibly imported, and it is live rather than queued, because a one-off seed
 *   that lands in a moderation queue nobody is working would leave the app as empty as before.
 * - `description` is OSM's when it has one. It is not in the prompt's field list, but it is real
 *   data on a nullable column, and dropping it would lose the only free text OSM offers.
 * - Equipment is mapped only where the `fitness_station=*` value is one this app can draw. Every
 *   other value is reported as unmapped and dropped, because guessing that `exercise_bike` means
 *   something in a catalogue of seven pieces of street equipment would put a fact in the database
 *   that OSM did not state.
 *
 * Everything the schema needs and OSM does not have — `condition`, `quantity`, `created_by` — is
 * left for the database default or null rather than invented here. A condition is not known from
 * an import, and the column's own default is the honest value; the importer simply does not send
 * one.
 */

/**
 * The OSM `fitness_station` values this app has equipment for.
 *
 * OSM's values are lowercase with underscores; the keys are exactly the catalogue names in
 * `src/features/spots/equipment-icons.ts`. A value not in this map is unknown, not similar: a
 * `horizontal_bar` is a pull-up bar, but a `balance_beam` is simply not one of our seven, and
 * mapping it onto the nearest one would be an invention.
 */
const EQUIPMENT_BY_OSM_VALUE: Record<string, string> = {
  horizontal_bar: 'Pull-up',
  pull_up_bar: 'Pull-up',
  pull_up_bars: 'Pull-up',
  parallel_bars: 'Dips',
  dip_bars: 'Dips',
  dip_bar: 'Dips',
  push_up_bar: 'Push-up bars',
  push_up_bars: 'Push-up bars',
  pushup_bars: 'Push-up bars',
  'push-up': 'Push-up bars',
  rings: 'Rings',
  monkey_bars: 'Monkey bars',
  monkey_bar: 'Monkey bars',
  sit_up_bench: 'Sit-up bench',
  'sit-up_bench': 'Sit-up bench',
  sit_up: 'Sit-up bench',
  'sit-up': 'Sit-up bench',
  ladder: 'Ladder',
};

/** OSM values that describe the element rather than a piece of equipment. */
const NON_EQUIPMENT_VALUES = new Set(['yes', 'no', 'fitness_station']);

export type MappingResult = {
  record: SpotImport;
  /** OSM equipment values with no catalogue entry, so the gap can be seen and closed later. */
  unmappedEquipment: readonly string[];
};

/**
 * The `fitness_station` values on one element.
 *
 * OSM's documented separator for several values on one key is a semicolon, so a node can be
 * `horizontal_bar;parallel_bars`. In Bulgarian data some mappers use commas instead — the first
 * real run found `pull_up_bar,hyperextension,parallel_bars,rings,sit-up,wall_bars` as a single
 * value — so both are treated as separators. That is a reading of the data, not a guess: the
 * pieces are individually recognisable, and splitting on a character the value clearly uses is
 * how they get read.
 *
 * The result is deduped because two OSM spellings can land on the same catalogue name.
 */
function equipmentValues(candidate: OsmCandidate): string[] {
  const raw = candidate.tags.fitness_station;

  if (raw === undefined) return [];

  return raw
    .split(/[;,]/)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

export function mapCandidate(candidate: OsmCandidate): MappingResult {
  const equipment = new Set<string>();
  const unmapped = new Set<string>();

  for (const value of equipmentValues(candidate)) {
    const name = EQUIPMENT_BY_OSM_VALUE[value];

    if (name !== undefined) {
      equipment.add(name);
    } else if (!NON_EQUIPMENT_VALUES.has(value)) {
      unmapped.add(value);
    }
  }

  const description = candidate.tags.description?.trim();

  return {
    record: {
      osmType: candidate.osmType,
      osmId: candidate.osmId,
      name: candidate.name,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      description: description === undefined || description.length === 0 ? null : description,
      source: 'osm',
      status: 'approved',
      equipment: [...equipment],
    },
    unmappedEquipment: [...unmapped],
  };
}
