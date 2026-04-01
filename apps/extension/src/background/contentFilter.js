/**
 * Local content filter — checks domains against hardcoded blocklist.
 * No server calls needed. User rules loaded from cached settings.
 */

// Blocked domains: explicit content, gambling, dating
const BLOCKED_DOMAINS = new Map([
  // Pornography
  ['pornhub.com', { category: 'pornography', confidence: 0.99 }],
  ['xvideos.com', { category: 'pornography', confidence: 0.99 }],
  ['xnxx.com', { category: 'pornography', confidence: 0.99 }],
  ['xhamster.com', { category: 'pornography', confidence: 0.99 }],
  ['redtube.com', { category: 'pornography', confidence: 0.99 }],
  ['youporn.com', { category: 'pornography', confidence: 0.99 }],
  ['tube8.com', { category: 'pornography', confidence: 0.99 }],
  ['spankbang.com', { category: 'pornography', confidence: 0.99 }],
  ['onlyfans.com', { category: 'pornography', confidence: 0.85 }],
  ['chaturbate.com', { category: 'pornography', confidence: 0.95 }],
  ['stripchat.com', { category: 'pornography', confidence: 0.95 }],
  // Gambling / Sports Betting
  ['draftkings.com', { category: 'sports_betting', confidence: 0.95 }],
  ['fanduel.com', { category: 'sports_betting', confidence: 0.95 }],
  ['bovada.lv', { category: 'gambling', confidence: 0.95 }],
  ['bet365.com', { category: 'gambling', confidence: 0.95 }],
  ['betmgm.com', { category: 'sports_betting', confidence: 0.95 }],
  ['caesars.com/sportsbook', { category: 'sports_betting', confidence: 0.90 }],
  ['pokerstars.com', { category: 'gambling', confidence: 0.95 }],
  ['stake.com', { category: 'gambling', confidence: 0.90 }],
  // Dating Apps
  ['tinder.com', { category: 'dating_apps', confidence: 0.90 }],
  ['bumble.com', { category: 'dating_apps', confidence: 0.90 }],
  ['hinge.co', { category: 'dating_apps', confidence: 0.90 }],
  ['match.com', { category: 'dating_apps', confidence: 0.85 }],
  ['okcupid.com', { category: 'dating_apps', confidence: 0.85 }],
  // Day Trading
  ['robinhood.com', { category: 'day_trading', confidence: 0.60 }],
  ['webull.com', { category: 'day_trading', confidence: 0.60 }],
]);

// Flagged domains: social media, gaming, streaming (lower severity)
const FLAGGED_DOMAINS = new Map([
  ['tiktok.com', { category: 'social_media', confidence: 0.70 }],
  ['instagram.com', { category: 'social_media', confidence: 0.60 }],
  ['twitter.com', { category: 'social_media', confidence: 0.50 }],
  ['x.com', { category: 'social_media', confidence: 0.50 }],
  ['reddit.com', { category: 'social_media', confidence: 0.50 }],
  ['facebook.com', { category: 'social_media', confidence: 0.40 }],
  ['snapchat.com', { category: 'social_media', confidence: 0.50 }],
  ['youtube.com', { category: 'binge_watching', confidence: 0.40 }],
  ['netflix.com', { category: 'binge_watching', confidence: 0.50 }],
  ['twitch.tv', { category: 'gaming', confidence: 0.50 }],
  ['store.steampowered.com', { category: 'gaming', confidence: 0.50 }],
  ['discord.com', { category: 'gaming', confidence: 0.40 }],
  ['amazon.com', { category: 'impulse_shopping', confidence: 0.30 }],
  ['ebay.com', { category: 'impulse_shopping', confidence: 0.30 }],
  ['shein.com', { category: 'impulse_shopping', confidence: 0.50 }],
  // News sites (social_media category covers "Social Media & News")
  ['cnn.com', { category: 'social_media', confidence: 0.40 }],
  ['foxnews.com', { category: 'social_media', confidence: 0.40 }],
  ['msnbc.com', { category: 'social_media', confidence: 0.40 }],
  ['bbc.com', { category: 'social_media', confidence: 0.30 }],
  ['nytimes.com', { category: 'social_media', confidence: 0.30 }],
  ['washingtonpost.com', { category: 'social_media', confidence: 0.30 }],
  ['zerohedge.com', { category: 'social_media', confidence: 0.50 }],
  ['dailymail.co.uk', { category: 'social_media', confidence: 0.40 }],
  ['huffpost.com', { category: 'social_media', confidence: 0.40 }],
  ['breitbart.com', { category: 'social_media', confidence: 0.50 }],
  ['drudgereport.com', { category: 'social_media', confidence: 0.40 }],
  ['news.ycombinator.com', { category: 'social_media', confidence: 0.40 }],
  ['threads.net', { category: 'social_media', confidence: 0.50 }],
  ['bsky.app', { category: 'social_media', confidence: 0.50 }],
  ['mastodon.social', { category: 'social_media', confidence: 0.50 }],
  ['pinterest.com', { category: 'social_media', confidence: 0.40 }],
  ['linkedin.com', { category: 'social_media', confidence: 0.30 }],
  ['tumblr.com', { category: 'social_media', confidence: 0.50 }],
]);

let cachedUserRules = null;

/**
 * Set user rules from extension settings.
 */
export function setUserRules(rules) {
  cachedUserRules = rules;
}

/**
 * Check a domain against the content filter.
 * Returns: { blocked, flagged, category, confidence }
 */
export function checkDomain(domain) {
  if (!domain) return { blocked: false, flagged: false, category: null, confidence: 0 };

  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  // Check user allow rules first (override everything)
  if (cachedUserRules) {
    const allowRule = cachedUserRules.find(r => r.rule_type === 'allow' && normalizedDomain.includes(r.domain));
    if (allowRule) return { blocked: false, flagged: false, category: null, confidence: 1.0, source: 'user_allow' };

    const blockRule = cachedUserRules.find(r => r.rule_type === 'block' && normalizedDomain.includes(r.domain));
    if (blockRule) return { blocked: true, flagged: false, category: blockRule.category || 'custom', confidence: 1.0, source: 'user_block' };
  }

  // Check blocked domains
  for (const [blockedDomain, info] of BLOCKED_DOMAINS) {
    if (normalizedDomain === blockedDomain || normalizedDomain.endsWith('.' + blockedDomain)) {
      return { blocked: true, flagged: false, ...info, source: 'curated' };
    }
  }

  // Check flagged domains
  for (const [flaggedDomain, info] of FLAGGED_DOMAINS) {
    if (normalizedDomain === flaggedDomain || normalizedDomain.endsWith('.' + flaggedDomain)) {
      return { blocked: false, flagged: true, ...info, source: 'curated' };
    }
  }

  return { blocked: false, flagged: false, category: null, confidence: 0 };
}
