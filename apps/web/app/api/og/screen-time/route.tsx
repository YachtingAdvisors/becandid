import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hours = Number(searchParams.get('h')) || 5;
  const age = Number(searchParams.get('age')) || 30;

  const remainingYears = Math.max(78 - age, 1);
  const lifetimeHours = hours * 365 * remainingYears;
  const lifetimeYears = (lifetimeHours / 24 / 365).toFixed(1);
  const percentOfLife = ((lifetimeHours / 24 / 365 / remainingYears) * 100).toFixed(0);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #1a3a44 0%, #226779 35%, #2d8a9e 70%, #3ba5b9 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-40px',
            width: '400px',
            height: '400px',
            borderRadius: '50% 50% 50% 0%',
            background: 'rgba(255, 255, 255, 0.06)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 300, color: 'rgba(255, 255, 255, 0.95)', display: 'flex' }}>
              C
            </div>
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
              display: 'flex',
            }}
          >
            becandid.io
          </div>
        </div>

        {/* Main stat */}
        <div style={{ fontSize: '96px', fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: '8px', display: 'flex' }}>
          {lifetimeYears} years
        </div>

        <div style={{ fontSize: '36px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginBottom: '32px', display: 'flex' }}>
          of my life will be spent on screens
        </div>

        {/* Divider */}
        <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px', display: 'flex' }} />

        {/* Detail line */}
        <div style={{ fontSize: '22px', color: 'rgba(255, 255, 255, 0.65)', display: 'flex' }}>
          {hours}h/day &middot; age {age} &middot; {percentOfLife}% of remaining life &middot; becandid.io/tools
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
