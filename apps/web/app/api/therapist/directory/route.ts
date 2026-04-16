export const dynamic = 'force-dynamic';
// GET   /api/therapist/directory — public, list therapists
// PATCH /api/therapist/directory — auth, update own therapist profile

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';
import { safeError, sanitizeText, sanitizeName } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    // Rate limit by IP for public endpoint
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const blocked = await checkDistributedRateLimit({
      scope: 'therapist-directory',
      key: ip,
      max: 120,
      windowMs: 60_000,
    });
    if (blocked) return blocked;

    const db = createServiceClient();

    const { data: therapists, error } = await db
      .from('users')
      .select('id, name, therapist_profile')
      .eq('is_therapist', true)
      .not('therapist_profile', 'is', null);

    if (error) return safeError('GET /api/therapist/directory', error);

    // Filter to only listed therapists and shape the response
    const listed = (therapists ?? [])
      .filter((t) => t.therapist_profile?.listed === true)
      .map((t) => ({
        id: t.id,
        name: t.name,
        specialty: t.therapist_profile?.specialty || [],
        location: t.therapist_profile?.location || '',
        bio: (t.therapist_profile?.bio || '').slice(0, 200),
        insurance: t.therapist_profile?.insurance || [],
        website: t.therapist_profile?.website || '',
      }));

    return NextResponse.json({ therapists: listed });
  } catch (err) {
    return safeError('GET /api/therapist/directory', err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Verify user is a therapist
    const { data: profile } = await db
      .from('users')
      .select('is_therapist, therapist_profile')
      .eq('id', user.id)
      .single();

    if (!profile?.is_therapist) {
      return NextResponse.json({ error: 'Only therapist accounts can update this profile' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    // Merge with existing profile
    const existing = profile.therapist_profile || {};
    const updated: Record<string, unknown> = { ...existing };

    if (body.bio !== undefined) updated.bio = sanitizeText(body.bio, 2000);
    if (body.location !== undefined) updated.location = sanitizeName(body.location);
    if (body.website !== undefined) updated.website = sanitizeText(body.website, 500);
    if (body.listed !== undefined) updated.listed = Boolean(body.listed);
    if (Array.isArray(body.specialty)) {
      updated.specialty = body.specialty.slice(0, 10).map((s: string) => sanitizeName(String(s)));
    }
    if (Array.isArray(body.insurance)) {
      updated.insurance = body.insurance.slice(0, 20).map((s: string) => sanitizeName(String(s)));
    }

    const { error: updateErr } = await db
      .from('users')
      .update({ therapist_profile: updated })
      .eq('id', user.id);

    if (updateErr) return safeError('PATCH /api/therapist/directory', updateErr);

    return NextResponse.json({ therapist_profile: updated });
  } catch (err) {
    return safeError('PATCH /api/therapist/directory', err);
  }
}
