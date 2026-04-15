export const dynamic = 'force-dynamic';

/**
 * POST /api/screen-capture
 *
 * Accepts a base64-encoded JPEG screenshot from the desktop agent,
 * runs Claude Vision analysis against the user's tracked goals,
 * and creates an event if concerning content is detected.
 *
 * The screenshot is NEVER stored — processed in memory only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';
import { checkFeatureGate } from '@/lib/stripe/featureGate';
import { analyzeImage, analyzeScreenshot } from '@/lib/imageAnalysis';
import { runAlertPipeline } from '@/lib/alertPipeline';
import type { ScreenshotMetadata } from '@/lib/imageClassifier';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';
import {
  buildIdempotencyKey,
  getIdempotencyState,
  reserveIdempotencyKey,
  storeIdempotentResponse,
} from '@/lib/idempotency';

const MAX_CAPTURES_PER_HOUR = 20;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const IDEMPOTENCY_TTL_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gate: screen awareness requires Pro+
    const gate = await checkFeatureGate(user.id, 'patternDetection');
    if (!gate.allowed) {
      return NextResponse.json(
        { error: 'Screen awareness requires a Pro plan or higher', upgrade_to: gate.requiredPlan },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { image, metadata: rawMetadata } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Missing base64 image data' }, { status: 400 });
    }

    // Validate size (base64 is ~33% larger than raw)
    const estimatedBytes = Math.ceil(image.length * 0.75);
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image too large. Max 5MB.' }, { status: 400 });
    }

    // Fetch user goals and tracked substances
    const db = createServiceClient();
    const { data: profile } = await db
      .from('users')
      .select('goals, tracked_substances')
      .eq('id', user.id)
      .single();

    const userGoals: string[] = profile?.goals || [];
    const trackedSubstances: string[] = profile?.tracked_substances || [];
    if (userGoals.length === 0) {
      return NextResponse.json({
        analyzed: true,
        categories: [],
        severity: 'low',
        event_id: null,
        message: 'No goals configured — nothing to monitor.',
      });
    }

    // Build screenshot metadata for the pre-classifier
    const screenshotMetadata: ScreenshotMetadata = {
      activeApp: rawMetadata?.activeApp ?? 'Unknown',
      activeUrl: rawMetadata?.activeUrl ?? undefined,
      windowTitle: rawMetadata?.windowTitle ?? undefined,
      timestamp: rawMetadata?.timestamp ?? new Date().toISOString(),
      screenChanged: rawMetadata?.screenChanged ?? true,
    };

    const idempotencyKey = typeof body?.idempotency_key === 'string'
      ? `screen-capture:${user.id}:${body.idempotency_key}`
      : buildIdempotencyKey('screen-capture', user.id, {
          image,
          metadata: screenshotMetadata,
        });

    const existing = await getIdempotencyState(idempotencyKey);
    if (existing.state === 'replay') return existing.response;
    if (existing.state === 'pending') {
      return NextResponse.json(
        { duplicate: true, pending: true },
        { status: 202, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const blocked = await checkDistributedRateLimit({
      scope: 'screen-capture',
      key: user.id,
      max: MAX_CAPTURES_PER_HOUR,
      windowMs: 3_600_000,
    });
    if (blocked) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 20 captures per hour.' },
        { status: 429, headers: blocked.headers },
      );
    }

    const reservation = await reserveIdempotencyKey(
      idempotencyKey,
      'screen-capture',
      user.id,
      IDEMPOTENCY_TTL_MS,
    );
    if (reservation.state === 'replay') return reservation.response;
    if (reservation.state === 'pending') {
      return NextResponse.json(
        { duplicate: true, pending: true },
        { status: 202, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Run selective analysis: pre-classifier first, Vision only if needed
    const substances = trackedSubstances as import('@be-candid/shared').TrackedSubstance[];
    const analysis = rawMetadata
      ? await analyzeScreenshot(image, 'image/jpeg', screenshotMetadata, userGoals, user.id, substances)
      : await analyzeImage(image, 'image/jpeg', userGoals, user.id, substances);

    // Only create an event if something meaningful was detected
    if (analysis.categories.length > 0 && analysis.confidence > 0.7) {
      // Map the first detected image category back to a GoalCategory
      const goalCategory = mapToGoalCategory(analysis.categories, userGoals);

      // Run alert pipeline — it handles event insert, AI guide, partner notification
      const pipelineResult = await runAlertPipeline(user.id, {
        category: goalCategory,
        severity: analysis.severity,
        platform: 'desktop',
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'screen_capture',
          detected_categories: analysis.categories,
          confidence: analysis.confidence,
          nsfw: analysis.nsfw,
          analysis_source: analysis.source,
          app_name: screenshotMetadata.activeApp || 'Screen Capture',
        },
      }).catch((err) => {
        console.error('[screen-capture] Pipeline error:', err);
        return null;
      });

      const responseBody = {
        analyzed: true,
        categories: analysis.categories,
        severity: analysis.severity,
        event_id: pipelineResult ? 'created' : null,
        source: analysis.source,
      };

      await storeIdempotentResponse(idempotencyKey, {
        status: 200,
        body: responseBody,
      });

      return NextResponse.json(responseBody);
    }

    const responseBody = {
      analyzed: true,
      categories: analysis.categories,
      severity: analysis.severity,
      event_id: null,
      source: analysis.source,
    };

    await storeIdempotentResponse(idempotencyKey, {
      status: 200,
      body: responseBody,
    });

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error('[screen-capture] Error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

/**
 * Map image analysis categories back to the user's GoalCategory.
 * Falls back to the first user goal if no direct mapping found.
 */
function mapToGoalCategory(imageCategories: string[], userGoals: string[]): string {
  const IMAGE_TO_GOAL: Record<string, string> = {
    nudity: 'pornography',
    explicit_sexual_content: 'pornography',
    adult_content: 'pornography',
    suggestive_content: 'sexting',
    intimate_messaging: 'sexting',
    gambling_ui: 'gambling',
    casino_interface: 'gambling',
    betting_slip: 'gambling',
    sports_betting_ui: 'sports_betting',
    betting_odds: 'sports_betting',
    dating_app_ui: 'dating_apps',
    dating_profile: 'dating_apps',
    alcohol: 'alcohol_drugs',
    drugs: 'alcohol_drugs',
    substance_use: 'alcohol_drugs',
    vaping: 'vaping_tobacco',
    tobacco: 'vaping_tobacco',
    smoking: 'vaping_tobacco',
    social_media_ui: 'social_media',
    social_feed: 'social_media',
    gaming_ui: 'gaming',
    game_interface: 'gaming',
    shopping_cart: 'impulse_shopping',
    checkout_ui: 'impulse_shopping',
  };

  for (const imgCat of imageCategories) {
    const goalCat = IMAGE_TO_GOAL[imgCat];
    if (goalCat && userGoals.includes(goalCat)) {
      return goalCat;
    }
  }

  // Fallback: return the mapped category even if not in user goals
  for (const imgCat of imageCategories) {
    if (IMAGE_TO_GOAL[imgCat]) return IMAGE_TO_GOAL[imgCat];
  }

  return userGoals[0] || 'custom';
}
