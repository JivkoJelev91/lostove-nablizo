import type { InvalidCandidate, OsmCandidate } from './types.ts';

/**
 * Deciding which candidates can become a spot.
 *
 * Validation here is about the *shape* of the data, not its quality: a position that exists and
 * is on Earth, an id to identify it by, and at least one tag that says why the query returned it.
 * Everything subtler — whether the place is really a fitness station, whether it is a duplicate,
 * what equipment it has — belongs to another stage, and blurring the two would make "invalid"
 * mean several things at once.
 *
 * The name is not checked because it cannot be missing: normalization gives every candidate one,
 * either OSM's or the generic default. A genuinely broken coordinate is still rejected, and that
 * is the only thing this stage is for.
 */

/** A tag that explains why this element is in the result set at all. */
const RELEVANT_TAGS = ['leisure', 'fitness_station', 'sport'];

function problemWith(candidate: OsmCandidate): string | null {
  if (!Number.isInteger(candidate.osmId) || candidate.osmId <= 0) {
    return 'missing osm id';
  }

  if (!Number.isFinite(candidate.latitude) || candidate.latitude < -90 || candidate.latitude > 90) {
    return 'latitude out of range';
  }

  if (
    !Number.isFinite(candidate.longitude) ||
    candidate.longitude < -180 ||
    candidate.longitude > 180
  ) {
    return 'longitude out of range';
  }

  // 0,0 is in the Atlantic and is what a broken import writes when a coordinate never arrived.
  // A real spot there is possible in principle and not in Bulgaria.
  if (candidate.latitude === 0 && candidate.longitude === 0) {
    return 'coordinate is null island';
  }

  if (!RELEVANT_TAGS.some((tag) => candidate.tags[tag] !== undefined)) {
    return 'no fitness tag';
  }

  return null;
}

export type ValidationResult = {
  valid: OsmCandidate[];
  invalid: InvalidCandidate[];
};

export function validateCandidates(candidates: readonly OsmCandidate[]): ValidationResult {
  const valid: OsmCandidate[] = [];
  const invalid: InvalidCandidate[] = [];

  for (const candidate of candidates) {
    const problem = problemWith(candidate);

    if (problem === null) {
      valid.push(candidate);
    } else {
      invalid.push({
        osmType: candidate.osmType,
        osmId: candidate.osmId,
        reason: problem,
      });
    }
  }

  return { valid, invalid };
}
