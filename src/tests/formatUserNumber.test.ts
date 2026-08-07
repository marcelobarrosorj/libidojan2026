import { describe, it, expect } from 'vitest';
import { formatUserNumber } from '../utils/formatUserNumber';

describe('formatUserNumber', () => {
  it('formats owner correctly', () => {
    expect(formatUserNumber(1)).toBe('000001');
  });

  it('formats subsequent users correctly', () => {
    expect(formatUserNumber(25)).toBe('000025');
    expect(formatUserNumber(999)).toBe('000999');
    expect(formatUserNumber(123456)).toBe('123456');
    expect(formatUserNumber(1234567)).toBe('1234567'); // Does not truncate
  });

  it('returns empty string for invalid inputs', () => {
    expect(formatUserNumber(undefined)).toBe('');
    expect(formatUserNumber(null)).toBe('');
    expect(formatUserNumber('invalid')).toBe('');
    expect(formatUserNumber(NaN)).toBe('');
  });
});
