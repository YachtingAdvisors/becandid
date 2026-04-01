import { ImageResponse } from 'next/og';
import { createServiceClient } from '@/lib/supabase';
import { getBadgeByKey, TIER_STYLES } from '@/lib/badges';

export const runtime = 'edge';
export const alt = 'Be Candid Achievement';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const db = createServiceClient();
  const { data } = await db
    .from('milestones')
    .select('milestone, unlocked_at, user_id')
    .eq('share_token', token)
    .maybeSingle();

  let firstName = 'Someone';
  let badgeLabel = 'Achievement';
  let tierColor = '#854d0e';

  if (data) {
    const { data: user } = await db
      .from('users')
      .select('name')
      .eq('id', data.user_id)
      .single();

    firstName = user?.name?.split(' ')[0] ?? 'Someone';
    const badge = getBadgeByKey(data.milestone);
    if (badge) {
      badgeLabel = badge.label;
      tierColor = TIER_STYLES[badge.tier].color;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbf9f8',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top brand bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #226779, #2d7082, #226779)',
          }}
        />

        {/* Badge circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            border: `4px solid ${tierColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 56,
          }}
        >
          🏆
        </div>

        {/* Achievement label */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: tierColor,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {badgeLabel}
        </div>

        {/* User name */}
        <div
          style={{
            fontSize: 28,
            color: '#49454f',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Earned by {firstName} on Be Candid
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 20,
            color: '#226779',
            fontWeight: 600,
          }}
        >
          becandid.io — Align your digital life
        </div>
      </div>
    ),
    { ...size },
  );
}
