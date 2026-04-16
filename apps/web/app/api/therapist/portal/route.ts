export const dynamic = 'force-dynamic';
// ============================================================
// app/api/therapist/portal/route.ts
//
// GET → fetch client data for the therapist portal
// Requires: authenticated therapist with accepted connection
// Respects: granular consent settings per connection
//
// Query params:
//   ?client_id=<uuid>       → which client to view
//   ?section=journal|moods|streaks|outcomes|patterns|family_systems|summary
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decryptJournalEntries, decrypt } from '@/lib/encryption';
import { analyzeFamilySystems } from '@/lib/stringerAnalysis';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  const section = url.searchParams.get('section') || 'summary';

  if (!clientId) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });

  const db = createServiceClient();

  // Verify therapist has an accepted connection to this client
  const { data: connection } = await db.from('therapist_connections')
    .select('can_see_journal, can_see_moods, can_see_streaks, can_see_outcomes, can_see_patterns, can_see_family_systems')
    .eq('therapist_user_id', user.id)
    .eq('user_id', clientId)
    .eq('status', 'accepted')
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'No active connection to this client' }, { status: 403 });
  }

  const { data: client } = await db.from('users')
    .select('name, created_at').eq('id', clientId).single();

  // Route to requested section (respecting consent)
  switch (section) {
    case 'journal': {
      if (!connection.can_see_journal) return NextResponse.json({ error: 'Access not granted for journal' }, { status: 403 });

      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
      const { data: rawEntries } = await db.from('stringer_journal')
        .select('id, created_at, trigger_type, mood, tags, freewrite, tributaries, longing, roadmap')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const entries = decryptJournalEntries(rawEntries || [], clientId);

      return NextResponse.json({
        client_name: client?.name,
        section: 'journal',
        entries: entries.map((e: any) => ({
          id: e.id,
          created_at: e.created_at,
          trigger_type: e.trigger_type,
          mood: e.mood,
          tags: e.tags,
          freewrite: e.freewrite,
          tributaries: e.tributaries,
          longing: e.longing,
          roadmap: e.roadmap,
        })),
      });
    }

    case 'moods': {
      if (!connection.can_see_moods) return NextResponse.json({ error: 'Access not granted for moods' }, { status: 403 });

      const { data: moodData } = await db.from('stringer_journal')
        .select('created_at, mood')
        .eq('user_id', clientId)
        .not('mood', 'is', null)
        .order('created_at', { ascending: true })
        .limit(90);

      const { data: checkinMoods } = await db.from('check_ins')
        .select('created_at, mood')
        .eq('user_id', clientId)
        .not('mood', 'is', null)
        .order('created_at', { ascending: true })
        .limit(90);

      return NextResponse.json({
        client_name: client?.name,
        section: 'moods',
        journal_moods: moodData || [],
        checkin_moods: checkinMoods || [],
      });
    }

    case 'streaks': {
      if (!connection.can_see_streaks) return NextResponse.json({ error: 'Access not granted for streaks' }, { status: 403 });

      const { data: segments } = await db.from('focus_segments')
        .select('date, status, period')
        .eq('user_id', clientId)
        .order('date', { ascending: false })
        .limit(60);

      const { data: milestones } = await db.from('milestones')
        .select('type, value, achieved_at')
        .eq('user_id', clientId)
        .order('achieved_at', { ascending: false });

      const { data: trustPoints } = await db.from('trust_points')
        .select('points')
        .eq('user_id', clientId);

      const totalPoints = (trustPoints || []).reduce((s: number, t: any) => s + t.points, 0);

      return NextResponse.json({
        client_name: client?.name,
        section: 'streaks',
        segments: segments || [],
        milestones: milestones || [],
        total_trust_points: totalPoints,
      });
    }

    case 'outcomes': {
      if (!connection.can_see_outcomes) return NextResponse.json({ error: 'Access not granted for outcomes' }, { status: 403 });

      const { data: outcomes } = await db.from('conversation_outcomes')
        .select('created_at, user_rating, user_felt, partner_rating, partner_felt, ai_reflection, alerts(category, severity)')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({
        client_name: client?.name,
        section: 'outcomes',
        outcomes: (outcomes || []).map((o: any) => ({
          ...o,
          ai_reflection: o.ai_reflection ? decrypt(o.ai_reflection, clientId) : null,
        })),
      });
    }

    case 'patterns': {
      if (!connection.can_see_patterns) {
        return NextResponse.json({ error: 'Access not granted for patterns' }, { status: 403 });
      }

      // Time pattern analysis — events by hour and day
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data: events } = await db.from('events')
        .select('category, severity, timestamp')
        .eq('user_id', clientId)
        .gte('timestamp', ninetyDaysAgo)
        .order('timestamp', { ascending: false });

      const hourCounts = new Array(24).fill(0);
      const dayCounts = new Array(7).fill(0);
      const categoryCounts: Record<string, number> = {};

      for (const e of (events || [])) {
        const dt = new Date(e.timestamp);
        hourCounts[dt.getUTCHours()]++;
        dayCounts[dt.getUTCDay()]++;
        categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
      }

      // Recent nudges
      const { data: nudges } = await db.from('nudges')
        .select('trigger_type, category, message, severity, sent_at')
        .eq('user_id', clientId)
        .order('sent_at', { ascending: false })
        .limit(20);

      // Frequency: last 7 days vs previous 30-day baseline
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const recentEvents = (events || []).filter(e => new Date(e.timestamp) > sevenDaysAgo);
      const baselineEvents = (events || []).filter(e => {
        const d = new Date(e.timestamp);
        return d > thirtyDaysAgo && d <= sevenDaysAgo;
      });
      const recentRate = recentEvents.length / 7;
      const baselineRate = baselineEvents.length > 0 ? baselineEvents.length / 23 : 0;
      const spikePercent = baselineRate > 0 ? Math.round((recentRate / baselineRate - 1) * 100) : null;

      // Also run the full pattern analysis from stringerAnalysis
      const { analyzePatterns } = await import('@/lib/stringerAnalysis');
      const patterns = await analyzePatterns(clientId);

      return NextResponse.json({
        client_name: client?.name,
        section: 'patterns',
        total_events_90d: (events || []).length,
        hour_distribution: hourCounts,
        day_distribution: dayCounts,
        category_breakdown: categoryCounts,
        frequency_spike_percent: spikePercent,
        recent_rate_per_day: Math.round(recentRate * 10) / 10,
        baseline_rate_per_day: Math.round(baselineRate * 10) / 10,
        nudges: nudges || [],
        patterns,
      });
    }

    case 'family_systems': {
      if (!connection.can_see_family_systems) {
        return NextResponse.json({ error: 'Access not granted for family systems' }, { status: 403 });
      }

      // Run the Stringer family systems analysis
      const analysis = await analyzeFamilySystems(db, clientId);

      // Fetch therapist's notes for this client
      const { data: notes } = await db.from('family_systems_notes')
        .select('id, dynamic, confirmed, confidence_override, parenting_style, note, note_type, created_at, updated_at')
        .eq('user_id', clientId)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      // Decrypt notes
      const decryptedNotes = (notes || []).map((n: any) => ({
        ...n,
        note: n.note ? decrypt(n.note, clientId) : null,
      }));

      return NextResponse.json({
        client_name: client?.name,
        section: 'family_systems',
        analysis,
        therapist_notes: decryptedNotes,
      });
    }

    case 'summary':
    default: {
      // High-level overview respecting all consent flags
      const result: any = { client_name: client?.name, section: 'summary', member_since: client?.created_at };

      if (connection.can_see_journal) {
        const { count } = await db.from('stringer_journal').select('id', { count: 'exact', head: true }).eq('user_id', clientId);
        result.journal_count = count ?? 0;

        // Last 7 days
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { count: weekCount } = await db.from('stringer_journal').select('id', { count: 'exact', head: true })
          .eq('user_id', clientId).gte('created_at', weekAgo);
        result.journal_this_week = weekCount ?? 0;
      }

      if (connection.can_see_moods) {
        const { data: recentMoods } = await db.from('stringer_journal')
          .select('mood').eq('user_id', clientId).not('mood', 'is', null)
          .order('created_at', { ascending: false }).limit(7);
        if (recentMoods?.length) {
          result.avg_mood_7d = Math.round(recentMoods.reduce((s: number, m: any) => s + m.mood, 0) / recentMoods.length * 10) / 10;
        }
      }

      if (connection.can_see_streaks) {
        // Current streak
        const { data: segments } = await db.from('focus_segments')
          .select('date, status').eq('user_id', clientId).order('date', { ascending: false }).limit(30);
        let streak = 0;
        for (const s of (segments || [])) {
          if (s.status === 'focused') streak++;
          else break;
        }
        result.current_streak = streak;
      }

      if (connection.can_see_outcomes) {
        const { count: convCount } = await db.from('conversation_outcomes')
          .select('id', { count: 'exact', head: true }).eq('user_id', clientId);
        result.conversations_completed = convCount ?? 0;
      }

      return NextResponse.json(result);
    }
  }
}
