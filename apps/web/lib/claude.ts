// ============================================================
// Be Candid — Claude AI Conversation Guide Generator
// Updated with category-specific sensitivity guidance
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { GOAL_LABELS, type GoalCategory, type Severity, type RelationshipType } from '@be-candid/shared';
import { buildCategoryPromptAddition, CATEGORY_GUIDANCE } from './categoryGuidance';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

export interface AIConversationGuide {
  for_user: {
    opening: string;
    how_to_be_honest: string;
    what_to_ask_for: string;
    affirmation: string;
    professional_resources?: string;
  };
  for_partner: {
    opening: string;
    what_not_to_say: string[];
    questions: string[];
    how_to_create_safety: string;
  };
}

const BASE_SYSTEM_PROMPT = `You are a compassionate, psychologically-informed conversation coach. Your role is to help people have honest, productive accountability conversations around digital habits and behavioral patterns.

Core principles:
- Motivational Interviewing (MI) framework throughout
- ZERO shame language — growth framing only
- You never moralize or judge — you empower
- You acknowledge the difficulty and courage of accountability
- You treat each person's goals as valid and self-determined

Output ONLY valid JSON — no markdown fences, no preamble.`;

export async function generateConversationGuide(params: {
  category: GoalCategory;
  severity: Severity;
  userName: string;
  partnerName: string;
  relationshipType: RelationshipType;
}): Promise<AIConversationGuide> {
  const { category, severity, userName, partnerName, relationshipType } = params;
  const categoryLabel = GOAL_LABELS[category] ?? category;

  // Build the category-specific system prompt addition
  const categoryAddition = buildCategoryPromptAddition(category);
  const guidance = CATEGORY_GUIDANCE[category];

  // For clinical categories, add the professional resources requirement
  const resourceInstruction = guidance.sensitivity === 'clinical'
    ? '\n\nIMPORTANT: Include a "professional_resources" field in the for_user section with a gentle suggestion to speak with a professional, plus any relevant helpline numbers.'
    : '';

  const systemPrompt = BASE_SYSTEM_PROMPT + categoryAddition;

  const prompt = `A ${severity} severity flag was triggered for "${categoryLabel}" for ${userName}.
Their accountability partner is ${partnerName} (relationship: ${relationshipType}).

Generate a conversation preparation guide as JSON with this exact structure:

{
  "for_user": {
    "opening": "A 2-3 sentence script for how ${userName} can open the conversation with ${partnerName}. Honest, vulnerable, not over-explaining.",
    "how_to_be_honest": "2-3 sentences coaching ${userName} on being transparent without drowning in detail or defensive justification.",
    "what_to_ask_for": "1-2 sentences on what ${userName} can specifically ask for from ${partnerName} — e.g. check-ins, questions, patience.",
    "affirmation": "A single empowering sentence reminding ${userName} that seeking accountability is strength, not weakness."${guidance.sensitivity === 'clinical' ? ',\n    "professional_resources": "A gentle 1-2 sentence suggestion to consider professional support, with any relevant helpline numbers."' : ''}
  },
  "for_partner": {
    "opening": "A 2-3 sentence script for how ${partnerName} can begin the conversation. Non-accusatory, curious, warm.",
    "what_not_to_say": ["3-4 specific phrases or approaches to avoid, each as a short string"],
    "questions": ["2-3 open-ended MI-style questions to invite ${userName} to reflect — each as a full question string"],
    "how_to_create_safety": "2-3 sentences on how ${partnerName} can signal that this is a safe space, not a courtroom."
  }
}${resourceInstruction}`;

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as AIConversationGuide;
}

// Format guide as HTML email section
export function formatGuideForEmail(
  guide: AIConversationGuide,
  role: 'user' | 'partner',
  recipientName: string
): string {
  if (role === 'user') {
    const g = guide.for_user;
    return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <h2 style="color: #4f46e5; font-size: 20px; margin-bottom: 8px;">Your Conversation Guide</h2>
  <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Hey ${recipientName} — here's how to show up for this conversation.</p>

  <div style="background: #f8f7ff; border-left: 3px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; margin: 0 0 8px;">How to open</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151;">${g.opening}</p>
  </div>

  <div style="background: #f8f7ff; border-left: 3px solid #7c3aed; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #7c3aed; margin: 0 0 8px;">How to be honest</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151;">${g.how_to_be_honest}</p>
  </div>

  <div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; margin: 0 0 8px;">What to ask for</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151;">${g.what_to_ask_for}</p>
  </div>

  <div style="background: #fefce8; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
    <p style="margin: 0; font-style: italic; color: #92400e; line-height: 1.6;">"${g.affirmation}"</p>
  </div>

  ${g.professional_resources ? `
  <div style="background: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #3b82f6; margin: 0 0 8px;">Additional support</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 13px;">${g.professional_resources}</p>
  </div>` : ''}
</div>`;
  }

  // Partner guide
  const g = guide.for_partner;
  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
  <h2 style="color: #4f46e5; font-size: 20px; margin-bottom: 8px;">Partner Conversation Guide</h2>
  <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Hey ${recipientName} — here's how to show up for this conversation.</p>

  <div style="background: #f8f7ff; border-left: 3px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; margin: 0 0 8px;">How to open</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151;">${g.opening}</p>
  </div>

  <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #ef4444; margin: 0 0 8px;">What NOT to say or do</h3>
    <ul style="margin: 0; padding-left: 18px; color: #374151; line-height: 1.8;">
      ${g.what_not_to_say.map(w => `<li>${w}</li>`).join('')}
    </ul>
  </div>

  <div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; margin: 0 0 8px;">Questions to ask</h3>
    <ul style="margin: 0; padding-left: 18px; color: #374151; line-height: 1.8;">
      ${g.questions.map(q => `<li>${q}</li>`).join('')}
    </ul>
  </div>

  <div style="background: #f8f7ff; border-left: 3px solid #7c3aed; padding: 16px; border-radius: 0 8px 8px 0;">
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #7c3aed; margin: 0 0 8px;">Creating safety</h3>
    <p style="margin: 0; line-height: 1.6; color: #374151;">${g.how_to_create_safety}</p>
  </div>
</div>`;
}
