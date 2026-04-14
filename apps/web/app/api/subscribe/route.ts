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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
