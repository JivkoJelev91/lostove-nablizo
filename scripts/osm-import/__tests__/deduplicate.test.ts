import { candidateKey, deduplicate } from '../deduplicate';
import type { OsmCandidate } from '../types';

/** A candidate at the given position, with everything else fixed so tests only vary what matters. */
function candidate(
  osmId: number,
  latitude: number,
  overrides: Partial<OsmCandidate> = {},
): OsmCandidate {
  return {
    osmType: 'node',
    osmId,
    name: `Място ${osmId}`,
    nameFromOsm: true,
    latitude,
    longitude: 23.3,
    tags: { name: `Място ${osmId}` },
    ...overrides,
  };
}

/** Roughly 22 m of latitude, which is inside the 50 m duplicate threshold. */
const NEARBY_LATITUDE_STEP = 0.0002;
/** Roughly 1.1 km of latitude, which is outside it. */
const FAR_LATITUDE_STEP = 0.01;

describe('candidateKey', () => {
  it('is the type and id together, because an id is only unique within its type', () => {
    expect(candidateKey(candidate(7, 42.7))).toBe('node/7');
    expect(candidateKey({ ...candidate(7, 42.7), osmType: 'way' })).toBe('way/7');
  });
});

describe('deduplicate', () => {
  it('drops an exact duplicate silently and keeps the unique list in order', () => {
    const result = deduplicate([candidate(1, 42.7), candidate(2, 43), candidate(1, 42.7)]);

    expect(result.unique.map((item) => item.osmId)).toEqual([1, 2]);
    expect(result.exactRemoved).toBe(1);
    expect(result.pairs).toEqual([]);
  });

  it('flags two different elements within the threshold, nearest first', () => {
    const first = candidate(1, 42.7);
    const second = candidate(2, 42.7 + NEARBY_LATITUDE_STEP);

    const result = deduplicate([first, second]);

    expect(result.unique).toHaveLength(2);
    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0]?.distanceM).toBeGreaterThan(0);
    expect(result.pairs[0]?.distanceM).toBeLessThanOrEqual(50);
  });

  it('does not flag elements beyond the threshold', () => {
    const result = deduplicate([candidate(1, 42.7), candidate(2, 42.7 + FAR_LATITUDE_STEP)]);

    expect(result.pairs).toEqual([]);
    expect(result.clusters).toEqual([]);
    expect(result.deferred).toEqual([]);
  });

  it('honours a caller-supplied threshold', () => {
    const result = deduplicate([candidate(1, 42.7), candidate(2, 42.7 + NEARBY_LATITUDE_STEP)], 10);

    expect(result.pairs).toEqual([]);
  });

  it('groups a chain into one cluster and defers every member but the most informative', () => {
    const sparse = candidate(2, 42.7 + NEARBY_LATITUDE_STEP, { nameFromOsm: false, tags: {} });
    const informative = candidate(1, 42.7, {
      tags: { name: 'Стадион', sport: 'fitness', leisure: 'pitch' },
    });
    const other = candidate(3, 42.7 + 2 * NEARBY_LATITUDE_STEP);

    const result = deduplicate([informative, sparse, other]);

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.members.map((item) => item.osmId)).toEqual([1, 2, 3]);
    expect(result.clusters[0]?.representative).toBe('node/1');
    expect(result.deferred.map((item) => item.osmId).sort()).toEqual([2, 3]);
  });
});
