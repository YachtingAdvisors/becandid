export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/auth/avatar', 'Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 2 MB.' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `avatars/${user.id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const db = createServiceClient();

    // Upload to Supabase Storage
    const { error: uploadError } = await db.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return safeError('POST /api/auth/avatar', uploadError);

    // Get public URL
    const { data: urlData } = db.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update user profile
    const { error: updateError } = await db
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) return safeError('POST /api/auth/avatar', updateError);

    auditLog({ action: 'profile.update', userId: user.id, metadata: { fields: ['avatar_url'] } });

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (err) {
    return safeError('POST /api/auth/avatar', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/auth/avatar', 'Unauthorized', 401);

    const db = createServiceClient();

    // Remove avatar_url from profile
    await db.from('users').update({ avatar_url: null, updated_at: new Date().toISOString() }).eq('id', user.id);

    // Try to delete from storage (ignore errors if file doesn't exist)
    await db.storage.from('avatars').remove([`avatars/${user.id}.jpg`, `avatars/${user.id}.png`, `avatars/${user.id}.webp`, `avatars/${user.id}.gif`]);

    auditLog({ action: 'profile.update', userId: user.id, metadata: { fields: ['avatar_url'], removed: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/auth/avatar', err);
  }
}
