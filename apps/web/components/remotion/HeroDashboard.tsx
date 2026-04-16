'use client';

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/* ─── Helpers ────────────────────────────────────────────── */
function fadeSlideIn(
  frame: number,
  fps: number,
  delay: number,
  opts?: { from?: 'bottom' | 'left' | 'right'; distance?: number }
) {
  const direction = opts?.from ?? 'bottom';
  const distance = opts?.distance ?? 20;
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translate = interpolate(frame, [delay, delay + 16], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const prop =
    direction === 'bottom'
      ? 'translateY'
      : direction === 'left'
        ? 'translateX'
        : 'translateX';
  const sign = direction === 'right' ? 1 : direction === 'left' ? -1 : 1;
  return {
    opacity,
    transform: `${prop}(${translate * sign}px)`,
  };
}

function countUp(frame: number, delay: number, target: number, duration = 20) {
  const raw = interpolate(frame, [delay, delay + duration], [0, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return Math.round(raw);
}

/* ─── Stat card item ─────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  frame,
  fps,
  delay,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  frame: number;
  fps: number;
  delay: number;
}) {
  const style = fadeSlideIn(frame, fps, delay);
  return (
    <div
      style={{
        ...style,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11, color }}>
            {icon}
          </span>
        </div>
        <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716c' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{value}</p>
    </div>
  );
}

/* ─── Main composition ───────────────────────────────────── */
export const HeroDashboardComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Timeline (frames at 30fps) ── */
  const T = {
    chrome: 0,
    header: 8,
    ring: 18,
    stats: 30,
    journal: 52,
    focus: 66,
    partner: 72,
  };

  /* Chrome fade */
  const chromeOpacity = interpolate(frame, [T.chrome, T.chrome + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* Ring animation */
  const ringProgress = interpolate(frame, [T.ring, T.ring + 40], [0, 76], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ringDashoffset = interpolate(ringProgress, [0, 100], [214, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringStyle = fadeSlideIn(frame, fps, T.ring);

  /* Stat values */
  const streak = countUp(frame, T.stats, 14, 24);
  const trust = countUp(frame, T.stats + 4, 2340, 28);
  const journals = countUp(frame, T.stats + 8, 23, 24);
  const mood = interpolate(frame, [T.stats + 12, T.stats + 36], [0, 4.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  /* Focus bar fill */
  const focusFill = interpolate(frame, [T.focus, T.focus + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  /* Journal typing effect */
  const journalText = 'What was happening right before the urge? Trace the emotional trail back...';
  const journalChars = Math.round(
    interpolate(frame, [T.journal + 6, T.journal + 50], [0, journalText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  /* Cursor blink for journal */
  const cursorVisible = Math.floor(frame / 8) % 2 === 0 && frame >= T.journal + 6;

  /* "All Clear" status pulse */
  const statusDotScale = spring({ frame: frame - T.header - 10, fps, config: { damping: 8, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* ── Browser chrome ── */}
        <div
          style={{
            opacity: chromeOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: 'rgba(15,23,42,0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.6)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.6)' }} />
          </div>
          <div
            style={{
              flex: 1,
              margin: '0 32px',
              height: 20,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 10, color: '#78716c', fontFamily: 'monospace' }}>
              app.becandid.io/dashboard
            </span>
          </div>
        </div>

        {/* ── Dashboard body ── */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #0e1a1d, #0f1c20, #0c1518)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Top bar */}
          <div
            style={{
              ...fadeSlideIn(frame, fps, T.header),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #226779, #22d3ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>C</span>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  My Sanctuary
                </p>
                <p style={{ fontSize: 9, color: '#78716c', margin: 0 }}>Good morning, Shawn</p>
              </div>
            </div>
            <div
              style={{
                height: 24,
                padding: '0 10px',
                borderRadius: 6,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#34d399',
                  transform: `scale(${statusDotScale})`,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#34d399' }}>All Clear</span>
            </div>
          </div>

          {/* Main grid: ring + stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            {/* Momentum ring */}
            <div
              style={{
                ...ringStyle,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="url(#anim-ring-gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="214"
                    strokeDashoffset={ringDashoffset}
                  />
                  <defs>
                    <linearGradient id="anim-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <p style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1 }}>
                    {Math.round(ringProgress)}
                  </p>
                  <p
                    style={{
                      fontSize: 7,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#78716c',
                      margin: '2px 0 0',
                    }}
                  >
                    Momentum
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 9, color: '#78716c', margin: '8px 0 0' }}>+4 from yesterday</p>
            </div>

            {/* Stats 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard
                label="Day Streak"
                value={String(streak)}
                icon="local_fire_department"
                color="#fbbf24"
                bg="rgba(245,158,11,0.1)"
                frame={frame}
                fps={fps}
                delay={T.stats}
              />
              <StatCard
                label="Reputation Points"
                value={trust.toLocaleString()}
                icon="workspace_premium"
                color="#22d3ee"
                bg="rgba(6,182,212,0.1)"
                frame={frame}
                fps={fps}
                delay={T.stats + 4}
              />
              <StatCard
                label="Journals"
                value={String(journals)}
                icon="menu_book"
                color="#34d399"
                bg="rgba(16,185,129,0.1)"
                frame={frame}
                fps={fps}
                delay={T.stats + 8}
              />
              <StatCard
                label="Avg Mood"
                value={mood.toFixed(1)}
                icon="mood"
                color="#c084fc"
                bg="rgba(168,85,247,0.1)"
                frame={frame}
                fps={fps}
                delay={T.stats + 12}
              />
            </div>
          </div>

          {/* Journal prompt */}
          <div
            style={{
              ...fadeSlideIn(frame, fps, T.journal),
              background: 'linear-gradient(90deg, rgba(34,103,121,0.1), rgba(6,182,212,0.05))',
              border: '1px solid rgba(34,103,121,0.2)',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(34,103,121,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#226779' }}>
                edit_note
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(34,103,121,0.8)',
                  margin: '0 0 2px',
                }}
              >
                Today&apos;s Reflection
              </p>
              <p style={{ fontSize: 12, color: '#d6d3d1', lineHeight: 1.5, margin: 0 }}>
                {journalText.slice(0, journalChars)}
                {cursorVisible && <span style={{ color: '#22d3ee' }}>|</span>}
              </p>
            </div>
            <div
              style={{
                ...fadeSlideIn(frame, fps, T.journal + 44),
                height: 28,
                padding: '0 10px',
                borderRadius: 8,
                background: 'rgba(34,103,121,0.2)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: '#226779' }}>Write</span>
            </div>
          </div>

          {/* Bottom row: focus + partner */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Focus Today */}
            <div
              style={{
                ...fadeSlideIn(frame, fps, T.focus),
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 10,
              }}
            >
              <p style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716c', margin: '0 0 6px' }}>
                Focus Today
              </p>
              <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(8)].map((_, j) => {
                  const barFill =
                    j < 5
                      ? interpolate(focusFill, [j / 8, (j + 1) / 8], [0, 1], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                        })
                      : j === 5
                        ? interpolate(focusFill, [5 / 8, 6 / 8], [0, 1], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                          })
                        : 0;

                  const bg =
                    j < 5
                      ? `rgba(16,185,129,${0.15 + barFill * 0.25})`
                      : j === 5
                        ? `rgba(245,158,11,${0.1 + barFill * 0.2})`
                        : 'rgba(255,255,255,0.06)';

                  const height = 4 + (j < 6 ? barFill * 12 : 0);

                  return (
                    <div
                      key={j}
                      style={{
                        flex: 1,
                        height,
                        borderRadius: 2,
                        background: bg,
                        alignSelf: 'flex-end',
                        transition: 'height 0.3s',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Partner status */}
            <div
              style={{
                ...fadeSlideIn(frame, fps, T.partner),
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 10,
              }}
            >
              <p style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716c', margin: '0 0 6px' }}>
                Partner Status
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22d3ee, #226779)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: 700, color: 'white' }}>S</span>
                </div>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>Connected</span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#34d399',
                    marginLeft: 'auto',
                    transform: `scale(${spring({ frame: frame - T.partner - 4, fps, config: { damping: 8 } })})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
