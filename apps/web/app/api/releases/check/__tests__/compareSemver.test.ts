import { describe, expect, it } from 'bun:test';
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
    // Before the fix, map(Number) turns "a" into NaN.
    // NaN > 0 is false, NaN < 0 is false, so it could fall through to equality
    // or evaluate in unpredictable ways.
    // Now it treats NaN as 0.
    expect(compareSemver('1.0.a', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0', '1.0.a')).toBe(0);

    // Testing specific NaN cases
    expect(compareSemver('1.0.NaN', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0', '1.0.NaN')).toBe(0);
  });
});
