import { formatDecimal, reviewCountLabel } from '@/i18n';

describe('formatDecimal', () => {
  it('always writes one decimal, with the comma Bulgarian uses', () => {
    expect(formatDecimal(3)).toBe('3,0');
    expect(formatDecimal(4.7)).toBe('4,7');
    expect(formatDecimal(4.25, 2)).toBe('4,25');
  });

  it('rounds to the requested number of decimals', () => {
    expect(formatDecimal(950, 0)).toBe('950');
    expect(formatDecimal(1.234, 1)).toBe('1,2');
  });
});

describe('reviewCountLabel', () => {
  it('declines the one/few pair the count needs', () => {
    expect(reviewCountLabel(1)).toBe('1 отзив');
    expect(reviewCountLabel(3)).toBe('3 отзива');
  });
});
