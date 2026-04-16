export const dynamic = 'force-dynamic';
// POST /api/conversations — mark a conversation complete
// GET  /api/conversations — list conversations

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { onConversationCompleted } from '@/lib/focusIntegration';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText, isValidUUID, auditLog } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/conversations', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('POST /api/conversations', 'Invalid JSON', 400);

    const { alertId, outcome, notes } = body;

    if (!alertId || !isValidUUID(alertId)) {
      return NextResponse.json({ error: 'Valid alertId required' }, { status: 400 });
    }

    if (!['positive', 'neutral', 'difficult'].includes(outcome)) {
      return NextResponse.json({ error: 'outcome must be positive, neutral, or difficult' }, { status: 400 });
    }

    const db = createServiceClient();

    // Verify alert exists and user has access
    const { data: alert } = await db
      .from('alerts')
      .select('id, user_id')
      .eq('id', alertId)
      .single();

    if (!alert) return safeError('POST /api/conversations', 'Alert not found', 404);

    // Authorization check
    if (alert.user_id !== user.id) {
      const { data: partnerRecord } = await db
        .from('partners')
        .select('id')
        .eq('user_id', alert.user_id)
        .eq('partner_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (!partnerRecord) return safeError('POST /api/conversations', 'Forbidden', 403);
    }

    // Check for duplicate
    const { data: existing } = await db
      .from('conversations')
      .select('id')
      .eq('alert_id', alertId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Conversation already recorded' }, { status: 409 });
    }

    // Sanitize notes
    const cleanNotes = notes ? sanitizeText(notes, 2000) : null;

    const { data: conversation, error: convError } = await db
      .from('conversations')
      .insert({
        alert_id: alertId,
        user_id: user.id,
        completed_at: new Date().toISOString(),
        outcome,
        notes: cleanNotes,
      })
      .select()
      .single();

    if (convError) return safeError('POST /api/conversations', convError);

    // Award reputation points
    let milestonesUnlocked: string[] = [];
    try {
      milestonesUnlocked = await onConversationCompleted(db, alert.user_id, alertId, outcome);
    } catch (e) {
      console.error('Reputation points award failed (non-fatal):', e);
    }

    auditLog({
      action: 'conversation.completed',
      userId: user.id,
      metadata: { alertId, outcome },
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      milestonesUnlocked,
    });
  } catch (err) {
    return safeError('POST /api/conversations', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/conversations', 'Unauthorized', 401);

    const db = createServiceClient();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20') || 20, 50);
    const role = searchParams.get('role'); // 'user' | 'partner' | null

    let targetUserId = user.id;

    if (role === 'partner') {
      // Partner wants to see their monitored user's conversations.
      // Look up who this partner is monitoring.
      const { data: partnership } = await db
        .from('partners')
        .select('user_id')
        .eq('partner_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!partnership) {
        return NextResponse.json({ conversations: [] });
      }
      targetUserId = partnership.user_id;
    }

    let conversations;

    if (role === 'partner') {
      // Find conversations linked to the monitored user's alerts
      const { data } = await db
        .from('conversations')
        .select('*, alerts!inner(id, sent_at, events(category, severity, platform, timestamp))')
        .eq('alerts.user_id', targetUserId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      conversations = data;
    } else {
      // Default: conversations the current user recorded
      const { data } = await db
        .from('conversations')
        .select('*, alerts(id, sent_at, events(category, severity, platform, timestamp))')
        .eq('user_id', targetUserId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      conversations = data;
    }

    return NextResponse.json({ conversations: conversations ?? [] });
  } catch (err) {
    return safeError('GET /api/conversations', err);
  }
}
