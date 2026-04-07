// ============================================================
// Be Candid — Category-Specific AI Guide Prompts
//
// Each category may need special handling in the AI conversation
// guide. This module provides category-specific system prompt
// fragments and sensitivity notes for the Claude API call.
// ============================================================

import { GoalCategory } from '@be-candid/shared';

interface CategoryGuidance {
  sensitivity: 'standard' | 'high' | 'clinical';
  systemPromptAddition: string;
  partnerWarnings: string[];
  resourceSuggestions?: string[];
}

export const CATEGORY_GUIDANCE: Record<GoalCategory, CategoryGuidance> = {
  pornography: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves pornography. Use shame-free language. Focus on the person\'s stated values and goals, not moral judgment. Acknowledge that this is an extremely common struggle. Frame it as a pattern to redirect, not a character flaw.',
    partnerWarnings: [
      'Do not express disgust or moral judgment',
      'Do not compare yourself to the content',
      'Do not threaten to leave or use ultimatums',
    ],
  },

  sexting: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves sexting. This may involve a trust violation in a relationship. Be extremely careful not to assume the relationship context. Focus on the user\'s stated accountability goals. If there\'s a romantic partner involved, acknowledge the complexity of betrayal without catastrophizing.',
    partnerWarnings: [
      'Do not demand to see the messages',
      'Do not interrogate about the other person\'s identity',
      'Do not make threats or ultimatums',
    ],
  },

  social_media: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves excessive social media and news consumption — Instagram, TikTok, X/Twitter, Reddit, news apps, and endless feeds. This covers both general overuse and doomscrolling (compulsive consumption of negative or outrage-inducing content). Help them identify what they were seeking — connection, validation, boredom relief, or the anxiety-relief pattern where scrolling feels productive ("staying informed") but is actually avoidance. Distinguish between the dopamine-seeking scroll and the cortisol-driven outrage scroll — both are harmful but feel different.',
    partnerWarnings: [
      'Avoid "just put your phone down" — it\'s dismissive',
      'Don\'t minimize it as "just reading the news" or "everyone does it"',
      'Acknowledge the real pull — these apps are engineered to be addictive',
    ],
  },

  binge_watching: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves binge watching — extended streaming sessions. Help them explore what they\'re escaping from or numbing. This is often loneliness, anxiety, or avoidance of tasks. Frame it gently.',
    partnerWarnings: [
      'Don\'t criticize their taste or content choices',
      'Focus on the pattern, not the specific show',
    ],
  },

  impulse_shopping: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves impulse shopping. This may have financial consequences. Be sensitive to potential shame around money. Focus on the emotional trigger (stress, boredom, reward-seeking) rather than the purchases themselves.',
    partnerWarnings: [
      'Do not itemize or criticize specific purchases',
      'Do not demand to see financial statements',
    ],
  },

  alcohol_drugs: {
    sensitivity: 'clinical',
    systemPromptAddition:
      'This involves alcohol or drug-related content/apps. This person may be in recovery. Use recovery-informed language. Do NOT use the word "relapse" casually — use "setback" or "challenge." Acknowledge how hard recovery is. If this is about exposure to content rather than active use, help them process the craving or trigger. Always suggest professional support as a complement to accountability.',
    partnerWarnings: [
      'Do not use the word "relapse" — say "setback" or "challenge"',
      'Do not ask "did you use?" directly — ask how they\'re feeling',
      'Do not express disappointment — express concern and support',
      'Do not try to be their therapist or sponsor',
    ],
    resourceSuggestions: [
      'SAMHSA National Helpline: 1-800-662-4357',
      'AA meeting finder: aa.org/find-aa',
      'NA meeting finder: na.org/meetingsearch',
    ],
  },

  vaping_tobacco: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves vaping or tobacco content. Nicotine addiction has a strong physiological component. Acknowledge the physical difficulty of quitting while supporting their accountability goals. Don\'t trivialize vaping compared to smoking.',
    partnerWarnings: [
      'Don\'t say "just quit" — nicotine withdrawal is real',
      'Acknowledge progress even if it\'s imperfect',
    ],
  },

  eating_disorder: {
    sensitivity: 'clinical',
    systemPromptAddition:
      'CRITICAL: This involves eating disorder content. Eating disorders have the highest mortality rate of any mental illness. Use extreme care with language. NEVER mention specific weights, calories, or body measurements. NEVER use words like "thin," "fat," "overweight," or "underweight." Do NOT congratulate weight loss or gain. Focus on emotional wellbeing, not food or body. Frame the conversation around what the person was feeling when they sought this content — loneliness, control, anxiety. Always strongly recommend professional support (therapist, dietitian specializing in ED). The partner must understand this is a medical condition, not a choice or vanity.',
    partnerWarnings: [
      'Do NOT comment on their body, weight, or appearance in any way',
      'Do NOT monitor or comment on their food intake',
      'Do NOT say "just eat" or "you look fine"',
      'Do NOT express frustration about meal times or food choices',
      'Ask: "What were you feeling?" not "What did you eat?"',
    ],
    resourceSuggestions: [
      'National Alliance for Eating Disorders Helpline: 1-866-662-1235',
      'Crisis Text Line: Text "NEDA" to 741741',
      'ANAD (National Association of Anorexia Nervosa): anad.org',
    ],
  },

  body_checking: {
    sensitivity: 'clinical',
    systemPromptAddition:
      'This involves body checking behavior — obsessive calorie tracking, mirror checking, excessive fitspiration consumption, or compulsive exercise-related content. This is closely related to eating disorders and body dysmorphia. Use the same sensitivity as eating disorder guidance. Focus on the emotional need being met by the behavior (control, safety, self-worth). Do NOT reinforce the idea that a particular body type equals health or worth.',
    partnerWarnings: [
      'Do NOT compliment or comment on their physical appearance',
      'Do NOT discuss exercise routines, diet, or "healthy eating"',
      'Ask about feelings, not behaviors',
      'Validate that this is a real struggle, not vanity',
    ],
    resourceSuggestions: [
      'National Alliance for Eating Disorders Helpline: 1-866-662-1235',
      'BDD Foundation: bddfoundation.org',
    ],
  },

  gambling: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves gambling. Be sensitive to potential financial consequences and shame. Gambling addiction has high comorbidity with depression and anxiety. Help the person process the trigger — the "almost won" dopamine hit, the escape, the fantasy of solving financial problems. Do not ask about specific dollar amounts unless they volunteer.',
    partnerWarnings: [
      'Do not ask how much they lost',
      'Do not express anger about finances',
      'Do not shame them — gambling addiction has neurological components',
    ],
    resourceSuggestions: [
      'National Problem Gambling Helpline: 1-800-522-4700',
      'Gamblers Anonymous: gamblersanonymous.org',
    ],
  },

  sports_betting: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves sports betting. Sports betting is uniquely dangerous because it feels like skill-based decision making rather than gambling. Help the person see the pattern — the "research" that enables the next bet, the near-miss that keeps them engaged. Acknowledge that sports culture normalizes this heavily.',
    partnerWarnings: [
      'Don\'t say "it\'s just a game" — the addiction is real',
      'Don\'t ask about win/loss records',
      'Acknowledge how normalized sports betting has become',
    ],
    resourceSuggestions: [
      'National Problem Gambling Helpline: 1-800-522-4700',
    ],
  },

  day_trading: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves compulsive day trading — crypto, meme stocks, options. This is functionally similar to gambling but often rationalized as "investing" or "building wealth." Help the person distinguish between legitimate investment and compulsive market-watching. The constant checking, the fear of missing out, the dopamine of gains — these are addiction patterns.',
    partnerWarnings: [
      'Do not debate whether specific trades were smart',
      'Do not ask about gains or losses',
      'Help them see the behavioral pattern, not the financial outcome',
    ],
  },

  dating_apps: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves compulsive dating app usage. If the person is in a relationship, this may involve betrayal — approach with care. If they\'re single and trying to break a validation-seeking pattern, focus on the emotional need the swiping fills. Dating apps are designed to be addictive — acknowledge the design manipulation without removing personal agency.',
    partnerWarnings: [
      'If they\'re your partner: express how this affects you without catastrophizing',
      'Do not demand to see their matches or messages',
      'Ask what they\'re looking for — connection? Validation? Escape?',
    ],
  },

  gaming: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves excessive gaming. Gaming serves many psychological needs — social connection, mastery, escape, flow state. Help the person explore which need is driving the excess. Don\'t demonize gaming itself — focus on the pattern and what it displaces (sleep, relationships, responsibilities).',
    partnerWarnings: [
      'Don\'t attack the games themselves or call them childish',
      'Acknowledge that gaming communities can provide real connection',
      'Focus on what\'s being displaced, not the activity itself',
    ],
  },

  rage_content: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves rage and outrage content — political anger, hate forums, comment section arguments. This is an adrenaline/cortisol pattern. The person feels righteous while consuming it but is actually harming their mental state. Help them recognize the physiological stress response. Don\'t debate the political content itself.',
    partnerWarnings: [
      'Do not engage with the political content or take sides',
      'Do not dismiss their concerns as unimportant',
      'Focus on how the consumption pattern makes them feel physically',
    ],
  },

  isolation: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves isolation and withdrawal from connection. The person\'s rival is not a substance or screen — it\'s the pattern of pulling away from people. Focus on connection, not content monitoring. Frame isolation as a protective response that has outlived its usefulness. Encourage small, concrete steps toward connection rather than dramatic overhauls.',
    partnerWarnings: [
      'Do not take their withdrawal personally',
      'Do not overwhelm them with demands for contact',
      'Reach out gently and consistently — even if they do not respond immediately',
      'Celebrate small connection moments rather than pointing out absences',
    ],
  },

  custom: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This is a custom-defined category. Apply general accountability conversation principles. Focus on the person\'s stated goals and what triggered the behavior.',
    partnerWarnings: [
      'Ask them to explain what this category means to them',
    ],
  },
};

/**
 * Builds the category-specific additions to the Claude system prompt.
 * Used in claude.ts when generating conversation guides.
 */
export function buildCategoryPromptAddition(category: GoalCategory): string {
  const guidance = CATEGORY_GUIDANCE[category];
  if (!guidance) return '';

  let prompt = `\n\nCATEGORY-SPECIFIC GUIDANCE:\n${guidance.systemPromptAddition}`;

  if (guidance.sensitivity === 'clinical') {
    prompt += '\n\nIMPORTANT: This is a clinically sensitive category. Always recommend professional support alongside accountability. The conversation guide should include a gentle suggestion to speak with a qualified professional.';
  }

  if (guidance.resourceSuggestions && guidance.resourceSuggestions.length > 0) {
    prompt += '\n\nIf appropriate, you may mention these resources: ' + guidance.resourceSuggestions.join('; ');
  }

  prompt += '\n\nPARTNER WARNINGS (include these in the partner guide under "What NOT to say/do"):\n';
  prompt += guidance.partnerWarnings.map(w => `- ${w}`).join('\n');

  return prompt;
}
