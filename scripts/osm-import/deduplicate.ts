import type { DuplicateCluster, DuplicatePair, OsmCandidate } from './types.ts';

/**
 * Finding the same place twice.
 *
 * Two kinds of duplicate exist here, and they are different enough to be handled differently.
 *
 * An *exact* duplicate is the same OSM element appearing twice. The query is a union of three
 * filters, so Overpass should already return each element once, but "should" is not a guarantee
 * worth trusting when the cost of being wrong is a doubled spot in the directory. These are
 * dropped silently: there is nothing to review, one of the two is simply not real.
 *
 * A *near* duplicate is two different OSM elements within a few dozen metres of each other. In
 * Bulgarian data these are usually real and usually interesting: mappers record a park as one
 * area plus a node per piece of equipment, so four nodes inside 50 m are four views of one
 * station. They are *flagged, never merged*.
 *
 * Flagged candidates are grouped into clusters — a chain of pairs is one decision to a reviewer,
 * not five — and one member of each cluster is nominated as its representative. That nomination is
 * not a merge and is not applied here: the import stage decides whether to use it, and the report
 * keeps every member so nothing is lost. The representative is simply the member carrying the most
 * information (the most tags, and a real name beats the generic one), because if only one of a
 * cluster is imported it should be the one that knows the most.
 *
 * The proximity pass is quadratic in the number of candidates, which is fine for the scale this
 * runs at — a few hundred for a country. If that stops being true, the fix is a spatial index,
 * not a bigger machine.
 */

const EARTH_RADIUS_M = 6_371_008.8;

/**
 * The distance within which two records are reported as possible duplicates, in metres.
 *
 * Fifty metres is about the width of a park and the range at which two pins stop being tellable
 * apart on a phone. It is a reporting threshold, not a merge threshold.
 */
export const DEFAULT_DUPLICATE_DISTANCE_M = 50;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Haversine, in metres.
 *
 * Duplicated from the app's `src/features/spots/distance.ts` on purpose: this script runs on
 * plain Node, which does not resolve the `@/` path alias, and importing through a relative path
 * into `src` would tie an offline script to React Native code it must not touch.
 */
function distanceMetersBetween(first: OsmCandidate, second: OsmCandidate): number {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(haversine));
}

/** The identity of an OSM element, which is its type and id together. */
export function candidateKey(candidate: OsmCandidate): string {
  return `${candidate.osmType}/${candidate.osmId}`;
}

/** How much a candidate knows, so the representative of a cluster is its most informative member. */
function informationScore(candidate: OsmCandidate): number {
  return Object.keys(candidate.tags).length + (candidate.nameFromOsm ? 1 : 0);
}

function representativeOf(members: readonly OsmCandidate[]): OsmCandidate {
  return members.reduce((best, candidate) => {
    const score = informationScore(candidate);
    const bestScore = informationScore(best);

    if (score > bestScore) return candidate;
    if (score === bestScore && candidate.osmId < best.osmId) return candidate;

    return best;
  });
}

/** Groups pairs into connected components, keeping each cluster's own pairs for the report. */
function buildClusters(pairs: readonly DuplicatePair[]): DuplicateCluster[] {
  const candidatesByKey = new Map<string, OsmCandidate>();
  const neighbours = new Map<string, Set<string>>();

  const connect = (key: string, other: string): void => {
    const set = neighbours.get(key) ?? new Set<string>();
    set.add(other);
    neighbours.set(key, set);
  };

  for (const pair of pairs) {
    const firstKey = candidateKey(pair.first);
    const secondKey = candidateKey(pair.second);

    candidatesByKey.set(firstKey, pair.first);
    candidatesByKey.set(secondKey, pair.second);
    connect(firstKey, secondKey);
    connect(secondKey, firstKey);
  }

  const clusters: DuplicateCluster[] = [];
  const visited = new Set<string>();

  for (const start of candidatesByKey.keys()) {
    if (visited.has(start)) continue;

    const memberKeys: string[] = [];
    const queue: string[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.pop();

      if (current === undefined) continue;

      memberKeys.push(current);

      for (const neighbour of neighbours.get(current) ?? []) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push(neighbour);
        }
      }
    }

    const memberSet = new Set(memberKeys);
    const members = memberKeys
      .map((key) => candidatesByKey.get(key))
      .filter((candidate): candidate is OsmCandidate => candidate !== undefined)
      .sort((first, second) => first.osmId - second.osmId);

    clusters.push({
      members,
      pairs: pairs
        .filter(
          (pair) =>
            memberSet.has(candidateKey(pair.first)) && memberSet.has(candidateKey(pair.second)),
        )
        .map((pair) => ({
          distanceM: pair.distanceM,
          first: candidateKey(pair.first),
          second: candidateKey(pair.second),
        })),
      representative: candidateKey(representativeOf(members)),
    });
  }

  return clusters;
}

export type DeduplicationResult = {
  /** Candidates with exact duplicates removed, in their original order. */
  unique: OsmCandidate[];
  /** Nearby pairs, nearest first, for review. Never removed from `unique`. */
  pairs: DuplicatePair[];
  /** Those pairs grouped into the decisions a reviewer actually makes. */
  clusters: DuplicateCluster[];
  exactRemoved: number;
  /**
   * Cluster members that are not their cluster's representative.
   *
   * The import defers these by default — one pin per park rather than four — and `--include-flagged`
   * imports them anyway. They are never dropped: they stay in `unique` and in the report.
   */
  deferred: OsmCandidate[];
};

export function deduplicate(
  candidates: readonly OsmCandidate[],
  thresholdM: number = DEFAULT_DUPLICATE_DISTANCE_M,
): DeduplicationResult {
  const seen = new Set<string>();
  const unique: OsmCandidate[] = [];
  let exactRemoved = 0;

  for (const candidate of candidates) {
    const key = candidateKey(candidate);

    if (seen.has(key)) {
      exactRemoved += 1;
      continue;
    }

    seen.add(key);
    unique.push(candidate);
  }

  const pairs: DuplicatePair[] = [];

  unique.forEach((first, index) => {
    for (const second of unique.slice(index + 1)) {
      const distanceM = distanceMetersBetween(first, second);

      if (distanceM <= thresholdM) {
        pairs.push({ first, second, distanceM });
      }
    }
  });

  pairs.sort((first, second) => first.distanceM - second.distanceM);

  const clusters = buildClusters(pairs);
  const deferred: OsmCandidate[] = [];

  for (const cluster of clusters) {
    const representative = candidateKey(representativeOf(cluster.members));

    for (const member of cluster.members) {
      if (candidateKey(member) !== representative) {
        deferred.push(member);
      }
    }
  }

  return { clusters, deferred, exactRemoved, pairs, unique };
}
