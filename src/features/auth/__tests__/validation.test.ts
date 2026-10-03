import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
  validatePasswordEntry,
} from '@/features/auth/validation';

describe('validateEmail', () => {
  it('rejects an empty value with the "required" key', () => {
    expect(validateEmail('')).toBe('auth.error.emailRequired');
    expect(validateEmail('   ')).toBe('auth.error.emailRequired');
  });

  it('rejects shapes that are obviously not an address', () => {
    expect(validateEmail('ivan')).toBe('auth.error.invalidEmail');
    expect(validateEmail('ivan@')).toBe('auth.error.invalidEmail');
    expect(validateEmail('ivan@primer')).toBe('auth.error.invalidEmail');
    expect(validateEmail('@primer.bg')).toBe('auth.error.invalidEmail');
    expect(validateEmail('ivan primer@bg')).toBe('auth.error.invalidEmail');
  });

  it('accepts a normal address, trimming the edges first', () => {
    expect(validateEmail('ivan@primer.bg')).toBeNull();
    expect(validateEmail('  ivan@primer.bg  ')).toBeNull();
    expect(validateEmail('ivan+tag@sub.primer.bg')).toBeNull();
  });
});

describe('validateName', () => {
  it('requires something that is not just whitespace', () => {
    expect(validateName('')).toBe('auth.error.nameRequired');
    expect(validateName('   ')).toBe('auth.error.nameRequired');
  });

  it('accepts any non-empty name', () => {
    expect(validateName('Иван')).toBeNull();
    expect(validateName('  Иван  ')).toBeNull();
  });
});

describe('validateNewPassword', () => {
  it('rejects passwords shorter than the minimum', () => {
    expect(validateNewPassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      'auth.error.weakPassword',
    );
  });

  it('accepts exactly the minimum and longer', () => {
    expect(validateNewPassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
    expect(validateNewPassword('a'.repeat(MIN_PASSWORD_LENGTH + 10))).toBeNull();
  });
});

describe('validatePasswordEntry', () => {
  it('only asks that something was typed', () => {
    expect(validatePasswordEntry('')).toBe('auth.error.passwordRequired');
    expect(validatePasswordEntry('x')).toBeNull();
  });
});
