import { DEFAULT_DUPLICATE_DISTANCE_M, candidateKey, deduplicate } from './deduplicate.ts';
import { buildQuery, fetchElements } from './fetch.ts';
import type { FetchTarget } from './fetch.ts';
import { mapCandidate } from './map-to-spot.ts';
import { normalizeElements } from './normalize.ts';
import type { InvalidCandidate, PipelineSummary } from './types.ts';
import { importToSupabase, resolveImportOptions, writeArtifacts } from './upload.ts';
import type { Artifacts, SupabaseImportResult } from './upload.ts';
import { validateCandidates } from './validate.ts';

/**
 * The OSM import, end to end.
 *
 *   pnpm osm:import                          # Bulgaria, write artifacts, insert nothing
 *   pnpm osm:import --bbox=... --refresh     # fast development run
 *   pnpm osm:import --upload                 # insert the candidates into Supabase
 *   pnpm osm:import --include-flagged        # import near-duplicates too, instead of deferring
 *
 * A run without `--upload` is the review step: it writes what would be imported, what is invalid,
 * and which records look like the same place, and inserts nothing. `--upload` reads those same
 * mapped records and inserts them idempotently.
 *
 * Near-duplicates are deferred by default — one pin per park rather than one per piece of
 * equipment — because a directory with four identical pins on one corner is worse than one that
 * is missing three. The deferred records are never dropped: they are in the duplicate report, and
 * `--include-flagged` imports them anyway.
 */

const DEFAULT_AREA = 'BG';

const USAGE = `Usage: pnpm osm:import [options]

  --area=BG                 ISO 3166-1 country code to import (default: ${DEFAULT_AREA})
  --bbox=s,w,n,e            import a bounding box instead of a country (for fast runs)
  --threshold=50            metres within which two spots are flagged as possible duplicates
  --refresh                 ignore the cached Overpass response and fetch again
  --print-query             print the Overpass query before running
  --upload                  insert the candidates into Supabase (needs a service-role key)
  --include-flagged         import near-duplicates instead of deferring them for review
`;

type Options = {
  target: FetchTarget;
  refresh: boolean;
  thresholdM: number;
  printQuery: boolean;
  upload: boolean;
  includeFlagged: boolean;
};

function parseNumber(value: string, flag: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${flag} expects a number, got "${value}"`);
  }

  return parsed;
}

function parseBbox(value: string): FetchTarget {
  const parts = value.split(',').map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error(`--bbox expects south,west,north,east, got "${value}"`);
  }

  const [south, west, north, east] = parts as [number, number, number, number];

  if (south >= north || west >= east) {
    throw new Error('--bbox is empty: south must be below north and west left of east');
  }

  return { kind: 'bbox', south, west, north, east };
}

function parseArgs(argv: readonly string[]): Options {
  let target: FetchTarget = { kind: 'area', areaCode: DEFAULT_AREA };
  let refresh = false;
  let thresholdM = DEFAULT_DUPLICATE_DISTANCE_M;
  let printQuery = false;
  let upload = false;
  let includeFlagged = false;

  for (const arg of argv) {
    if (arg === '--refresh') {
      refresh = true;
    } else if (arg === '--print-query') {
      printQuery = true;
    } else if (arg === '--upload') {
      upload = true;
    } else if (arg === '--include-flagged') {
      includeFlagged = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith('--area=')) {
      target = { kind: 'area', areaCode: arg.slice('--area='.length).toUpperCase() };
    } else if (arg.startsWith('--bbox=')) {
      target = parseBbox(arg.slice('--bbox='.length));
    } else if (arg.startsWith('--threshold=')) {
      thresholdM = parseNumber(arg.slice('--threshold='.length), '--threshold');
    } else {
      throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
    }
  }

  if (thresholdM <= 0) {
    throw new Error('--threshold must be greater than zero');
  }

  return { includeFlagged, printQuery, refresh, target, thresholdM, upload };
}

function describeTarget(target: FetchTarget): string {
  return target.kind === 'area'
    ? `area ${target.areaCode} (ISO 3166-1, admin_level=2)`
    : `bbox ${target.south},${target.west},${target.north},${target.east}`;
}

function reasonsBreakdown(invalid: readonly InvalidCandidate[]): [string, number][] {
  const counts = new Map<string, number>();

  for (const item of invalid) {
    counts.set(item.reason, (counts.get(item.reason) ?? 0) + 1);
  }

  return [...counts.entries()].sort((first, second) => second[1] - first[1]);
}

const row = (label: string, value: number | string): string => `  ${label.padEnd(22)} ${value}`;

type RunReport = {
  summary: PipelineSummary;
  clusters: number;
  deferred: number;
  invalid: readonly InvalidCandidate[];
  artifacts: Artifacts;
  unmappedEquipment: readonly string[];
  thresholdM: number;
};

function printSummary(report: RunReport): void {
  const { summary } = report;

  console.log('\nPipeline');
  console.log(row('found', summary.found));
  console.log(row('normalized', summary.normalized));
  console.log(row('invalid', summary.invalid));
  console.log(row('duplicate pairs', summary.duplicates));
  console.log(row('duplicate clusters', report.clusters));
  console.log(row('candidates', summary.candidates));
  console.log(row('  named in OSM', summary.named));
  console.log(row('  default name', summary.candidates - summary.named));
  console.log(row('deferred', report.deferred));

  console.log(
    `\n  pairs = different OSM records within ${report.thresholdM} m, grouped into clusters for review`,
  );

  if (report.unmappedEquipment.length > 0) {
    console.log(`  equipment with no catalogue entry: ${report.unmappedEquipment.join(', ')}`);
  }

  if (report.invalid.length > 0) {
    console.log('\n  invalid reasons:');

    for (const [reason, count] of reasonsBreakdown(report.invalid)) {
      console.log(row(reason, count));
    }
  }

  console.log('\n  artifacts:');
  console.log(`    ${report.artifacts.candidates}`);
  console.log(`    ${report.artifacts.duplicates}`);
  console.log(`    ${report.artifacts.invalid}`);
}

function printImportSummary(
  result: SupabaseImportResult,
  found: number,
  skipped: number,
  invalid: number,
): void {
  console.log('\nImport');
  console.log(row('found', found));
  console.log(row('imported', result.imported));
  console.log(row('skipped', skipped));
  console.log(row('duplicate', result.duplicate));
  console.log(row('invalid', invalid));
  console.log(row('failed', result.failed));
  console.log(row('equipment attached', result.equipmentAttached));

  if (result.unmappedEquipment.length > 0) {
    console.log(row('unmapped equipment', result.unmappedEquipment.join(', ')));
  }

  for (const failure of result.failures.slice(0, 20)) {
    console.log(`    ${failure.target}: ${failure.reason}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log(`OSM import — ${describeTarget(options.target)}`);

  if (options.printQuery) {
    console.log(`\n${buildQuery(options.target)}\n`);
  }

  console.log('1/6 fetch');
  const fetched = await fetchElements(options.target, { refresh: options.refresh });

  console.log('2/6 normalize');
  const normalized = normalizeElements(fetched.elements);

  console.log('3/6 validate');
  const validation = validateCandidates(normalized.candidates);
  const invalid = [...normalized.dropped, ...validation.invalid];

  console.log('4/6 deduplicate');
  const dedup = deduplicate(validation.valid, options.thresholdM);

  console.log('5/6 map');
  const deferredKeys = new Set(dedup.deferred.map(candidateKey));
  const importable = options.includeFlagged
    ? dedup.unique
    : dedup.unique.filter((candidate) => !deferredKeys.has(candidateKey(candidate)));
  const mapped = importable.map((candidate) => mapCandidate(candidate));
  const records = mapped.map((result) => result.record);
  const unmappedEquipment = [...new Set(mapped.flatMap((result) => result.unmappedEquipment))];

  console.log('6/6 write artifacts');
  const artifacts = await writeArtifacts({
    candidates: records,
    duplicates: dedup.clusters,
    invalid,
  });

  const summary: PipelineSummary = {
    found: fetched.elements.length,
    normalized: normalized.candidates.length,
    invalid: invalid.length,
    duplicates: dedup.pairs.length,
    candidates: records.length,
    named: importable.filter((candidate) => candidate.nameFromOsm).length,
  };

  printSummary({
    artifacts,
    clusters: dedup.clusters.length,
    deferred: options.includeFlagged ? 0 : dedup.deferred.length,
    invalid,
    summary,
    thresholdM: options.thresholdM,
    unmappedEquipment,
  });

  if (!options.upload) {
    console.log('\nDry run: nothing was inserted. Re-run with --upload to import.');
    return;
  }

  const credentials = resolveImportOptions();

  if (credentials === null) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. Set it in scripts/osm-import/.env.local (gitignored) or the environment.',
    );
  }

  console.log('\nImporting to Supabase');

  const result = await importToSupabase(records, credentials);

  printImportSummary(
    result,
    records.length + (options.includeFlagged ? 0 : dedup.deferred.length),
    options.includeFlagged ? 0 : dedup.deferred.length,
    invalid.length,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`\nImport failed: ${message}`);
  process.exitCode = 1;
});
