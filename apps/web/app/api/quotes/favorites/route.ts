export const dynamic = 'force-dynamic';
// GET    /api/quotes/favorites — list user's favorited quotes
// POST   /api/quotes/favorites — add a favorite
// DELETE /api/quotes/favorites — remove a favorite

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/quotes/favorites', 'Unauthorized', 401);

    const db = createServiceClient();
    const { data: favorites } = await db
      .from('quote_favorites')
      .select('id, quote_text, quote_author, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ favorites: favorites ?? [] });
  } catch (err) {
    return safeError('GET /api/quotes/favorites', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/quotes/favorites', 'Unauthorized', 401);

    const { quote_text, quote_author } = await req.json();
    if (!quote_text || !quote_author) {
      return safeError('POST /api/quotes/favorites', 'quote_text and quote_author required', 400);
    }

    const db = createServiceClient();
    const { error } = await db
      .from('quote_favorites')
      .upsert(
        { user_id: user.id, quote_text, quote_author },
        { onConflict: 'user_id,quote_text' }
      );

    if (error) return safeError('POST /api/quotes/favorites', error);
    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/quotes/favorites', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/quotes/favorites', 'Unauthorized', 401);

    const { quote_text } = await req.json();
    if (!quote_text) {
      return safeError('DELETE /api/quotes/favorites', 'quote_text required', 400);
    }

    const db = createServiceClient();
    await db
      .from('quote_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('quote_text', quote_text);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/quotes/favorites', err);
  }
}
