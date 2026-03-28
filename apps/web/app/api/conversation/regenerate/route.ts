export const dynamic = 'force-dynamic';
// POST /api/conversation/regenerate — generate a fresh AI guide for an alert
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { generateConversationGuide } from '@/lib/claude';
import { aiGuideLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, isValidUUID, auditLog } from '@/lib/security';
import type { GoalCategory, Severity, RelationshipType } from '@be-candid/shared';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/conversation/regenerate', 'Unauthorized', 401);

    // Check plan — free users get 3 regenerations/month
    const db = createServiceClient();
    const { data: profile } = await db.from('users').select('plan').eq('id', user.id).single();
    if (profile?.plan === 'free') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { count } = await db
        .from('audit_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action', 'conversation.regenerated' as any)
        .gte('created_at', monthStart.toISOString());
      if ((count ?? 0) >= 3) {
        return NextResponse.json({
          error: 'Free plan limited to 3 guide regenerations per month. Upgrade to Pro for unlimited.',
          upgrade: true,
        }, { status: 403 });
      }
    }

    const blocked = checkUserRate(aiGuideLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body?.alertId || !isValidUUID(body.alertId)) {
      return safeError('POST /api/conversation/regenerate', 'Valid alertId required', 400);
    }

    // Fetch alert + event + user data
    const { data: alert } = await db
      .from('alerts')
      .select('*, events(category, severity), users!alerts_user_id_fkey(name, relationship_type)')
      .eq('id', body.alertId)
      .single();

    if (!alert) return safeError('POST /api/conversation/regenerate', 'Not found', 404);

    // Auth check
    const isOwner = alert.user_id === user.id;
    if (!isOwner) {
      const { data: p } = await db.from('partners')
        .select('id').eq('user_id', alert.user_id).eq('partner_user_id', user.id).eq('status', 'active').maybeSingle();
      if (!p) return safeError('POST /api/conversation/regenerate', 'Forbidden', 403);
    }

    // Get partner name
    const { data: partner } = await db
      .from('partners')
      .select('partner_name')
      .eq('user_id', alert.user_id)
      .eq('status', 'active')
      .maybeSingle();

    const event = (alert as any).events;
    const userData = (alert as any).users;

    const guide = await generateConversationGuide({
      category: event.category as GoalCategory,
      severity: event.severity as Severity,
      userName: userData?.name ?? 'User',
      partnerName: partner?.partner_name ?? 'Partner',
      relationshipType: (userData?.relationship_type ?? 'friend') as RelationshipType,
    });

    // Update the alert with new guides
    await db.from('alerts').update({
      ai_guide_user: JSON.stringify(guide.for_user),
      ai_guide_partner: JSON.stringify(guide.for_partner),
    }).eq('id', body.alertId);

    auditLog({
      action: 'conversation.regenerated' as any,
      userId: user.id,
      metadata: { alertId: body.alertId },
    });

    return NextResponse.json({ success: true, guide });
  } catch (err) {
    return safeError('POST /api/conversation/regenerate', err);
  }
}
