export const dynamic = 'force-dynamic';
// ============================================================
// app/api/image-analyze/route.ts
//
// POST endpoint for AI image analysis.
// Accepts a base64 image, calls Claude Vision, returns result.
// Rate limited: 5/hour (expensive API call).
// Audit logged (but image is NEVER stored).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { checkUserRate, rateLimitResponse } from '@/lib/rateLimit';
import { analyzeImage } from '@/lib/imageAnalysis';

// ── Dedicated rate limiter for image analysis (5/hour) ───────

const IMAGE_ANALYSIS_STORE = new Map<string, { count: number; resetAt: number }>();

function checkImageRate(userId: string): boolean {
  const now = Date.now();
  const entry = IMAGE_ANALYSIS_STORE.get(userId);
  if (!entry || now > entry.resetAt) {
    IMAGE_ANALYSIS_STORE.set(userId, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type ValidMediaType = typeof VALID_MEDIA_TYPES[number];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB base64 string length limit

// ── POST ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkImageRate(user.id)) {
    return rateLimitResponse(3600);
  }

  let body: { image: string; media_type: string; goals?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { image, media_type, goals } = body;

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'Missing image (base64 string)' }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
  }
  if (!media_type || !VALID_MEDIA_TYPES.includes(media_type as ValidMediaType)) {
    return NextResponse.json(
      { error: `Invalid media_type. Must be one of: ${VALID_MEDIA_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // Fetch user goals if not provided
  let userGoals = goals;
  if (!userGoals || userGoals.length === 0) {
    const db = createServiceClient();
    const { data: userData } = await db
      .from('users')
      .select('goals')
      .eq('id', user.id)
      .single();
    userGoals = userData?.goals || [];
  }

  const result = await analyzeImage(
    image,
    media_type as ValidMediaType,
    userGoals || []
  );

  // Audit log (NEVER store the image itself)
  const db = createServiceClient();
  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'image_analyzed',
    metadata: {
      nsfw: result.nsfw,
      severity: result.severity,
      categories: result.categories,
      confidence: result.confidence,
    },
  });

  // Log to content_filter_log if flagged
  if (result.nsfw || result.severity !== 'low') {
    await db.from('content_filter_log').insert({
      user_id: user.id,
      domain: null,
      app_name: 'image_analysis',
      category: result.categories[0] || 'unknown',
      action: result.nsfw ? 'blocked' : 'flagged',
      confidence: result.confidence,
      source: 'ai',
    });
  }

  return NextResponse.json({ result });
}
