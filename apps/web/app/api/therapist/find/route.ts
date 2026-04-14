export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const { data: profile } = await db.from('users')
    .select('name, email')
    .eq('id', user.id)
    .single();

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>',
      to: 'shawn@becandid.io',
      subject: `Therapist request from ${profile?.name || 'a user'}`,
      html: `
        <p><strong>${profile?.name || 'A user'}</strong> (${profile?.email || user.email}) is looking for a therapist.</p>
        <p>They clicked "Looking for a therapist?" in their Be Candid settings.</p>
        <p>User ID: <code>${user.id}</code></p>
      `,
    });
  } catch (e) {
    console.error('[therapist/find] Email error:', e);
  }

  return NextResponse.json({ sent: true });
}
