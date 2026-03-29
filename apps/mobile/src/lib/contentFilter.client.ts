// ============================================================
// mobile/src/lib/contentFilter.client.ts
//
// Client-side URL/domain checking against a cached blocklist.
// Pure client-side — never sends URL data to any server.
//
// Responsibilities:
//   1. Check URLs against a local in-memory + AsyncStorage blocklist
//   2. Map blocked domains to GoalCategory values
//   3. Allow server-pushed rule updates without re-fetching on every check
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ────────────────────────────────────────────────────

export type GoalCategory =
  | 'adult_content'
  | 'social_media'
  | 'gambling'
  | 'gaming'
  | 'streaming'
  | 'dating'
  | 'other';

export interface BlocklistRule {
  domain: string;
  category: string;
  action: 'block' | 'allow';
}

export interface CheckResult {
  blocked: boolean;
  category: string | null;
  confidence: number;
}

// ── Storage key ──────────────────────────────────────────────

const BLOCKLIST_KEY = '@be_candid_blocklist';
const BLOCKLIST_VERSION_KEY = '@be_candid_blocklist_version';

// Default version for the bundled list
const DEFAULT_VERSION = '1.0.0';

// ── Built-in blocklist (~200 known explicit/harmful domains) ─

const DEFAULT_RULES: BlocklistRule[] = [
  // Adult content
  { domain: 'pornhub.com', category: 'adult_content', action: 'block' },
  { domain: 'xvideos.com', category: 'adult_content', action: 'block' },
  { domain: 'xnxx.com', category: 'adult_content', action: 'block' },
  { domain: 'xhamster.com', category: 'adult_content', action: 'block' },
  { domain: 'redtube.com', category: 'adult_content', action: 'block' },
  { domain: 'youporn.com', category: 'adult_content', action: 'block' },
  { domain: 'tube8.com', category: 'adult_content', action: 'block' },
  { domain: 'thumbzilla.com', category: 'adult_content', action: 'block' },
  { domain: 'spankbang.com', category: 'adult_content', action: 'block' },
  { domain: 'txxx.com', category: 'adult_content', action: 'block' },
  { domain: 'hclips.com', category: 'adult_content', action: 'block' },
  { domain: 'drtuber.com', category: 'adult_content', action: 'block' },
  { domain: 'tnaflix.com', category: 'adult_content', action: 'block' },
  { domain: 'eporner.com', category: 'adult_content', action: 'block' },
  { domain: 'beeg.com', category: 'adult_content', action: 'block' },
  { domain: 'hardsextube.com', category: 'adult_content', action: 'block' },
  { domain: 'hotmovs.com', category: 'adult_content', action: 'block' },
  { domain: 'fux.com', category: 'adult_content', action: 'block' },
  { domain: 'gotporn.com', category: 'adult_content', action: 'block' },
  { domain: 'pornone.com', category: 'adult_content', action: 'block' },
  { domain: 'sextube.com', category: 'adult_content', action: 'block' },
  { domain: 'porntube.com', category: 'adult_content', action: 'block' },
  { domain: 'keezmovies.com', category: 'adult_content', action: 'block' },
  { domain: 'pornerbros.com', category: 'adult_content', action: 'block' },
  { domain: 'faphouse.com', category: 'adult_content', action: 'block' },
  { domain: 'porn.com', category: 'adult_content', action: 'block' },
  { domain: 'sex.com', category: 'adult_content', action: 'block' },
  { domain: 'brazzers.com', category: 'adult_content', action: 'block' },
  { domain: 'reality kings.com', category: 'adult_content', action: 'block' },
  { domain: 'naughtyamerica.com', category: 'adult_content', action: 'block' },
  { domain: 'bangbros.com', category: 'adult_content', action: 'block' },
  { domain: 'mofos.com', category: 'adult_content', action: 'block' },
  { domain: 'babes.com', category: 'adult_content', action: 'block' },
  { domain: 'wankz.com', category: 'adult_content', action: 'block' },
  { domain: 'digitalplayground.com', category: 'adult_content', action: 'block' },
  { domain: 'teamskeet.com', category: 'adult_content', action: 'block' },
  { domain: 'vixen.com', category: 'adult_content', action: 'block' },
  { domain: 'blacked.com', category: 'adult_content', action: 'block' },
  { domain: 'tushy.com', category: 'adult_content', action: 'block' },
  { domain: 'deeper.com', category: 'adult_content', action: 'block' },
  { domain: 'onlyfans.com', category: 'adult_content', action: 'block' },
  { domain: 'fansly.com', category: 'adult_content', action: 'block' },
  { domain: 'manyvids.com', category: 'adult_content', action: 'block' },
  { domain: 'clips4sale.com', category: 'adult_content', action: 'block' },
  { domain: 'iwantclips.com', category: 'adult_content', action: 'block' },
  { domain: 'loyalfans.com', category: 'adult_content', action: 'block' },
  { domain: 'fancentro.com', category: 'adult_content', action: 'block' },
  { domain: 'admireme.vip', category: 'adult_content', action: 'block' },
  { domain: 'justforfans.com', category: 'adult_content', action: 'block' },
  { domain: 'frisk.chat', category: 'adult_content', action: 'block' },
  { domain: 'dirtyroulette.com', category: 'adult_content', action: 'block' },
  { domain: 'chaturbate.com', category: 'adult_content', action: 'block' },
  { domain: 'myfreecams.com', category: 'adult_content', action: 'block' },
  { domain: 'cam4.com', category: 'adult_content', action: 'block' },
  { domain: 'stripchat.com', category: 'adult_content', action: 'block' },
  { domain: 'livejasmin.com', category: 'adult_content', action: 'block' },
  { domain: 'bongacams.com', category: 'adult_content', action: 'block' },
  { domain: 'flirt4free.com', category: 'adult_content', action: 'block' },
  { domain: 'streamate.com', category: 'adult_content', action: 'block' },
  { domain: 'camsoda.com', category: 'adult_content', action: 'block' },
  { domain: 'imlive.com', category: 'adult_content', action: 'block' },
  { domain: 'xcams.com', category: 'adult_content', action: 'block' },
  { domain: 'camster.com', category: 'adult_content', action: 'block' },
  { domain: 'jerkmate.com', category: 'adult_content', action: 'block' },
  { domain: 'adultfriendfinder.com', category: 'adult_content', action: 'block' },
  { domain: 'ashleymadison.com', category: 'adult_content', action: 'block' },
  { domain: 'fling.com', category: 'adult_content', action: 'block' },
  { domain: 'alt.com', category: 'adult_content', action: 'block' },
  { domain: 'fetlife.com', category: 'adult_content', action: 'block' },
  { domain: 'collarspace.com', category: 'adult_content', action: 'block' },
  { domain: 'nsfw.xxx', category: 'adult_content', action: 'block' },
  { domain: 'hentaihaven.xxx', category: 'adult_content', action: 'block' },
  { domain: 'nhentai.net', category: 'adult_content', action: 'block' },
  { domain: 'hentai2read.com', category: 'adult_content', action: 'block' },
  { domain: 'fakku.net', category: 'adult_content', action: 'block' },
  { domain: 'literotica.com', category: 'adult_content', action: 'block' },
  { domain: 'xart.com', category: 'adult_content', action: 'block' },
  { domain: 'hegre.com', category: 'adult_content', action: 'block' },
  // Dating
  { domain: 'tinder.com', category: 'dating', action: 'block' },
  { domain: 'bumble.com', category: 'dating', action: 'block' },
  { domain: 'hinge.co', category: 'dating', action: 'block' },
  { domain: 'match.com', category: 'dating', action: 'block' },
  { domain: 'okcupid.com', category: 'dating', action: 'block' },
  { domain: 'pof.com', category: 'dating', action: 'block' },
  { domain: 'zoosk.com', category: 'dating', action: 'block' },
  { domain: 'eharmony.com', category: 'dating', action: 'block' },
  { domain: 'badoo.com', category: 'dating', action: 'block' },
  { domain: 'meetme.com', category: 'dating', action: 'block' },
  { domain: 'tagged.com', category: 'dating', action: 'block' },
  { domain: 'grindr.com', category: 'dating', action: 'block' },
  { domain: 'scruff.com', category: 'dating', action: 'block' },
  { domain: 'jackd.com', category: 'dating', action: 'block' },
  { domain: 'her.app', category: 'dating', action: 'block' },
  // Gambling
  { domain: 'betway.com', category: 'gambling', action: 'block' },
  { domain: 'draftkings.com', category: 'gambling', action: 'block' },
  { domain: 'fanduel.com', category: 'gambling', action: 'block' },
  { domain: 'bet365.com', category: 'gambling', action: 'block' },
  { domain: 'bovada.lv', category: 'gambling', action: 'block' },
  { domain: 'mybookie.ag', category: 'gambling', action: 'block' },
  { domain: '888casino.com', category: 'gambling', action: 'block' },
  { domain: 'betmgm.com', category: 'gambling', action: 'block' },
  { domain: 'caesarssportsbook.com', category: 'gambling', action: 'block' },
  { domain: 'pointsbet.com', category: 'gambling', action: 'block' },
  { domain: 'unibet.com', category: 'gambling', action: 'block' },
  { domain: 'williamhill.com', category: 'gambling', action: 'block' },
  { domain: 'ladbrokes.com', category: 'gambling', action: 'block' },
  { domain: 'coral.co.uk', category: 'gambling', action: 'block' },
  { domain: 'pokerstars.com', category: 'gambling', action: 'block' },
  { domain: 'partypoker.com', category: 'gambling', action: 'block' },
  { domain: '888poker.com', category: 'gambling', action: 'block' },
  { domain: 'ggpoker.com', category: 'gambling', action: 'block' },
  { domain: 'wsop.com', category: 'gambling', action: 'block' },
  // Social media (monitoring, not blocking by default — action can be overridden)
  { domain: 'tiktok.com', category: 'social_media', action: 'block' },
  { domain: 'instagram.com', category: 'social_media', action: 'block' },
  { domain: 'twitter.com', category: 'social_media', action: 'block' },
  { domain: 'x.com', category: 'social_media', action: 'block' },
  { domain: 'snapchat.com', category: 'social_media', action: 'block' },
  { domain: 'facebook.com', category: 'social_media', action: 'block' },
  { domain: 'reddit.com', category: 'social_media', action: 'block' },
  { domain: 'tumblr.com', category: 'social_media', action: 'block' },
  // Streaming
  { domain: 'netflix.com', category: 'streaming', action: 'block' },
  { domain: 'hulu.com', category: 'streaming', action: 'block' },
  { domain: 'disneyplus.com', category: 'streaming', action: 'block' },
  { domain: 'hbomax.com', category: 'streaming', action: 'block' },
  { domain: 'max.com', category: 'streaming', action: 'block' },
  { domain: 'peacocktv.com', category: 'streaming', action: 'block' },
  { domain: 'paramountplus.com', category: 'streaming', action: 'block' },
  { domain: 'youtube.com', category: 'streaming', action: 'block' },
  { domain: 'twitch.tv', category: 'streaming', action: 'block' },
  { domain: 'crunchyroll.com', category: 'streaming', action: 'block' },
  // Gaming
  { domain: 'roblox.com', category: 'gaming', action: 'block' },
  { domain: 'steampowered.com', category: 'gaming', action: 'block' },
  { domain: 'epicgames.com', category: 'gaming', action: 'block' },
  { domain: 'blizzard.com', category: 'gaming', action: 'block' },
  { domain: 'ea.com', category: 'gaming', action: 'block' },
  { domain: 'ubisoft.com', category: 'gaming', action: 'block' },
  { domain: 'miniclip.com', category: 'gaming', action: 'block' },
  { domain: 'poki.com', category: 'gaming', action: 'block' },
  { domain: 'armor games.com', category: 'gaming', action: 'block' },
  { domain: 'kongregate.com', category: 'gaming', action: 'block' },
];

// ── In-memory cache ──────────────────────────────────────────

let memoryCache: Map<string, BlocklistRule> | null = null;
let currentVersion: string = DEFAULT_VERSION;

// ── Internal helpers ─────────────────────────────────────────

function buildMap(rules: BlocklistRule[]): Map<string, BlocklistRule> {
  const map = new Map<string, BlocklistRule>();
  for (const rule of rules) {
    map.set(rule.domain.toLowerCase().trim(), rule);
  }
  return map;
}

async function loadFromStorage(): Promise<BlocklistRule[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKLIST_KEY);
    if (raw) {
      return JSON.parse(raw) as BlocklistRule[];
    }
  } catch {
    // Ignore parse errors — fall back to defaults
  }
  return DEFAULT_RULES;
}

async function ensureLoaded(): Promise<Map<string, BlocklistRule>> {
  if (memoryCache) return memoryCache;
  const rules = await loadFromStorage();
  memoryCache = buildMap(rules);
  try {
    const ver = await AsyncStorage.getItem(BLOCKLIST_VERSION_KEY);
    if (ver) currentVersion = ver;
  } catch {
    // ignore
  }
  return memoryCache;
}

function extractDomain(url: string): string {
  try {
    // Handle bare domains (no protocol)
    const withProto = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(withProto);
    // Strip leading 'www.'
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    // Fallback: strip protocol + www manually
    return url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0]
      .toLowerCase();
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Check a URL against the local blocklist.
 * Pure client-side — no network call.
 *
 * Returns:
 *   blocked    – whether the URL matches a block rule
 *   category   – GoalCategory string or null
 *   confidence – 0–1 confidence score (1.0 = exact match)
 */
export async function checkUrlOnDevice(url: string): Promise<CheckResult> {
  if (!url || typeof url !== 'string') {
    return { blocked: false, category: null, confidence: 0 };
  }

  const cache = await ensureLoaded();
  const domain = extractDomain(url);

  // 1. Exact domain match
  const exact = cache.get(domain);
  if (exact) {
    return {
      blocked: exact.action === 'block',
      category: exact.category,
      confidence: 1.0,
    };
  }

  // 2. Parent domain match (e.g. sub.pornhub.com → pornhub.com)
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join('.');
    const parentRule = cache.get(parent);
    if (parentRule) {
      return {
        blocked: parentRule.action === 'block',
        category: parentRule.category,
        confidence: 0.9,
      };
    }
  }

  return { blocked: false, category: null, confidence: 0 };
}

/**
 * Update the cached blocklist with new server-pushed rules.
 * Merges with existing rules (server rules take precedence).
 * Persists to AsyncStorage for offline use.
 */
export async function updateCachedBlocklist(
  rules: Array<{ domain: string; category: string; action: 'block' | 'allow' }>
): Promise<void> {
  const existing = await loadFromStorage();

  // Build a map of existing rules keyed by domain
  const merged = new Map<string, BlocklistRule>();
  for (const r of existing) {
    merged.set(r.domain.toLowerCase().trim(), r);
  }
  // Server rules override local ones
  for (const r of rules) {
    merged.set(r.domain.toLowerCase().trim(), r as BlocklistRule);
  }

  const updatedList = Array.from(merged.values());

  try {
    await AsyncStorage.setItem(BLOCKLIST_KEY, JSON.stringify(updatedList));
    const newVersion = `1.${Date.now()}`;
    await AsyncStorage.setItem(BLOCKLIST_VERSION_KEY, newVersion);
    currentVersion = newVersion;
  } catch (e) {
    console.warn('[ContentFilter] Failed to persist blocklist update:', e);
  }

  // Invalidate in-memory cache so next check re-loads
  memoryCache = buildMap(updatedList);
}

/**
 * Returns the current blocklist version string.
 * Format: "1.0.0" for the built-in list, "1.<timestamp>" for server-updated lists.
 */
export function getBlocklistVersion(): string {
  return currentVersion;
}
