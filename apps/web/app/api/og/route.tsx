// ============================================================
// app/api/og/route.tsx
//
// Dynamic Open Graph image generator using Next.js ImageResponse.
// Renders a branded 1200x630 preview card with:
//   - Teal gradient background
//   - Be Candid logo (embedded)
//   - Title + tagline text
//   - Clean, modern layout that looks great in text messages,
//     Slack, Twitter, and link previews
// ============================================================

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Allow overriding title/subtitle for page-specific OG images
  const title = searchParams.get('title') || 'Be Candid';
  const subtitle = searchParams.get('subtitle') || 'Align Your Digital Life';
  const description = searchParams.get('description') || 'AI-powered accountability — your screen time should match who you want to be.';

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
        {/* Decorative leaf shape — top right */}
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
        {/* Second decorative element */}
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

        {/* Logo mark — the "C" with leaf */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Stylized C-leaf logo using pure shapes */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.95)',
                marginTop: '-2px',
                display: 'flex',
              }}
            >
              C
            </div>
          </div>
          <div
            style={{
              fontSize: '20px',
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

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '16px',
            display: 'flex',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.3,
            marginBottom: '24px',
            display: 'flex',
          }}
        >
          {subtitle}
        </div>

        {/* Divider line */}
        <div
          style={{
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '24px',
            display: 'flex',
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: 1.5,
            maxWidth: '700px',
            display: 'flex',
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
