// Gemini Flash 2.0 client for non-therapeutic AI tasks
// Used for content categorization, severity assessment, etc.
// Therapeutic conversation guides still use Claude.

import { GoogleGenerativeAI } from '@google/generative-ai';

let _client: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

export async function geminiClassify(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function geminiJSON<T = any>(systemPrompt: string, userPrompt: string): Promise<T> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
  const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
  const text = result.response.text();
  return JSON.parse(text);
}

// Check if Gemini is available (key configured)
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
