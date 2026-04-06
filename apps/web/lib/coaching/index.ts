// ============================================================
// Be Candid — Coaching Content Index
//
// Combines all coaching library partitions into a single
// searchable in-memory array. Each partition is maintained
// by domain experts and generated separately:
//   - Sexual content & substances
//   - Digital consumption & gambling
//   - Other categories (body image, rage, custom, etc.)
// ============================================================

import { COACHING_LIBRARY_SEXUAL_SUBSTANCES } from './library-sexual-substances';
import { COACHING_LIBRARY_DIGITAL_GAMBLING } from './library-digital-gambling';
import { COACHING_LIBRARY_OTHER } from './library-other';

export { type CoachingEntry } from './library-sexual-substances';

export const FULL_COACHING_LIBRARY = [
  ...COACHING_LIBRARY_SEXUAL_SUBSTANCES,
  ...COACHING_LIBRARY_DIGITAL_GAMBLING,
  ...COACHING_LIBRARY_OTHER,
];
