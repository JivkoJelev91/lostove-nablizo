import { DEFAULT_SPOT_NAME, normalizeElement, normalizeElements } from '../normalize';
import type { OverpassElement } from '../types';

const node = (overrides: Partial<OverpassElement> = {}): OverpassElement => ({
  type: 'node',
  id: 1,
  lat: 42.7,
  lon: 23.3,
  tags: { name: 'Парк до блок 5' },
  ...overrides,
});

describe('normalizeElement', () => {
  it('reads a node position from lat/lon', () => {
    const candidate = normalizeElement(node());

    expect(candidate).toMatchObject({
      osmType: 'node',
      osmId: 1,
      latitude: 42.7,
      longitude: 23.3,
      name: 'Парк до блок 5',
      nameFromOsm: true,
    });
  });

  it('reads a way position from its center', () => {
    const candidate = normalizeElement({
      type: 'way',
      id: 9,
      center: { lat: 43.1, lon: 27.9 },
      tags: { name: 'Стадион' },
    });

    expect(candidate).toMatchObject({ latitude: 43.1, longitude: 27.9, name: 'Стадион' });
  });

  it('drops an element that carries no position at all', () => {
    expect(normalizeElement({ type: 'relation', id: 4, tags: { name: 'x' } })).toBeNull();
  });

  it('names an unnamed station with the generic label and records that OSM did not name it', () => {
    const candidate = normalizeElement(node({ tags: {} }));

    expect(candidate).toMatchObject({ name: DEFAULT_SPOT_NAME, nameFromOsm: false });
  });

  it('treats a blank name tag as unnamed and keeps the raw tags for later stages', () => {
    const candidate = normalizeElement(node({ tags: { name: '   ', sport: 'fitness' } }));

    expect(candidate).toMatchObject({ name: DEFAULT_SPOT_NAME, nameFromOsm: false });
    expect(candidate?.tags).toEqual({ name: '   ', sport: 'fitness' });
  });
});

describe('normalizeElements', () => {
  it('accounts for dropped elements instead of carrying rows without coordinates', () => {
    const result = normalizeElements([
      node(),
      { type: 'way', id: 2, tags: {} },
      { type: 'node', id: 3, lat: 1, lon: 2, tags: {} },
    ]);

    expect(result.candidates.map((candidate) => candidate.osmId)).toEqual([1, 3]);
    expect(result.dropped).toEqual([
      { osmType: 'way', osmId: 2, reason: 'no position on the element' },
    ]);
  });
});
