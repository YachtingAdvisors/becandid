export const dynamic = 'force-dynamic';
// ============================================================
// GET /api/pause/context
//
// Returns context for the "Before You Open" interstitial page:
// - Current focus streak
// - Last journal insight (roadmap or longing, decrypted)
// - Random quote tailored to user's motivator
// - Partner name + phone (if exists)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { calculateFocusStreak } from '@/lib/focusSegments';
import { decryptJournalEntry } from '@/lib/encryption';
import { aiGuideLimiter, checkUserRate } from '@/lib/rateLimit';
import { getRandomQuote, type FoundationalMotivator } from '@be-candid/shared';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(aiGuideLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();

  // Get user profile for timezone and motivator
  const { data: profile } = await db
    .from('users')
    .select('timezone, motivator, name')
    .eq('id', user.id)
    .single();

  const tz = profile?.timezone || 'America/New_York';
  const motivator = (profile?.motivator as FoundationalMotivator) || null;

  // Fetch all context in parallel
  const [streak, journalResult, partnerResult] = await Promise.all([
    // Current streak
    calculateFocusStreak(db, user.id, tz),

    // Most recent journal entry with roadmap or longing
    db.from('stringer_journal')
      .select('roadmap, longing, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),

    // Partner info
    db.from('partners')
      .select('partner_user_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ]);

  // Find first entry with roadmap or longing
  let lastInsight: string | null = null;
  const entries = journalResult.data || [];
  for (const entry of entries) {
    const decrypted = decryptJournalEntry(entry, user.id);
    if (decrypted.roadmap) {
      lastInsight = decrypted.roadmap;
      break;
    }
    if (decrypted.longing) {
      lastInsight = decrypted.longing;
      break;
    }
  }

  // Get partner details if exists
  let partnerName: string | null = null;
  let partnerPhone: string | null = null;
  if (partnerResult.data?.partner_user_id) {
    const { data: partnerProfile } = await db
      .from('users')
      .select('name, phone')
      .eq('id', partnerResult.data.partner_user_id)
      .single();
    partnerName = partnerProfile?.name || null;
    partnerPhone = partnerProfile?.phone || null;
  }

  // Random quote for the user's motivator
  const quote = getRandomQuote(motivator);

  return NextResponse.json({
    streak: streak.streakDays,
    lastInsight,
    quote: { text: quote.text, author: quote.author },
    partner: partnerName ? { name: partnerName, phone: partnerPhone } : null,
  });
}
