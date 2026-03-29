// ============================================================
// mobile/src/lib/monitor.ios.ts
//
// iOS monitoring integration.
// iOS Screen Time API requires native entitlements (ManagedSettings
// + FamilyControls frameworks) that are only available after
// `expo prebuild` with a custom native module.
//
// All NativeModule calls are wrapped in try/catch for Expo Go safety.
// Bundle ID → GoalCategory mapping for ~20 common iOS apps.
// ============================================================

import { NativeModules } from 'react-native';
import { checkUrlOnDevice } from './contentFilter.client';
import { recordAppUsage } from './screenTime.client';

// ── Types ────────────────────────────────────────────────────

export type GoalCategory =
  | 'adult_content'
  | 'social_media'
  | 'gambling'
  | 'gaming'
  | 'streaming'
  | 'dating'
  | 'other';

export interface IOSAppUsage {
  bundleId: string;
  minutes: number;
}

export interface ContentTypeResult {
  category: string | null;
  confidence: number;
}

// ── Bundle ID → GoalCategory map ────────────────────────────

const BUNDLE_CATEGORY_MAP: Record<string, GoalCategory> = {
  // Social media
  'com.zhiliaoapp.musically': 'social_media',       // TikTok
  'com.burbn.instagram': 'social_media',             // Instagram
  'com.atebits.Tweetie2': 'social_media',            // Twitter/X
  'com.toyopagroup.picaboo': 'social_media',         // Snapchat
  'com.facebook.Facebook': 'social_media',
  'com.reddit.Reddit': 'social_media',
  'com.tumblr.tumblr': 'social_media',
  'pinterest': 'social_media',
  // Streaming / video
  'com.google.ios.youtube': 'streaming',
  'com.netflix.Netflix': 'streaming',
  'com.hulu.plus': 'streaming',
  'com.amazon.aiv.AIVApp': 'streaming',              // Prime Video
  'tv.twitch': 'streaming',
  'com.disney.disneyplus': 'streaming',
  'com.hbo.hbonow': 'streaming',                     // Max / HBO
  // Gaming
  'com.roblox.robloxmobile': 'gaming',
  'com.activision.codm': 'gaming',
  'com.supercell.magic': 'gaming',                   // Clash of Clans
  'com.king.candycrushsaga': 'gaming',
  // Dating
  'com.cardify.tinder': 'dating',
  'com.bumble.app': 'dating',
  'co.hinge.mobile': 'dating',
};

// ── Monitoring interval handle ───────────────────────────────

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

// ── Public API ───────────────────────────────────────────────

/**
 * Request Screen Time permission on iOS.
 *
 * NOTE: iOS Screen Time API (FamilyControls) requires the
 * com.apple.developer.family-controls entitlement, which is only
 * available via Apple's Family Controls entitlement request process.
 * This cannot be granted at runtime in Expo Go.
 *
 * Always returns false — log explains what is required.
 */
export async function requestScreenTimePermission(): Promise<boolean> {
  console.log(
    '[Monitor:iOS] Screen Time API requires the com.apple.developer.family-controls ' +
    'entitlement and native FamilyControls framework integration. ' +
    'Run `expo prebuild`, add the entitlement in your provisioning profile, ' +
    'and implement NativeModules.ScreenTime to enable this feature.'
  );

  try {
    if (
      NativeModules.ScreenTime &&
      typeof NativeModules.ScreenTime.requestAuthorization === 'function'
    ) {
      const granted: boolean = await NativeModules.ScreenTime.requestAuthorization();
      return granted;
    }
  } catch (e) {
    console.warn('[Monitor:iOS] requestScreenTimePermission error:', e);
  }

  return false;
}

/**
 * Fetch per-app usage for the past `days` days.
 * Uses NativeModules.ScreenTime if available, otherwise returns [].
 */
export async function getIOSAppUsage(days: number): Promise<IOSAppUsage[]> {
  try {
    if (
      NativeModules.ScreenTime &&
      typeof NativeModules.ScreenTime.queryAppUsage === 'function'
    ) {
      const usage: IOSAppUsage[] = await NativeModules.ScreenTime.queryAppUsage(days);
      return Array.isArray(usage) ? usage : [];
    }

    // Native module not available (Expo Go)
    return [];
  } catch (e) {
    console.warn('[Monitor:iOS] getIOSAppUsage error:', e);
    return [];
  }
}

/**
 * Determine content type from a URL + iOS bundle ID.
 * Combines URL blocklist check with bundle ID heuristics.
 */
export async function detectIOSContentType(
  url: string,
  bundleId: string
): Promise<ContentTypeResult> {
  // 1. URL check (highest confidence)
  if (url) {
    const urlResult = await checkUrlOnDevice(url);
    if (urlResult.blocked) {
      return { category: urlResult.category, confidence: urlResult.confidence };
    }
  }

  // 2. Exact bundle ID mapping
  const mapped = BUNDLE_CATEGORY_MAP[bundleId];
  if (mapped) {
    return { category: mapped, confidence: 0.8 };
  }

  // 3. Partial bundle ID heuristics
  const lower = bundleId.toLowerCase();
  if (lower.includes('porn') || lower.includes('xxx') || lower.includes('adult')) {
    return { category: 'adult_content', confidence: 0.7 };
  }
  if (lower.includes('casino') || lower.includes('bet') || lower.includes('poker')) {
    return { category: 'gambling', confidence: 0.65 };
  }
  if (lower.includes('tinder') || lower.includes('dating') || lower.includes('match')) {
    return { category: 'dating', confidence: 0.65 };
  }
  if (lower.includes('game') || lower.includes('games')) {
    return { category: 'gaming', confidence: 0.5 };
  }

  return { category: null, confidence: 0 };
}

/**
 * Start periodic iOS usage reporting every 5 minutes.
 * Fetches Screen Time data (if native module available), maps to
 * categories, and records locally for later upload.
 */
export function startIOSMonitoring(config: { userId: string; apiBase: string }): void {
  if (monitoringInterval !== null) {
    console.log('[Monitor:iOS] Already running');
    return;
  }

  console.log('[Monitor:iOS] Starting monitoring for user', config.userId);

  const run = async () => {
    try {
      const usage = await getIOSAppUsage(1); // Past day
      for (const app of usage) {
        const category = BUNDLE_CATEGORY_MAP[app.bundleId];
        if (category && app.minutes > 0) {
          await recordAppUsage(app.bundleId, category, app.minutes);
        }
      }
    } catch (e) {
      console.warn('[Monitor:iOS] Monitoring tick error:', e);
    }
  };

  run();
  monitoringInterval = setInterval(run, 5 * 60 * 1000);
}

/**
 * Stop the periodic monitoring interval.
 */
export function stopIOSMonitoring(): void {
  if (monitoringInterval !== null) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[Monitor:iOS] Monitoring stopped');
  }
}

/**
 * Legacy stub — kept for backward compatibility with _layout.tsx
 */
export async function registerMonitoringTask(): Promise<void> {
  console.log('[Monitor:iOS] registerMonitoringTask (stub — use startIOSMonitoring)');
}
