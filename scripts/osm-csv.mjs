/**
 * CSV reading shared by the two OSM import scripts.
 *
 * The output of the image downloader opens with a UTF-8 BOM and quotes every field, and a BOM
 * left in place hides the first column name. Stripping it here keeps both scripts from growing
 * their own subtly different parser.
 */
import { readFileSync } from 'node:fs';

/** Splits one CSV line into fields, honouring double quotes around commas. */
export function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

/** Reads a CSV file as a header plus data rows of fields. */
export function readCsv(csvPath) {
  const lines = readFileSync(csvPath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  return {
    header: parseCsvLine(lines[0]),
    rows: lines.slice(1).map(parseCsvLine),
  };
}
