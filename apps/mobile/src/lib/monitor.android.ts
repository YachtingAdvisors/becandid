// ============================================================
// mobile/src/lib/monitor.android.ts
//
// Android monitoring integration.
// Wraps NativeModules.UsageStats (available after prebuild with
// a custom native module) and falls back gracefully in Expo Go.
//
// Package name → GoalCategory mapping for ~20 common apps.
// ============================================================

import { checkUrlOnDevice } from './contentFilter.client';
import { recordAppUsage } from './screenTime.client';

// Import the native module from the local Expo module.
// Falls back to null when running in Expo Go (no native code).
let UsageStatsModule: typeof import('../../modules/usage-stats').default | null = null;
try {
  UsageStatsModule = require('../../modules/usage-stats').default;
} catch {
  // Native module not available (e.g. Expo Go)
  UsageStatsModule = null;
}

// ── Types ────────────────────────────────────────────────────

export type GoalCategory =
  | 'adult_content'
  | 'social_media'
  | 'gambling'
  | 'gaming'
  | 'streaming'
  | 'dating'
  | 'other';

export interface UsageStat {
  packageName: string;
  totalTimeInForeground: number; // milliseconds
}

export interface ContentTypeResult {
  category: string | null;
  confidence: number;
}

// ── Package name → GoalCategory map ─────────────────────────

const PACKAGE_CATEGORY_MAP: Record<string, GoalCategory> = {
  // Social media
  'com.zhiliaoapp.musically': 'social_media',      // TikTok
  'com.instagram.android': 'social_media',
  'com.twitter.android': 'social_media',
  'com.snapchat.android': 'social_media',
  'com.facebook.katana': 'social_media',
  'com.reddit.frontpage': 'social_media',
  'com.tumblr': 'social_media',
  'com.pinterest': 'social_media',
  // Streaming / video
  'com.google.android.youtube': 'streaming',
  'com.netflix.mediaclient': 'streaming',
  'com.hulu.plus': 'streaming',
  'com.amazon.avod.thirdpartyclient': 'streaming',  // Prime Video
  'com.twitch.android.app': 'streaming',
  'com.disney.disneyplus': 'streaming',
  // Gaming
  'com.roblox.client': 'gaming',
  'com.activision.callofduty.shooter': 'gaming',
  'com.supercell.clashofclans': 'gaming',
  'com.king.candycrushsaga': 'gaming',
  // Dating
  'com.tinder': 'dating',
  'com.bumble.app': 'dating',
  'co.hinge.app': 'dating',
};

// ── Monitoring interval handle ───────────────────────────────

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

// ── Public API ───────────────────────────────────────────────

/**
 * Request the PACKAGE_USAGE_STATS permission on Android.
 * On Android 5.1+ this requires the user to manually grant access
 * in Settings > Apps > Special App Access > Usage Access.
 *
 * Returns true if permission is granted, false otherwise.
 */
export async function requestUsageStatsPermission(): Promise<boolean> {
  try {
    // PACKAGE_USAGE_STATS is not a runtime permission — it must be
    // granted via the Settings UI. We use the native module to check
    // and open the settings page if needed.
    if (UsageStatsModule) {
      const hasPermission: boolean = await UsageStatsModule.hasPermission();
      if (!hasPermission) {
        await UsageStatsModule.requestPermission();
      }
      return hasPermission;
    }

    // Expo Go fallback — native module not available
    console.warn(
      '[Monitor:Android] UsageStats native module not available. ' +
      'Run `expo prebuild` to enable usage stats.'
    );
    return false;
  } catch (e) {
    console.warn('[Monitor:Android] requestUsageStatsPermission error:', e);
    return false;
  }
}

/**
 * Retrieve app usage stats for the past `hours` hours.
 * Uses NativeModules.UsageStats if available, otherwise returns [].
 */
export async function getAndroidUsageStats(hours: number): Promise<UsageStat[]> {
  try {
    if (UsageStatsModule) {
      const stats: UsageStat[] = await UsageStatsModule.queryUsageStats(hours);
      return Array.isArray(stats) ? stats : [];
    }

    console.warn(
      '[Monitor:Android] UsageStats native module not available — returning empty array.'
    );
    return [];
  } catch (e) {
    console.warn('[Monitor:Android] getAndroidUsageStats error:', e);
    return [];
  }
}

/**
 * Determine the content type for a given URL + package name.
 * Combines URL-based blocklist check with package name heuristics.
 */
export async function detectAndroidContentType(
  url: string,
  appPackage: string
): Promise<ContentTypeResult> {
  // 1. URL check (highest confidence)
  if (url) {
    const urlResult = await checkUrlOnDevice(url);
    if (urlResult.blocked) {
      return { category: urlResult.category, confidence: urlResult.confidence };
    }
  }

  // 2. Package name heuristic
  const mapped = PACKAGE_CATEGORY_MAP[appPackage];
  if (mapped) {
    return { category: mapped, confidence: 0.8 };
  }

  // 3. Partial package name matching
  const lowerPkg = appPackage.toLowerCase();
  if (lowerPkg.includes('porn') || lowerPkg.includes('xxx') || lowerPkg.includes('adult')) {
    return { category: 'adult_content', confidence: 0.7 };
  }
  if (lowerPkg.includes('casino') || lowerPkg.includes('bet') || lowerPkg.includes('poker')) {
    return { category: 'gambling', confidence: 0.65 };
  }
  if (lowerPkg.includes('tinder') || lowerPkg.includes('dating') || lowerPkg.includes('match')) {
    return { category: 'dating', confidence: 0.65 };
  }
  if (lowerPkg.includes('game') || lowerPkg.includes('play')) {
    return { category: 'gaming', confidence: 0.5 };
  }

  return { category: null, confidence: 0 };
}

/**
 * Start periodic usage reporting every 5 minutes.
 * Fetches Android usage stats, maps to categories, and records locally
 * via screenTime.client for later upload.
 */
export function startAndroidMonitoring(config: { userId: string; apiBase: string }): void {
  if (monitoringInterval !== null) {
    console.log('[Monitor:Android] Already running');
    return;
  }

  console.log('[Monitor:Android] Starting monitoring for user', config.userId);

  const run = async () => {
    try {
      const stats = await getAndroidUsageStats(1); // Past hour
      for (const stat of stats) {
        const category = PACKAGE_CATEGORY_MAP[stat.packageName];
        if (category) {
          const minutes = stat.totalTimeInForeground / 60_000;
          if (minutes > 0) {
            await recordAppUsage(stat.packageName, category, minutes);
          }
        }
      }
    } catch (e) {
      console.warn('[Monitor:Android] Monitoring tick error:', e);
    }
  };

  // Run immediately on start, then every 5 minutes
  run();
  monitoringInterval = setInterval(run, 5 * 60 * 1000);
}

/**
 * Stop the periodic monitoring interval.
 */
export function stopAndroidMonitoring(): void {
  if (monitoringInterval !== null) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[Monitor:Android] Monitoring stopped');
  }
}

/**
 * Legacy stub — kept for backward compatibility with _layout.tsx
 */
export async function registerMonitoringTask(): Promise<void> {
  console.log('[Monitor:Android] registerMonitoringTask (stub — use startAndroidMonitoring)');
}
