// ============================================================
// packages/shared/types/stringer.ts
// ============================================================

export interface StringerJournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  freewrite: string | null;
  tributaries: string | null;
  longing: string | null;
  roadmap: string | null;
  alert_id: string | null;
  trigger_type: 'relapse' | 'reminder' | 'manual';
  mood: 1 | 2 | 3 | 4 | 5 | null;
  tags: string[];
  prompt_shown: string | null;
}

export interface JournalPreferences {
  user_id: string;
  reminder_enabled: boolean;
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly';
  preferred_hour: number;    // 0-23
  timezone: string;
  after_relapse: boolean;
  relapse_delay_min: number; // minutes to wait before prompting
  last_reminder_at: string | null;
  last_relapse_prompt: string | null;
}

export interface StringerPrompt {
  id: 'tributaries' | 'longing' | 'roadmap';
  label: string;
  question: string;
  hint: string;
}

export const STRINGER_PROMPTS: StringerPrompt[] = [
  {
    id: 'tributaries',
    label: 'The Tributaries',
    question: 'What was happening in your life — emotionally, relationally, physically — in the hours or days before this moment?',
    hint: 'Stringer teaches that unwanted behavior is never random. Trace the stream back to its source.',
  },
  {
    id: 'longing',
    label: 'The Unmet Longing',
    question: 'What emotions were present? What did you actually need in that moment?',
    hint: 'Beneath every struggle is a legitimate longing — for belonging, for rest, for agency, for tenderness.',
  },
  {
    id: 'roadmap',
    label: 'The Roadmap',
    question: 'What might this struggle be revealing about the life you actually want to live?',
    hint: 'Your struggle is a sign pointing to where your pain is.',
  },
];

// Notification-friendly prompts — shorter, more personal,
// rotated through for daily/scheduled reminders
export const JOURNAL_NOTIFICATION_PROMPTS = [
  // Tributaries-flavored
  "What's been weighing on you today? Trace it back.",
  "Before you scroll or check out tonight — what happened today that's unprocessed?",
  "Were you seen today? Really seen? Write about it.",
  "What conflict or tension are you carrying right now?",
  "When did you feel most alone today?",
  // Longing-flavored
  "What did you actually need today that you didn't get?",
  "If you could ask for one thing right now without judgment, what would it be?",
  "Where in your body are you holding something? What does it want?",
  "What would tenderness look like for you tonight?",
  "Name one legitimate need you tried to meet in the wrong place today.",
  // Roadmap-flavored
  "If today's struggle is a sign, what is it pointing to?",
  "What kind of life would make this pattern unnecessary?",
  "What are you saying yes to that you actually want to say no to?",
  "Imagine telling someone you trust about today. What would you want them to know?",
  "What would freedom look like tomorrow morning?",
];

// Post-relapse prompts — more direct, acknowledging what just happened
export const RELAPSE_NOTIFICATION_PROMPTS = [
  "Something came up. Before the shame sets in — what were you feeling 30 minutes ago?",
  "This moment isn't a verdict. It's information. What is it telling you?",
  "Stringer says freedom is found through kindness and curiosity. Start there. What happened?",
  "You don't have to figure it all out right now. Just write what's true.",
  "What were you reaching for? Not the screen — the thing beneath it.",
  "The behavior is the signal, not the problem. What's the signal saying?",
  "Before you spiral — name one thing you needed today that you didn't get.",
  "Your partner was notified. That takes courage. Now write for yourself.",
];

export const STRINGER_QUOTES = [
  { text: 'Freedom is found through kindness and curiosity.', ref: 'p. 68' },
  { text: 'We are healed to the degree we turn to face and name what is killing us.', ref: 'p. 146' },
  { text: 'Honesty and kindness change the human heart.', ref: 'Unwanted' },
  { text: 'Healing is not about simply saying no; it is about saying yes to the good, the true, and the beautiful.', ref: 'p. 151' },
  { text: 'Your struggles are the beginning of your story, not the end.', ref: 'Jay Stringer' },
  { text: 'Our belovedness will never change according to our wanderings. But our belovedness is intended to change our wanderings.', ref: 'Unwanted' },
] as const;

export const JOURNAL_TAGS = [
  'late-night', 'stress', 'loneliness', 'conflict', 'exhaustion',
  'boredom', 'rejection', 'shame', 'anger', 'anxiety',
  'travel', 'celebration', 'weekend', 'morning', 'work',
] as const;
