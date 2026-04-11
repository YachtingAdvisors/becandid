// ============================================================
// lib/imageAnalysis.ts
//
// AI image analysis using Claude Vision API.
// Analyzes images for concerning content relevant to the
// user's tracked goals. Uses lazy Anthropic instantiation.
//
// COST OPTIMIZATION: A lightweight rule-based pre-classifier
// (imageClassifier.ts) filters 80-90% of screenshots without
// any API call. Only ambiguous cases go to Vision (Haiku).
//
// PRIVACY: Logs that analysis occurred but NEVER stores the image.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import {
  preClassifyScreenshot,
  type ScreenshotMetadata,
  type ClassificationResult,
} from './imageClassifier';
import { logApiCost } from './costTracker';
import type { TrackedSubstance } from '@be-candid/shared';
import { SUBSTANCE_LABELS } from '@be-candid/shared';

export interface ImageAnalysisResult {
  nsfw: boolean;
  confidence: number; // 0-1
  categories: string[]; // e.g., ['nudity', 'gambling_ui', 'dating_app', 'substance']
  severity: 'low' | 'medium' | 'high';
  source: 'classifier' | 'vision';
}

// ── Lazy Anthropic client ────────────────────────────────────

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

// ── Goal → image category mapping (used by both prompt and classifier) ──

const GOAL_TO_IMAGE_CATEGORIES: Record<string, string[]> = {
  pornography: ['nudity', 'explicit_sexual_content', 'adult_content'],
  sexting: ['suggestive_content', 'intimate_messaging'],
  gambling: ['gambling_ui', 'casino_interface', 'betting_slip'],
  sports_betting: ['sports_betting_ui', 'betting_odds'],
  dating_apps: ['dating_app_ui', 'dating_profile'],
  alcohol_drugs: ['alcohol', 'drugs', 'substance_use'],
  vaping_tobacco: ['vaping', 'tobacco', 'smoking'],
  social_media: ['social_media_ui', 'social_feed'],
  gaming: ['gaming_ui', 'game_interface'],
  impulse_shopping: ['shopping_cart', 'checkout_ui'],
  binge_watching: ['streaming_ui', 'video_player'],
  day_trading: ['trading_ui', 'stock_chart'],
};

// ── Selective analysis (pre-classifier + Vision fallback) ───

export async function analyzeScreenshot(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  metadata: ScreenshotMetadata,
  userGoals: string[],
  userId: string,
  trackedSubstances?: TrackedSubstance[]
): Promise<ImageAnalysisResult> {
  // Step 1: Pre-classify using metadata (FREE — no API call)
  const preResult = preClassifyScreenshot(metadata, trackedSubstances);

  logClassifierResult(preResult, userId);

  if (!preResult.needsVisionAnalysis) {
    // Pre-classifier resolved it — skip Vision entirely
    if (preResult.category) {
      const detectedCategories =
        GOAL_TO_IMAGE_CATEGORIES[preResult.category] ?? [preResult.category];
      return {
        nsfw: preResult.category === 'pornography',
        confidence: preResult.confidence,
        categories: detectedCategories,
        severity: preResult.confidence >= 0.9 ? 'high' : 'medium',
        source: 'classifier',
      };
    }
    // Safe — nothing to flag
    return {
      nsfw: false,
      confidence: 0,
      categories: [],
      severity: 'low',
      source: 'classifier',
    };
  }

  // Step 2: Only send to Vision when the pre-classifier says so.
  // Use Haiku for cost savings — sufficient for content classification.
  const result = await analyzeImage(imageBase64, mediaType, userGoals, userId, trackedSubstances);
  return { ...result, source: 'vision' };
}

// ── Cost/ratio logging ──────────────────────────────────────

function logClassifierResult(
  result: ClassificationResult,
  userId: string
): void {
  console.info(
    JSON.stringify({
      type: 'screen_capture_classification',
      needs_vision: result.needsVisionAnalysis,
      reason: result.reason,
      category: result.category,
      confidence: result.confidence,
      user_id: userId,
      timestamp: new Date().toISOString(),
    })
  );
}

// ── Vision analysis function (called only when needed) ──────

export async function analyzeImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  userGoals: string[],
  userId?: string,
  trackedSubstances?: TrackedSubstance[]
): Promise<ImageAnalysisResult> {
  const relevantCategories = userGoals.flatMap(
    (goal) => GOAL_TO_IMAGE_CATEGORIES[goal] || []
  );

  if (relevantCategories.length === 0) {
    return { nsfw: false, confidence: 0, categories: [], severity: 'low', source: 'vision' as const };
  }

  // Build substance-aware context for the prompt
  const substanceContext = buildSubstancePromptContext(userGoals, trackedSubstances);

  const systemPrompt = `You are a content safety classifier for a digital wellness app. Your job is to analyze screenshots and images to determine if they contain content matching the user's tracked categories.

Analyze the image and determine if it contains content matching ANY of these categories: ${relevantCategories.join(', ')}
${substanceContext}

You MUST respond with ONLY valid JSON in this exact format:
{
  "nsfw": boolean,
  "confidence": number between 0 and 1,
  "categories": ["list", "of", "matched", "categories"],
  "severity": "low" | "medium" | "high"
}

Severity guide:
- "low": Mildly related content (e.g., social media feed visible)
- "medium": Clearly related content (e.g., dating app open, betting odds visible)
- "high": Explicit or deeply concerning content (e.g., explicit imagery, active gambling session)

If no categories match, return: {"nsfw": false, "confidence": 0, "categories": [], "severity": "low"}

Respond with ONLY the JSON object, no explanation.`;

  try {
    const visionModel =
      process.env.ANTHROPIC_VISION_MODEL || 'claude-haiku-4-5-20251001';

    const response = await getAnthropic().messages.create({
      model: visionModel,
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Classify this image.',
            },
          ],
        },
      ],
    });

    // Log Vision API cost
    if (userId) {
      logApiCost({
        feature: 'screen_capture_vision',
        model: visionModel,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        userId,
        tier: 'haiku',
      });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    return {
      nsfw: Boolean(parsed.nsfw),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'low',
      source: 'vision' as const,
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    // Fail open — don't block on analysis errors
    return { nsfw: false, confidence: 0, categories: [], severity: 'low', source: 'vision' as const };
  }
}

// ── Substance-aware prompt context ─────────────────────────

function buildSubstancePromptContext(
  userGoals: string[],
  trackedSubstances?: TrackedSubstance[]
): string {
  const hasSubstanceGoal =
    userGoals.includes('alcohol_drugs') || userGoals.includes('vaping_tobacco');

  if (!hasSubstanceGoal) return '';

  if (trackedSubstances && trackedSubstances.length > 0) {
    const substanceNames = trackedSubstances
      .map((s) => SUBSTANCE_LABELS[s])
      .join(', ');
    return `
SUBSTANCE-SPECIFIC MONITORING:
The user is specifically monitoring these substances: ${substanceNames}.
Check if this screenshot shows: bars, liquor stores, dispensaries, drink menus, substance-related content, delivery apps, or any content related to these specific substances.
Do NOT flag other substances the user is not tracking. Only flag content related to the substances listed above.`;
  }

  return `
SUBSTANCE MONITORING:
The user is tracking substance-related content. Check for bars, liquor stores, dispensaries, drink menus, substance-related content, or delivery apps.`;
}
