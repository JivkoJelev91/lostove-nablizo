import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../src/types/database.ts';
import type { DuplicateCluster, InvalidCandidate, SpotImport } from './types.ts';

/**
 * Writing the run's results, and — when asked — inserting them.
 *
 * The default run writes artifacts only. That is deliberate: a one-off import into a live
 * database should be reviewable before it happens, and the files are what the review reads. With
 * `--upload` the same mapped records are inserted, idempotently.
 *
 * Idempotency is by OSM key, not by upsert. A record whose (osm_type, osm_id) already exists is
 * counted as a duplicate and skipped — never updated. That distinction matters because the app's
 * owner intends to correct imported names and coordinates by hand, and an upsert would overwrite
 * that work on the next run. Skipping is what makes re-running safe.
 *
 * The service-role key is required and never lives in the app's environment: `EXPO_PUBLIC_*`
 * values are inlined into the bundle, so a service key there would ship full database access to
 * every install. The key is read from the process environment or from a gitignored
 * `scripts/osm-import/.env.local`.
 */

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(SCRIPT_DIR, 'output');
const ROOT_ENV_FILE = join(SCRIPT_DIR, '..', '..', '.env');
const LOCAL_ENV_FILE = join(SCRIPT_DIR, '.env.local');

export type Artifacts = {
  candidates: string;
  duplicates: string;
  invalid: string;
};

export type ArtifactInput = {
  candidates: readonly SpotImport[];
  duplicates: readonly DuplicateCluster[];
  invalid: readonly InvalidCandidate[];
};

async function writeJson(name: string, value: unknown): Promise<string> {
  const path = join(OUTPUT_DIR, name);

  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

  return path;
}

export async function writeArtifacts(input: ArtifactInput): Promise<Artifacts> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [candidates, duplicates, invalid] = await Promise.all([
    writeJson('candidates.json', input.candidates),
    writeJson('duplicates.json', input.duplicates),
    writeJson('invalid.json', input.invalid),
  ]);

  return { candidates, duplicates, invalid };
}

export type SupabaseImportOptions = {
  url: string;
  serviceRoleKey: string;
};

/**
 * The credentials for the import, or `null` when they are not configured.
 *
 * The root `.env` is loaded for the project URL — it is already there for Expo and is not a
 * secret. The service key is not, and must come from the environment or from
 * `scripts/osm-import/.env.local`, which `.gitignore` already covers via `.env*.local`.
 */
export function resolveImportOptions(): SupabaseImportOptions | null {
  for (const file of [ROOT_ENV_FILE, LOCAL_ENV_FILE]) {
    if (existsSync(file)) {
      process.loadEnvFile(file);
    }
  }

  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    url === undefined ||
    url.length === 0 ||
    serviceRoleKey === undefined ||
    serviceRoleKey.length === 0
  ) {
    return null;
  }

  return { serviceRoleKey, url };
}

export type ImportFailure = {
  /** `node/123` for a spot, `spot_equipment:<spot id>` for an equipment row. */
  target: string;
  reason: string;
};

export type SupabaseImportResult = {
  imported: number;
  duplicate: number;
  failed: number;
  equipmentAttached: number;
  unmappedEquipment: string[];
  failures: ImportFailure[];
};

type Client = SupabaseClient<Database>;

type InsertedSpot = { spotId: string; record: SpotImport };

const SPOT_BATCH_SIZE = 100;
const EQUIPMENT_BATCH_SIZE = 200;
const PAGE_SIZE = 1000;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

/** Every OSM key already in the database, so a re-run inserts nothing twice. */
async function fetchExistingKeys(client: Client): Promise<Set<string>> {
  const keys = new Set<string>();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from('spots')
      .select('osm_type, osm_id')
      .not('osm_id', 'is', null)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const rows = data ?? [];

    for (const row of rows) {
      keys.add(`${row.osm_type ?? ''}/${row.osm_id}`);
    }

    if (rows.length < PAGE_SIZE) break;
  }

  return keys;
}

/** Catalogue names to ids, so equipment is attached by identity rather than by name at insert time. */
async function fetchEquipmentIds(client: Client): Promise<Map<string, string>> {
  const { data, error } = await client.from('equipment').select('id, name');

  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.name, row.id]));
}

function toSpotRow(record: SpotImport) {
  // `created_by` is absent: an imported spot has no author, and the column is nullable.
  // `condition` and `quantity` on the equipment rows are absent too, for the same reason — OSM
  // does not record them and the columns' own defaults are the honest values.
  return {
    description: record.description,
    latitude: record.latitude,
    longitude: record.longitude,
    name: record.name,
    osm_id: record.osmId,
    osm_type: record.osmType,
    source: record.source,
    status: record.status,
  };
}

/**
 * Inserts the spots, in batches.
 *
 * A batch that fails is retried row by row, so one bad record is logged with its own reason
 * instead of losing the ninety-nine good ones beside it. That is the whole reason the failure
 * report can name a specific element.
 */
async function insertSpots(
  client: Client,
  records: readonly SpotImport[],
  failures: ImportFailure[],
): Promise<InsertedSpot[]> {
  const inserted: InsertedSpot[] = [];

  for (const batch of chunk(records, SPOT_BATCH_SIZE)) {
    const { data, error } = await client
      .from('spots')
      .insert(batch.map(toSpotRow))
      .select('id, osm_type, osm_id');

    if (error === null) {
      for (const row of data ?? []) {
        const record = batch.find(
          (candidate) => candidate.osmId === row.osm_id && candidate.osmType === row.osm_type,
        );

        if (record !== undefined) {
          inserted.push({ record, spotId: row.id });
        }
      }

      continue;
    }

    console.warn(`  a batch of ${batch.length} failed (${error.message}); retrying one by one`);

    for (const record of batch) {
      const { data: single, error: singleError } = await client
        .from('spots')
        .insert(toSpotRow(record))
        .select('id')
        .single();

      if (singleError !== null) {
        failures.push({ reason: singleError.message, target: `${record.osmType}/${record.osmId}` });
        continue;
      }

      inserted.push({ record, spotId: single.id });
    }
  }

  return inserted;
}

/** Attaches each inserted spot's mapped equipment, and reports names the catalogue does not have. */
async function attachEquipment(
  client: Client,
  inserted: readonly InsertedSpot[],
  equipmentIds: Map<string, string>,
  failures: ImportFailure[],
): Promise<{ attached: number; unmapped: Set<string> }> {
  const rows: { spot_id: string; equipment_id: string }[] = [];
  const unmapped = new Set<string>();

  for (const { record, spotId } of inserted) {
    for (const name of record.equipment) {
      const equipmentId = equipmentIds.get(name);

      if (equipmentId === undefined) {
        unmapped.add(name);
        continue;
      }

      rows.push({ equipment_id: equipmentId, spot_id: spotId });
    }
  }

  let attached = 0;

  for (const batch of chunk(rows, EQUIPMENT_BATCH_SIZE)) {
    const { error } = await client.from('spot_equipment').insert(batch);

    if (error === null) {
      attached += batch.length;
      continue;
    }

    for (const row of batch) {
      const { error: singleError } = await client.from('spot_equipment').insert(row);

      if (singleError === null) {
        attached += 1;
      } else {
        failures.push({ reason: singleError.message, target: `spot_equipment:${row.spot_id}` });
      }
    }
  }

  return { attached, unmapped };
}

export async function importToSupabase(
  records: readonly SpotImport[],
  options: SupabaseImportOptions,
): Promise<SupabaseImportResult> {
  const client = createClient<Database>(options.url, options.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const existing = await fetchExistingKeys(client);
  const equipmentIds = await fetchEquipmentIds(client);

  if (equipmentIds.size === 0) {
    console.warn(
      '  the equipment catalogue is empty; apply the osm_import migration before importing',
    );
  }

  const pending = records.filter((record) => !existing.has(`${record.osmType}/${record.osmId}`));
  const failures: ImportFailure[] = [];
  const inserted = await insertSpots(client, pending, failures);
  const equipment = await attachEquipment(client, inserted, equipmentIds, failures);

  return {
    duplicate: records.length - pending.length,
    equipmentAttached: equipment.attached,
    failed: failures.length,
    failures,
    imported: inserted.length,
    unmappedEquipment: [...equipment.unmapped],
  };
}
