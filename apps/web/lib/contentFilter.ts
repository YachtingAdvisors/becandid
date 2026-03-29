// ============================================================
// lib/contentFilter.ts
//
// Content filtering engine. Checks URLs/domains/apps against:
//   1. Curated blocklist (fast, no DB hit)
//   2. User's custom rules (DB query, cached in-memory)
//   3. URL patterns (regex for suspicious patterns)
//
// Returns a FilterResult with category mapped to GoalCategory.
// ============================================================

import { createServiceClient } from './supabase';
import { checkDomain, checkUrl, getCategoryForDomain } from './contentBlocklist';
import type { GoalCategory } from '@be-candid/shared';

export interface FilterResult {
  blocked: boolean;
  flagged: boolean;
  category: GoalCategory | null;
  confidence: number; // 0-1
  reason: string;
  source: 'blocklist' | 'pattern' | 'ai' | 'user_rule';
}

export interface ContentRule {
  id: string;
  user_id: string;
  domain: string;
  rule_type: 'block' | 'allow';
  category: string | null;
  created_at: string;
}

// ── In-memory cache for user rules (TTL: 5 min) ─────────────

const ruleCache = new Map<string, { rules: ContentRule[]; fetchedAt: number }>();
const RULE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedRules(userId: string): ContentRule[] | null {
  const cached = ruleCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < RULE_CACHE_TTL) {
    return cached.rules;
  }
  return null;
}

function setCachedRules(userId: string, rules: ContentRule[]) {
  ruleCache.set(userId, { rules, fetchedAt: Date.now() });
}

export function invalidateRuleCache(userId: string) {
  ruleCache.delete(userId);
}

// ── Extract domain helper ────────────────────────────────────

function extractDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── Main filter function ─────────────────────────────────────

export async function filterContent(
  userId: string,
  url: string | null,
  domain: string | null,
  appName: string | null,
  metadata?: Record<string, unknown>
): Promise<FilterResult> {
  const effectiveDomain = domain || (url ? extractDomainFromUrl(url) : null);

  // Step 1: Check user's custom allow rules first (overrides blocklist)
  const userRules = await getUserContentRules(userId);
  if (effectiveDomain) {
    const normalizedDomain = effectiveDomain.toLowerCase();
    const allowRule = userRules.find(
      (r) => r.rule_type === 'allow' && normalizedDomain.includes(r.domain.toLowerCase())
    );
    if (allowRule) {
      return {
        blocked: false,
        flagged: false,
        category: null,
        confidence: 1.0,
        reason: `User allowlisted: ${allowRule.domain}`,
        source: 'user_rule',
      };
    }
  }

  // Step 2: Check user's custom block rules
  if (effectiveDomain) {
    const normalizedDomain = effectiveDomain.toLowerCase();
    const blockRule = userRules.find(
      (r) => r.rule_type === 'block' && normalizedDomain.includes(r.domain.toLowerCase())
    );
    if (blockRule) {
      return {
        blocked: true,
        flagged: false,
        category: (blockRule.category as GoalCategory) || null,
        confidence: 1.0,
        reason: `User blocked: ${blockRule.domain}`,
        source: 'user_rule',
      };
    }
  }

  // Step 3: Check URL against curated blocklist (includes URL pattern matching)
  if (url) {
    const urlResult = checkUrl(url);
    if (urlResult.found && urlResult.entry) {
      return {
        blocked: urlResult.blocked,
        flagged: urlResult.flagged,
        category: urlResult.entry.category,
        confidence: urlResult.entry.confidence,
        reason: urlResult.blocked
          ? `Domain blocked: ${urlResult.entry.domain}`
          : `Domain flagged: ${urlResult.entry.domain}`,
        source: urlResult.urlPatternMatch ? 'pattern' : 'blocklist',
      };
    }
  }

  // Step 4: Check domain directly against blocklist
  if (effectiveDomain) {
    const domainResult = checkDomain(effectiveDomain);
    if (domainResult.found && domainResult.entry) {
      return {
        blocked: domainResult.blocked,
        flagged: domainResult.flagged,
        category: domainResult.entry.category,
        confidence: domainResult.entry.confidence,
        reason: domainResult.blocked
          ? `Domain blocked: ${domainResult.entry.domain}`
          : `Domain flagged: ${domainResult.entry.domain}`,
        source: 'blocklist',
      };
    }
  }

  // Step 5: Check app name against known app patterns
  if (appName) {
    const appCategory = matchAppName(appName);
    if (appCategory) {
      return {
        blocked: false,
        flagged: true,
        category: appCategory.category,
        confidence: appCategory.confidence,
        reason: `App flagged: ${appName}`,
        source: 'pattern',
      };
    }
  }

  // No match
  return {
    blocked: false,
    flagged: false,
    category: null,
    confidence: 0,
    reason: 'No match',
    source: 'blocklist',
  };
}

// ── App name matching ────────────────────────────────────────

const APP_PATTERNS: Array<{ pattern: RegExp; category: GoalCategory; confidence: number }> = [
  { pattern: /\b(tinder|bumble|hinge|grindr|okcupid)\b/i, category: 'dating_apps', confidence: 0.9 },
  { pattern: /\b(pornhub|xvideos|xhamster|onlyfans)\b/i, category: 'pornography', confidence: 0.95 },
  { pattern: /\b(draftkings|fanduel|betmgm|bet365)\b/i, category: 'gambling', confidence: 0.9 },
  { pattern: /\b(instagram|tiktok|snapchat|twitter)\b/i, category: 'social_media', confidence: 0.5 },
  { pattern: /\b(netflix|hulu|disney\+?|youtube)\b/i, category: 'binge_watching', confidence: 0.4 },
  { pattern: /\b(robinhood|webull|etrade)\b/i, category: 'day_trading', confidence: 0.6 },
];

function matchAppName(appName: string): { category: GoalCategory; confidence: number } | null {
  for (const { pattern, category, confidence } of APP_PATTERNS) {
    if (pattern.test(appName)) {
      return { category, confidence };
    }
  }
  return null;
}

// ── User content rules (from DB) ─────────────────────────────

export async function getUserContentRules(userId: string): Promise<ContentRule[]> {
  const cached = getCachedRules(userId);
  if (cached) return cached;

  const db = createServiceClient();
  const { data, error } = await db
    .from('content_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch content rules:', error.message);
    return [];
  }

  const rules = (data || []) as ContentRule[];
  setCachedRules(userId, rules);
  return rules;
}

export async function addContentRule(
  userId: string,
  rule: { domain: string; rule_type: 'block' | 'allow'; category?: string }
): Promise<ContentRule | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('content_rules')
    .upsert(
      {
        user_id: userId,
        domain: rule.domain.toLowerCase(),
        rule_type: rule.rule_type,
        category: rule.category || null,
      },
      { onConflict: 'user_id,domain,rule_type' }
    )
    .select()
    .single();

  if (error) {
    console.error('Failed to add content rule:', error.message);
    return null;
  }

  invalidateRuleCache(userId);
  return data as ContentRule;
}

export async function removeContentRule(userId: string, ruleId: string): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from('content_rules')
    .delete()
    .eq('id', ruleId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to remove content rule:', error.message);
    return false;
  }

  invalidateRuleCache(userId);
  return true;
}

// ── Filter level ─────────────────────────────────────────────

export async function getFilterLevel(userId: string): Promise<'off' | 'standard' | 'strict' | 'custom'> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('users')
    .select('content_filter_level')
    .eq('id', userId)
    .single();

  if (error || !data) return 'standard';
  return (data.content_filter_level as 'off' | 'standard' | 'strict' | 'custom') || 'standard';
}

// ── Audit logging ────────────────────────────────────────────

export async function logFilterAction(
  userId: string,
  result: FilterResult,
  domain: string | null,
  appName: string | null
) {
  // Only log blocked or flagged results
  if (!result.blocked && !result.flagged) return;

  const db = createServiceClient();
  const { error } = await db.from('content_filter_log').insert({
    user_id: userId,
    domain: domain || null,
    app_name: appName || null,
    category: result.category,
    action: result.blocked ? 'blocked' : 'flagged',
    confidence: result.confidence,
    source: result.source,
  });
  if (error) console.error('Failed to log filter action:', error.message);
}
