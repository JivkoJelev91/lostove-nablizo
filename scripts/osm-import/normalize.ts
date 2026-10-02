import type { InvalidCandidate, OsmCandidate, OverpassElement } from './types.ts';

/**
 * Turning Overpass elements into candidates.
 *
 * This stage resolves two things and applies one deliberate default.
 *
 * It resolves a position: nodes carry `lat`/`lon`, while ways and relations carry a `center`
 * because the query asks for one. An element with neither has no position and cannot become a
 * spot, so it is dropped here rather than carried as a row with no coordinates.
 *
 * It resolves a name: the OSM `name` tag when there is one, and {@link DEFAULT_SPOT_NAME}
 * otherwise. The default is an invention, and it is deliberate — OSM names 11 of 394 Bulgarian
 * stations, and the app's owner chose a generic label in the row over dropping the rest or making
 * the column nullable, with the intent of editing names by hand later. `nameFromOsm` records
 * which is which, so the default can be found and replaced rather than being indistinguishable
 * from a real name.
 *
 * It does not resolve equipment. `fitness_station=*` values are real and worth mapping, but the
 * mapping is its own prompt (41) and its own layer, and doing half of it here would put the
 * mapping in two places.
 */

/**
 * What an unnamed station is imported as.
 *
 * Bulgarian for "area with a pull-up bar". It is not a fact from OSM and does not pretend to be
 * one; it is a placeholder that reads naturally on a card and is easy to search for when the
 * names are corrected.
 */
export const DEFAULT_SPOT_NAME = 'Площадка с лост';

function coordinateOf(element: OverpassElement): { latitude: number; longitude: number } | null {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { latitude: element.lat, longitude: element.lon };
  }

  if (element.center !== undefined) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }

  return null;
}

function nameOf(tags: Record<string, string>): string | null {
  const name = tags.name?.trim();

  return name === undefined || name.length === 0 ? null : name;
}

/** One element as a candidate, or `null` when it carries no position. */
export function normalizeElement(element: OverpassElement): OsmCandidate | null {
  const coordinate = coordinateOf(element);

  if (coordinate === null) return null;

  const tags = element.tags ?? {};
  const osmName = nameOf(tags);

  return {
    osmType: element.type,
    osmId: element.id,
    name: osmName ?? DEFAULT_SPOT_NAME,
    nameFromOsm: osmName !== null,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    tags,
  };
}

export type NormalizationResult = {
  candidates: OsmCandidate[];
  /** Elements that had no position, kept as invalid so the summary can account for them. */
  dropped: InvalidCandidate[];
};

export function normalizeElements(elements: readonly OverpassElement[]): NormalizationResult {
  const candidates: OsmCandidate[] = [];
  const dropped: InvalidCandidate[] = [];

  for (const element of elements) {
    const candidate = normalizeElement(element);

    if (candidate === null) {
      dropped.push({
        osmType: element.type,
        osmId: element.id,
        reason: 'no position on the element',
      });
    } else {
      candidates.push(candidate);
    }
  }

  return { candidates, dropped };
}
