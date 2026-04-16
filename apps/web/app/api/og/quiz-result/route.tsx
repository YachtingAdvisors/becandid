import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const LEVELS: Record<string, { label: string; color: string }> = {
  'not-ready': { label: 'Not Ready Yet', color: '#a8a29e' },
  'getting-there': { label: 'Getting There', color: '#fbbf24' },
  'ready': { label: 'Ready', color: '#22d3ee' },
  'highly-motivated': { label: 'Highly Motivated', color: '#34d399' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = Number(searchParams.get('score')) || 0;
  const level = searchParams.get('level') || 'ready';
  const levelData = LEVELS[level] || LEVELS['ready'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1a3a44 0%, #226779 35%, #2d8a9e 70%, #3ba5b9 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 300, color: 'rgba(255, 255, 255, 0.95)', display: 'flex' }}>C</div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '3px', textTransform: 'uppercase' as const, display: 'flex' }}>
            becandid.io
          </div>
        </div>

        <div style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px', display: 'flex' }}>
          Accountability Readiness
        </div>

        <div style={{ fontSize: '80px', fontWeight: 800, color: levelData.color, lineHeight: 1, marginBottom: '16px', display: 'flex' }}>
          {levelData.label}
        </div>

        <div style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.6)', display: 'flex' }}>
          Score: {score} / 32
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
