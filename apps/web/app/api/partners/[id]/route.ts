export const dynamic = 'force-dynamic';
// DELETE /api/partners/[id] — remove an accountability partner relationship

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, auditLog } from '@/lib/security';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/partners/[id]', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const partnerId = params.id;
    if (!partnerId) {
      return NextResponse.json({ error: 'Missing partner id' }, { status: 400 });
    }

    const db = createServiceClient();

    // Verify the partner row belongs to this user (they are the inviter)
    const { data: row } = await db
      .from('partners')
      .select('id, user_id, partner_user_id, partner_email, partner_name')
      .eq('id', partnerId)
      .eq('user_id', user.id)  // only the inviter can delete
      .maybeSingle();

    if (!row) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Delete the partner row
    const { error: deleteError } = await db
      .from('partners')
      .delete()
      .eq('id', partnerId);

    if (deleteError) {
      return safeError('DELETE /api/partners/[id]', deleteError);
    }

    auditLog({
      action: 'partner.remove',
      userId: user.id,
      metadata: {
        partnerId,
        partnerEmail: row.partner_email,
        partnerName: row.partner_name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/partners/[id]', err);
  }
}
