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
  | 'doomscrolling'
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
  | 'emotional_affairs'
  // Gaming
  | 'gaming'
  // Rage & outrage
  | 'rage_content'
  | 'gossip_drama'
  // Isolation & withdrawal
  | 'isolation'
  // AI & Virtual
  | 'ai_relationships'
  // Overworking
  | 'overworking'
  // Sleep & Rest
  | 'sleep_avoidance'
  // Recovery & Healing
  | 'self_harm'
  // Productivity
  | 'procrastination'
  // Other
  | 'custom';

// ─── Tracked Substances ─────────────────────────────────────

export type TrackedSubstance =
  | 'alcohol'
  | 'beer'
  | 'wine'
  | 'liquor'
  | 'marijuana'
  | 'cannabis'
  | 'cocaine'
  | 'opioids'
  | 'heroin'
  | 'fentanyl'
  | 'methamphetamine'
  | 'prescription_drugs'
  | 'vaping'
  | 'cigarettes'
  | 'nicotine'
  | 'kratom'
  | 'psychedelics'
  | 'other';

export const SUBSTANCE_LABELS: Record<TrackedSubstance, string> = {
  alcohol: 'Alcohol (general)',
  beer: 'Beer',
  wine: 'Wine',
  liquor: 'Liquor/Spirits',
  marijuana: 'Marijuana/Cannabis',
  cannabis: 'Cannabis/THC',
  cocaine: 'Cocaine',
  opioids: 'Opioids/Painkillers',
  heroin: 'Heroin',
  fentanyl: 'Fentanyl',
  methamphetamine: 'Methamphetamine',
  prescription_drugs: 'Prescription Drug Misuse',
  vaping: 'Vaping/E-cigarettes',
  cigarettes: 'Cigarettes',
  nicotine: 'Nicotine (general)',
  kratom: 'Kratom',
  psychedelics: 'Psychedelics',
  other: 'Other Substance',
};

// Map substances to their parent GoalCategory
export const SUBSTANCE_CATEGORIES: Record<TrackedSubstance, GoalCategory> = {
  alcohol: 'alcohol_drugs',
  beer: 'alcohol_drugs',
  wine: 'alcohol_drugs',
  liquor: 'alcohol_drugs',
  marijuana: 'alcohol_drugs',
  cannabis: 'alcohol_drugs',
  cocaine: 'alcohol_drugs',
  opioids: 'alcohol_drugs',
  heroin: 'alcohol_drugs',
  fentanyl: 'alcohol_drugs',
  methamphetamine: 'alcohol_drugs',
  prescription_drugs: 'alcohol_drugs',
  vaping: 'vaping_tobacco',
  cigarettes: 'vaping_tobacco',
  nicotine: 'vaping_tobacco',
  kratom: 'alcohol_drugs',
  psychedelics: 'alcohol_drugs',
  other: 'alcohol_drugs',
};

// Substances available for each parent category
export const SUBSTANCES_BY_CATEGORY: Record<string, TrackedSubstance[]> = {
  alcohol_drugs: [
    'alcohol', 'beer', 'wine', 'liquor',
    'marijuana', 'cannabis',
    'cocaine', 'opioids', 'heroin', 'fentanyl', 'methamphetamine',
    'prescription_drugs', 'kratom', 'psychedelics', 'other',
  ],
  vaping_tobacco: ['vaping', 'cigarettes', 'nicotine'],
};

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
    description: 'Scrolling, streaming, shopping loops, and doomscrolling',
    icon: '📱',
    categories: ['social_media', 'binge_watching', 'impulse_shopping', 'doomscrolling'],
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
    description: 'Compulsive swiping, validation-seeking, and emotional infidelity',
    icon: '💔',
    categories: ['dating_apps', 'emotional_affairs'],
  },
  {
    label: 'Gaming',
    description: 'Excessive or compulsive gaming sessions',
    icon: '🎮',
    categories: ['gaming'],
  },
  {
    label: 'Rage & Outrage',
    description: 'Political rage, hate content, comment wars, gossip, and drama',
    icon: '🔥',
    categories: ['rage_content', 'gossip_drama'],
  },
  {
    label: 'Isolation & Withdrawal',
    description: 'Pulling away from people, avoiding connection, hiding',
    icon: '🚪',
    categories: ['isolation'],
  },
  {
    label: 'AI & Virtual',
    description: 'AI chatbot companions replacing real human connection',
    icon: '🤖',
    categories: ['ai_relationships'],
  },
  {
    label: 'Overworking',
    description: 'Using work to avoid relationships, feelings, or rest',
    icon: '💼',
    categories: ['overworking'],
  },
  {
    label: 'Sleep & Rest',
    description: 'Revenge bedtime procrastination and sleep avoidance',
    icon: '🌙',
    categories: ['sleep_avoidance'],
  },
  {
    label: 'Recovery & Healing',
    description: 'Recovery from self-harm with crisis support and safety features',
    icon: '🩹',
    categories: ['self_harm'],
  },
  {
    label: 'Productivity',
    description: 'Task avoidance, analysis paralysis, and procrastination',
    icon: '⏳',
    categories: ['procrastination'],
  },
];

// ─── Display Labels ──────────────────────────────────────────

export const GOAL_LABELS: Record<GoalCategory, string> = {
  pornography:      'Pornography',
  sexting:          'Sexting',
  social_media:     'Social Media & News',
  binge_watching:   'Binge Watching',
  impulse_shopping: 'Impulse Shopping',
  doomscrolling:    'Doomscrolling',
  alcohol_drugs:    'Alcohol & Drugs',
  vaping_tobacco:   'Vaping & Tobacco',
  eating_disorder:  'Eating Disorder Content',
  body_checking:    'Body Checking',
  gambling:         'Gambling',
  sports_betting:   'Sports Betting',
  day_trading:      'Day Trading',
  dating_apps:      'Dating Apps',
  emotional_affairs: 'Emotional Affairs',
  gaming:           'Excessive Gaming',
  rage_content:     'Rage & Outrage Content',
  gossip_drama:     'Gossip & Drama',
  isolation:        'Isolation & Withdrawal',
  ai_relationships: 'AI Relationships',
  overworking:      'Overworking',
  sleep_avoidance:  'Sleep Avoidance',
  self_harm:        'Self-Harm Recovery',
  procrastination:  'Procrastination',
  custom:           'Custom',
};

export const GOAL_DESCRIPTIONS: Record<GoalCategory, string> = {
  pornography:      'Explicit videos, images, and sites',
  sexting:          'Sexual messaging and exchanges',
  social_media:     'Instagram, TikTok, X, Reddit, news feeds — scrolling, doomscrolling, and overuse',
  binge_watching:   'Netflix, YouTube rabbit holes, streaming marathons',
  impulse_shopping: 'Amazon, online shopping sprees, cart addiction',
  doomscrolling:    'News addiction, political rabbit holes, doomscrolling, anxiety-driven information consumption',
  alcohol_drugs:    'Bar finders, delivery apps, content romanticizing use',
  vaping_tobacco:   'Vape shops, tobacco content, nicotine-related apps',
  eating_disorder:  'Pro-ED communities, extreme diet content, thinspo',
  body_checking:    'Obsessive calorie tracking, mirror checking, fitspiration',
  gambling:         'Online casinos, poker, slot apps',
  sports_betting:   'DraftKings, FanDuel, bet tracking apps',
  day_trading:      'Crypto trading, meme stocks, compulsive market watching',
  dating_apps:      'Tinder, Hinge, Bumble — compulsive swiping',
  emotional_affairs: 'Emotionally intimate relationships outside your primary relationship — confiding, texting constantly, crossing boundaries without physical contact',
  gaming:           'Extended gaming sessions, ranked addiction',
  rage_content:     'Political outrage, hate forums, comment arguments',
  gossip_drama:     'Reality TV obsession, group chat drama, compulsive involvement in other people\'s business, celebrity gossip',
  isolation:        'Pulling away from people, canceling plans, hiding in your room, avoiding calls',
  ai_relationships: 'Character.AI, Replika, romantic AI companions — replacing real connection with artificial intimacy',
  overworking:      'Using work to avoid relationships, feelings, or rest. Staying late, checking email obsessively, inability to disconnect',
  sleep_avoidance:  'Staying up late to reclaim personal time, revenge bedtime procrastination, sacrificing sleep for scrolling or streaming',
  self_harm:        'Recovery from self-harm behaviors. This category includes extra safety features and crisis resources.',
  procrastination:  'Task avoidance, analysis paralysis, doing everything except what matters. Often the precursor to other rivals.',
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
    doomscrolling:    '📰',
    alcohol_drugs:    '🍷',
    vaping_tobacco:   '🚬',
    eating_disorder:  '⚠️',
    body_checking:    '🪞',
    gambling:         '🎰',
    sports_betting:   '🏈',
    day_trading:      '📈',
    dating_apps:      '💔',
    emotional_affairs: '💭',
    gaming:           '🎮',
    rage_content:     '😤',
    gossip_drama:     '🗣️',
    isolation:        '🚪',
    ai_relationships: '🤖',
    overworking:      '💼',
    sleep_avoidance:  '🌙',
    self_harm:        '🩹',
    procrastination:  '⏳',
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
  no_failures:           'Spartan (High Intensity)',
  conversation_required: 'Accountable (Modified)',
};

export const STREAK_MODE_SHORT: Record<StreakMode, string> = {
  no_failures:           'Any flag resets your streak — unless your partner marks it as a false flag',
  conversation_required: 'Flags are ok if you talk it through with your partner',
};

// ─── All category keys (for validation) ──────────────────────

export const ALL_GOAL_CATEGORIES: GoalCategory[] = [
  'pornography', 'sexting',
  'social_media', 'binge_watching', 'impulse_shopping', 'doomscrolling',
  'alcohol_drugs', 'vaping_tobacco',
  'eating_disorder', 'body_checking',
  'gambling', 'sports_betting', 'day_trading',
  'dating_apps', 'emotional_affairs',
  'gaming',
  'rage_content', 'gossip_drama',
  'isolation',
  'ai_relationships',
  'overworking',
  'sleep_avoidance',
  'self_harm',
  'procrastination',
  'custom',
];

// ─── Database row types ──────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  goals: GoalCategory[];
  tracked_substances?: TrackedSubstance[];
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
  invite_token?: string | null;
  invite_expires_at?: string | null;
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
  guardian_email?: string | null;
  relationship: GuardianRelationship;
  status: 'pending' | 'active' | 'revoked';
  permissions: GuardianPermissions;
  invite_token?: string | null;
  invite_expires_at?: string | null;
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
