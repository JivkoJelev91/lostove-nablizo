import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { OverpassElement } from './types.ts';

/**
 * Fetching the OSM data, once.
 *
 * The Overpass API is slow by nature — a country-wide query for a handful of tags took around two
 * minutes on a healthy mirror while this was written, and the main instance returned "too busy"
 * on the first attempt. That slowness is why this stage exists separately from the rest: it runs
 * once, writes what it got to disk, and every later stage reads the cache. Iterating on
 * normalization or deduplication costs no network at all.
 *
 * Three endpoints are tried in order. The public instances go down and come back independently,
 * and a one-off import that fails because one mirror is busy is a worse outcome than waiting for
 * the next.
 *
 * The user agent is not optional. Overpass answers a default agent with `406 Not Acceptable`; the
 * usage policy asks every client to identify itself, and an unidentifiable client is refused.
 */

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(SCRIPT_DIR, '.cache');

const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const USER_AGENT =
  'lostove-nablizo-osm-import/0.1 (https://github.com/JivkoJelev91/lostove-nablizo)';

/** How long Overpass may spend on the query itself, in seconds. */
const QUERY_TIMEOUT_S = 900;

/** The client's own ceiling, a little above the server's so the server times out first. */
const REQUEST_TIMEOUT_MS = (QUERY_TIMEOUT_S + 60) * 1000;

/**
 * What counts as a fitness place.
 *
 * `leisure=fitness_station` is the canonical outdoor fitness tag and the bulk of the data.
 * `fitness_station=*` catches equipment nodes that carry the type but not the leisure tag.
 * `sport=calisthenics` is rare but is exactly the app's subject, so it is worth the one line.
 *
 * Deliberately absent: `leisure=fitness_centre`, which is an indoor gym. The app is about outdoor
 * spots, and pulling 327 gyms into an outdoor directory would be a different product.
 */
const TAG_FILTERS = [
  '["leisure"="fitness_station"]',
  '["fitness_station"]',
  '["sport"="calisthenics"]',
];

export type FetchTarget =
  | { kind: 'area'; areaCode: string }
  | { kind: 'bbox'; south: number; west: number; north: number; east: number };

export type FetchResult = {
  elements: OverpassElement[];
  /** Where the elements came from: an endpoint hostname, or `cache`. */
  source: string;
  cached: boolean;
};

/** The Overpass query for a target. Exported so a run can be inspected without fetching it. */
export function buildQuery(target: FetchTarget): string {
  const areaSetup =
    target.kind === 'area'
      ? `area["ISO3166-1"="${target.areaCode}"][admin_level=2]->.target;\n`
      : '';

  const location =
    target.kind === 'area'
      ? '(area.target)'
      : `(${target.south},${target.west},${target.north},${target.east})`;

  const filters = TAG_FILTERS.map((filter) => `  nwr${filter}${location};`).join('\n');

  return `[out:json][timeout:${QUERY_TIMEOUT_S}];\n${areaSetup}(\n${filters}\n);\nout center tags qt;`;
}

function cachePath(target: FetchTarget): string {
  const key =
    target.kind === 'area'
      ? `area-${target.areaCode}`
      : `bbox-${target.south}_${target.west}_${target.north}_${target.east}`;

  return join(CACHE_DIR, `${key}.json`);
}

function isOverpassElement(value: unknown): value is OverpassElement {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as { type?: unknown; id?: unknown };

  return (
    (candidate.type === 'node' || candidate.type === 'way' || candidate.type === 'relation') &&
    typeof candidate.id === 'number'
  );
}

/**
 * Reads an Overpass response, refusing anything that is not the JSON it should be.
 *
 * A busy instance answers with an HTML error page and an HTTP 200, so status alone proves nothing.
 * Parsing is the check that matters, and a parse failure moves the run to the next endpoint
 * instead of letting an HTML page travel through the pipeline as if it were data.
 */
function parseResponse(text: string): OverpassElement[] {
  let payload: unknown;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('response was not JSON (the endpoint is probably busy)');
  }

  if (typeof payload !== 'object' || payload === null) {
    throw new Error('response was not an object');
  }

  const elements = (payload as { elements?: unknown }).elements;

  if (!Array.isArray(elements)) {
    throw new Error('response had no elements array');
  }

  return elements.filter(isOverpassElement);
}

async function requestElements(endpoint: string, query: string): Promise<OverpassElement[]> {
  const started = Date.now();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const elements = parseResponse(text);
  const seconds = Math.round((Date.now() - started) / 1000);

  console.log(`  ${endpoint} answered with ${elements.length} elements in ${seconds}s`);

  return elements;
}

async function readCache(path: string): Promise<OverpassElement[] | null> {
  try {
    const raw = await readFile(path, 'utf8');
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isOverpassElement) : null;
  } catch {
    return null;
  }
}

async function writeCache(path: string, elements: readonly OverpassElement[]): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path, JSON.stringify(elements, null, 2), 'utf8');
}

/** The elements for a target, from the cache when one exists and from Overpass otherwise. */
export async function fetchElements(
  target: FetchTarget,
  options: { refresh?: boolean } = {},
): Promise<FetchResult> {
  const cache = cachePath(target);

  if (options.refresh !== true) {
    const cached = await readCache(cache);

    if (cached !== null) {
      console.log(`  reusing ${cached.length} cached elements from ${cache}`);
      return { elements: cached, source: 'cache', cached: true };
    }
  }

  const query = buildQuery(target);
  let lastError: unknown = null;

  for (const endpoint of ENDPOINTS) {
    try {
      const elements = await requestElements(endpoint, query);
      await writeCache(cache, elements);

      return { elements, source: new URL(endpoint).hostname, cached: false };
    } catch (error: unknown) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);

      console.warn(`  ${endpoint} failed: ${message}`);
    }
  }

  const lastMessage = lastError instanceof Error ? lastError.message : String(lastError);

  throw new Error(`Every Overpass endpoint failed. Last error: ${lastMessage}`);
}
