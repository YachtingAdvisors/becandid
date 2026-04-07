// ============================================================
// Goal-specific onboarding tips
// Shown after the user selects their rivals during onboarding.
// 2-3 tips per GoalCategory, keyed by the category string.
// ============================================================

import type { GoalCategory } from '@be-candid/shared';

export interface GoalTip {
  icon: string;
  tip: string;
}

export const GOAL_TIPS: Record<GoalCategory, GoalTip[]> = {
  pornography: [
    { icon: 'schedule', tip: 'Set a vulnerability window for late-night hours — your highest risk time.' },
    { icon: 'phone_android', tip: 'Install the Chrome extension for real-time web monitoring.' },
    { icon: 'edit_note', tip: 'After a flag, journal within 30 minutes while the feelings are fresh.' },
  ],
  sexting: [
    { icon: 'phone_android', tip: 'Enable message scanning — Be Candid can flag risky conversations.' },
    { icon: 'group', tip: 'Tell your partner about this rival. Secrecy is what gives it power.' },
    { icon: 'block', tip: 'Delete the apps or threads where it usually starts. Remove the on-ramp.' },
  ],
  social_media: [
    { icon: 'timer', tip: 'Set a daily limit for social apps — even 60 minutes makes a difference.' },
    { icon: 'bedtime', tip: 'No social media after 9 PM. Late-night scrolling is the biggest trap.' },
    { icon: 'notifications_off', tip: 'Turn off all social media notifications. You choose when to check.' },
  ],
  binge_watching: [
    { icon: 'timer', tip: 'Set an episode limit before you press play — write it on a sticky note.' },
    { icon: 'bedtime', tip: 'No new episodes after 10 PM. Autoplay is designed to steal your sleep.' },
    { icon: 'swap_horiz', tip: 'Replace one binge session per week with something that recharges you.' },
  ],
  impulse_shopping: [
    { icon: 'shopping_cart', tip: 'Add a 48-hour rule — nothing goes from cart to purchase in under two days.' },
    { icon: 'credit_card_off', tip: 'Remove saved payment methods from your most-used shopping apps.' },
    { icon: 'account_balance', tip: 'Track your "money saved by not buying" as a focus metric.' },
  ],
  doomscrolling: [
    { icon: 'timer', tip: 'Set a 15-minute timer before opening any news app. When it rings, you stop.' },
    { icon: 'notifications_off', tip: 'Turn off all news push notifications. Choose when you consume information.' },
    { icon: 'self_improvement', tip: 'Journal your anxiety level before and after a scroll session — the data is eye-opening.' },
  ],
  alcohol_drugs: [
    { icon: 'local_bar', tip: 'Add your specific substances in Settings — the scanner will watch for those specifically.' },
    { icon: 'group', tip: 'Join a group in the app for community support.' },
    { icon: 'calendar_month', tip: "Mark important sobriety dates — we'll celebrate milestones with you." },
  ],
  vaping_tobacco: [
    { icon: 'smoke_free', tip: 'Log every craving — even ones you resist. The pattern will teach you.' },
    { icon: 'timer', tip: 'Use the "delay 10 minutes" technique. Most cravings pass in under 5.' },
    { icon: 'favorite', tip: 'Track your health recovery timeline — lungs start healing within 48 hours.' },
  ],
  eating_disorder: [
    { icon: 'block', tip: 'Block pro-ED communities and thinspo content in your site lists now.' },
    { icon: 'favorite', tip: 'Your safety card will always be visible on your dashboard.' },
    { icon: 'restaurant', tip: 'Log nourishment wins, not restrictions. Reframe what "progress" means.' },
  ],
  body_checking: [
    { icon: 'timer', tip: 'Set a mirror-check limit — log each time and reduce gradually.' },
    { icon: 'block', tip: 'Unfollow fitspiration accounts. Comparison is the thief of recovery.' },
    { icon: 'self_improvement', tip: 'When the urge hits, journal what triggered it instead of checking.' },
  ],
  gambling: [
    { icon: 'block', tip: 'Block DraftKings and FanDuel in your site lists now — before Sunday.' },
    { icon: 'sports_football', tip: 'Set vulnerability windows for game days and Sunday afternoons.' },
    { icon: 'account_balance', tip: 'Track your "money saved by not betting" as a focus metric.' },
  ],
  sports_betting: [
    { icon: 'block', tip: 'Delete all betting apps right now. Not tomorrow — now.' },
    { icon: 'sports_football', tip: 'Set vulnerability windows around major games and playoffs.' },
    { icon: 'account_balance', tip: 'Calculate what you spent last month and set that as your "saved" goal.' },
  ],
  day_trading: [
    { icon: 'timer', tip: 'Set a hard cutoff for market-watching. After hours means after hours.' },
    { icon: 'block', tip: 'Remove real-time tickers from your home screen and watch face.' },
    { icon: 'edit_note', tip: 'Journal every trade impulse — most of them are emotional, not strategic.' },
  ],
  dating_apps: [
    { icon: 'delete', tip: 'Delete the apps from your phone. You can always re-download — but friction helps.' },
    { icon: 'schedule', tip: 'Set a daily time limit. Compulsive swiping is the enemy, not dating itself.' },
    { icon: 'self_improvement', tip: 'Ask: "Am I swiping because I want connection, or because I want validation?"' },
  ],
  emotional_affairs: [
    { icon: 'chat', tip: 'If you catch yourself thinking "they just understand me" — that is the flag.' },
    { icon: 'group', tip: 'Invite your primary partner as your accountability partner. Transparency heals.' },
    { icon: 'edit_note', tip: 'Journal what you are getting from this person that you are not getting at home.' },
  ],
  gaming: [
    { icon: 'timer', tip: 'Set a hard stop time before you start playing. Write it down.' },
    { icon: 'group', tip: 'Tell your accountability partner your gaming schedule.' },
    { icon: 'directions_walk', tip: 'Replace one gaming session per week with something physical.' },
  ],
  rage_content: [
    { icon: 'block', tip: 'Block the subreddits, accounts, and forums that always pull you in.' },
    { icon: 'edit_note', tip: 'Before posting a reply, write it in your journal instead. The anger still gets out.' },
    { icon: 'notifications_off', tip: 'Turn off comment reply notifications. The engagement loop is the trap.' },
  ],
  gossip_drama: [
    { icon: 'notifications_off', tip: 'Mute group chats that trend toward drama. You can still check — on your terms.' },
    { icon: 'self_improvement', tip: 'Ask yourself: "Is this making me feel better or worse about my own life?"' },
    { icon: 'timer', tip: 'Set a daily limit for reality TV and celebrity content. Track it honestly.' },
  ],
  isolation: [
    { icon: 'chat', tip: 'Log at least one connection per day — even a text counts.' },
    { icon: 'person_add', tip: 'Invite a partner who will notice when you go quiet.' },
    { icon: 'self_improvement', tip: 'Use the Conversation Coach when you feel like withdrawing.' },
  ],
  ai_relationships: [
    { icon: 'block', tip: 'Set daily time limits on AI companion apps. Track how much time you spend.' },
    { icon: 'group', tip: 'For every AI conversation, have one real human conversation that day.' },
    { icon: 'edit_note', tip: 'Journal what you are seeking from the AI — then seek it from a real person.' },
  ],
  overworking: [
    { icon: 'work_off', tip: 'Set a "clock out" time and tell your partner to hold you to it.' },
    { icon: 'do_not_disturb', tip: 'Turn off work email notifications after 7 PM.' },
    { icon: 'favorite', tip: 'Schedule non-negotiable family/personal time — treat it like a meeting.' },
  ],
  sleep_avoidance: [
    { icon: 'bedtime', tip: 'Set a phone-down alarm 30 minutes before your target bedtime.' },
    { icon: 'phone_android', tip: 'Charge your phone outside the bedroom. Remove the temptation entirely.' },
    { icon: 'edit_note', tip: 'Journal before bed instead of scrolling. It processes the day without stealing your sleep.' },
  ],
  self_harm: [
    { icon: 'emergency', tip: 'Save 988 in your phone as a contact right now.' },
    { icon: 'favorite', tip: 'Your safety card will always be visible on your dashboard.' },
    { icon: 'edit_note', tip: 'Journal when the urge comes — writing it out can release the pressure.' },
  ],
  procrastination: [
    { icon: 'timer', tip: 'Use the "just 5 minutes" rule — commit to 5 minutes and the momentum often carries you.' },
    { icon: 'checklist', tip: 'Break your biggest task into 3 tiny steps. Do the first one now.' },
    { icon: 'edit_note', tip: 'Journal what you are avoiding and why. The resistance usually points to fear, not laziness.' },
  ],
  custom: [
    { icon: 'tune', tip: 'Define clear triggers for your custom category in Settings.' },
    { icon: 'edit_note', tip: 'Journal every time you encounter this rival. Patterns only emerge with data.' },
    { icon: 'group', tip: 'Tell your accountability partner exactly what this category means to you.' },
  ],
};
