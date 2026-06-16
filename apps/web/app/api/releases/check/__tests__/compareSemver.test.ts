import { describe, expect, it } from 'vitest';
import { compareSemver } from '../route';

describe('compareSemver', () => {
  it('should return 0 for equal versions', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('v1.0.0', '1.0.0')).toBe(0);
  });

  it('should return 1 when first version is greater', () => {
    expect(compareSemver('2.0.0', '1.0.0')).toBe(1);
    expect(compareSemver('1.1.0', '1.0.0')).toBe(1);
    expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
  });

  it('should return -1 when first version is lesser', () => {
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
    expect(compareSemver('1.0.0', '1.1.0')).toBe(-1);
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
  });

  it('should handle versions with different lengths', () => {
    expect(compareSemver('1.0.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.1', '1.0')).toBe(1);
  });

  it('should gracefully handle non-numeric components (security fix)', () => {
    expect(compareSemver('1.0.a', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0', '1.0.a')).toBe(0);

    expect(compareSemver('1.0.NaN', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0', '1.0.NaN')).toBe(0);
  });
});
