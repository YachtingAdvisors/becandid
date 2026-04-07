export const dynamic = 'force-dynamic';

// ============================================================
// GET/POST /api/coach/schedule — Coach Session Scheduling
//
// GET:  Returns the user's current coach schedule
// POST: Saves or clears the coach schedule (JSONB on users row)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

// ─── Validation helpers ─────────────────────────────────────

const VALID_FREQUENCIES = ['daily', 'every_2_days', 'weekly'] as const;
const VALID_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

type Frequency = (typeof VALID_FREQUENCIES)[number];
type DayOfWeek = (typeof VALID_DAYS)[number];

interface CoachSchedulePayload {
  hour: number | null;
  minute?: number | null;
  frequency: Frequency | null;
  day: DayOfWeek | null;
}

function isValidPayload(body: unknown): body is CoachSchedulePayload {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  // Allow clearing the schedule
  if (b.hour === null && b.frequency === null) return true;

  if (typeof b.hour !== 'number' || b.hour < 0 || b.hour > 23) return false;
  if (b.minute != null && (typeof b.minute !== 'number' || b.minute < 0 || b.minute > 59)) return false;
  if (!VALID_FREQUENCIES.includes(b.frequency as Frequency)) return false;

  if (b.frequency === 'weekly') {
    if (b.day && !VALID_DAYS.includes(b.day as DayOfWeek)) return false;
  }

  return true;
}

// ─── GET ────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = createServiceClient();
    const { data, error } = await db
      .from('users')
      .select('coach_schedule')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule: data?.coach_schedule ?? null });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!isValidPayload(body)) {
      return NextResponse.json(
        { error: 'Invalid schedule. Provide hour (0-23), frequency (daily|every_2_days|weekly), and optional day.' },
        { status: 400 },
      );
    }

    const db = createServiceClient();

    // Build the JSONB value — null clears the schedule
    const scheduleValue = body.hour === null
      ? null
      : {
          hour: body.hour,
          minute: body.minute ?? 0,
          frequency: body.frequency,
          day: body.frequency === 'weekly' ? (body.day ?? 'sunday') : null,
        };

    const { error } = await db
      .from('users')
      .update({ coach_schedule: scheduleValue })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
    }

    return NextResponse.json({ schedule: scheduleValue, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
