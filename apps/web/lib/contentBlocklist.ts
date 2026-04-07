// ============================================================
// lib/contentBlocklist.ts
//
// Domain/URL blocklist system for content filtering.
// Categories map to existing GoalCategory from @be-candid/shared.
//
// Exports:
//   checkDomain()        — check if a domain is blocked/flagged
//   checkUrl()           — extract domain from URL and check
//   getCategoryForDomain — get the GoalCategory for a domain
//   BLOCKED_DOMAINS      — curated blocklist (blocked outright)
//   FLAGGED_DOMAINS      — domains that are flagged, not blocked
// ============================================================

import type { GoalCategory, TrackedSubstance } from '@be-candid/shared';
import { SUBSTANCE_CATEGORIES } from '@be-candid/shared';

export interface BlocklistEntry {
  domain: string;
  category: GoalCategory;
  confidence: number; // 0-1
}

export type BlocklistResult = {
  found: boolean;
  blocked: boolean;
  flagged: boolean;
  entry: BlocklistEntry | null;
};

// ── Blocked domains (high confidence, auto-blocked) ──────────

export const BLOCKED_DOMAINS: BlocklistEntry[] = [
  // Pornography — known adult sites and patterns
  { domain: 'pornhub.com', category: 'pornography', confidence: 1.0 },
  { domain: 'xvideos.com', category: 'pornography', confidence: 1.0 },
  { domain: 'xnxx.com', category: 'pornography', confidence: 1.0 },
  { domain: 'xhamster.com', category: 'pornography', confidence: 1.0 },
  { domain: 'redtube.com', category: 'pornography', confidence: 1.0 },
  { domain: 'youporn.com', category: 'pornography', confidence: 1.0 },
  { domain: 'brazzers.com', category: 'pornography', confidence: 1.0 },
  { domain: 'onlyfans.com', category: 'pornography', confidence: 0.9 },
  { domain: 'chaturbate.com', category: 'pornography', confidence: 1.0 },
  { domain: 'stripchat.com', category: 'pornography', confidence: 1.0 },
  { domain: 'livejasmin.com', category: 'pornography', confidence: 1.0 },
  { domain: 'spankbang.com', category: 'pornography', confidence: 1.0 },
  { domain: 'tube8.com', category: 'pornography', confidence: 1.0 },
  { domain: 'xtube.com', category: 'pornography', confidence: 1.0 },
  { domain: 'motherless.com', category: 'pornography', confidence: 1.0 },

  // Gambling — casino/betting domains
  { domain: 'draftkings.com', category: 'gambling', confidence: 1.0 },
  { domain: 'fanduel.com', category: 'gambling', confidence: 1.0 },
  { domain: 'betmgm.com', category: 'gambling', confidence: 1.0 },
  { domain: 'caesars.com', category: 'gambling', confidence: 0.8 },
  { domain: 'bet365.com', category: 'gambling', confidence: 1.0 },
  { domain: 'williamhill.com', category: 'gambling', confidence: 1.0 },
  { domain: 'bovada.lv', category: 'gambling', confidence: 1.0 },
  { domain: 'pokerstars.com', category: 'gambling', confidence: 1.0 },
  { domain: '888casino.com', category: 'gambling', confidence: 1.0 },
  { domain: 'betway.com', category: 'gambling', confidence: 1.0 },

  // Sports betting
  { domain: 'espnbet.com', category: 'sports_betting', confidence: 1.0 },
  { domain: 'pointsbet.com', category: 'sports_betting', confidence: 1.0 },
  { domain: 'betrivers.com', category: 'sports_betting', confidence: 1.0 },
  { domain: 'hardrock.bet', category: 'sports_betting', confidence: 1.0 },
  { domain: 'unibet.com', category: 'sports_betting', confidence: 1.0 },

  // Day trading / speculative platforms
  { domain: 'robinhood.com', category: 'day_trading', confidence: 0.7 },
  { domain: 'webull.com', category: 'day_trading', confidence: 0.7 },
  { domain: 'etrade.com', category: 'day_trading', confidence: 0.6 },

  // Dating apps
  { domain: 'tinder.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'bumble.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'hinge.co', category: 'dating_apps', confidence: 1.0 },
  { domain: 'match.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'okcupid.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'pof.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'grindr.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'ashley-madison.com', category: 'dating_apps', confidence: 1.0 },
  { domain: 'ashleymadison.com', category: 'dating_apps', confidence: 1.0 },

  // Alcohol/drugs
  { domain: 'drizly.com', category: 'alcohol_drugs', confidence: 0.8 },
  { domain: 'totalwine.com', category: 'alcohol_drugs', confidence: 0.7 },
  { domain: 'minibar.com', category: 'alcohol_drugs', confidence: 0.8 },
];

// ── Flagged domains (monitored, not auto-blocked) ────────────

export const FLAGGED_DOMAINS: BlocklistEntry[] = [
  // Social media — flagged for awareness, not blocked
  { domain: 'instagram.com', category: 'social_media', confidence: 0.5 },
  { domain: 'tiktok.com', category: 'social_media', confidence: 0.5 },
  { domain: 'twitter.com', category: 'social_media', confidence: 0.5 },
  { domain: 'x.com', category: 'social_media', confidence: 0.5 },
  { domain: 'reddit.com', category: 'social_media', confidence: 0.5 },
  { domain: 'facebook.com', category: 'social_media', confidence: 0.4 },
  { domain: 'snapchat.com', category: 'social_media', confidence: 0.5 },
  { domain: 'threads.net', category: 'social_media', confidence: 0.4 },

  // Binge watching
  { domain: 'netflix.com', category: 'binge_watching', confidence: 0.4 },
  { domain: 'hulu.com', category: 'binge_watching', confidence: 0.4 },
  { domain: 'disneyplus.com', category: 'binge_watching', confidence: 0.4 },
  { domain: 'youtube.com', category: 'binge_watching', confidence: 0.3 },
  { domain: 'twitch.tv', category: 'binge_watching', confidence: 0.4 },

  // Shopping
  { domain: 'amazon.com', category: 'impulse_shopping', confidence: 0.3 },
  { domain: 'shein.com', category: 'impulse_shopping', confidence: 0.5 },
  { domain: 'temu.com', category: 'impulse_shopping', confidence: 0.5 },
  { domain: 'wish.com', category: 'impulse_shopping', confidence: 0.5 },
];

// ── TLD patterns (blocked by extension) ──────────────────────

const BLOCKED_TLDS = ['.xxx', '.porn', '.sex', '.adult'];

// ── URL pattern checks ───────────────────────────────────────

const SUSPICIOUS_URL_PATTERNS: Array<{ pattern: RegExp; category: GoalCategory; confidence: number }> = [
  { pattern: /\b(porn|xxx|nsfw|hentai|nude)\b/i, category: 'pornography', confidence: 0.85 },
  { pattern: /\b(casino|slot|jackpot|roulette|blackjack)\b/i, category: 'gambling', confidence: 0.7 },
  { pattern: /\b(sportsbook|parlay|odds|wager)\b/i, category: 'sports_betting', confidence: 0.7 },
  { pattern: /\b(hookup|affair|discreet-dating)\b/i, category: 'dating_apps', confidence: 0.8 },
];

// ── Build lookup maps for fast O(1) checks ───────────────────

const blockedMap = new Map<string, BlocklistEntry>();
for (const entry of BLOCKED_DOMAINS) {
  blockedMap.set(entry.domain.toLowerCase(), entry);
}

const flaggedMap = new Map<string, BlocklistEntry>();
for (const entry of FLAGGED_DOMAINS) {
  flaggedMap.set(entry.domain.toLowerCase(), entry);
}

// ── Exported functions ───────────────────────────────────────

/**
 * Extract the registrable domain from a hostname.
 * e.g., "www.sub.pornhub.com" -> "pornhub.com"
 */
function extractDomain(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  return parts.slice(-2).join('.');
}

/**
 * Check a domain against the blocklist and flaglist.
 */
export function checkDomain(domain: string): BlocklistResult {
  const normalized = extractDomain(domain.toLowerCase());

  // Check blocked list first
  const blockedEntry = blockedMap.get(normalized);
  if (blockedEntry) {
    return { found: true, blocked: true, flagged: false, entry: blockedEntry };
  }

  // Check blocked TLDs
  for (const tld of BLOCKED_TLDS) {
    if (normalized.endsWith(tld)) {
      return {
        found: true,
        blocked: true,
        flagged: false,
        entry: { domain: normalized, category: 'pornography', confidence: 0.95 },
      };
    }
  }

  // Check flagged list
  const flaggedEntry = flaggedMap.get(normalized);
  if (flaggedEntry) {
    return { found: true, blocked: false, flagged: true, entry: flaggedEntry };
  }

  return { found: false, blocked: false, flagged: false, entry: null };
}

/**
 * Extract domain from a URL string and check it.
 */
export function checkUrl(url: string): BlocklistResult & { urlPatternMatch?: { category: GoalCategory; confidence: number } } {
  let hostname: string;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = parsed.hostname;
  } catch {
    return { found: false, blocked: false, flagged: false, entry: null };
  }

  const domainResult = checkDomain(hostname);

  // Also check URL patterns (path, query params)
  for (const { pattern, category, confidence } of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(url)) {
      // If domain was already found, keep the domain result but note URL match
      if (domainResult.found) {
        return { ...domainResult, urlPatternMatch: { category, confidence } };
      }
      // URL pattern match without domain match
      return {
        found: true,
        blocked: true,
        flagged: false,
        entry: { domain: hostname, category, confidence },
        urlPatternMatch: { category, confidence },
      };
    }
  }

  return domainResult;
}

/**
 * Get the GoalCategory for a domain, or null if not in any list.
 */
export function getCategoryForDomain(domain: string): GoalCategory | null {
  const result = checkDomain(domain);
  return result.entry?.category ?? null;
}
