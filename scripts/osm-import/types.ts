/**
 * The shapes that travel between the OSM import stages.
 *
 * Kept in the script rather than imported from `src/`: this runs on plain Node, which does not
 * resolve the app's `@/` path alias, and the OSM shapes are not the app's shapes. A spot becomes
 * the app's `Spot` only at upload time, and deliberately so — nothing here should be able to
 * reach into React Native code.
 */

/** The three element kinds Overpass returns. */
export type OsmElementType = 'node' | 'way' | 'relation';

/** One element as Overpass serialises it, narrowed to the fields the pipeline reads. */
export type OverpassElement = {
  type: OsmElementType;
  id: number;
  /** Present on nodes. */
  lat?: number;
  /** Present on nodes. */
  lon?: number;
  /** Present on ways and relations when the query asks for `out center`. */
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

/** A station with a position, before validation and deduplication. */
export type OsmCandidate = {
  osmType: OsmElementType;
  osmId: number;
  /**
   * The name to import.
   *
   * OSM names almost none of them — 11 of 394 Bulgarian stations at the time of writing — and the
   * app's owner chose a generic Bulgarian label over dropping 97% of the data or making the
   * column nullable. The row is meant to be edited by hand afterwards, so the value has to be in
   * the row. `nameFromOsm` keeps the provenance, because "we named it" and "OSM named it" are
   * different facts and the summary should not blur them.
   */
  name: string;
  /** Whether `name` is the OSM `name` tag rather than the generic default. */
  nameFromOsm: boolean;
  latitude: number;
  longitude: number;
  /** The raw OSM tags, kept so later stages can read equipment and anything else they need. */
  tags: Record<string, string>;
};

/** A candidate that cannot become a row, with the reason it was rejected. */
export type InvalidCandidate = {
  osmType: OsmElementType;
  osmId: number;
  reason: string;
};

/** Two candidates close enough that they may describe the same place. Reported, never merged. */
export type DuplicatePair = {
  first: OsmCandidate;
  second: OsmCandidate;
  distanceM: number;
};

/**
 * A connected group of candidates that are all within the threshold of at least one other member.
 *
 * A park mapped as one node per piece of equipment produces a chain of pairs, and a chain is hard
 * to review one pair at a time. The cluster is the unit a person actually decides about: "these
 * four pins are one station" or "these two are genuinely different".
 */
export type DuplicateCluster = {
  /** The member the import keeps when it defers the rest, as `type/id`. */
  representative: string;
  members: OsmCandidate[];
  /** Member keys and their distances, rather than the members again — the report is read by hand. */
  pairs: DuplicatePairRef[];
};

/** A pair inside a cluster report: the two members' keys and how far apart they are. */
export type DuplicatePairRef = {
  first: string;
  second: string;
  distanceM: number;
};

/**
 * A mapped, import-ready record: the `spots` row and its equipment, in the app's vocabulary.
 *
 * This is Prompt 41's mapping layer output. It is deliberately not an `OsmCandidate`: the
 * candidate carries raw OSM tags, and this carries the columns the database has — `source`,
 * `status` and the equipment names the catalogue uses. Everything between the two is a decision
 * that is written down in `map-to-spot.ts` rather than implied by a field name.
 */
export type SpotImport = {
  osmType: OsmElementType;
  osmId: number;
  name: string;
  latitude: number;
  longitude: number;
  /** The OSM `description` when it has one, otherwise null. Never invented. */
  description: string | null;
  /** The OSM `addr:city` when it has one, otherwise null. Never inferred from coordinates. */
  city: string | null;
  source: 'osm';
  status: 'approved';
  /** Catalogue names, deduped. OSM values with no mapping are reported, never guessed into this. */
  equipment: readonly string[];
};

/** What the Supabase import did, as Prompt 43 asks it to be reported. */
export type ImportSummary = {
  imported: number;
  /** Near-duplicates deferred for review rather than imported. */
  skipped: number;
  /** Records whose OSM key was already in the database, so re-running imports nothing. */
  duplicate: number;
  invalid: number;
  failed: number;
  equipmentAttached: number;
  unmappedEquipment: readonly string[];
};

/** The counts the prompt asks the run to report. */
export type PipelineSummary = {
  found: number;
  normalized: number;
  invalid: number;
  duplicates: number;
  candidates: number;
  /** How many candidates carry a real OSM name, so the defaulted remainder stays visible. */
  named: number;
};
