'use client';

import { useParams, useSearchParams } from 'next/navigation';

export default function BadgeClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const theme = searchParams.get('theme') || 'dark';
  const isDark = theme === 'dark';

  const referralLink = `https://becandid.io/r/${code}?ref=badge`;

  return (
    <div style={{ margin: 0, padding: '8px', background: 'transparent' }}>
      <a
        href={referralLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', textDecoration: 'none' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: isDark ? '#0c1214' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.8)' : '#226779'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 300,
                color: isDark ? 'rgba(255,255,255,0.9)' : '#226779',
              }}
            >
              C
            </span>
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#1c1917',
                lineHeight: 1.3,
              }}
            >
              Recommended on Be Candid
            </div>
            <div
              style={{
                fontSize: '10px',
                color: isDark ? '#a8a29e' : '#78716c',
                lineHeight: 1.3,
              }}
            >
              Digital accountability for real change
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
