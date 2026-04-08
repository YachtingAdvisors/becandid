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
    hint: 'Stringer teaches that unwanted behavior is never random. Trace the stream back to its source. Were you escaping, numbing, chasing, performing, punishing, controlling, fantasizing, or guarding?',
  },
  {
    id: 'longing',
    label: 'The Unmet Longing',
    question: 'What emotions were present? What did you actually need in that moment?',
    hint: 'Beneath every struggle is a legitimate longing — for presence, for experiencing life fully, for belonging, for compassion, for real connection, for trust.',
  },
  {
    id: 'roadmap',
    label: 'The Roadmap',
    question: 'What might this struggle be revealing about what you\'re climbing toward?',
    hint: 'Every coping pattern has a growth direction. Escaping → Presence. Numbing → Experiencing. Chasing → Building. What are you climbing into?',
  },
];

// Notification-friendly prompts — shorter, more personal,
// rotated through for daily/scheduled reminders
export const JOURNAL_NOTIFICATION_PROMPTS = [
  // Tributaries-flavored (what pattern were you sliding into?)
  "What's been weighing on you today? Were you escaping, numbing, or guarding?",
  "Before you scroll or check out tonight — were you sliding into numbing or escaping? What happened?",
  "Were you seen today? Really seen? Or were you performing for belonging?",
  "What conflict or tension are you carrying? Is it pulling you toward controlling or guarding?",
  "When did you feel most alone today? Were you fantasizing connection instead of seeking it?",
  // Longing-flavored (what growth are you reaching for?)
  "What did you actually need today? Presence? Belonging? Real connection?",
  "If you could ask for one thing right now — compassion, trust, belonging — what would it be?",
  "Where in your body are you holding something? Is it asking for experiencing instead of numbing?",
  "What would it look like to climb into compassion for yourself tonight?",
  "Name one need you tried to meet through escaping. What would building look like instead?",
  // Roadmap-flavored (what are you climbing toward?)
  "If today's struggle is a sign, is it pointing you toward presence or connection?",
  "What kind of life would make this pattern unnecessary? One built on belonging? Trusting? Building?",
  "What are you saying yes to that pulls you away from the person you're becoming?",
  "Imagine telling someone you trust about today. Would they see someone climbing toward compassion?",
  "What would it look like to wake up tomorrow already practicing surrendering or trusting?",
];

// Post-relapse prompts — more direct, acknowledging what just happened
export const RELAPSE_NOTIFICATION_PROMPTS = [
  "Something came up. Before the shame sets in — were you escaping, numbing, or chasing? Name it without judgment.",
  "This moment isn't a verdict. It's information. Were you sliding into an old pattern? What growth direction does it point to?",
  "Compassion before analysis. What were you feeling? What would the you who's climbing toward presence say right now?",
  "You don't have to figure it all out right now. Just write what's true. You're still someone climbing toward something better.",
  "What were you reaching for? Not the screen — the thing beneath it. Belonging? Connection? Rest? That longing is real.",
  "The behavior is a signal pointing to a legitimate need. Were you numbing when you needed experiencing? Escaping when you needed presence?",
  "Before you spiral into punishing — name one thing you needed today that you didn't get. Then name the growth direction it points to.",
  "Your partner was notified. That takes courage. They're your ally in climbing toward connection and trust. Now write for yourself.",
];

// Therapeutic journal prompts — deeper, category-based prompts
// for the PromptPicker component in the journal write flow
export const THERAPEUTIC_PROMPTS: Array<{ text: string; category: 'reflection' | 'letter' | 'imagination' | 'body' | 'relationship' }> = [
  // Reflection — with growth transformation verbs
  { text: "What would your younger self think of who you are today? What would they say about the person climbing toward presence and compassion?", category: 'reflection' },
  { text: "If shame had a voice, what would it say? Now write what compassion would say back. Which voice are you climbing toward?", category: 'reflection' },
  { text: "What's one belief about yourself that you've outgrown? What new belief are you building in its place?", category: 'reflection' },
  { text: "What are you avoiding right now? Are you escaping or numbing? Name it — then name what experiencing it fully would feel like.", category: 'reflection' },

  // Letter — reframed around growth
  { text: "Write a letter to the person you hurt most recently. What would someone climbing toward compassion and connecting say?", category: 'letter' },
  { text: "Write a letter from your future self — the version of you who has fully arrived in presence, belonging, and trust. What does that person want you to know?", category: 'letter' },
  { text: "Write a thank-you note to someone who modeled real connection for you — not performance, but genuine belonging.", category: 'letter' },

  // Imagination — climbing into the future
  { text: "Describe a single day in the life you're climbing toward. What does presence feel like at breakfast? What does belonging feel like at dinner?", category: 'imagination' },
  { text: "If you could tell one person your full story — the escaping, the numbing, the climbing — without judgment, who would it be?", category: 'imagination' },

  // Body — experiencing vs. numbing
  { text: "Where in your body do you feel tension right now? Instead of numbing it, try experiencing it. Describe what it feels like to stay.", category: 'body' },
  { text: "What does surrendering feel like in your body? Not giving up — letting go. When was the last time you truly rested without guilt?", category: 'body' },

  // Relationship — connecting and belonging
  { text: "What does your partner need to hear from you? Not performing — real connecting. What truth would deepen your belonging together?", category: 'relationship' },
  { text: "Name one way someone loved you well this week. Did you let it in, or were you guarding? What would trusting look like?", category: 'relationship' },
  { text: "What would trust look like fully rebuilt? Not controlling the outcome — surrendering to the process of reconnection.", category: 'relationship' },

  // Emotional affairs — fantasizing vs. connecting
  { text: "If your partner could see who you've been talking to, would they feel safe? Are you fantasizing connection or building it?", category: 'relationship' },
  { text: "What are you getting from this person that you're not getting at home? Is it real belonging — or are you performing for approval?", category: 'relationship' },

  // Procrastination — escaping vs. building
  { text: "What's the ONE thing you've been escaping from? Write it down. Now ask: what would building look like instead of avoiding?", category: 'reflection' },
  { text: "If procrastination is escaping disguised as rest, what are you actually running from? What would presence with that task feel like?", category: 'reflection' },

  // AI relationships — fantasizing vs. connecting
  { text: "What would you lose if you deleted the AI companion? What would you gain by climbing from fantasizing into real connecting?", category: 'imagination' },
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

// ─── Foundational Motivator ─────────────────────────────────
// Users choose what grounds their accountability journey.
// Quotes and prompts are tailored to their motivator.

export type FoundationalMotivator = 'spiritual' | 'psychological' | 'relational' | 'general';

export const MOTIVATOR_LABELS: Record<FoundationalMotivator, string> = {
  spiritual: 'Faith & Spirituality',
  psychological: 'Psychology & Self-Understanding',
  relational: 'Relationships & Connection',
  general: 'General Wisdom',
};

export const MOTIVATOR_DESCRIPTIONS: Record<FoundationalMotivator, string> = {
  spiritual: 'Faith-grounded reflections on grace, identity, and redemption to anchor your journey.',
  psychological: 'Clinical insights on shame, vulnerability, and healing rooted in research and self-understanding.',
  relational: 'Wisdom about trust, intimacy, and rebuilding connection with those you love.',
  general: 'A blend of all perspectives — whatever resonates with you.',
};

export interface MotivatorQuote {
  text: string;
  author: string;
  ref: string;
  motivator: FoundationalMotivator;
  image?: string;
}

export const SPIRITUAL_QUOTES: MotivatorQuote[] = [
  {
    text: 'To be loved but not known is comforting but superficial. To be known and not loved is our greatest fear. But to be fully known and truly loved is, well, a lot like being loved by God. It is what we need more than anything.',
    author: 'Tim Keller',
    ref: 'The Meaning of Marriage',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Timothy_Keller.jpg/200px-Timothy_Keller.jpg',
  },
  {
    text: 'The gospel is this: We are more sinful and flawed in ourselves than we ever dared believe, yet at the very same time we are more loved and accepted in Jesus Christ than we ever dared hope.',
    author: 'Tim Keller',
    ref: 'The Meaning of Marriage',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Timothy_Keller.jpg/200px-Timothy_Keller.jpg',
  },
  {
    text: 'Grace does not make us less honest about sin; it makes us more honest because we are no longer afraid of what honesty will cost us.',
    author: 'Tim Keller',
    ref: 'The Reason for God',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Timothy_Keller.jpg/200px-Timothy_Keller.jpg',
  },
  {
    text: 'To be yourself before God is to strip away every false identity, every mask you have put on, every self you have tried to construct.',
    author: 'Tim Keller',
    ref: 'Prayer',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Timothy_Keller.jpg/200px-Timothy_Keller.jpg',
  },
  {
    text: 'The Christian gospel is that I am so flawed that Jesus had to die for me, yet I am so loved and valued that Jesus was glad to die for me.',
    author: 'Tim Keller',
    ref: 'Timothy Keller Sermons',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Timothy_Keller.jpg/200px-Timothy_Keller.jpg',
  },
  {
    text: 'We are not the sum of our weaknesses and failures; we are the sum of the Father\'s love for us.',
    author: 'St. John Paul II',
    ref: 'World Youth Day 2002',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/ADAMELLO_-_PAPA_-_Giovanni_Paolo_II_-_panoramio_%28cropped%29.jpg/200px-ADAMELLO_-_PAPA_-_Giovanni_Paolo_II_-_panoramio_%28cropped%29.jpg',
  },
  {
    text: 'The place God calls you to is the place where your deep gladness and the world\'s deep hunger meet.',
    author: 'Frederick Buechner',
    ref: 'Wishful Thinking',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/BG-0269.jpg/200px-BG-0269.jpg',
  },
  {
    text: 'You are not what you have done. You are what God has given you. You are God\'s child. That is your identity.',
    author: 'Henri Nouwen',
    ref: 'Life of the Beloved',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/HenriNouwen.JPG/200px-HenriNouwen.JPG',
  },
  {
    text: 'The spiritual life does not remove us from the world but leads us deeper into it.',
    author: 'Henri Nouwen',
    ref: 'Making All Things New',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/HenriNouwen.JPG/200px-HenriNouwen.JPG',
  },
  {
    text: 'No one can be healed in isolation. Healing is found in community, in truth-telling, in the presence of others who know us fully.',
    author: 'Dietrich Bonhoeffer',
    ref: 'Life Together',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bundesarchiv_Bild_146-1987-074-16%2C_Dietrich_Bonhoeffer.jpg/200px-Bundesarchiv_Bild_146-1987-074-16%2C_Dietrich_Bonhoeffer.jpg',
  },
  {
    text: 'We can be sure that God will never give us more than we can handle. But He might give us more than we can handle alone.',
    author: 'C.S. Lewis',
    ref: 'Letters',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/CS_Lewis_photo_on_dust_jacket.jpg/200px-CS_Lewis_photo_on_dust_jacket.jpg',
  },
  {
    text: 'A live body is not one that never gets hurt, but one that can to some extent repair itself. In the same way a Christian is not a man who never goes wrong, but a man who is enabled to repent and pick himself up and begin over again after each stumble\u2014because the Christ-life is inside him, repairing him all the time, enabling him to repeat (in some degree) the kind of voluntary death which Christ Himself carried out.',
    author: 'C.S. Lewis',
    ref: 'Mere Christianity',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/CS_Lewis_photo_on_dust_jacket.jpg/200px-CS_Lewis_photo_on_dust_jacket.jpg',
  },
  {
    text: 'Integrity is doing the right thing, even when no one is watching. But accountability is inviting someone to watch.',
    author: 'Charles Swindoll',
    ref: 'The Grace Awakening',
    motivator: 'spiritual',
    image: 'https://images.gr-assets.com/authors/1281556736p5/5139.jpg',
  },
  {
    text: 'Freedom is an often paradoxical and unexpected path that is found through kindness and curiosity. What would it mean for you to bless instead of curse your body for experiencing what it felt? Will you cry out with agony for how your desire was misused instead of remaining silent in your shame? Honesty and kindness change the human heart. Contempt for arousal and silence in our shame lead to continual pursuit of unwanted sexual behavior.',
    author: 'Jay Stringer',
    ref: 'Unwanted',
    motivator: 'spiritual',
    image: 'https://images.gr-assets.com/authors/1760377897p5/17973424.jpg',
  },
  // ── Buddhist ────────────────────────────────────────────
  {
    text: 'Nothing can harm you as much as your own thoughts unguarded.',
    author: 'The Buddha',
    ref: 'Dhammapada',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg/200px-Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg',
  },
  {
    text: 'You yourself must strive. The Buddhas only point the way.',
    author: 'The Buddha',
    ref: 'Dhammapada 276',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg/200px-Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg',
  },
  // ── Jewish tradition (via modern voices) ────────────────
  {
    text: 'The human soul is a candle of God. When we hide parts of ourselves in the dark, we are dimming the very light we were created to carry.',
    author: 'Rabbi Jonathan Sacks',
    ref: 'To Heal a Fractured World',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Rabbi_Jonathan_Sacks_zt%22l.jpg/200px-Rabbi_Jonathan_Sacks_zt%22l.jpg',
  },
  // ── Islamic tradition (via modern voices) ───────────────
  {
    text: 'The wound is the place where the Light enters you. Do not turn away from your brokenness — it is the door.',
    author: 'Omid Safi',
    ref: 'Radical Love',
    motivator: 'spiritual',
  },
  // ── Hindu tradition (via modern voices) ─────────────────
  {
    text: 'When you let go of who you think you should be, you make room to discover who you actually are. That discovery is the beginning of all real change.',
    author: 'Eknath Easwaran',
    ref: 'Conquest of Mind',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Eknath_Easwaran_courtesy_of_the_Blue_Mountain_Center_of_Meditation.jpg/200px-Eknath_Easwaran_courtesy_of_the_Blue_Mountain_Center_of_Meditation.jpg',
  },
  // ── Sikh tradition (via modern voices) ──────────────────
  {
    text: 'True courage is not the absence of fear but the willingness to walk through it honestly, with your community beside you.',
    author: 'Valarie Kaur',
    ref: 'See No Stranger',
    motivator: 'spiritual',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Valarie_Kaur%2C_2016_%28cropped%29.jpg/200px-Valarie_Kaur%2C_2016_%28cropped%29.jpg',
  },
];

export const PSYCHOLOGICAL_QUOTES: MotivatorQuote[] = [
  {
    text: 'Vulnerability is not winning or losing; it\'s having the courage to show up and be seen when we have no control over the outcome.',
    author: 'Brené Brown',
    ref: 'Rising Strong',
    motivator: 'psychological',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg/200px-Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg',
  },
  {
    text: 'Shame derives its power from being unspeakable. The moment we speak shame, it begins to wither.',
    author: 'Brené Brown',
    ref: 'Daring Greatly',
    motivator: 'psychological',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg/200px-Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg',
  },
  {
    text: 'Between stimulus and response there is a space. In that space is our power to choose our response.',
    author: 'Viktor Frankl',
    ref: "Man's Search for Meaning",
    motivator: 'psychological',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Viktor_Frankl2.jpg/200px-Viktor_Frankl2.jpg',
  },
  {
    text: 'The curious paradox is that when I accept myself just as I am, then I can change.',
    author: 'Carl Rogers',
    ref: 'On Becoming a Person',
    motivator: 'psychological',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Carl_Ransom_Rogers.jpg/200px-Carl_Ransom_Rogers.jpg',
  },
  {
    text: 'What we resist persists. What we look at and name begins to lose its grip on us.',
    author: 'Gabor Maté',
    ref: 'In the Realm of Hungry Ghosts',
    motivator: 'psychological',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gabor_Mat%C3%A9_-_01_%28cropped%29.jpeg/200px-Gabor_Mat%C3%A9_-_01_%28cropped%29.jpeg',
  },
  {
    text: 'Healing doesn\'t mean the damage never existed. It means the damage no longer controls our lives.',
    author: 'Akshay Dubey',
    ref: 'Attributed',
    motivator: 'psychological',
  },
];

export const RELATIONAL_QUOTES: MotivatorQuote[] = [
  {
    text: 'Trust is built in very small moments. It is not a grand gesture — it is turning toward instead of turning away.',
    author: 'John Gottman',
    ref: 'The Science of Trust',
    motivator: 'relational',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Dr._John_Gottman_123_%28cropped%29.jpg/200px-Dr._John_Gottman_123_%28cropped%29.jpg',
  },
  {
    text: 'The quality of your life ultimately depends on the quality of your relationships.',
    author: 'Esther Perel',
    ref: 'Mating in Captivity',
    motivator: 'relational',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Esther_Perel_2017.jpg/200px-Esther_Perel_2017.jpg',
  },
  {
    text: 'In every relationship, the only person you can truly change is yourself. But that change can transform everything.',
    author: 'Harriet Lerner',
    ref: 'The Dance of Anger',
    motivator: 'relational',
    image: 'https://images.gr-assets.com/authors/1337262358p5/84497.jpg',
  },
  {
    text: 'Are you there for me? Can I reach you? Will you respond when I need you? These are the fundamental questions of attachment.',
    author: 'Sue Johnson',
    ref: 'Hold Me Tight',
    motivator: 'relational',
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Sue_Johnson.png',
  },
  {
    text: 'Connection is the energy that is created between people when they feel seen, heard, and valued.',
    author: 'Brené Brown',
    ref: 'The Gifts of Imperfection',
    motivator: 'relational',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg/200px-Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg',
  },
];

export const GENERAL_QUOTES: MotivatorQuote[] = [
  {
    text: "Anything that's human is mentionable, and anything that is mentionable can be more manageable. When we can talk about our feelings, they become less overwhelming, less upsetting, and less scary. The people we trust with that important talk can help us know that we are not alone.",
    author: 'Fred Rogers',
    ref: "The World According to Mister Rogers",
    motivator: 'general',
    image: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/authors/1208803867i/32106._UX200_CR0,1,200,200_.jpg',
  },
  {
    text: 'The curious paradox is that when I accept myself just as I am, then I can change.',
    author: 'Carl Rogers',
    ref: 'On Becoming a Person',
    motivator: 'general',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Carl_Ransom_Rogers.jpg/200px-Carl_Ransom_Rogers.jpg',
  },
  {
    text: 'Between stimulus and response there is a space. In that space is our freedom and power to choose our response.',
    author: 'Viktor Frankl',
    ref: "Man's Search for Meaning",
    motivator: 'general',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Viktor_Frankl2.jpg/200px-Viktor_Frankl2.jpg',
  },
  {
    text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    author: 'Ralph Waldo Emerson',
    ref: 'Attributed',
    motivator: 'general',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ralph_Waldo_Emerson_by_Josiah_Johnson_Hawes_1857.jpg/200px-Ralph_Waldo_Emerson_by_Josiah_Johnson_Hawes_1857.jpg',
  },
  {
    text: 'The only journey is the one within.',
    author: 'Rainer Maria Rilke',
    ref: 'Letters',
    motivator: 'general',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Rainer_Maria_Rilke_1900.jpg/200px-Rainer_Maria_Rilke_1900.jpg',
  },
  {
    text: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: 'Dan Millman',
    ref: 'Way of the Peaceful Warrior',
    motivator: 'general',
    image: 'https://images.gr-assets.com/authors/1327194022p5/1539.jpg',
  },
];

// ─── Quote Selector ─────────────────────────────────────────
// Returns quotes matching the user's motivator, falling back to
// Stringer quotes (which are always included).
// The Mr. Rogers quote is ALWAYS first in every pool.

export function getQuotesForMotivator(motivator: FoundationalMotivator | null | undefined): MotivatorQuote[] {
  // Stringer quotes are always the base (convert to MotivatorQuote format)
  const stringerConverted: MotivatorQuote[] = STRINGER_QUOTES.map(q => ({
    text: q.text,
    author: 'Jay Stringer',
    ref: q.ref,
    motivator: 'psychological' as FoundationalMotivator,
  }));

  // Mr. Rogers is always first, then motivator-specific quotes follow

  if (!motivator || motivator === 'general') {
    return [MR_ROGERS_QUOTE, ...stringerConverted, ...GENERAL_QUOTES.filter(q => q.text !== MR_ROGERS_QUOTE.text), ...SPIRITUAL_QUOTES.slice(0, 4), ...PSYCHOLOGICAL_QUOTES.slice(0, 3), ...RELATIONAL_QUOTES.slice(0, 3)];
  }

  switch (motivator) {
    case 'spiritual':
      return [MR_ROGERS_QUOTE, ...SPIRITUAL_QUOTES, ...stringerConverted];
    case 'psychological':
      return [MR_ROGERS_QUOTE, ...PSYCHOLOGICAL_QUOTES, ...stringerConverted];
    case 'relational':
      return [MR_ROGERS_QUOTE, ...RELATIONAL_QUOTES, ...stringerConverted];
    default:
      return [MR_ROGERS_QUOTE, ...stringerConverted];
  }
}

export function getRandomQuote(motivator: FoundationalMotivator | null | undefined): MotivatorQuote {
  const quotes = getQuotesForMotivator(motivator);
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ─── All Quotes ─────────────────────────────────────────────
// Returns every quote from every array, each tagged with its motivator.

export function getAllQuotes(): MotivatorQuote[] {
  const stringerConverted: MotivatorQuote[] = STRINGER_QUOTES.map(q => ({
    text: q.text,
    author: 'Jay Stringer',
    ref: q.ref,
    motivator: 'psychological' as FoundationalMotivator,
  }));
  return [
    MR_ROGERS_QUOTE,
    ...stringerConverted,
    ...SPIRITUAL_QUOTES,
    ...PSYCHOLOGICAL_QUOTES,
    ...RELATIONAL_QUOTES,
    ...GENERAL_QUOTES.filter(q => q.text !== MR_ROGERS_QUOTE.text),
  ];
}

// ─── Quote of the Day ───────────────────────────────────────
// Deterministically picks a quote based on the current date so
// every user on the same motivator sees the same quote that day.

export function getQuoteOfTheDay(motivator?: FoundationalMotivator | null): MotivatorQuote {
  const quotes = motivator ? getQuotesForMotivator(motivator) : getAllQuotes();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return quotes[Math.abs(hash) % quotes.length];
}

// The Mr. Rogers quote specifically, used as default for new users
export const MR_ROGERS_QUOTE: MotivatorQuote = GENERAL_QUOTES[0];

// ─── Family Systems Types ───────────────────────────────────
// Based on Jay Stringer's six family-of-origin dynamics from
// *Unwanted*, generalized across all rival categories.

export type FamilyDynamic =
  | 'rigidity'
  | 'enmeshment'
  | 'triangulation'
  | 'dismissiveness'
  | 'abdication'
  | 'incongruence';

export type ParentingStyle =
  | 'authoritarian'
  | 'enmeshed'
  | 'uninvolved'
  | 'permissive'
  | 'conflict_driven'
  | 'performative';

export type FamilySystemsNoteType =
  | 'observation'
  | 'family_history'
  | 'attachment_pattern'
  | 'treatment_note'
  | 'dynamic_assessment';

export interface FamilySystemsNote {
  id: string;
  user_id: string;
  therapist_id: string;
  connection_id: string;
  dynamic: FamilyDynamic | null;
  confirmed: boolean | null;
  confidence_override: number | null;
  parenting_style: ParentingStyle | null;
  note: string;
  note_type: FamilySystemsNoteType;
  created_at: string;
  updated_at: string;
}

export interface DynamicScore {
  dynamic: FamilyDynamic;
  label: string;
  description: string;
  confidence: number;
  signals: string[];
  parenting_style: ParentingStyle;
  parenting_label: string;
}

export interface FamilySystemsAnalysis {
  user_id: string;
  analyzed_at: string;
  rivals: string[];
  dynamics: DynamicScore[];
  primary_dynamic: FamilyDynamic | null;
  primary_parenting_style: ParentingStyle | null;
  data_quality: 'insufficient' | 'low' | 'moderate' | 'strong';
  journal_count: number;
  event_count: number;
  summary: string;
}
