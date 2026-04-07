// ============================================================
// lib/imageClassifier.ts
//
// Lightweight rule-based pre-classifier for desktop screenshots.
// Decides whether a screenshot needs expensive Claude Vision
// analysis based on metadata alone (app name, URL, window title,
// screen-change detection).
//
// Goal: filter out 80-90% of screenshots without any API call.
// ============================================================

import { checkDomain, checkUrl } from './contentBlocklist';
import type { GoalCategory, TrackedSubstance } from '@be-candid/shared';
import { SUBSTANCE_CATEGORIES } from '@be-candid/shared';

// ── Public types ────────────────────────────────────────────

export interface ScreenshotMetadata {
  activeApp: string;
  activeUrl?: string;
  windowTitle?: string;
  timestamp: string;
  screenChanged: boolean;
}

export interface ClassificationResult {
  needsVisionAnalysis: boolean;
  category: GoalCategory | null;
  confidence: number;
  reason: string;
}

// ── Safe apps that never need Vision ────────────────────────

const SAFE_APPS = new Set([
  'terminal',
  'iterm',
  'iterm2',
  'warp',
  'alacritty',
  'hyper',
  'visual studio code',
  'code',
  'vscode',
  'xcode',
  'intellij idea',
  'webstorm',
  'android studio',
  'sublime text',
  'neovim',
  'vim',
  'finder',
  'file explorer',
  'system preferences',
  'system settings',
  'calculator',
  'notes',
  'apple notes',
  'calendar',
  'reminders',
  'mail',
  'apple mail',
  'activity monitor',
  'task manager',
  'preview',
  'textedit',
  'keychain access',
  'disk utility',
  'console',
  'accessibility inspector',
  'font book',
  'archive utility',
  'migration assistant',
  'bluetooth file exchange',
  'grapher',
  'digital color meter',
  'screenshot',
  'time machine',
]);

// ── Browser identifiers ─────────────────────────────────────

const BROWSER_APPS = new Set([
  'google chrome',
  'chrome',
  'safari',
  'firefox',
  'mozilla firefox',
  'microsoft edge',
  'edge',
  'brave browser',
  'brave',
  'arc',
  'opera',
  'vivaldi',
]);

// ── Window-title keyword matchers ───────────────────────────
// Each entry maps keyword patterns to a GoalCategory and
// confidence. Patterns are tested case-insensitively against
// the full window title string.

interface TitleKeywordRule {
  patterns: RegExp;
  category: GoalCategory;
  confidence: number;
}

const TITLE_KEYWORD_RULES: TitleKeywordRule[] = [
  // Gambling / betting
  {
    patterns:
      /\b(bet365|draftkings|fanduel|betmgm|pokerstars|bovada|caesars\s*sports|casino|poker|blackjack|roulette|slot\s*machine|sportsbook|parlay|odds\s*boost|betting\s*slip|fanduel\s*sportsbook|barstool\s*sportsbook)\b/i,
    category: 'gambling',
    confidence: 0.9,
  },
  // Adult / pornography (site names that commonly appear in titles)
  {
    patterns:
      /\b(pornhub|xvideos|xnxx|xhamster|redtube|youporn|brazzers|onlyfans|chaturbate|stripchat|livejasmin|spankbang|tube8|motherless|rule34|hentai|nhentai|hanime)\b/i,
    category: 'pornography',
    confidence: 0.95,
  },
  // Dating
  {
    patterns:
      /\b(tinder|bumble|hinge|grindr|okcupid|match\.com|plenty\s*of\s*fish|ashley\s*madison|feeld)\b/i,
    category: 'dating_apps',
    confidence: 0.9,
  },
  // Social media
  {
    patterns:
      /\b(instagram|tiktok|twitter|reddit|facebook|snapchat|threads)\b/i,
    category: 'social_media',
    confidence: 0.6,
  },
  // Gaming / streaming
  {
    patterns:
      /\b(steam|twitch|discord|epic\s*games|battle\.net|riot\s*client|league\s*of\s*legends|fortnite|valorant|minecraft|roblox|genshin\s*impact|call\s*of\s*duty|apex\s*legends|counter[\s-]*strike|overwatch|diablo|world\s*of\s*warcraft)\b/i,
    category: 'gaming',
    confidence: 0.7,
  },
  // Binge watching
  {
    patterns:
      /\b(netflix|hulu|disney\+?|prime\s*video|hbo\s*max|peacock|paramount\+?|apple\s*tv\+?|crunchyroll|funimation)\b/i,
    category: 'binge_watching',
    confidence: 0.5,
  },
  // Shopping
  {
    patterns:
      /\b(add\s*to\s*cart|checkout|shein|temu|wish\.com|shopping\s*cart)\b/i,
    category: 'impulse_shopping',
    confidence: 0.5,
  },
  // Alcohol / substance
  {
    patterns:
      /\b(drizly|totalwine|minibar\s*delivery|bevmo|wine\.com|liquor)\b/i,
    category: 'alcohol_drugs',
    confidence: 0.7,
  },
  // Day trading
  {
    patterns:
      /\b(robinhood|webull|etrade|e\*trade|thinkorswim|tradingview)\b/i,
    category: 'day_trading',
    confidence: 0.6,
  },
];

// ── Substance-specific window title keywords ───────────────

const SUBSTANCE_TITLE_KEYWORDS: Record<string, string[]> = {
  alcohol: ['bar', 'brewery', 'wine', 'cocktail', 'happy hour', 'tavern', 'pub', 'liquor store', 'beer', 'spirits', 'whiskey', 'vodka', 'rum', 'tequila'],
  beer: ['brewery', 'beer', 'lager', 'ale', 'ipa', 'craft beer', 'tap room', 'taproom'],
  wine: ['wine', 'winery', 'vineyard', 'sommelier', 'wine bar', 'wine club'],
  liquor: ['liquor', 'spirits', 'whiskey', 'vodka', 'rum', 'tequila', 'bourbon', 'gin', 'distillery'],
  marijuana: ['dispensary', 'cannabis', 'weed', 'thc', 'leafly', 'weedmaps', 'marijuana', 'edibles', 'dab'],
  cannabis: ['dispensary', 'cannabis', 'weed', 'thc', 'leafly', 'weedmaps', 'marijuana', 'edibles'],
  cocaine: ['cocaine', 'coke'],
  opioids: ['opioid', 'painkiller', 'oxy', 'percocet', 'vicodin'],
  heroin: ['heroin'],
  fentanyl: ['fentanyl'],
  methamphetamine: ['meth', 'methamphetamine', 'crystal'],
  prescription_drugs: ['pill finder', 'drug identifier', 'pharmacy', 'prescription'],
  vaping: ['vape', 'juul', 'puff bar', 'vaporizer', 'e-liquid', 'ejuice', 'e-juice', 'pod system', 'mod kit'],
  cigarettes: ['cigarette', 'marlboro', 'camel', 'newport', 'smoking'],
  nicotine: ['nicotine', 'nic salt', 'nicotine pouch', 'zyn'],
  kratom: ['kratom', 'mitragyna'],
  psychedelics: ['psychedelic', 'psilocybin', 'mushroom', 'lsd', 'ayahuasca', 'dmt'],
};

// ── Main pre-classifier ─────────────────────────────────────

export function preClassifyScreenshot(
  metadata: ScreenshotMetadata,
  trackedSubstances?: TrackedSubstance[]
): ClassificationResult {
  // 1. Skip if screen hasn't changed since last capture
  if (!metadata.screenChanged) {
    return {
      needsVisionAnalysis: false,
      category: null,
      confidence: 1.0,
      reason: 'no_change',
    };
  }

  const appNormalized = metadata.activeApp.toLowerCase().trim();

  // 2. Check active URL against content blocklist (reuses existing domain matching)
  if (metadata.activeUrl) {
    const urlResult = checkUrl(metadata.activeUrl);
    if (urlResult.found && urlResult.entry) {
      return {
        needsVisionAnalysis: false,
        category: urlResult.entry.category,
        confidence: urlResult.entry.confidence,
        reason: urlResult.blocked ? 'blocked_domain' : 'flagged_domain',
      };
    }

    // Also try domain extraction for bare domains
    const domainResult = extractAndCheckDomain(metadata.activeUrl);
    if (domainResult) {
      return domainResult;
    }
  }

  // 3. Check window title for substance-specific keywords
  if (metadata.windowTitle && trackedSubstances && trackedSubstances.length > 0) {
    const substanceResult = matchSubstanceTitle(metadata.windowTitle, trackedSubstances);
    if (substanceResult) {
      return substanceResult;
    }
  }

  // 4. Check window title for keyword matches
  if (metadata.windowTitle) {
    const titleResult = matchWindowTitle(metadata.windowTitle);
    if (titleResult) {
      return titleResult;
    }
  }

  // 5. Check if the active app is a known safe app
  if (SAFE_APPS.has(appNormalized)) {
    return {
      needsVisionAnalysis: false,
      category: null,
      confidence: 0.95,
      reason: 'safe_app',
    };
  }

  // 6. Browser is active but URL is unknown — need Vision
  if (BROWSER_APPS.has(appNormalized)) {
    if (!metadata.activeUrl) {
      return {
        needsVisionAnalysis: true,
        category: null,
        confidence: 0,
        reason: 'unknown_browser_content',
      };
    }
    // URL was provided but not in blocklist — safe enough to skip
    return {
      needsVisionAnalysis: false,
      category: null,
      confidence: 0.7,
      reason: 'browser_unlisted_url',
    };
  }

  // 7. Check if app name itself matches a known pattern
  const appResult = matchAppName(appNormalized);
  if (appResult) {
    return {
      needsVisionAnalysis: false,
      category: appResult.category,
      confidence: appResult.confidence,
      reason: 'known_app',
    };
  }

  // 8. Unknown / unrecognized app — send to Vision
  return {
    needsVisionAnalysis: true,
    category: null,
    confidence: 0,
    reason: 'unknown_app',
  };
}

// ── Helpers ─────────────────────────────────────────────────

function extractAndCheckDomain(
  url: string
): ClassificationResult | null {
  try {
    const parsed = new URL(
      url.startsWith('http') ? url : `https://${url}`
    );
    const hostname = parsed.hostname.replace(/^www\./, '');
    const result = checkDomain(hostname);
    if (result.found && result.entry) {
      return {
        needsVisionAnalysis: false,
        category: result.entry.category,
        confidence: result.entry.confidence,
        reason: result.blocked ? 'blocked_domain' : 'flagged_domain',
      };
    }
  } catch {
    // Malformed URL — fall through
  }
  return null;
}

function matchWindowTitle(
  title: string
): ClassificationResult | null {
  for (const rule of TITLE_KEYWORD_RULES) {
    if (rule.patterns.test(title)) {
      return {
        needsVisionAnalysis: false,
        category: rule.category,
        confidence: rule.confidence,
        reason: 'title_keyword_match',
      };
    }
  }
  return null;
}

/**
 * Match window title against substance-specific keywords,
 * only flagging substances the user is actively tracking.
 */
function matchSubstanceTitle(
  title: string,
  trackedSubstances: TrackedSubstance[]
): ClassificationResult | null {
  const titleLower = title.toLowerCase();
  for (const substance of trackedSubstances) {
    const keywords = SUBSTANCE_TITLE_KEYWORDS[substance];
    if (!keywords) continue;
    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        const parentCategory = SUBSTANCE_CATEGORIES[substance];
        return {
          needsVisionAnalysis: false,
          category: parentCategory,
          confidence: 0.75,
          reason: `substance_keyword_match:${substance}:${keyword}`,
        };
      }
    }
  }
  return null;
}

/** App-name-level category detection (non-browser apps) */
const APP_NAME_PATTERNS: Array<{
  pattern: RegExp;
  category: GoalCategory;
  confidence: number;
}> = [
  { pattern: /\b(tinder|bumble|hinge|grindr|okcupid)\b/i, category: 'dating_apps', confidence: 0.9 },
  { pattern: /\b(draftkings|fanduel|betmgm|bet365|pokerstars)\b/i, category: 'gambling', confidence: 0.9 },
  { pattern: /\b(instagram|tiktok|snapchat|twitter)\b/i, category: 'social_media', confidence: 0.5 },
  { pattern: /\b(steam|discord|twitch)\b/i, category: 'gaming', confidence: 0.6 },
  { pattern: /\b(netflix|hulu|disney)\b/i, category: 'binge_watching', confidence: 0.4 },
  { pattern: /\b(robinhood|webull|etrade)\b/i, category: 'day_trading', confidence: 0.6 },
];

function matchAppName(
  appName: string
): { category: GoalCategory; confidence: number } | null {
  for (const { pattern, category, confidence } of APP_NAME_PATTERNS) {
    if (pattern.test(appName)) {
      return { category, confidence };
    }
  }
  return null;
}
