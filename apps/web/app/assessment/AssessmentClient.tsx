'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import MaterialIcon from '@/components/ui/MaterialIcon';

/* ─── Rival definitions ─────────────────────────────────── */
type RivalId =
  | 'pornography' | 'sexting' | 'social_media' | 'binge_watching'
  | 'impulse_shopping' | 'doomscrolling' | 'alcohol_drugs' | 'vaping_tobacco'
  | 'gambling' | 'sports_betting' | 'day_trading' | 'dating_apps'
  | 'emotional_affairs' | 'gaming' | 'rage_content' | 'gossip_drama'
  | 'isolation' | 'ai_relationships' | 'overworking' | 'sleep_avoidance'
  | 'self_harm' | 'procrastination' | 'eating_disorder' | 'body_checking';

const RIVAL_META: Record<RivalId, { label: string; icon: string; color: string; desc: string }> = {
  pornography:      { label: 'Pornography', icon: 'visibility_off', color: 'bg-red-500', desc: 'Compulsive use of sexual imagery as a substitute for intimacy, connection, or emotional regulation.' },
  sexting:          { label: 'Sexting', icon: 'chat_bubble', color: 'bg-pink-500', desc: 'Seeking validation or excitement through sexual messaging, often driven by loneliness or boredom.' },
  social_media:     { label: 'Social Media', icon: 'phone_iphone', color: 'bg-blue-500', desc: 'Reflexive scrolling for dopamine hits, comparison loops, or avoiding present-moment discomfort.' },
  binge_watching:   { label: 'Binge Watching', icon: 'tv', color: 'bg-purple-500', desc: 'Using passive consumption to numb, escape, or avoid responsibilities and difficult emotions.' },
  impulse_shopping: { label: 'Impulse Shopping', icon: 'shopping_cart', color: 'bg-amber-500', desc: 'Purchasing for the rush rather than the need — often masking anxiety, inadequacy, or emptiness.' },
  doomscrolling:    { label: 'Doomscrolling', icon: 'trending_down', color: 'bg-orange-500', desc: 'Compulsively consuming negative news, feeding anxiety while creating an illusion of control.' },
  alcohol_drugs:    { label: 'Alcohol & Drugs', icon: 'local_bar', color: 'bg-rose-600', desc: 'Using substances to regulate emotions, escape pain, or cope with stress and social pressure.' },
  vaping_tobacco:   { label: 'Vaping & Tobacco', icon: 'smoking_rooms', color: 'bg-gray-500', desc: 'Habitual nicotine use as a stress response, often tied to anxiety, boredom, or social cues.' },
  gambling:         { label: 'Gambling', icon: 'casino', color: 'bg-green-600', desc: 'Chasing the high of risk and reward, often driven by financial stress or a need for excitement.' },
  sports_betting:   { label: 'Sports Betting', icon: 'sports_soccer', color: 'bg-green-500', desc: 'Turning sport fandom into compulsive wagering, fueled by the illusion of skill and control.' },
  day_trading:      { label: 'Day Trading', icon: 'candlestick_chart', color: 'bg-emerald-500', desc: 'Obsessive market watching disguised as productivity, driven by greed, FOMO, or proving worth.' },
  dating_apps:      { label: 'Dating Apps', icon: 'favorite', color: 'bg-pink-400', desc: 'Endless swiping for validation or novelty, substituting real vulnerability with curated personas.' },
  emotional_affairs:{ label: 'Emotional Affairs', icon: 'heart_broken', color: 'bg-rose-400', desc: 'Seeking emotional intimacy outside your relationship to fill unmet needs without the risk of honesty.' },
  gaming:           { label: 'Excessive Gaming', icon: 'sports_esports', color: 'bg-indigo-500', desc: 'Using gaming worlds to escape real-world stress, loneliness, or a lack of purpose and achievement.' },
  rage_content:     { label: 'Rage & Outrage Content', icon: 'whatshot', color: 'bg-red-600', desc: 'Consuming content that triggers anger or moral outrage — it feels righteous but fuels dysregulation.' },
  gossip_drama:     { label: 'Gossip & Drama', icon: 'record_voice_over', color: 'bg-fuchsia-500', desc: 'Engaging in others\' conflicts for a sense of belonging, superiority, or distraction from your own life.' },
  isolation:        { label: 'Isolation & Withdrawal', icon: 'person_off', color: 'bg-slate-500', desc: 'Pulling away from people and responsibilities as a protective response to shame, overwhelm, or fear.' },
  ai_relationships: { label: 'AI Relationships', icon: 'smart_toy', color: 'bg-cyan-500', desc: 'Forming emotional bonds with AI chatbots as a safe substitute for the vulnerability real relationships require.' },
  overworking:      { label: 'Overworking', icon: 'work', color: 'bg-yellow-600', desc: 'Using productivity as armor — staying busy to avoid the stillness where difficult feelings surface.' },
  sleep_avoidance:  { label: 'Sleep Avoidance', icon: 'bedtime_off', color: 'bg-indigo-400', desc: 'Delaying sleep to reclaim personal time, often because the day felt unfulfilling or overly controlled.' },
  self_harm:        { label: 'Self-Harm Risk', icon: 'emergency', color: 'bg-red-700', desc: 'Physical self-harm as a way to externalize inner pain, regain a sense of control, or feel something.' },
  procrastination:  { label: 'Procrastination', icon: 'hourglass_empty', color: 'bg-amber-400', desc: 'Avoiding tasks not out of laziness but fear — of failure, judgment, or not being good enough.' },
  eating_disorder:  { label: 'Eating Disorder', icon: 'restaurant', color: 'bg-lime-600', desc: 'Using food restriction or overconsumption to manage anxiety, control, body image, or emotional pain.' },
  body_checking:    { label: 'Body Checking', icon: 'person_search', color: 'bg-teal-500', desc: 'Compulsive self-monitoring of appearance, weight, or physique driven by shame or inadequacy.' },
};

/* ─── Word-to-rival weighted mapping ────────────────────── */
interface Word {
  text: string;
  weights: Partial<Record<RivalId, number>>;
}

// Each step has a theme and a set of words
interface Step {
  title: string;
  subtitle: string;
  icon: string;
  words: Word[];
}

const STEPS: Step[] = [
  {
    title: 'Emotional Landscape',
    subtitle: 'Select every word that resonates with how you often feel.',
    icon: 'psychology',
    words: [
      { text: 'Lonely', weights: { pornography: 3, dating_apps: 2, emotional_affairs: 2, isolation: 3, ai_relationships: 2 } },
      { text: 'Bored', weights: { social_media: 3, binge_watching: 3, gaming: 2, doomscrolling: 2, impulse_shopping: 2 } },
      { text: 'Anxious', weights: { doomscrolling: 3, social_media: 2, procrastination: 2, sleep_avoidance: 2, self_harm: 1 } },
      { text: 'Restless', weights: { sleep_avoidance: 3, social_media: 2, gambling: 2, overworking: 2, procrastination: 1 } },
      { text: 'Numb', weights: { pornography: 2, alcohol_drugs: 3, binge_watching: 2, self_harm: 2, gaming: 1 } },
      { text: 'Ashamed', weights: { pornography: 3, sexting: 2, gambling: 2, impulse_shopping: 1, self_harm: 2 } },
      { text: 'Overwhelmed', weights: { procrastination: 3, doomscrolling: 2, isolation: 2, self_harm: 2, sleep_avoidance: 2 } },
      { text: 'Envious', weights: { social_media: 3, impulse_shopping: 2, body_checking: 2, gossip_drama: 1 } },
      { text: 'Angry', weights: { rage_content: 3, alcohol_drugs: 2, gaming: 2, gossip_drama: 1 } },
      { text: 'Driven', weights: { overworking: 3, day_trading: 2, sports_betting: 1 } },
      { text: 'Empty', weights: { pornography: 2, ai_relationships: 2, alcohol_drugs: 2, binge_watching: 2, isolation: 2, self_harm: 2 } },
      { text: 'Insecure', weights: { social_media: 3, body_checking: 3, dating_apps: 2, eating_disorder: 2, gossip_drama: 1 } },
      { text: 'Guilty', weights: { pornography: 2, sexting: 2, emotional_affairs: 2, gambling: 2, impulse_shopping: 2 } },
      { text: 'Trapped', weights: { overworking: 2, isolation: 2, self_harm: 3, sleep_avoidance: 2 } },
      { text: 'Curious', weights: { pornography: 2, dating_apps: 2, day_trading: 2, ai_relationships: 2 } },
      { text: 'Competitive', weights: { gaming: 3, sports_betting: 3, day_trading: 2, overworking: 2 } },
    ],
  },
  {
    title: 'Behavioral Patterns',
    subtitle: 'Select habits or tendencies you recognize in yourself.',
    icon: 'repeat',
    words: [
      { text: 'Staying up too late', weights: { sleep_avoidance: 3, binge_watching: 2, social_media: 2, gaming: 2, pornography: 2 } },
      { text: 'Checking my phone first thing', weights: { social_media: 3, doomscrolling: 2, dating_apps: 1 } },
      { text: 'Losing track of time online', weights: { social_media: 3, binge_watching: 3, gaming: 3, doomscrolling: 2 } },
      { text: 'Spending money I shouldn\'t', weights: { impulse_shopping: 3, gambling: 3, sports_betting: 2, day_trading: 2 } },
      { text: 'Keeping secrets from people close to me', weights: { pornography: 3, sexting: 3, emotional_affairs: 3, gambling: 2, alcohol_drugs: 2 } },
      { text: 'Avoiding responsibilities', weights: { procrastination: 3, gaming: 2, binge_watching: 2, social_media: 1 } },
      { text: 'Working through meals and weekends', weights: { overworking: 3, sleep_avoidance: 1 } },
      { text: 'Comparing myself to others', weights: { social_media: 3, body_checking: 3, eating_disorder: 2, impulse_shopping: 1 } },
      { text: 'Canceling plans to be alone', weights: { isolation: 3, gaming: 2, binge_watching: 1, social_media: 1 } },
      { text: 'Using substances to relax', weights: { alcohol_drugs: 3, vaping_tobacco: 3 } },
      { text: 'Refreshing feeds compulsively', weights: { social_media: 3, doomscrolling: 3, sports_betting: 2, day_trading: 2 } },
      { text: 'Making impulsive decisions', weights: { impulse_shopping: 3, gambling: 3, dating_apps: 2, day_trading: 2, sexting: 1 } },
      { text: 'Chasing the next win', weights: { gambling: 3, sports_betting: 3, day_trading: 3, gaming: 2 } },
      { text: 'Seeking validation from strangers', weights: { social_media: 3, dating_apps: 3, sexting: 2, ai_relationships: 1 } },
      { text: 'Talking to someone I shouldn\'t be', weights: { emotional_affairs: 3, sexting: 3, dating_apps: 2, ai_relationships: 2 } },
      { text: 'Watching "just one more" episode', weights: { binge_watching: 3, procrastination: 2, sleep_avoidance: 2 } },
    ],
  },
  {
    title: 'Trigger Situations',
    subtitle: 'Select situations that tend to pull you off track.',
    icon: 'bolt',
    words: [
      { text: 'After an argument', weights: { alcohol_drugs: 2, pornography: 2, rage_content: 2, emotional_affairs: 2, isolation: 2, self_harm: 2 } },
      { text: 'Late at night alone', weights: { pornography: 3, sleep_avoidance: 3, binge_watching: 2, dating_apps: 2, gambling: 1 } },
      { text: 'When I feel left out', weights: { social_media: 3, gossip_drama: 2, isolation: 2, impulse_shopping: 2, ai_relationships: 1 } },
      { text: 'During stressful deadlines', weights: { procrastination: 3, overworking: 3, vaping_tobacco: 2, social_media: 1 } },
      { text: 'When I\'m home alone', weights: { pornography: 3, binge_watching: 2, gaming: 2, alcohol_drugs: 2, isolation: 1 } },
      { text: 'After a bad day at work', weights: { alcohol_drugs: 3, impulse_shopping: 2, binge_watching: 2, gambling: 1, vaping_tobacco: 2 } },
      { text: 'Scrolling in bed', weights: { social_media: 3, doomscrolling: 3, sleep_avoidance: 3, pornography: 1 } },
      { text: 'When my self-esteem is low', weights: { body_checking: 3, eating_disorder: 2, social_media: 2, dating_apps: 2, self_harm: 2 } },
      { text: 'When boredom hits', weights: { gaming: 3, social_media: 2, binge_watching: 2, impulse_shopping: 2, gambling: 2 } },
      { text: 'During social gatherings', weights: { alcohol_drugs: 3, vaping_tobacco: 2, social_media: 1 } },
      { text: 'When I need to escape reality', weights: { gaming: 3, binge_watching: 3, alcohol_drugs: 2, pornography: 2, ai_relationships: 2 } },
      { text: 'After seeing upsetting news', weights: { doomscrolling: 3, rage_content: 3, alcohol_drugs: 1, gossip_drama: 1 } },
    ],
  },
  {
    title: 'Inner Dialogue',
    subtitle: 'Select thoughts you catch yourself thinking.',
    icon: 'forum',
    words: [
      { text: '"Just this once won\'t hurt"', weights: { pornography: 2, gambling: 3, impulse_shopping: 2, alcohol_drugs: 2, sexting: 1 } },
      { text: '"I deserve this after what I\'ve been through"', weights: { impulse_shopping: 3, binge_watching: 2, alcohol_drugs: 2, gambling: 1 } },
      { text: '"Nobody really understands me"', weights: { isolation: 3, ai_relationships: 3, emotional_affairs: 2, self_harm: 1 } },
      { text: '"I need to be more productive"', weights: { overworking: 3, procrastination: 2, sleep_avoidance: 1 } },
      { text: '"What are they saying about me?"', weights: { gossip_drama: 3, social_media: 3 } },
      { text: '"I\'ll stop after this one"', weights: { binge_watching: 3, gaming: 2, social_media: 2, gambling: 2, doomscrolling: 2 } },
      { text: '"I can win it back"', weights: { gambling: 3, sports_betting: 3, day_trading: 3 } },
      { text: '"If I looked different, things would be better"', weights: { body_checking: 3, eating_disorder: 3, social_media: 2, dating_apps: 1 } },
      { text: '"Everyone else can handle it, why can\'t I?"', weights: { alcohol_drugs: 2, self_harm: 2, social_media: 2, overworking: 1 } },
      { text: '"I just need something to take the edge off"', weights: { alcohol_drugs: 3, vaping_tobacco: 3, pornography: 2, gambling: 1 } },
      { text: '"I\'ll deal with it tomorrow"', weights: { procrastination: 3, sleep_avoidance: 2, binge_watching: 1 } },
      { text: '"They don\'t appreciate me enough"', weights: { emotional_affairs: 3, dating_apps: 2, overworking: 2, rage_content: 1 } },
    ],
  },
  {
    title: 'Coping & Avoidance Style',
    subtitle: 'Select behaviors you use when life gets hard.',
    icon: 'shield_person',
    words: [
      { text: 'I withdraw and isolate', weights: { isolation: 3, gaming: 2, binge_watching: 2, sleep_avoidance: 1 } },
      { text: 'I seek intensity or thrills', weights: { gambling: 3, sports_betting: 2, day_trading: 2, pornography: 2 } },
      { text: 'I numb out with screens', weights: { binge_watching: 3, social_media: 3, gaming: 2, doomscrolling: 1 } },
      { text: 'I control what I eat or how I look', weights: { eating_disorder: 3, body_checking: 3 } },
      { text: 'I overwork to feel valuable', weights: { overworking: 3, procrastination: 1 } },
      { text: 'I people-please to avoid conflict', weights: { emotional_affairs: 2, social_media: 2, gossip_drama: 1, overworking: 1 } },
      { text: 'I use substances to cope', weights: { alcohol_drugs: 3, vaping_tobacco: 3 } },
      { text: 'I seek out secret relationships', weights: { sexting: 3, emotional_affairs: 3, dating_apps: 2, ai_relationships: 2 } },
      { text: 'I buy things to feel better', weights: { impulse_shopping: 3, gambling: 1 } },
      { text: 'I doom-spiral into worst-case thinking', weights: { doomscrolling: 3, rage_content: 2, self_harm: 1 } },
      { text: 'I punish myself mentally or physically', weights: { self_harm: 3, overworking: 1, eating_disorder: 1 } },
      { text: 'I outsource my emotions to AI or parasocial figures', weights: { ai_relationships: 3, binge_watching: 2, gossip_drama: 1 } },
    ],
  },
];

const TOTAL_WORDS = STEPS.reduce((sum, s) => sum + s.words.length, 0);

/* ─── Coping/Personality type definitions ───────────────── */
type CopingTypeId = 'escapist' | 'numbing' | 'thrill_seeking' | 'approval_seeking' | 'self_punishing' | 'control_oriented' | 'fantasy_bonding' | 'hypervigilant';

interface CopingType {
  id: CopingTypeId;
  // "Sliding into" — the struggle
  slideVerb: string;
  slideIcon: string;
  slideColor: string;
  slideDesc: string;
  // "Climbing into" — the growth
  climbVerb: string;
  climbIcon: string;
  climbColor: string;
  climbDesc: string;
  climbPractice: string;
}

const COPING_TYPES: CopingType[] = [
  {
    id: 'escapist',
    slideVerb: 'Escaping',
    slideIcon: 'flight',
    slideColor: 'from-indigo-600 to-indigo-800',
    slideDesc: 'Mentally checking out through screens, stories, or alternate worlds. Reality feels heavy, so you seek exits.',
    climbVerb: 'Presence',
    climbIcon: 'self_improvement',
    climbColor: 'from-emerald-500 to-teal-600',
    climbDesc: 'Grounding yourself in the here and now. Engaging with reality — even when it\'s uncomfortable — because that\'s where growth lives.',
    climbPractice: 'Try a 2-minute body scan before reaching for a screen. Name 5 things you can see, 4 you can touch, 3 you can hear.',
  },
  {
    id: 'numbing',
    slideVerb: 'Numbing',
    slideIcon: 'blur_on',
    slideColor: 'from-slate-500 to-slate-700',
    slideDesc: 'Turning down the emotional volume — substances, scrolling, bingeing — anything to not feel the hard things.',
    climbVerb: 'Experiencing',
    climbIcon: 'wb_sunny',
    climbColor: 'from-amber-500 to-yellow-600',
    climbDesc: 'Allowing yourself to feel the full spectrum — joy, grief, boredom, anger — without running. Emotions are data, not danger.',
    climbPractice: 'When the urge to numb hits, set a 90-second timer. Feel the wave. It always passes. Journal what surfaced.',
  },
  {
    id: 'thrill_seeking',
    slideVerb: 'Chasing',
    slideIcon: 'local_fire_department',
    slideColor: 'from-orange-500 to-red-600',
    slideDesc: 'Pursuing intensity — risk, excitement, novelty. Calm feels uncomfortable, so you chase the next dopamine hit.',
    climbVerb: 'Building',
    climbIcon: 'construction',
    climbColor: 'from-cyan-500 to-blue-600',
    climbDesc: 'Channeling that energy into creation rather than consumption. Building something meaningful satisfies the same drive — without the crash.',
    climbPractice: 'Replace one thrill-seeking session with a creative challenge: write, build, cook, exercise. Notice how accomplishment feels different than adrenaline.',
  },
  {
    id: 'approval_seeking',
    slideVerb: 'Performing',
    slideIcon: 'thumb_up',
    slideColor: 'from-pink-500 to-rose-600',
    slideDesc: 'Seeking external validation — likes, attention, reassurance. Your worth feels contingent on others\' reactions.',
    climbVerb: 'Belonging',
    climbIcon: 'favorite',
    climbColor: 'from-rose-400 to-pink-500',
    climbDesc: 'Knowing you are enough without an audience. Real belonging doesn\'t require performance — it requires vulnerability.',
    climbPractice: 'Share something imperfect with someone safe. Not for likes — for connection. Notice how authenticity feels compared to applause.',
  },
  {
    id: 'self_punishing',
    slideVerb: 'Punishing',
    slideIcon: 'gavel',
    slideColor: 'from-red-700 to-red-900',
    slideDesc: 'Turning pain inward — harsh self-talk, overworking to exhaustion, physically punishing yourself. Shame runs the show.',
    climbVerb: 'Compassion',
    climbIcon: 'spa',
    climbColor: 'from-green-500 to-emerald-600',
    climbDesc: 'Treating yourself the way you\'d treat someone you love. Compassion isn\'t weakness — it\'s the foundation of lasting change.',
    climbPractice: 'When you catch the inner critic, ask: "Would I say this to a friend?" Rewrite the thought as if speaking to someone you care about.',
  },
  {
    id: 'control_oriented',
    slideVerb: 'Controlling',
    slideIcon: 'tune',
    slideColor: 'from-amber-600 to-orange-700',
    slideDesc: 'Tightening control over your body, schedule, diet, or environment. If you can control it, it can\'t hurt you.',
    climbVerb: 'Surrendering',
    climbIcon: 'water_drop',
    climbColor: 'from-sky-400 to-blue-500',
    climbDesc: 'Practicing the art of letting go. Surrendering isn\'t giving up — it\'s trusting that you can handle uncertainty.',
    climbPractice: 'Choose one thing today to leave unfinished or imperfect on purpose. Sit with the discomfort. That\'s your growth edge.',
  },
  {
    id: 'fantasy_bonding',
    slideVerb: 'Fantasizing',
    slideIcon: 'auto_awesome',
    slideColor: 'from-purple-600 to-violet-800',
    slideDesc: 'Building relationships with screens — AI companions, fictional characters, parasocial figures — instead of real people.',
    climbVerb: 'Connecting',
    climbIcon: 'handshake',
    climbColor: 'from-teal-500 to-emerald-500',
    climbDesc: 'Risking real intimacy with real people. Simulated connection can\'t reject you, but it also can\'t truly see you.',
    climbPractice: 'Replace one screen interaction with a real one. Text a friend. Call someone. Show up somewhere. Real connection is messy but alive.',
  },
  {
    id: 'hypervigilant',
    slideVerb: 'Guarding',
    slideIcon: 'visibility',
    slideColor: 'from-cyan-600 to-teal-800',
    slideDesc: 'Staying constantly alert — scanning for threats, doom-reading, monitoring everything. Relaxing feels dangerous.',
    climbVerb: 'Trusting',
    climbIcon: 'shield_with_heart',
    climbColor: 'from-violet-500 to-purple-600',
    climbDesc: 'Learning that safety can exist without surveillance. Trusting yourself, trusting others, trusting the process.',
    climbPractice: 'Set a "news fast" for 24 hours. When the urge to check arises, take three deep breaths instead. You are safe right now.',
  },
];

// Map words → coping type scores
const COPING_WORD_MAP: Record<string, Partial<Record<CopingTypeId, number>>> = {
  // Emotional
  'Lonely': { fantasy_bonding: 2, approval_seeking: 1 },
  'Bored': { escapist: 3, thrill_seeking: 1 },
  'Anxious': { hypervigilant: 3, numbing: 1 },
  'Restless': { thrill_seeking: 2, escapist: 1 },
  'Numb': { numbing: 3 },
  'Ashamed': { self_punishing: 3, numbing: 1 },
  'Overwhelmed': { numbing: 2, escapist: 2, control_oriented: 1 },
  'Envious': { approval_seeking: 2, control_oriented: 1 },
  'Angry': { self_punishing: 1, thrill_seeking: 1 },
  'Driven': { control_oriented: 3 },
  'Empty': { numbing: 2, fantasy_bonding: 2, escapist: 1 },
  'Insecure': { approval_seeking: 3, control_oriented: 1 },
  'Guilty': { self_punishing: 2, numbing: 1 },
  'Trapped': { escapist: 3, self_punishing: 1 },
  'Curious': { thrill_seeking: 2 },
  'Competitive': { thrill_seeking: 2, control_oriented: 2 },
  // Behavioral
  'Staying up too late': { escapist: 2, numbing: 1 },
  'Checking my phone first thing': { hypervigilant: 2, approval_seeking: 1 },
  'Losing track of time online': { escapist: 3, numbing: 1 },
  "Spending money I shouldn't": { thrill_seeking: 2, numbing: 1 },
  'Keeping secrets from people close to me': { self_punishing: 1, fantasy_bonding: 1 },
  'Avoiding responsibilities': { escapist: 2, numbing: 1 },
  'Working through meals and weekends': { control_oriented: 3, self_punishing: 1 },
  'Comparing myself to others': { approval_seeking: 3, control_oriented: 1 },
  'Canceling plans to be alone': { escapist: 2, numbing: 1 },
  'Using substances to relax': { numbing: 3 },
  'Refreshing feeds compulsively': { hypervigilant: 3, approval_seeking: 1 },
  'Making impulsive decisions': { thrill_seeking: 3 },
  'Chasing the next win': { thrill_seeking: 3 },
  'Seeking validation from strangers': { approval_seeking: 3 },
  "Talking to someone I shouldn't be": { fantasy_bonding: 2, thrill_seeking: 1 },
  'Watching "just one more" episode': { escapist: 3, numbing: 1 },
  // Triggers
  'After an argument': { numbing: 1, self_punishing: 1 },
  'Late at night alone': { escapist: 2, fantasy_bonding: 1 },
  'When I feel left out': { approval_seeking: 2, fantasy_bonding: 1 },
  'During stressful deadlines': { control_oriented: 2, escapist: 1 },
  "When I'm home alone": { escapist: 2, numbing: 1, fantasy_bonding: 1 },
  'After a bad day at work': { numbing: 2, thrill_seeking: 1 },
  'Scrolling in bed': { escapist: 2, hypervigilant: 1 },
  'When my self-esteem is low': { approval_seeking: 2, self_punishing: 2, control_oriented: 1 },
  'When boredom hits': { thrill_seeking: 2, escapist: 2 },
  'During social gatherings': { numbing: 2, approval_seeking: 1 },
  'When I need to escape reality': { escapist: 3 },
  'After seeing upsetting news': { hypervigilant: 3, numbing: 1 },
  // Inner dialogue
  "\"Just this once won't hurt\"": { thrill_seeking: 2, numbing: 1 },
  "\"I deserve this after what I've been through\"": { numbing: 2, thrill_seeking: 1 },
  '"Nobody really understands me"': { fantasy_bonding: 3, escapist: 1 },
  '"I need to be more productive"': { control_oriented: 3, self_punishing: 1 },
  '"What are they saying about me?"': { hypervigilant: 3, approval_seeking: 2 },
  "\"I'll stop after this one\"": { escapist: 2, numbing: 1 },
  '"I can win it back"': { thrill_seeking: 3 },
  '"If I looked different, things would be better"': { control_oriented: 2, approval_seeking: 2, self_punishing: 1 },
  '"Everyone else can handle it, why can\'t I?"': { self_punishing: 3, approval_seeking: 1 },
  '"I just need something to take the edge off"': { numbing: 3 },
  "\"I'll deal with it tomorrow\"": { escapist: 2, numbing: 1 },
  '"They don\'t appreciate me enough"': { approval_seeking: 2, self_punishing: 1 },
  // Coping step
  'I withdraw and isolate': { escapist: 3, numbing: 1 },
  'I seek intensity or thrills': { thrill_seeking: 3 },
  'I numb out with screens': { numbing: 3, escapist: 1 },
  'I control what I eat or how I look': { control_oriented: 3 },
  'I overwork to feel valuable': { control_oriented: 2, self_punishing: 2 },
  'I people-please to avoid conflict': { approval_seeking: 3 },
  'I use substances to cope': { numbing: 3 },
  'I seek out secret relationships': { fantasy_bonding: 3, thrill_seeking: 1 },
  'I buy things to feel better': { numbing: 2, thrill_seeking: 1 },
  'I doom-spiral into worst-case thinking': { hypervigilant: 3, self_punishing: 1 },
  'I punish myself mentally or physically': { self_punishing: 3 },
  'I outsource my emotions to AI or parasocial figures': { fantasy_bonding: 3 },
};

function calculateCopingTypes(selected: Set<string>): { type: CopingType; pct: number }[] {
  const scores: Partial<Record<CopingTypeId, number>> = {};
  const maxPossible: Partial<Record<CopingTypeId, number>> = {};

  for (const [word, weights] of Object.entries(COPING_WORD_MAP)) {
    for (const [typeId, weight] of Object.entries(weights)) {
      const tid = typeId as CopingTypeId;
      maxPossible[tid] = (maxPossible[tid] ?? 0) + weight;
      if (selected.has(word)) {
        scores[tid] = (scores[tid] ?? 0) + weight;
      }
    }
  }

  return COPING_TYPES
    .map(type => ({
      type,
      pct: Math.round(((scores[type.id] ?? 0) / (maxPossible[type.id] ?? 1)) * 100),
    }))
    .filter(t => t.pct > 0)
    .sort((a, b) => b.pct - a.pct);
}

/* ─── Scoring ────────────────────────────────────────────── */
function calculateResults(selected: Set<string>): { id: RivalId; label: string; icon: string; color: string; pct: number }[] {
  const scores: Partial<Record<RivalId, number>> = {};
  const maxPossible: Partial<Record<RivalId, number>> = {};

  for (const step of STEPS) {
    for (const word of step.words) {
      for (const [rival, weight] of Object.entries(word.weights)) {
        const rid = rival as RivalId;
        maxPossible[rid] = (maxPossible[rid] ?? 0) + weight;
        if (selected.has(word.text)) {
          scores[rid] = (scores[rid] ?? 0) + weight;
        }
      }
    }
  }

  const results = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([id, score]) => {
      const rid = id as RivalId;
      const max = maxPossible[rid] ?? 1;
      const pct = Math.round((score / max) * 100);
      return { id: rid, ...RIVAL_META[rid], pct };
    })
    .sort((a, b) => b.pct - a.pct);

  return results;
}

/* ─── Rival Results List (top 7 + expandable) ────────────── */
function RivalResultsList({ results }: { results: { id: RivalId; label: string; icon: string; color: string; pct: number }[] }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<RivalId | null>(null);
  const visible = showAll ? results : results.slice(0, 7);
  const hiddenCount = results.length - 7;

  return (
    <div className="space-y-3">
      {visible.map((rival, idx) => {
        const meta = RIVAL_META[rival.id];
        const isExpanded = expandedId === rival.id;
        return (
          <div
            key={rival.id}
            onClick={() => setExpandedId(isExpanded ? null : rival.id)}
            className={`bg-white/[0.05] rounded-2xl ring-1 ring-white/10 p-4 transition-all duration-200 cursor-pointer hover:bg-white/[0.08] ${idx < 3 ? 'shadow-md' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-headline font-black text-sm ${
                idx === 0 ? 'bg-red-100 text-red-700' :
                idx === 1 ? 'bg-orange-100 text-orange-700' :
                idx === 2 ? 'bg-amber-100 text-amber-700' :
                'bg-white/10 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className={`w-10 h-10 rounded-xl ${rival.color} flex items-center justify-center shrink-0`}>
                <MaterialIcon name={rival.icon} filled className="text-white text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline font-bold text-sm text-white">{rival.label}</h3>
                  <span className={`font-headline font-bold text-sm ${
                    rival.pct >= 70 ? 'text-red-400' : rival.pct >= 45 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {rival.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      rival.pct >= 70 ? 'bg-red-500' : rival.pct >= 45 ? 'bg-amber-500' : 'bg-primary/60'
                    }`}
                    style={{ width: `${rival.pct}%` }}
                  />
                </div>
              </div>
              <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-slate-500 text-lg shrink-0" />
            </div>
            {isExpanded && meta?.desc && (
              <p className="mt-3 text-xs text-slate-400 leading-relaxed font-body pl-[4.5rem]">
                {meta.desc}
              </p>
            )}
          </div>
        );
      })}
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-sm font-label font-medium text-slate-400 hover:text-white rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          Show {hiddenCount} more rival{hiddenCount > 1 ? 's' : ''}
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-xs font-label text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Show less
        </button>
      )}
    </div>
  );
}

/* ─── Coping Transformation UI ────────────────────────────── */
function CopingProfile({ copingResults }: { copingResults: { type: CopingType; pct: number }[] }) {
  const [showGrowth, setShowGrowth] = useState(false);

  if (copingResults.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Header with toggle */}
      <div className="text-center space-y-3 pt-4">
        <h2 className="font-headline text-xl font-extrabold tracking-tight text-white">
          {showGrowth ? 'Your Growth Path' : 'Your Coping Patterns'}
        </h2>
        <p className="text-sm text-white-variant font-body max-w-md mx-auto">
          {showGrowth
            ? 'Every struggle has a healthier counterpart. Here\'s what you\'re climbing toward.'
            : 'When life gets hard, these are the patterns you tend to slide into.'}
        </p>

        {/* The toggle */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => setShowGrowth(!showGrowth)}
            className="relative group flex items-center gap-0 rounded-full p-1 bg-white/10 ring-1 ring-white/10/20 cursor-pointer transition-all duration-300 hover:ring-primary/30"
          >
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-all duration-500 ease-out ${
                showGrowth
                  ? 'left-[calc(50%+2px)] bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                  : 'left-1 bg-gradient-to-r from-slate-500 to-slate-600 shadow-lg shadow-slate-500/20'
              }`}
            />
            <span
              className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold transition-colors duration-300 ${
                !showGrowth ? 'text-white' : 'text-white-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">trending_down</span>
              Sliding Into
            </span>
            <span
              className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold transition-colors duration-300 ${
                showGrowth ? 'text-white' : 'text-white-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Climbing Into
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      {copingResults.slice(0, 4).map((item, idx) => {
        const t = item.type;
        const gradient = showGrowth ? t.climbColor : t.slideColor;
        const icon = showGrowth ? t.climbIcon : t.slideIcon;
        const verb = showGrowth ? t.climbVerb : t.slideVerb;
        const desc = showGrowth ? t.climbDesc : t.slideDesc;

        return (
          <div
            key={t.id}
            className={`relative overflow-hidden rounded-2xl ring-1 transition-all duration-500 ${
              showGrowth
                ? 'ring-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'
                : 'ring-white/10/10 bg-white/[0.05]'
            } ${idx === 0 ? 'shadow-lg' : 'shadow-sm'}`}
          >
            {/* Gradient accent bar */}
            <div className={`h-1 bg-gradient-to-r ${gradient} transition-all duration-500`} />

            <div className="p-5 space-y-3">
              {/* Header row */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md transition-all duration-500`}>
                  <MaterialIcon name={icon} filled className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-label font-bold uppercase tracking-wider ${
                      showGrowth ? 'text-emerald-600' : 'text-white-variant/60'
                    } transition-colors duration-500`}>
                      {showGrowth ? 'Climbing into' : 'Sliding into'}
                    </span>
                    {idx === 0 && (
                      <span className={`text-[9px] font-label font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        showGrowth ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      } transition-all duration-500`}>
                        {showGrowth ? 'Primary Growth' : 'Primary Pattern'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline font-extrabold text-lg text-white mt-0.5 tracking-tight">
                    {verb}
                  </h3>
                </div>
                <span className={`font-headline font-bold text-base tabular-nums ${
                  showGrowth ? 'text-emerald-600' : (item.pct >= 60 ? 'text-red-500' : 'text-white-variant')
                } transition-colors duration-500`}>
                  {item.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-white-variant font-body leading-relaxed">{desc}</p>

              {/* Growth practice (only in climb mode) */}
              {showGrowth && (
                <div className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 transition-all duration-500">
                  <MaterialIcon name="rocket_launch" filled className="text-emerald-500 text-base mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-label font-bold text-emerald-600 uppercase tracking-wider mb-1">Try This</p>
                    <p className="text-xs text-white font-body leading-relaxed">{t.climbPractice}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Remaining types — compact */}
      {copingResults.length > 4 && (
        <div className="grid grid-cols-2 gap-2.5">
          {copingResults.slice(4).map(item => {
            const t = item.type;
            const gradient = showGrowth ? t.climbColor : t.slideColor;
            const icon = showGrowth ? t.climbIcon : t.slideIcon;
            const verb = showGrowth ? t.climbVerb : t.slideVerb;
            return (
              <div
                key={t.id}
                className={`rounded-xl p-3.5 flex items-center gap-3 transition-all duration-500 ${
                  showGrowth
                    ? 'bg-emerald-500/5 ring-1 ring-emerald-500/10'
                    : 'bg-white/[0.05] ring-1 ring-white/10/10'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 transition-all duration-500`}>
                  <MaterialIcon name={icon} filled className="text-white text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-xs text-white truncate">{verb}</p>
                  <p className="text-[10px] text-white-variant">{item.pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Encouragement in growth mode */}
      {showGrowth && (
        <div className="text-center py-3 transition-all duration-500">
          <p className="text-sm font-body text-emerald-600 italic">
            &ldquo;The opposite of addiction is not sobriety. The opposite of addiction is connection.&rdquo;
          </p>
          <p className="text-xs font-label font-bold text-emerald-500/60 mt-1">&mdash; Johann Hari</p>
        </div>
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export default function AssessmentClient() {
  const [step, setStep] = useState(0); // 0..3 = questions, 4 = results, 5 = pick rivals
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chosenRivals, setChosenRivals] = useState<Set<RivalId>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isResults = step === STEPS.length;
  const isPickRivals = step === STEPS.length + 1;

  const results = useMemo(
    () => (step >= STEPS.length ? calculateResults(selected) : []),
    [step, selected]
  );

  const copingResults = useMemo(
    () => (step >= STEPS.length ? calculateCopingTypes(selected) : []),
    [step, selected]
  );

  function toggle(word: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  function next() {
    if (step < STEPS.length + 1) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function toggleRival(id: RivalId) {
    setChosenRivals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goToPickRivals() {
    // Pre-select only top 2 — momentum from 2 creates a snowball effect
    const preselected = new Set<RivalId>();
    results.slice(0, 2).forEach(r => preselected.add(r.id));
    setChosenRivals(preselected);
    setStep(STEPS.length + 1);
  }

  async function saveAndStart() {
    setSaving(true);
    const rivals = Array.from(chosenRivals);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: rivals }),
      });
      if (res.ok) { window.location.href = '/dashboard'; return; }
    } catch {}
    setSaving(false);
    window.location.href = '/auth/signup';
  }

  const progress = ((step) / STEPS.length) * 100;
  const selectedInStep = currentStep ? currentStep.words.filter(w => selected.has(w.text)).length : 0;

  /* ── Results Screen ──────────────────────────────────── */
  if (isResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <MaterialIcon name="analytics" filled className="text-primary text-3xl" />
          </div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-white">
            Your Rival Profile
          </h1>
          <p className="text-sm text-white-variant font-body max-w-md mx-auto leading-relaxed">
            Based on your responses, here are the digital rivals most likely to challenge you — ranked by match strength.
          </p>
          <p className="text-xs text-white-variant/60 font-label">
            {selected.size} of {TOTAL_WORDS} indicators selected
          </p>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-white/[0.05] rounded-2xl ring-1 ring-white/10/10 p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-white-variant/30 mb-3 block">check_circle</span>
            <h3 className="font-headline font-bold text-white text-lg mb-2">No strong matches</h3>
            <p className="text-sm text-white-variant">You didn&apos;t select enough indicators. Go back and answer honestly — this is just for you.</p>
          </div>
        ) : (
          <RivalResultsList results={results} />
        )}

        {/* ── Coping Transformation Profile ─────────────────── */}
        <CopingProfile copingResults={copingResults} />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-white-variant font-label">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>High (70%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>Moderate (45-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <span>Low (&lt;45%)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={goToPickRivals}
            disabled={results.length === 0}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-label font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Choose My Rivals
            <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
          <button
            onClick={() => { setStep(0); setSelected(new Set()); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-label font-semibold text-sm text-white-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Retake Assessment
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-white-variant/50 font-body leading-relaxed max-w-md mx-auto">
          This assessment is for self-awareness purposes only and is not a clinical diagnosis.
          Results are based on behavioral pattern indicators from your self-reported responses.
          If you are in crisis, call or text 988.
        </p>
      </div>
    );
  }

  /* ── Rival Picker Screen ──────────────────────────────── */
  if (isPickRivals) {
    // Build full rival list: assessment matches first (with %), then all remaining
    const resultIds = new Set(results.map(r => r.id));
    const allRivalIds = Object.keys(RIVAL_META) as RivalId[];
    const unmatched = allRivalIds.filter(id => !resultIds.has(id));

    // Growth direction lookup for each rival
    const RIVAL_GROWTH: Partial<Record<RivalId, { slide: string; climb: string; climbIcon: string }>> = {
      pornography: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      sexting: { slide: 'Fantasizing', climb: 'Connecting', climbIcon: 'handshake' },
      social_media: { slide: 'Performing', climb: 'Belonging', climbIcon: 'favorite' },
      binge_watching: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      impulse_shopping: { slide: 'Numbing', climb: 'Experiencing', climbIcon: 'wb_sunny' },
      doomscrolling: { slide: 'Guarding', climb: 'Trusting', climbIcon: 'shield_with_heart' },
      alcohol_drugs: { slide: 'Numbing', climb: 'Experiencing', climbIcon: 'wb_sunny' },
      vaping_tobacco: { slide: 'Numbing', climb: 'Experiencing', climbIcon: 'wb_sunny' },
      gambling: { slide: 'Chasing', climb: 'Building', climbIcon: 'construction' },
      sports_betting: { slide: 'Chasing', climb: 'Building', climbIcon: 'construction' },
      day_trading: { slide: 'Chasing', climb: 'Building', climbIcon: 'construction' },
      dating_apps: { slide: 'Performing', climb: 'Belonging', climbIcon: 'favorite' },
      emotional_affairs: { slide: 'Fantasizing', climb: 'Connecting', climbIcon: 'handshake' },
      gaming: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      rage_content: { slide: 'Guarding', climb: 'Trusting', climbIcon: 'shield_with_heart' },
      gossip_drama: { slide: 'Performing', climb: 'Belonging', climbIcon: 'favorite' },
      isolation: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      ai_relationships: { slide: 'Fantasizing', climb: 'Connecting', climbIcon: 'handshake' },
      overworking: { slide: 'Controlling', climb: 'Surrendering', climbIcon: 'water_drop' },
      sleep_avoidance: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      self_harm: { slide: 'Punishing', climb: 'Compassion', climbIcon: 'spa' },
      procrastination: { slide: 'Escaping', climb: 'Presence', climbIcon: 'self_improvement' },
      eating_disorder: { slide: 'Controlling', climb: 'Surrendering', climbIcon: 'water_drop' },
      body_checking: { slide: 'Controlling', climb: 'Surrendering', climbIcon: 'water_drop' },
    };

    function renderRivalCard(id: RivalId, pct?: number) {
      const meta = RIVAL_META[id];
      const growth = RIVAL_GROWTH[id];
      const isChosen = chosenRivals.has(id);
      return (
        <button
          key={id}
          onClick={() => toggleRival(id)}
          className={`relative flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
            isChosen
              ? 'bg-primary/10 ring-2 ring-primary shadow-lg shadow-primary/10'
              : 'bg-white/[0.05] ring-1 ring-white/10/20 hover:ring-primary/30'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            isChosen ? 'bg-primary' : 'bg-white/10 ring-1 ring-white/10/30'
          }`}>
            {isChosen && <span className="material-symbols-outlined text-white text-sm">check</span>}
          </div>
          <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
            <MaterialIcon name={meta.icon} filled className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-white">{meta.label}</h3>
              {pct !== undefined && (
                <span className={`font-headline font-bold text-xs ${pct >= 70 ? 'text-red-500' : pct >= 45 ? 'text-amber-500' : 'text-white-variant'}`}>{pct}%</span>
              )}
            </div>
            {growth && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-white-variant font-label">{growth.slide}</span>
                <span className="material-symbols-outlined text-emerald-500 text-xs">arrow_forward</span>
                <MaterialIcon name={growth.climbIcon} filled className="text-emerald-500 text-xs" />
                <span className="text-[10px] text-emerald-600 font-label font-semibold">{growth.climb}</span>
              </div>
            )}
          </div>
        </button>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <MaterialIcon name="target" filled className="text-primary text-3xl" />
          </div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-white">
            Choose Your Rivals &amp; Growth Path
          </h1>
          <p className="text-sm text-white-variant font-body max-w-md mx-auto leading-relaxed">
            Select the struggles you want to focus on. Each rival has a growth direction you&apos;ll be climbing toward. You can always change these later in Settings.
          </p>
        </div>

        {/* Recommendation banner */}
        <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4">
          <MaterialIcon name="tips_and_updates" filled className="text-emerald-500 text-lg mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-headline font-bold text-white mb-0.5">We recommend starting with 2</p>
            <p className="text-xs text-white-variant font-body leading-relaxed">
              Momentum from progressing in one area creates a snowball effect that naturally brings progress in other areas along with it. Focus beats breadth.
            </p>
          </div>
        </div>

        {/* Count + feedback */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white-variant font-label">
            <span className="font-bold text-white">{chosenRivals.size}</span> selected
          </p>
          {chosenRivals.size >= 6 && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span className="text-xs font-label font-semibold">Consider narrowing your focus — you can always add more later in Settings</span>
            </div>
          )}
          {chosenRivals.size >= 3 && chosenRivals.size < 6 && (
            <div className="flex items-center gap-1.5 text-white-variant">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-xs font-label">Solid selection — you can adjust anytime</span>
            </div>
          )}
          {chosenRivals.size <= 2 && chosenRivals.size > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-500">
              <MaterialIcon name="check_circle" filled className="text-sm" />
              <span className="text-xs font-label font-semibold">Great focus</span>
            </div>
          )}
        </div>

        {/* Assessment matches */}
        {results.length > 0 && (
          <div>
            <p className="text-xs font-label font-semibold text-white-variant uppercase tracking-wider mb-2.5">From your assessment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map(r => renderRivalCard(r.id, r.pct))}
            </div>
          </div>
        )}

        {/* All other rivals */}
        <div>
          <p className="text-xs font-label font-semibold text-white-variant uppercase tracking-wider mb-2.5">All rivals</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unmatched.map(id => renderRivalCard(id))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-dark-sanctuary via-dark-sanctuary to-transparent pb-2">
          <button
            onClick={saveAndStart}
            disabled={saving || chosenRivals.size === 0}
            className="group inline-flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-full font-label font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Start Your Journey'}
            <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
          <button
            onClick={() => setStep(STEPS.length)}
            className="inline-flex items-center gap-1.5 text-sm font-label font-semibold text-white-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to results
          </button>
        </div>
      </div>
    );
  }

  /* ── Question Screen ──────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-label text-white-variant">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{selected.size} selected total</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <MaterialIcon name={currentStep.icon} filled className="text-primary text-2xl" />
        </div>
        <div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-white">{currentStep.title}</h1>
          <p className="text-sm text-white-variant font-body">{currentStep.subtitle}</p>
        </div>
      </div>

      {/* Word grid */}
      <div className="flex flex-wrap gap-2.5">
        {currentStep.words.map(word => {
          const isSelected = selected.has(word.text);
          return (
            <button
              key={word.text}
              onClick={() => toggle(word.text)}
              className={`px-4 py-2.5 rounded-xl text-sm font-label font-medium cursor-pointer transition-all duration-200 select-none active:scale-[0.96] ${
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/20 ring-2 ring-primary'
                  : 'bg-white/[0.05] text-white ring-1 ring-white/10/20 hover:ring-primary/30 hover:bg-primary/5'
              }`}
            >
              {word.text}
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      <p className="text-xs text-white-variant font-label text-center">
        {selectedInStep} selected in this step
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prev}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-label font-semibold text-sm text-white-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>

        <button
          onClick={next}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          {step === STEPS.length - 1 ? 'See My Results' : 'Next'}
          <span className="material-symbols-outlined text-lg">
            {step === STEPS.length - 1 ? 'analytics' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
}
