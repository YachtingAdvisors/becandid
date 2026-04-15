export const dynamic = 'force-dynamic';
// ============================================================
// app/api/journal-reminders/route.ts
//
// GET  → fetch user's journal reminder preferences
// PUT  → upsert preferences (frequency, time, after_relapse)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { checkFeatureGate } from '@/lib/stripe/featureGate';

const VALID_FREQUENCIES = ['daily', 'every_2_days', 'every_3_days', 'weekly'];

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { data } = await db.from('journal_preferences')
    .select('*').eq('user_id', user.id).single();

  // Return defaults if no preferences set yet
  return NextResponse.json({
    preferences: data || {
      user_id: user.id,
      reminder_enabled: true,
      frequency: 'daily',
      preferred_hour: 20,
      timezone: 'America/New_York',
      after_relapse: true,
      relapse_delay_min: 30,
      last_reminder_at: null,
      last_relapse_prompt: null,
    },
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: journal reminders require Pro+
  const gate = await checkFeatureGate(user.id, 'journalReminders');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const body = await req.json();
  const {
    reminder_enabled, frequency, preferred_hour,
    timezone, after_relapse, relapse_delay_min,
  } = body;

  // Validate
  if (frequency && !VALID_FREQUENCIES.includes(frequency)) {
    return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
  }
  if (preferred_hour != null && (preferred_hour < 0 || preferred_hour > 23)) {
    return NextResponse.json({ error: 'Hour must be 0-23' }, { status: 400 });
  }
  if (relapse_delay_min != null && (relapse_delay_min < 5 || relapse_delay_min > 1440)) {
    return NextResponse.json({ error: 'Delay must be 5-1440 minutes' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db.from('journal_preferences').upsert({
    user_id: user.id,
    reminder_enabled: reminder_enabled ?? true,
    frequency: frequency || 'daily',
    preferred_hour: preferred_hour ?? 20,
    timezone: timezone || 'America/New_York',
    after_relapse: after_relapse ?? true,
    relapse_delay_min: relapse_delay_min ?? 30,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select().single();

  if (error) return safeError('PUT /api/journal-reminders', error);
  return NextResponse.json({ preferences: data });
}
