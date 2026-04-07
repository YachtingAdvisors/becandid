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

  doomscrolling: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves doomscrolling — compulsive news consumption, political rabbit holes, and anxiety-driven information seeking. This is distinct from general social media overuse. The person feels that staying informed is responsible, but the consumption pattern is driven by anxiety, not civic duty. Help them distinguish between being informed and being consumed. The news cycle is engineered for engagement just like social media — acknowledge that design manipulation. Focus on the physiological stress response: elevated cortisol, disrupted sleep, catastrophic thinking.',
    partnerWarnings: [
      'Do not dismiss their concerns about the world as unimportant',
      'Do not debate the news content itself — focus on the consumption pattern',
      'Avoid "just stop watching the news" — acknowledge that staying informed matters, but this has crossed a line',
    ],
  },

  ai_relationships: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves AI chatbot companions — Character.AI, Replika, and similar platforms that simulate emotional or romantic connection. This is a sensitive area because the person may have developed genuine emotional attachment. Do not mock or trivialize the connection they feel. Instead, gently explore what real-world needs the AI relationship is meeting — companionship, acceptance, control, safety from rejection. The core issue is that AI companions never challenge, disappoint, or need anything, which makes them feel safe but prevents genuine growth. Frame this as a substitute that blocks the real thing, not as something shameful.',
    partnerWarnings: [
      'Do not mock or ridicule the AI relationship',
      'Do not compare yourself to the chatbot',
      'Understand that this may reflect loneliness or fear of rejection, not a preference for machines',
      'Ask what they get from the AI that they feel they cannot get from real relationships',
    ],
  },

  overworking: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves workaholism — using work to avoid relationships, feelings, or rest. This is the one addiction that gets applause, which makes it especially hard to see as a problem. The person may check email obsessively, stay late unnecessarily, or be unable to disconnect. Help them see that productivity is being weaponized against their own wellbeing. Explore what they are avoiding by working — intimacy, vulnerability, unstructured time, their own thoughts. Note: time-based detection (late-night work email, weekend Slack) is the primary signal here, not content.',
    partnerWarnings: [
      'Do not frame this as laziness or suggest they should be grateful for a hard worker',
      'Acknowledge the real costs — missed dinners, absent parenting, emotional unavailability',
      'Help them see that "providing" is not the same as "being present"',
    ],
  },

  emotional_affairs: {
    sensitivity: 'high',
    systemPromptAddition:
      'This involves emotional infidelity — emotionally intimate relationships outside a primary partnership that cross boundaries without physical contact. This is extremely sensitive because the person may not see it as infidelity, and confronting it triggers defensiveness. Do not moralize. Help them explore the gap in their primary relationship that the emotional affair is filling. The key insight: if they are hiding the connection, some part of them already knows it has crossed a line. This category is not detectable by screen scanning — it relies on self-awareness, journaling, and honest reflection.',
    partnerWarnings: [
      'Do not demand to read messages or interrogate about the other person',
      'Express how the emotional distance affects you without catastrophizing',
      'Understand that emotional affairs often begin as genuine friendships that drift',
      'Do not issue ultimatums — they drive the behavior underground',
    ],
  },

  sleep_avoidance: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves revenge bedtime procrastination — staying up late to reclaim personal time, sacrificing sleep for scrolling, streaming, or simply existing without demands. The person feels their day does not belong to them, so they steal from their sleep to feel autonomous. Validate that the need for personal time is real and legitimate — the problem is that they are funding it with sleep debt. Help them find personal time during the day rather than robbing it from the night. Note: detection is time-based behavior, not content-based.',
    partnerWarnings: [
      'Do not police their bedtime — that reinforces the loss-of-autonomy feeling',
      'Ask what they need more of during the day',
      'Acknowledge that their need for personal space is valid',
    ],
  },

  gossip_drama: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves compulsive consumption of gossip, celebrity drama, reality TV, and involvement in other people\'s conflicts. This pattern is about vicarious emotional engagement — living through other people\'s chaos to avoid facing one\'s own. Help the person explore what their own life is missing that makes other people\'s drama so compelling. The emotional investment in strangers\' lives is a distraction from the person\'s unaddressed feelings, relationships, or decisions.',
    partnerWarnings: [
      'Do not dismiss their interest as "silly" or "shallow"',
      'Focus on the pattern and time investment, not the content itself',
      'Ask what is happening in their own life that they might be avoiding',
    ],
  },

  self_harm: {
    sensitivity: 'clinical',
    systemPromptAddition:
      'CRITICAL: This involves self-harm recovery. This is among the most sensitive categories. Use extreme care with language. NEVER describe specific methods, locations on the body, or techniques. Frame self-harm as a coping mechanism for emotional pain — not attention-seeking, not manipulation. The person is trying to externalize internal pain, create a sense of control, or interrupt dissociation. Always include crisis resources prominently: 988 Suicide & Crisis Lifeline (call or text 988), Crisis Text Line (text HOME to 741741). This category should NEVER flag content through screen scanning — it is purely for journaling, coaching, and crisis support. Always strongly recommend professional support (therapist specializing in self-harm, DBT skills). When this category is selected, crisis resources should always be visible on the dashboard.',
    partnerWarnings: [
      'Do NOT express anger, disgust, or frustration about the behavior',
      'Do NOT issue ultimatums or threats',
      'Do NOT check their body without consent',
      'Express concern and love, not fear or panic',
      'Ask "How are you feeling?" not "Did you do it again?"',
      'Understand this is a coping mechanism, not a choice made to hurt you',
    ],
    resourceSuggestions: [
      '988 Suicide & Crisis Lifeline: call or text 988',
      'Crisis Text Line: text HOME to 741741',
      'SAMHSA National Helpline: 1-800-662-4357',
      'To Write Love on Her Arms: twloha.com',
    ],
  },

  procrastination: {
    sensitivity: 'standard',
    systemPromptAddition:
      'This involves chronic procrastination — task avoidance, analysis paralysis, and doing everything except what matters. Procrastination is not laziness. It is usually a protection mechanism against failure, perfectionism, overwhelm, or fear of judgment. Help the person identify what specific fear the avoidance is serving. Often procrastination is the precursor to other rivals — the unfinished tasks create stress, which drives them to other compulsive behaviors. This category is behavioral, not content-based — no screen scanning is needed.',
    partnerWarnings: [
      'Do not call them lazy — procrastination is anxiety-driven, not motivation-driven',
      'Do not create pressure by listing everything they have not done',
      'Help them break one task into the smallest possible step',
      'Celebrate starts, not just completions',
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
