import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const db = createServiceClient();

    // Upsert to avoid duplicates — update source/timestamp if already exists
    const { error } = await db
      .from('email_subscribers')
      .upsert(
        { email: email.toLowerCase().trim(), source: source || 'blog', subscribed_at: new Date().toISOString() },
        { onConflict: 'email' },
      );

    if (error) {
      console.error('Subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Notify admin of new subscriber
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
      await resend.emails.send({
        from,
        to: 'slaser90@gmail.com',
        subject: `New blog subscriber: ${email.toLowerCase().trim()}`,
        html: `<p><strong>${email.toLowerCase().trim()}</strong> just subscribed via <em>${source || 'blog'}</em>.</p><p>Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>`,
      });
    } catch {
      // Don't fail the subscription if notification fails
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
