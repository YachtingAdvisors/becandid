// Content classification using Gemini Flash (cheaper than Claude)
// Falls back gracefully if Gemini is not configured

import { geminiJSON, isGeminiAvailable } from './gemini';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

interface ClassificationResult {
  category: GoalCategory;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  reason: string;
}

const CATEGORIES = Object.entries(GOAL_LABELS)
  .map(([key, label]) => `- ${key}: ${label}`)
  .join('\n');

export async function classifyContent(
  domain: string,
  title?: string,
  context?: string,
): Promise<ClassificationResult | null> {
  if (!isGeminiAvailable()) return null;

  try {
    const result = await geminiJSON<ClassificationResult>(
      `You are a content classifier for a digital wellness app. Classify the following web content into one of these categories:\n${CATEGORIES}\n\nRespond with JSON: { "category": "category_key", "severity": "low|medium|high", "confidence": 0.0-1.0, "reason": "brief reason" }`,
      `Domain: ${domain}${title ? `\nPage title: ${title}` : ''}${context ? `\nContext: ${context}` : ''}`,
    );
    return result;
  } catch (e) {
    console.error('[contentClassifier] Gemini classification failed:', e);
    return null;
  }
}
