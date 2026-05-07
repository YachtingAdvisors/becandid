// ============================================================
// lib/costTracker.ts — API Cost Monitoring
//
// Logs structured cost data for every Claude API call.
// In production, pipe these to a metrics service (Datadog,
// Axiom, etc.) via structured log ingestion.
// ============================================================

interface CostLogParams {
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  userId: string;
  tier: 'static' | 'haiku' | 'sonnet' | 'crisis' | 'cached';
}

const RATES: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
};

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = RATES[model] || RATES['claude-sonnet-4-6'];
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}

export function logApiCost(params: CostLogParams): void {
  console.info(JSON.stringify({
    type: 'api_cost',
    ...params,
    estimated_cost: calculateCost(params.model, params.inputTokens, params.outputTokens),
    timestamp: new Date().toISOString(),
  }));
}
