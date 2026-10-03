import { formatDistance, formatDistanceAway } from '@/features/spots/format-distance';
import { t } from '@/i18n';

describe('formatDistance', () => {
  it('calls anything under 30 m "here", because the fix cannot tell finer than that', () => {
    expect(formatDistance(0)).toBe(t('distance.here'));
    expect(formatDistance(29)).toBe(t('distance.here'));
  });

  it('rounds metres to the nearest ten below a kilometre', () => {
    expect(formatDistance(30)).toBe(t('distance.meters', { distance: '30' }));
    expect(formatDistance(954)).toBe(t('distance.meters', { distance: '950' }));
  });

  it('switches to kilometres at a kilometre, with one decimal and a comma', () => {
    expect(formatDistance(1000)).toBe(t('distance.kilometers', { distance: '1,0' }));
    expect(formatDistance(1234)).toBe(t('distance.kilometers', { distance: '1,2' }));
    expect(formatDistance(15400)).toBe(t('distance.kilometers', { distance: '15,4' }));
  });

  it('chooses the unit after rounding, so 999 m is one kilometre rather than "1000 м"', () => {
    expect(formatDistance(999)).toBe(t('distance.kilometers', { distance: '1,0' }));
  });
});

describe('formatDistanceAway', () => {
  it('has no label when there is no position to measure from', () => {
    expect(formatDistanceAway(null)).toBeUndefined();
  });

  it('is the same sentence as formatDistance when a distance is known', () => {
    expect(formatDistanceAway(850)).toBe(formatDistance(850));
  });
});
