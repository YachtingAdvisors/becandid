// ============================================================
// lib/widgets/registry.ts
//
// Central registry of all dashboard widgets. Each widget has
// metadata used for the widget manager UI and for computing
// recommended defaults based on goals + motivator.
// ============================================================

import type { GoalCategory } from '@be-candid/shared';

export interface WidgetDef {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbols icon name
  category: 'daily' | 'monitoring' | 'growth' | 'social' | 'info';
  alwaysOn?: boolean; // Can't be removed (e.g. DashboardHero)
  requiresGoal?: GoalCategory; // Only available if user has this goal
  defaultForGoals?: GoalCategory[]; // Auto-added when user has any of these goals
  defaultForMotivators?: string[]; // Auto-added when user has any of these motivators
}

// ── Full widget catalog ───────────────────────────────────────

export const WIDGET_REGISTRY: WidgetDef[] = [
  // Always-on
  {
    id: 'dashboard_hero',
    name: 'Dashboard Overview',
    description: 'Your streak, mood trend, journal count, and reputation points at a glance.',
    icon: 'dashboard',
    category: 'info',
    alwaysOn: true,
  },

  // Daily rituals
  {
    id: 'quick_mood',
    name: 'Quick Mood Check-in',
    description: 'Rate your mood in one tap to track emotional patterns over time.',
    icon: 'mood',
    category: 'daily',
  },
  {
    id: 'daily_commitment',
    name: 'Daily Commitment',
    description: 'Set morning intentions and evening reflections to anchor your day.',
    icon: 'flag',
    category: 'daily',
    defaultForMotivators: ['spiritual', 'general'],
  },
  {
    id: 'daily_challenge',
    name: 'Daily Challenge',
    description: 'A new growth challenge each day to push your comfort zone.',
    icon: 'emoji_events',
    category: 'daily',
    defaultForMotivators: ['psychological', 'general'],
  },
  {
    id: 'daily_inventory',
    name: 'Daily Inventory',
    description: 'Step-through emotional inventory to process your day.',
    icon: 'checklist',
    category: 'daily',
  },
  {
    id: 'quote_of_day',
    name: 'Quote of the Day',
    description: 'An inspiring quote personalized to your foundational motivator.',
    icon: 'format_quote',
    category: 'daily',
  },

  // Monitoring & awareness checks
  {
    id: 'crisis_detection',
    name: 'Crisis Detection',
    description: 'Real-time activity monitoring with flag counts and severity tracking.',
    icon: 'shield',
    category: 'monitoring',
  },
  {
    id: 'screen_time',
    name: 'Screen Time',
    description: 'Today\'s screen time stats and category breakdown.',
    icon: 'phone_android',
    category: 'monitoring',
  },
  {
    id: 'content_filter',
    name: 'Content Filter',
    description: 'AI content filtering status and blocked content stats.',
    icon: 'filter_alt',
    category: 'monitoring',
  },
  {
    id: 'isolation_check',
    name: 'Isolation Check',
    description: 'Monitor connection patterns and catch isolation before it spirals.',
    icon: 'group_off',
    category: 'monitoring',
    requiresGoal: 'isolation',
    defaultForGoals: ['isolation'],
  },
  {
    id: 'doomscroll_check',
    name: 'Doomscroll Check',
    description: 'Awareness widget for doomscrolling patterns and triggers.',
    icon: 'swipe_down',
    category: 'monitoring',
    requiresGoal: 'doomscrolling',
    defaultForGoals: ['doomscrolling'],
  },
  {
    id: 'procrastination_check',
    name: 'Procrastination Check',
    description: 'Track procrastination patterns and build momentum.',
    icon: 'hourglass_empty',
    category: 'monitoring',
    requiresGoal: 'procrastination',
    defaultForGoals: ['procrastination'],
  },
  {
    id: 'worklife_check',
    name: 'Work-Life Check',
    description: 'Monitor overworking patterns and protect your boundaries.',
    icon: 'work_off',
    category: 'monitoring',
    requiresGoal: 'overworking',
    defaultForGoals: ['overworking'],
  },
  {
    id: 'sleep_check',
    name: 'Sleep Check',
    description: 'Track sleep avoidance and bedtime procrastination patterns.',
    icon: 'bedtime',
    category: 'monitoring',
    requiresGoal: 'sleep_avoidance',
    defaultForGoals: ['sleep_avoidance'],
  },
  {
    id: 'self_harm_safety',
    name: 'Safety Resources',
    description: 'Crisis resources and safety planning tools.',
    icon: 'health_and_safety',
    category: 'monitoring',
    requiresGoal: 'self_harm',
    defaultForGoals: ['self_harm'],
  },

  // Growth & reflection
  {
    id: 'focus_board_mini',
    name: 'Focus Board',
    description: 'Morning and evening focus status with streak tracking.',
    icon: 'center_focus_strong',
    category: 'growth',
  },
  {
    id: 'checkin_mini',
    name: 'Check-in',
    description: 'Quick accountability check-in with your partner.',
    icon: 'fact_check',
    category: 'growth',
  },
  {
    id: 'growth_journal',
    name: 'Growth Journal',
    description: 'Stringer-framework journaling for deep self-reflection.',
    icon: 'auto_stories',
    category: 'growth',
    defaultForMotivators: ['psychological', 'relational'],
  },
  {
    id: 'focus_chips',
    name: 'Focus Chips',
    description: 'Recent milestone achievements (7, 14, 30, 60, 90+ days).',
    icon: 'military_tech',
    category: 'growth',
  },

  // Social & partner
  {
    id: 'relationship_mini',
    name: 'Relationship',
    description: 'Relationship health and accountability partner status.',
    icon: 'favorite',
    category: 'social',
  },
  {
    id: 'spouse_impact',
    name: 'Spouse Impact',
    description: 'Track how your journey impacts your partner relationship.',
    icon: 'volunteer_activism',
    category: 'social',
  },
  {
    id: 'partner_awareness',
    name: 'Partner Awareness',
    description: 'Your accountability partner\'s view and connection status.',
    icon: 'handshake',
    category: 'social',
  },
  {
    id: 'referral_card',
    name: 'Referral',
    description: 'Share Be Candid and earn free days for you and your friend.',
    icon: 'card_giftcard',
    category: 'social',
  },

  // Info & utility
  {
    id: 'nudge_banner',
    name: 'Nudge Banner',
    description: 'Encouragement nudges and motivational prompts.',
    icon: 'notifications_active',
    category: 'info',
  },
  {
    id: 'whats_new',
    name: 'What\'s New',
    description: 'Latest features and updates from Be Candid.',
    icon: 'new_releases',
    category: 'info',
  },
  {
    id: 'scheduled_coach',
    name: 'Scheduled Coach',
    description: 'Upcoming coaching sessions and conversation guides.',
    icon: 'event',
    category: 'info',
  },
  {
    id: 'recent_events',
    name: 'Recent Events',
    description: 'Your latest digital activity events with severity levels.',
    icon: 'history',
    category: 'info',
  },
  {
    id: 'weekly_report',
    name: 'Weekly Report',
    description: 'Link to your full weekly accountability report.',
    icon: 'summarize',
    category: 'info',
  },
];

// ── Helpers ───────────────────────────────────────────────────

export function getWidgetById(id: string): WidgetDef | undefined {
  return WIDGET_REGISTRY.find(w => w.id === id);
}

export function getAvailableWidgets(goals: string[]): WidgetDef[] {
  return WIDGET_REGISTRY.filter(w => {
    if (w.requiresGoal && !goals.includes(w.requiresGoal)) return false;
    return true;
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  daily: 'Daily Rituals',
  monitoring: 'Monitoring & Awareness',
  growth: 'Growth & Reflection',
  social: 'Social & Partner',
  info: 'Info & Utility',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * Compute the recommended default widget set based on the user's
 * goals and foundational motivator.
 */
export function getDefaultWidgets(
  goals: string[] = [],
  motivator: string = 'general'
): string[] {
  const widgets: string[] = [];

  // 1. Always-on widgets
  for (const w of WIDGET_REGISTRY) {
    if (w.alwaysOn) widgets.push(w.id);
  }

  // 2. Core starter widgets
  const coreWidgets = ['quick_mood', 'quote_of_day', 'focus_board_mini', 'checkin_mini'];
  for (const id of coreWidgets) {
    if (!widgets.includes(id)) widgets.push(id);
  }

  // 3. Goal-based defaults
  for (const w of WIDGET_REGISTRY) {
    if (w.defaultForGoals && w.defaultForGoals.some(g => goals.includes(g))) {
      if (!widgets.includes(w.id)) widgets.push(w.id);
    }
  }

  // 4. Motivator-based defaults
  const motivators = motivator.split(',').map(m => m.trim());
  for (const w of WIDGET_REGISTRY) {
    if (w.defaultForMotivators && w.defaultForMotivators.some(m => motivators.includes(m))) {
      if (!widgets.includes(w.id)) widgets.push(w.id);
    }
  }

  // 5. A few universally useful extras
  widgets.push('nudge_banner', 'referral_card', 'weekly_report');

  return [...new Set(widgets)]; // dedupe
}
