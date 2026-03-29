// ============================================================
// lib/sextingDetection.ts
//
// CLIENT-SIDE ONLY text pattern detection for sexting content.
// Similar in philosophy to crisisDetection.ts:
//   - Purely informational for the user
//   - No server logging
//   - No partner alerts
//   - The UI uses this to show a warning banner
//
// PRIVACY: This runs in the browser. Nothing is transmitted.
// ============================================================

export interface SextingResult {
  detected: boolean;
  confidence: number; // 0-1
  severity: 'none' | 'suggestive' | 'explicit';
}

// ── Pattern lists ────────────────────────────────────────────
// These are checked against lowercased text.

const EXPLICIT_PHRASES = [
  'send nudes', 'send me a pic', 'send pics',
  'show me your', 'take it off',
  'what are you wearing', 'what r u wearing',
  'come over tonight', 'hook up',
  'friends with benefits', 'fwb',
  'no strings attached', 'nsa',
  'send me something', 'be naughty',
  'get naked', 'get undressed',
  'turn me on', 'make me come',
  'want to see you', 'wanna see u',
];

const SUGGESTIVE_PHRASES = [
  'you\'re so hot', 'ur so hot',
  'you\'re sexy', 'ur sexy',
  'thinking about you', 'thinking of you',
  'miss your body', 'miss ur body',
  'can\'t stop thinking', 'cant stop thinking',
  'alone tonight', 'home alone',
  'come over', 'my place',
  'late night', 'after dark',
  'just between us', 'our secret',
  'don\'t tell anyone', 'dont tell',
];

const SOLICITATION_PATTERNS = [
  /send\s*(me\s*)?(a\s*)?(nude|pic|photo|selfie)/i,
  /show\s*(me\s*)?(your|ur)\s*(body|self)/i,
  /take\s*(a\s*)?(pic|photo|selfie)\s*(for|of)/i,
  /snap\s*(me|chat)/i,
  /private\s*(pic|photo|snap|chat)/i,
  /\b(sext|sexting)\b/i,
  /dm\s*(me|for)\s*(pics|photos|fun)/i,
];

// ── Detection function ───────────────────────────────────────

export function detectSextingPatterns(text: string): SextingResult {
  if (!text || text.length < 5) {
    return { detected: false, confidence: 0, severity: 'none' };
  }

  const lower = text.toLowerCase();
  let maxConfidence = 0;
  let severity: SextingResult['severity'] = 'none';

  // Check explicit phrases (highest severity)
  for (const phrase of EXPLICIT_PHRASES) {
    if (lower.includes(phrase)) {
      maxConfidence = Math.max(maxConfidence, 0.9);
      severity = 'explicit';
    }
  }

  // Check solicitation regex patterns (high severity)
  if (severity !== 'explicit') {
    for (const pattern of SOLICITATION_PATTERNS) {
      if (pattern.test(text)) {
        maxConfidence = Math.max(maxConfidence, 0.8);
        severity = 'explicit';
        break;
      }
    }
  }

  // Check suggestive phrases (lower severity)
  if (severity === 'none') {
    for (const phrase of SUGGESTIVE_PHRASES) {
      if (lower.includes(phrase)) {
        maxConfidence = Math.max(maxConfidence, 0.5);
        severity = 'suggestive';
      }
    }
  }

  return {
    detected: severity !== 'none',
    confidence: maxConfidence,
    severity,
  };
}
