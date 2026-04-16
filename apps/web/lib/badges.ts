// ============================================================
// Badge & Milestone definitions — shared between progress page
// and shareable milestone pages
// ============================================================

export interface BadgeDefinition {
  key: string;
  label: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const ALL_BADGES: BadgeDefinition[] = [
  { key: 'focused_segments_10',  label: '10 Focused Segments',  icon: 'eco', tier: 'bronze' },
  { key: 'focused_segments_25',  label: '25 Focused Segments',  icon: 'park', tier: 'bronze' },
  { key: 'focused_segments_50',  label: '50 Focused Segments',  icon: 'forest', tier: 'silver' },
  { key: 'focused_segments_100', label: '100 Focused Segments', icon: 'landscape', tier: 'gold' },
  { key: 'full_days_7',          label: '7 Full Focused Days',  icon: 'star', tier: 'bronze' },
  { key: 'full_days_14',         label: '14 Full Focused Days', icon: 'stars', tier: 'silver' },
  { key: 'full_days_30',         label: '30 Full Focused Days', icon: 'auto_awesome', tier: 'gold' },
  { key: 'full_days_60',         label: '60 Full Focused Days', icon: 'local_fire_department', tier: 'gold' },
  { key: 'full_days_90',         label: '90 Full Focused Days', icon: 'crown', tier: 'platinum' },
  { key: 'points_100',           label: '100 Reputation Points',     icon: 'target', tier: 'bronze' },
  { key: 'points_500',           label: '500 Reputation Points',     icon: 'diamond', tier: 'silver' },
  { key: 'points_1000',          label: '1,000 Reputation Points',   icon: 'emoji_events', tier: 'gold' },
  { key: 'points_5000',          label: '5,000 Reputation Points',   icon: 'workspace_premium', tier: 'platinum' },
  { key: 'conversations_5',      label: '5 Conversations',      icon: 'chat', tier: 'bronze' },
  { key: 'conversations_10',     label: '10 Conversations',     icon: 'handshake', tier: 'silver' },
  { key: 'conversations_25',     label: '25 Conversations',     icon: 'favorite', tier: 'gold' },
  { key: 'streak_7',             label: '7-Day Streak',         icon: 'local_fire_department', tier: 'bronze' },
  { key: 'streak_30',            label: '30-Day Streak',        icon: 'bolt', tier: 'gold' },
  { key: 'streak_90',            label: '90-Day Streak',        icon: 'military_tech', tier: 'platinum' },
];

export const TIER_STYLES = {
  bronze:   { bg: 'bg-amber-50',    border: 'border-amber-300',  text: 'text-amber-800',  color: '#92400e' },
  silver:   { bg: 'bg-gray-50',     border: 'border-gray-300',   text: 'text-gray-700',   color: '#374151' },
  gold:     { bg: 'bg-yellow-50',   border: 'border-yellow-400', text: 'text-yellow-800', color: '#854d0e' },
  platinum: { bg: 'bg-violet-50',   border: 'border-violet-300', text: 'text-violet-800', color: '#5b21b6' },
} as const;

export const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export function getBadgeByKey(key: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(b => b.key === key);
}
