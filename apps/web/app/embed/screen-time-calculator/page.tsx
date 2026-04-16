'use client';

import { useState, useMemo, useCallback } from 'react';

const COMPARISONS = [
  { perHour: 1 / 40, label: 'books read', icon: '📚' },
  { perHour: 1 / 2000, label: 'languages learned', icon: '🌍' },
  { perHour: 1 / 500, label: 'marathon training cycles', icon: '🏃' },
  { perHour: 1 / 200, label: 'novels written', icon: '✍️' },
];

export default function EmbedScreenTimeCalculator() {
  const [hours, setHours] = useState(5);
  const [age, setAge] = useState(30);
  const [showResults, setShowResults] = useState(false);

  const remainingYears = Math.max(78 - age, 1);
  const lifetimeHours = hours * 365 * remainingYears;
  const lifetimeYears = lifetimeHours / 24 / 365;
  const percentOfLife = (lifetimeYears / remainingYears) * 100;

  const topComparisons = useMemo(() => {
    return COMPARISONS.map((c) => ({
      ...c,
      count: Math.floor(lifetimeHours * c.perHour),
    })).filter((c) => c.count >= 1);
  }, [lifetimeHours]);

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#0c1214',
        color: '#fff',
        padding: '24px',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>
        Screen Time Calculator
      </h2>
      <p style={{ fontSize: '13px', color: '#a8a29e', textAlign: 'center', margin: '0 0 20px' }}>
        How much of your life will you spend on screens?
      </p>

      {/* Hours Slider */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
          <span>Daily screen time</span>
          <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: '18px' }}>{hours}h</span>
        </div>
        <input
          type="range"
          min={1}
          max={16}
          step={0.5}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#06b6d4' }}
        />
      </div>

      {/* Age Slider */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
          <span>Your age</span>
          <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: '18px' }}>{age}</span>
        </div>
        <input
          type="range"
          min={10}
          max={80}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#06b6d4' }}
        />
      </div>

      {!showResults ? (
        <button
          onClick={() => setShowResults(true)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: '#06b6d4',
            color: '#000',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Calculate
        </button>
      ) : (
        <div>
          {/* Big number */}
          <div style={{ textAlign: 'center', margin: '0 0 16px' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#22d3ee' }}>
              {lifetimeYears.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: '#a8a29e' }}>
              years on screens ({percentOfLife.toFixed(0)}% of remaining life)
            </div>
          </div>

          {/* Comparisons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {topComparisons.map((c) => (
              <div
                key={c.label}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: '18px' }}>{c.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{c.count.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#a8a29e' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="https://becandid.io/tools/screen-time-calculator?utm_source=embed"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#06b6d4', fontSize: '12px', textDecoration: 'none' }}
        >
          Powered by Be Candid — Try the full calculator
        </a>
      </div>
    </div>
  );
}
