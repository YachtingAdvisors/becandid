// ============================================================
// Be Candid — Shared Domain Types
// Updated with expanded rival categories
// ============================================================

import type { FoundationalMotivator } from './stringer';

export type Severity = 'low' | 'medium' | 'high';
export type Platform = 'android' | 'ios' | 'web' | 'extension';
export type PartnerStatus = 'pending' | 'active' | 'declined';
export type RelationshipType = 'friend' | 'spouse' | 'mentor' | 'family' | 'coach';
export type StreakMode = 'no_failures' | 'conversation_required';

export type GoalCategory =
  // Sexual content
  | 'pornography'
  | 'sexting'
  // Compulsive consumption
  | 'social_media'
  | 'binge_watching'
  | 'impulse_shopping'
  // Substances & recovery
  | 'alcohol_drugs'
  | 'vaping_tobacco'
  // Body image & eating disorders
  | 'eating_disorder'
  | 'body_checking'
  // Gambling & financial
  | 'gambling'
  | 'sports_betting'
  | 'day_trading'
  // Dating & relationships
  | 'dating_apps'
  // Gaming
  | 'gaming'
  // Rage & outrage
  | 'rage_content'
  // Other
  | 'custom';

// ─── Category Groups (for onboarding UI) ─────────────────────

export interface CategoryGroup {
  label: string;
  description: string;
  icon: string;
  categories: GoalCategory[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'Sexual Content',
    description: 'Pornography, sexting, and explicit material',
    icon: '🔒',
    categories: ['pornography', 'sexting'],
  },
  {
    label: 'Compulsive Consumption',
    description: 'Scrolling, streaming, and shopping loops',
    icon: '📱',
    categories: ['social_media', 'binge_watching', 'impulse_shopping'],
  },
  {
    label: 'Substances & Recovery',
    description: 'Alcohol, drugs, vaping, and tobacco content',
    icon: '🚫',
    categories: ['alcohol_drugs', 'vaping_tobacco'],
  },
  {
    label: 'Body Image & Eating Disorders',
    description: 'Pro-ED content, obsessive tracking, body checking',
    icon: '🪞',
    categories: ['eating_disorder', 'body_checking'],
  },
  {
    label: 'Gambling & Financial',
    description: 'Casinos, sports betting, and compulsive trading',
    icon: '💰',
    categories: ['gambling', 'sports_betting', 'day_trading'],
  },
  {
    label: 'Dating & Relationships',
    description: 'Compulsive swiping and validation-seeking',
    icon: '💔',
    categories: ['dating_apps'],
  },
  {
    label: 'Gaming',
    description: 'Excessive or compulsive gaming sessions',
    icon: '🎮',
    categories: ['gaming'],
  },
  {
    label: 'Rage & Outrage',
    description: 'Political rage, hate content, comment wars',
    icon: '🔥',
    categories: ['rage_content'],
  },
];

// ─── Display Labels ──────────────────────────────────────────

export const GOAL_LABELS: Record<GoalCategory, string> = {
  pornography:      'Pornography',
  sexting:          'Sexting',
  social_media:     'Social Media & News',
  binge_watching:   'Binge Watching',
  impulse_shopping: 'Impulse Shopping',
  alcohol_drugs:    'Alcohol & Drugs',
  vaping_tobacco:   'Vaping & Tobacco',
  eating_disorder:  'Eating Disorder Content',
  body_checking:    'Body Checking',
  gambling:         'Gambling',
  sports_betting:   'Sports Betting',
  day_trading:      'Day Trading',
  dating_apps:      'Dating Apps',
  gaming:           'Excessive Gaming',
  rage_content:     'Rage & Outrage Content',
  custom:           'Custom',
};

export const GOAL_DESCRIPTIONS: Record<GoalCategory, string> = {
  pornography:      'Explicit videos, images, and sites',
  sexting:          'Sexual messaging and exchanges',
  social_media:     'Instagram, TikTok, X, Reddit, news feeds — scrolling, doomscrolling, and overuse',
  binge_watching:   'Netflix, YouTube rabbit holes, streaming marathons',
  impulse_shopping: 'Amazon, online shopping sprees, cart addiction',
  alcohol_drugs:    'Bar finders, delivery apps, content romanticizing use',
  vaping_tobacco:   'Vape shops, tobacco content, nicotine-related apps',
  eating_disorder:  'Pro-ED communities, extreme diet content, thinspo',
  body_checking:    'Obsessive calorie tracking, mirror checking, fitspiration',
  gambling:         'Online casinos, poker, slot apps',
  sports_betting:   'DraftKings, FanDuel, bet tracking apps',
  day_trading:      'Crypto trading, meme stocks, compulsive market watching',
  dating_apps:      'Tinder, Hinge, Bumble — compulsive swiping',
  gaming:           'Extended gaming sessions, ranked addiction',
  rage_content:     'Political outrage, hate forums, comment arguments',
  custom:           'Define your own category to monitor',
};

// ─── Emojis ──────────────────────────────────────────────────

export function getCategoryEmoji(category: GoalCategory): string {
  const map: Record<GoalCategory, string> = {
    pornography:      '🔞',
    sexting:          '💬',
    social_media:     '📱',
    binge_watching:   '📺',
    impulse_shopping: '🛒',
    alcohol_drugs:    '🍷',
    vaping_tobacco:   '🚬',
    eating_disorder:  '⚠️',
    body_checking:    '🪞',
    gambling:         '🎰',
    sports_betting:   '🏈',
    day_trading:      '📈',
    dating_apps:      '💔',
    gaming:           '🎮',
    rage_content:     '😤',
    custom:           '⚙️',
  };
  return map[category] ?? '⚠️';
}

// ─── Severity ────────────────────────────────────────────────

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#F59E0B',
  medium: '#F97316',
  high: '#EF4444',
};

// ─── Streak Mode ─────────────────────────────────────────────

export const STREAK_MODE_LABELS: Record<StreakMode, string> = {
  no_failures:           'No Failures (stricter)',
  conversation_required: 'Had an Accountability Conversation (modified)',
};

export const STREAK_MODE_SHORT: Record<StreakMode, string> = {
  no_failures:           'Strict — zero flags',
  conversation_required: 'Modified — flags ok if you talk it through',
};

// ─── All category keys (for validation) ──────────────────────

export const ALL_GOAL_CATEGORIES: GoalCategory[] = [
  'pornography', 'sexting',
  'social_media', 'binge_watching', 'impulse_shopping',
  'alcohol_drugs', 'vaping_tobacco',
  'eating_disorder', 'body_checking',
  'gambling', 'sports_betting', 'day_trading',
  'dating_apps',
  'gaming',
  'rage_content',
  'custom',
];

// ─── Database row types ──────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  goals: GoalCategory[];
  partner_id?: string;
  relationship_type: RelationshipType;
  monitoring_enabled: boolean;
  streak_mode: StreakMode;
  timezone: string;
  account_mode?: AccountMode;
  foundational_motivator?: FoundationalMotivator;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  partner_user_id?: string;
  partner_email: string;
  partner_name: string;
  partner_phone?: string;
  status: PartnerStatus;
  invite_token: string;
  invited_at: string;
  accepted_at?: string;
}

export interface Event {
  id: string;
  user_id: string;
  category: GoalCategory;
  severity: Severity;
  platform: Platform;
  app_name?: string;
  url_hash?: string;
  duration_seconds?: number;
  acknowledged: boolean;
  timestamp: string;
  created_at: string;
}

export interface Alert {
  id: string;
  event_id: string;
  user_id: string;
  sent_at: string;
  email_sent: boolean;
  sms_sent: boolean;
  ai_guide_user: string;
  ai_guide_partner: string;
  partner_notified: boolean;
}

export interface Conversation {
  id: string;
  alert_id: string;
  user_id: string;
  completed_at?: string;
  notes?: string;
  outcome?: 'positive' | 'neutral' | 'difficult';
  created_at: string;
}

export interface CreateEventPayload {
  category: GoalCategory;
  severity: Severity;
  platform: Platform;
  app_name?: string;
  duration_seconds?: number;
}

export interface OnboardingPayload {
  name: string;
  goals: GoalCategory[];
  partner_email: string;
  partner_name: string;
  partner_phone?: string;
  relationship_type: RelationshipType;
}

export interface AIConversationGuide {
  for_user: {
    opening: string;
    how_to_be_honest: string;
    what_to_ask_for: string;
    affirmation: string;
  };
  for_partner: {
    opening: string;
    what_not_to_say: string[];
    questions: string[];
    how_to_create_safety: string;
  };
}
// ─── Account Mode ─────────────────────────────────────────
export type AccountMode = 'adult' | 'teen';

// ─── Guardian ─────────────────────────────────────────────
export type GuardianRelationship = 'parent' | 'guardian' | 'counselor' | 'mentor';

export interface Guardian {
  id: string;
  guardian_user_id: string;
  teen_user_id: string;
  relationship: GuardianRelationship;
  status: 'pending' | 'active' | 'revoked';
  permissions: GuardianPermissions;
  invite_token: string;
  created_at: string;
}

export interface GuardianPermissions {
  view_events: boolean;
  view_journal: boolean; // Never true by default — journal is sacred
  manage_content_filter: boolean;
  manage_screen_time: boolean;
  receive_alerts: boolean;
  manage_settings: boolean;
}

// ─── Content Filter ───────────────────────────────────────
export type ContentFilterLevel = 'off' | 'standard' | 'strict' | 'custom';

// ─── Screen Time ──────────────────────────────────────────
export interface ScreenTimeRule {
  id: string;
  user_id: string;
  category: string; // GoalCategory or 'all'
  daily_limit_minutes: number | null;
  downtime_start: string | null; // HH:MM
  downtime_end: string | null;   // HH:MM
  days_of_week: number[];        // 0-6 (Sun-Sat)
  enforced: boolean;             // Guardian-locked if true
  created_at: string;
}

export interface ScreenTimeUsage {
  user_id: string;
  date: string;
  category: string;
  minutes_used: number;
  limit_minutes: number | null;
  over_limit: boolean;
}

export * from './stringer';
