import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function getLabel(score: number) {
  if (score <= 12) return { label: 'Needs Attention', color: '#f87171' };
  if (score <= 20) return { label: 'Room to Grow', color: '#fbbf24' };
  if (score <= 28) return { label: 'Mostly Healthy', color: '#22d3ee' };
  return { label: 'Thriving', color: '#34d399' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = Number(searchParams.get('s')) || 24;
  const result = getLabel(score);

  const categories = [
    { label: 'Communication', score: Number(searchParams.get('c')) || 0, color: '#22d3ee' },
    { label: 'Trust', score: Number(searchParams.get('t')) || 0, color: '#34d399' },
    { label: 'Digital Boundaries', score: Number(searchParams.get('d')) || 0, color: '#fbbf24' },
    { label: 'Quality Time', score: Number(searchParams.get('q')) || 0, color: '#a78bfa' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1a3a44 0%, #226779 35%, #2d8a9e 70%, #3ba5b9 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '400px', height: '400px', borderRadius: '50% 50% 50% 0%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 300, color: 'rgba(255,255,255,0.95)', display: 'flex' }}>C</div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', textTransform: 'uppercase' as const, display: 'flex' }}>
            becandid.io
          </div>
        </div>

        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'flex' }}>
          Relationship Health Check
        </div>

        <div style={{ fontSize: '72px', fontWeight: 800, color: result.color, lineHeight: 1, marginBottom: '24px', display: 'flex' }}>
          {result.label}
        </div>

        {/* Category bars */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          {categories.map((cat) => (
            <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>{cat.label}</div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: cat.color, width: `${(cat.score / 8) * 100}%`, display: 'flex' }} />
              </div>
              <div style={{ fontSize: '14px', color: cat.color, fontWeight: 600, display: 'flex' }}>{cat.score}/8</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
          Score: {score}/32 &middot; becandid.io/tools
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
