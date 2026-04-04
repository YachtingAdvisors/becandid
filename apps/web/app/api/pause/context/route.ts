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
import { decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';
import { getRandomQuote, type FoundationalMotivator } from '@be-candid/shared';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  try {
    const db = createServiceClient();

    // Get user profile for timezone and motivator
    const { data: profile } = await db
      .from('users')
      .select('timezone, motivator, display_name')
      .eq('id', user.id)
      .single();

    const tz = profile?.timezone || 'America/New_York';
    const motivator = (profile?.motivator as FoundationalMotivator) || null;

    // Fetch all context in parallel
    const [streak, journalResult, partnerResult, topValueResult] = await Promise.all([
      // Current streak
      calculateFocusStreak(db, user.id, tz),

      // Most recent journal entry with roadmap or longing
      db.from('stringer_journal')
        .select('roadmap, longing, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),

      // Partner info — fetch partner_user_id + stored partner_name/phone
      db.from('partners')
        .select('partner_user_id, partner_name, partner_phone')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .maybeSingle(),

      // Top user value (#1 ranked)
      db.from('user_values')
        .select('value_name, rival_conflict')
        .eq('user_id', user.id)
        .eq('rank', 1)
        .maybeSingle(),
    ]);

    // Find first entry with roadmap or longing
    let lastInsight: string | null = null;
    let lastInsightDate: string | null = null;
    const entries = journalResult.data || [];
    for (const entry of entries) {
      const decrypted = decryptJournalEntry(entry, user.id);
      if (decrypted.roadmap) {
        lastInsight = truncateInsight(decrypted.roadmap);
        lastInsightDate = decrypted.created_at;
        break;
      }
      if (decrypted.longing && !lastInsight) {
        lastInsight = truncateInsight(decrypted.longing);
        lastInsightDate = decrypted.created_at;
      }
    }

    // Resolve partner details — use stored name, fall back to partner's user profile
    let partnerName: string | null = partnerResult.data?.partner_name || null;
    let partnerPhone: string | null = partnerResult.data?.partner_phone || null;
    if (partnerResult.data?.partner_user_id && !partnerName) {
      const { data: partnerProfile } = await db
        .from('users')
        .select('display_name, phone')
        .eq('id', partnerResult.data.partner_user_id)
        .single();
      partnerName = partnerProfile?.display_name || null;
      partnerPhone = partnerPhone || partnerProfile?.phone || null;
    }

    // Random quote for the user's motivator
    const quote = getRandomQuote(motivator);

    // Resolve top value (decrypt rival_conflict if present)
    let topValue: { name: string; conflict: string | null } | null = null;
    if (topValueResult.data) {
      topValue = {
        name: topValueResult.data.value_name,
        conflict: topValueResult.data.rival_conflict
          ? decrypt(topValueResult.data.rival_conflict, user.id)
          : null,
      };
    }

    return NextResponse.json({
      streak: streak.streakDays,
      lastInsight,
      lastInsightDate,
      quote: { text: quote.text, author: quote.author, ref: quote.ref },
      partner: partnerName ? { name: partnerName, phone: partnerPhone } : null,
      userName: profile?.display_name || null,
      topValue,
    });
  } catch (err) {
    console.error('Pause context error:', err);
    return NextResponse.json({ error: safeError(err) }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────

/** Truncate journal insight to a reasonable display length */
function truncateInsight(text: string, maxLen = 180): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  const lastPeriod = cut.lastIndexOf('.');
  if (lastPeriod > maxLen * 0.5) return cut.slice(0, lastPeriod + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : maxLen) + '...';
}
