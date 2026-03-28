// ============================================================
// lib/crisisDetection.ts
//
// Scans journal freewrite text for crisis indicators.
// When detected, shows the user crisis resources.
//
// CRITICAL: This NEVER alerts the partner. Crisis signals
// in a private journal are between the user and themselves.
// Adding surveillance to someone's most vulnerable writing
// would destroy trust and discourage honest reflection.
//
// What it does:
//   1. Checks text against keyword list
//   2. Returns matched resource type
//   3. The UI displays appropriate resources inline
//
// What it does NOT do:
//   - Send alerts to anyone
//   - Store the match in a queryable way
//   - Block the user from saving their entry
//   - Make the user feel surveilled
// ============================================================

export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  contact: string;
  url: string;
  available: string;
}

export const CRISIS_RESOURCES: Record<string, CrisisResource> = {
  '988_suicide_lifeline': {
    id: '988_suicide_lifeline',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support for people in distress.',
    contact: 'Call or text 988',
    url: 'https://988lifeline.org',
    available: '24/7',
  },
  crisis_text_line: {
    id: 'crisis_text_line',
    name: 'Crisis Text Line',
    description: 'Text-based crisis support with trained counselors.',
    contact: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    available: '24/7',
  },
  general_crisis: {
    id: 'general_crisis',
    name: 'SAMHSA National Helpline',
    description: 'Free referrals and information for mental health and substance use.',
    contact: 'Call 1-800-662-4357',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    available: '24/7, 365 days',
  },
};

// ── Keywords ────────────────────────────────────────────────
// These are checked client-side ONLY — no server logging.

const URGENT_PHRASES = [
  'want to die', 'kill myself', 'end my life', 'suicidal',
  'no reason to live', 'better off dead', 'end it all',
  'don\'t want to be here', 'can\'t go on',
];

const RESOURCE_PHRASES = [
  'self harm', 'self-harm', 'cutting myself', 'hurting myself',
  'worthless', 'hopeless', 'give up', 'can\'t take it',
  'nobody cares', 'no one would miss me',
];

export interface CrisisDetectionResult {
  detected: boolean;
  severity: 'urgent' | 'show_resources' | null;
  resources: CrisisResource[];
}

export function checkForCrisisLanguage(text: string): CrisisDetectionResult {
  if (!text) return { detected: false, severity: null, resources: [] };

  const lower = text.toLowerCase();

  // Check urgent phrases first
  for (const phrase of URGENT_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        detected: true,
        severity: 'urgent',
        resources: [
          CRISIS_RESOURCES['988_suicide_lifeline'],
          CRISIS_RESOURCES.crisis_text_line,
        ],
      };
    }
  }

  // Check resource-level phrases
  for (const phrase of RESOURCE_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        detected: true,
        severity: 'show_resources',
        resources: [
          CRISIS_RESOURCES.general_crisis,
          CRISIS_RESOURCES.crisis_text_line,
        ],
      };
    }
  }

  return { detected: false, severity: null, resources: [] };
}
