// ============================================================
// lib/imageAnalysis.ts
//
// AI image analysis using Claude Vision API.
// Analyzes images for concerning content relevant to the
// user's tracked goals. Uses lazy Anthropic instantiation.
//
// PRIVACY: Logs that analysis occurred but NEVER stores the image.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';

export interface ImageAnalysisResult {
  nsfw: boolean;
  confidence: number; // 0-1
  categories: string[]; // e.g., ['nudity', 'gambling_ui', 'dating_app', 'substance']
  severity: 'low' | 'medium' | 'high';
}

// ── Lazy Anthropic client ────────────────────────────────────

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

// ── Category mapping for the prompt ──────────────────────────

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
};

// ── Main analysis function ───────────────────────────────────

export async function analyzeImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  userGoals: string[]
): Promise<ImageAnalysisResult> {
  const relevantCategories = userGoals.flatMap(
    (goal) => GOAL_TO_IMAGE_CATEGORIES[goal] || []
  );

  if (relevantCategories.length === 0) {
    return { nsfw: false, confidence: 0, categories: [], severity: 'low' };
  }

  const systemPrompt = `You are a content safety classifier for a digital wellness app. Your job is to analyze screenshots and images to determine if they contain content matching the user's tracked categories.

Analyze the image and determine if it contains content matching ANY of these categories: ${relevantCategories.join(', ')}

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
    const response = await getAnthropic().messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
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
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    // Fail open — don't block on analysis errors
    return { nsfw: false, confidence: 0, categories: [], severity: 'low' };
  }
}
