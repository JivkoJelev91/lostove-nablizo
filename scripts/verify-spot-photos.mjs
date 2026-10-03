/**
 * Proves that each imported photo belongs to the CSV row — and therefore the spot — it names.
 *
 * The import was built on three links, and this script checks all three from the outside, over the
 * public API, so it tests what the data actually says rather than trusting the import's own log:
 *
 *   1. CSV row N references `maps_images/N.jpg`. The downloader named images after the loop index,
 *      so the number in the filename is the row number — an off-by-one would break this.
 *   2. The CSV row's id, name, coordinates and OSM key equal the `spots` row with that id. This
 *      catches a spot import that was shifted against the CSV.
 *   3. The `photos` row for that spot points at `<owner>/osm/N.jpg`. This catches a photo attached
 *      to the wrong spot even when everything else is right.
 *
 * It also checks the reverse: every object under the prefix maps back to the CSV row that owns it,
 * so nothing was attached twice or to a spot the CSV does not mention. Samples of the public URLs
 * are fetched so the bytes are known to be reachable, and the full mapping is written to a CSV you
 * can open next to the map and eyeball.
 *
 * Usage:
 *   pnpm exec node scripts/verify-spot-photos.mjs \
 *     --csv ../process-images/scripts/osm-import/output/spots_updated.csv \
 *     --owner <profile uuid> [--out <file>]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readCsv } from './osm-csv.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Reads `--name value` from argv, or exits with the usage line when a required one is absent. */
function readArg(name, required = true) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1 || process.argv[index + 1] === undefined) {
    if (required) {
      console.error(`Missing --${name}.`);
      console.error(
        'Usage: node scripts/verify-spot-photos.mjs --csv <file> --owner <uuid> [--out <file>]',
      );
      process.exit(1);
    }

    return undefined;
  }

  return process.argv[index + 1];
}

/** The public project URL and key, read from the same gitignored file the app uses. */
function readEnv() {
  const text = readFileSync(join(repoRoot, '.env'), 'utf8');
  const value = (name) => {
    const match = text.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm'));
    return match === null ? '' : match[1].trim().replace(/^["']|["']$/g, '');
  };

  return {
    url: value('EXPO_PUBLIC_SUPABASE_URL'),
    key: value('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  };
}

/** One read-only PostgREST call. */
async function get(path, env) {
  const response = await fetch(`${env.url}/rest/v1/${path}`, {
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
  });

  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

const csvPath = resolve(readArg('csv'));
const owner = readArg('owner');
const outPath = resolve(readArg('out', false) ?? join(dirname(csvPath), 'spot-photos-map.csv'));

const { header, rows } = readCsv(csvPath);
const columns = {
  id: header.indexOf('id'),
  name: header.indexOf('name'),
  latitude: header.indexOf('latitude'),
  longitude: header.indexOf('longitude'),
  osmType: header.indexOf('osm_type'),
  osmId: header.indexOf('osm_id'),
  image: header.indexOf('image_path'),
};

for (const [column, index] of Object.entries(columns)) {
  if (index === -1) {
    console.error(`The CSV must have a "${column}" column, found: ${header.join(', ')}`);
    process.exit(1);
  }
}

const env = readEnv();
const spots = await get(
  'spots?select=id,name,latitude,longitude,osm_type,osm_id&source=eq.osm&limit=1000',
  env,
);
const photos = await get(
  'photos?select=spot_id,storage_path,user_id,width,height,size&limit=1000',
  env,
);

const spotById = new Map(spots.map((spot) => [spot.id, spot]));
const photoByPath = new Map(photos.map((photo) => [photo.storage_path, photo]));
const prefix = `${owner}/osm/`;

const problems = { numbering: [], spot: [], photo: [] };
const mapped = [];
let withoutImage = 0;

for (const [rowIndex, row] of rows.entries()) {
  const number = rowIndex + 1;
  const id = row[columns.id];
  const name = row[columns.name];
  const latitude = Number(row[columns.latitude]);
  const longitude = Number(row[columns.longitude]);

  const spot = spotById.get(id);

  if (spot === undefined) {
    problems.spot.push(`#${number} ${id} is not in the database`);
    continue;
  }

  const spotMatches =
    spot.name === name &&
    Math.abs(Number(spot.latitude) - latitude) < 1e-6 &&
    Math.abs(Number(spot.longitude) - longitude) < 1e-6 &&
    spot.osm_type === row[columns.osmType] &&
    String(spot.osm_id) === row[columns.osmId];

  if (!spotMatches) {
    problems.spot.push(`#${number} ${name} does not match the database row`);
    continue;
  }

  const imagePath = row[columns.image] ?? '';

  if (!imagePath.startsWith('maps_images/')) {
    withoutImage += 1;
    continue;
  }

  if (imagePath !== `maps_images/${number}.jpg`) {
    problems.numbering.push(`#${number} references ${imagePath}`);
    continue;
  }

  const expected = `${prefix}${number}.jpg`;
  const photo = photoByPath.get(expected);

  if (photo === undefined) {
    problems.photo.push(`#${number} ${name} has no photo row for ${expected}`);
    continue;
  }

  if (photo.spot_id !== id || photo.user_id !== owner) {
    problems.photo.push(`#${number} ${expected} belongs to spot ${photo.spot_id}`);
    continue;
  }

  mapped.push({
    number,
    spotId: id,
    name,
    latitude,
    longitude,
    imageUrl: `${env.url}/storage/v1/object/public/photos/${expected}`,
  });
}

const underPrefix = photos.filter((photo) => photo.storage_path.startsWith(prefix));
const unexpected = underPrefix.filter((photo) => {
  const number = Number(photo.storage_path.slice(prefix.length).replace(/\.jpg$/, ''));
  const row = rows[number - 1];
  return row === undefined || row[columns.id] !== photo.spot_id;
});

const sample = [mapped[0], mapped[Math.floor(mapped.length / 2)], mapped[mapped.length - 1]].filter(
  (entry) => entry !== undefined,
);
let reachable = 0;

for (const entry of sample) {
  const response = await fetch(entry.imageUrl, { method: 'HEAD' });
  if (response.ok && (response.headers.get('content-type') ?? '').startsWith('image/jpeg')) {
    reachable += 1;
  }
}

const mapCsv = [
  'row,spot_id,name,latitude,longitude,image_url',
  ...mapped.map(
    (entry) =>
      `${entry.number},${entry.spotId},"${entry.name.replace(/"/g, '""')}",${entry.latitude},${entry.longitude},${entry.imageUrl}`,
  ),
].join('\n');
writeFileSync(outPath, `${mapCsv}\n`, 'utf8');

const rowsWithImage = rows.length - withoutImage;
const totalProblems =
  problems.numbering.length + problems.spot.length + problems.photo.length + unexpected.length;
const checks = [
  ['CSV rows', rows.length],
  ['CSV rows with an image', rowsWithImage],
  ['rows without an image (no photo expected)', withoutImage],
  ['row number references its own image', mapped.length + problems.photo.length],
  ['spot matches the CSV (name, coordinates, OSM key)', rows.length - problems.spot.length],
  ['photo attached to the CSV row', mapped.length],
  ['photos under the prefix', underPrefix.length],
  ['unexpected photos under the prefix', unexpected.length],
  ['sampled URLs reachable as image/jpeg', `${reachable}/${sample.length}`],
];

console.log(checks.map(([label, value]) => `${String(value).padStart(5)}  ${label}`).join('\n'));

for (const [kind, list] of Object.entries(problems)) {
  for (const problem of list) {
    console.log(`  ${kind}: ${problem}`);
  }
}

console.log(`\nMapping written to ${outPath}`);
console.log(totalProblems === 0 && reachable === sample.length ? 'RESULT: PASS' : 'RESULT: FAIL');

process.exit(totalProblems === 0 && reachable === sample.length ? 0 : 1);
