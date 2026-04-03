// ============================================================
// Anonymous Name Generator
// Deterministic: same user_id always produces the same name.
// ============================================================

const ADJECTIVES = [
  'Focused', 'Brave', 'Steady', 'Honest', 'Hopeful',
  'Resilient', 'Patient', 'Gentle', 'Courageous', 'Faithful',
  'Grounded', 'Rising',
];

const NOUNS = [
  'Explorer', 'Wanderer', 'Pilgrim', 'Builder', 'Seeker',
  'Traveler', 'Climber', 'Runner', 'Gardener', 'Warrior',
  'Keeper', 'Listener',
];

/**
 * Generate a consistent anonymous display name from a user ID.
 * Uses a simple hash of the UUID to pick adjective + noun.
 */
export function getAnonymousName(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  // Ensure positive
  const positive = Math.abs(hash);
  const adj = ADJECTIVES[positive % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(positive / ADJECTIVES.length) % NOUNS.length];
  return `${adj} ${noun}`;
}
