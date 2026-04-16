export const dynamic = 'force-dynamic';
// POST /api/milestones/share — generate a share token for a milestone

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { z } from 'zod';
import crypto from 'crypto';

const ShareSchema = z.object({
  milestone: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/milestones/share', 'Unauthorized', 401);

    const body = await req.json().catch(() => null);
    const parsed = ShareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const db = supabase;

    // Find the user's milestone
    const { data: milestone } = await db
      .from('milestones')
      .select('id, share_token')
      .eq('user_id', user.id)
      .eq('milestone', parsed.data.milestone)
      .maybeSingle();

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found or not yet earned' }, { status: 404 });
    }

    // Return existing token or generate new one
    let token = milestone.share_token;
    if (!token) {
      token = crypto.randomBytes(12).toString('hex');
      await db
        .from('milestones')
        .update({ share_token: token })
        .eq('id', milestone.id);
    }

    return NextResponse.json({
      shareUrl: `/share/milestone/${token}`,
      token,
    });
  } catch (err) {
    return safeError('POST /api/milestones/share', err);
  }
}
