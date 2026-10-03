import type { SpotFilters } from '@/features/spots/useSpotFilters';
import {
  NO_FILTERS,
  countActiveFilters,
  filterSpots,
  filterSpotsByEquipment,
  toggleEquipmentFilter,
} from '@/features/spots/useSpotFilters';
import type { Spot } from '@/features/spots/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

/** A spot with every required field, so each test only states the field it filters on. */
function makeSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: 'spot-1',
    name: 'Тест',
    coordinate: { latitude: 42.7, longitude: 23.3 },
    city: null,
    rating: 0,
    reviewCount: 0,
    equipment: [],
    condition: 'good',
    description: '',
    distanceMeters: null,
    images: [],
    photos: [],
    status: 'approved',
    ...overrides,
  };
}

function makeFilters(overrides: Partial<SpotFilters> = {}): SpotFilters {
  return { ...NO_FILTERS, ...overrides };
}

describe('filterSpotsByEquipment', () => {
  it('returns the list untouched when nothing is selected', () => {
    const spots = [makeSpot()];

    expect(filterSpotsByEquipment(spots, [])).toBe(spots);
  });

  it('requires every selected piece, not any one of them', () => {
    const pullUpOnly = makeSpot({ id: 'pull-up', equipment: [{ name: 'Pull-up' }] });
    const dipsOnly = makeSpot({ id: 'dips', equipment: [{ name: 'Dips' }] });
    const both = makeSpot({ id: 'both', equipment: [{ name: 'Pull-up' }, { name: 'Dips' }] });

    const result = filterSpotsByEquipment([pullUpOnly, dipsOnly, both], ['Pull-up', 'Dips']);

    expect(result.map((spot) => spot.id)).toEqual(['both']);
  });
});

describe('countActiveFilters', () => {
  it('counts groups, not values, so one or three pieces both read as one filter', () => {
    expect(countActiveFilters(NO_FILTERS)).toBe(0);
    expect(countActiveFilters(makeFilters({ equipment: ['Pull-up'] }))).toBe(1);
    expect(countActiveFilters(makeFilters({ equipment: ['Pull-up', 'Dips'] }))).toBe(1);
  });

  it('adds one per active group', () => {
    const filters = makeFilters({
      equipment: ['Pull-up'],
      minRating: 4,
      conditions: ['worn'],
      maxDistanceM: 5000,
      verifiedRecently: true,
    });

    expect(countActiveFilters(filters)).toBe(5);
  });
});

describe('filterSpots', () => {
  it('keeps spots rated at or above the minimum', () => {
    const low = makeSpot({ id: 'low', rating: 3.9 });
    const exactly = makeSpot({ id: 'exactly', rating: 4 });

    const result = filterSpots([low, exactly], makeFilters({ minRating: 4 }));

    expect(result.map((spot) => spot.id)).toEqual(['exactly']);
  });

  it('keeps only the selected conditions', () => {
    const good = makeSpot({ id: 'good', condition: 'good' });
    const worn = makeSpot({ id: 'worn', condition: 'worn' });

    const result = filterSpots([good, worn], makeFilters({ conditions: ['worn'] }));

    expect(result.map((spot) => spot.id)).toEqual(['worn']);
  });

  it('excludes an unknown distance when a maximum is set, but not when distance is unconstrained', () => {
    const near = makeSpot({ id: 'near', distanceMeters: 800 });
    const far = makeSpot({ id: 'far', distanceMeters: 1500 });
    const unknown = makeSpot({ id: 'unknown', distanceMeters: null });

    expect(
      filterSpots([near, far, unknown], makeFilters({ maxDistanceM: 1000 })).map((spot) => spot.id),
    ).toEqual(['near']);

    expect(filterSpots([near, far, unknown], NO_FILTERS).map((spot) => spot.id)).toEqual([
      'near',
      'far',
      'unknown',
    ]);
  });

  it('treats "recently verified" as the badge does: a never-verified spot does not qualify', () => {
    const fresh = makeSpot({ id: 'fresh', verifiedAt: daysAgo(0) });
    const aging = makeSpot({ id: 'aging', verifiedAt: daysAgo(8) });
    const never = makeSpot({ id: 'never' });

    const result = filterSpots([fresh, aging, never], makeFilters({ verifiedRecently: true }));

    expect(result.map((spot) => spot.id)).toEqual(['fresh']);
  });
});

describe('toggleEquipmentFilter', () => {
  it('adds a piece that is not selected and removes one that is', () => {
    const added = toggleEquipmentFilter(NO_FILTERS, 'Pull-up');

    expect(added.equipment).toEqual(['Pull-up']);
    expect(toggleEquipmentFilter(added, 'Pull-up').equipment).toEqual([]);
  });

  it('does not mutate the filter set it was given', () => {
    toggleEquipmentFilter(NO_FILTERS, 'Pull-up');

    expect(NO_FILTERS.equipment).toEqual([]);
  });
});
