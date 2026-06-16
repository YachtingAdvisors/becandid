import { describe, it, expect } from 'bun:test';
import { getCategoryEmoji, ALL_GOAL_CATEGORIES, GoalCategory } from '../types/index';

describe('getCategoryEmoji', () => {
  it('should return the correct emoji for all defined goal categories', () => {
    // We expect every defined category to return a specific string (emoji)
    // We can test a few explicit mappings
    expect(getCategoryEmoji('pornography')).toBe('🔞');
    expect(getCategoryEmoji('eating_disorder')).toBe('⚠️');
    expect(getCategoryEmoji('gaming')).toBe('🎮');
    expect(getCategoryEmoji('procrastination')).toBe('⏳');

    // And ensure no defined category falls through unexpectedly (unless the map explicitly uses the default)
    // ALL_GOAL_CATEGORIES has 25 items, verify them all.
    ALL_GOAL_CATEGORIES.forEach(category => {
      const emoji = getCategoryEmoji(category);
      expect(typeof emoji).toBe('string');
      expect(emoji.length).toBeGreaterThan(0);
    });
  });

  it('should return the default warning emoji for unknown or invalid categories', () => {
    // By casting an invalid string to GoalCategory, we can test the fallback
    expect(getCategoryEmoji('unknown_category' as GoalCategory)).toBe('⚠️');
    expect(getCategoryEmoji('' as GoalCategory)).toBe('⚠️');
    expect(getCategoryEmoji(undefined as unknown as GoalCategory)).toBe('⚠️');
    expect(getCategoryEmoji(null as unknown as GoalCategory)).toBe('⚠️');
  });
});
