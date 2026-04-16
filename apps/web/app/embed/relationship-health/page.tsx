'use client';

import { useState, useCallback } from 'react';

const QUESTIONS = [
  { text: 'How often do you talk openly about phone use with your partner?', category: 'Communication', options: [{ label: 'Never', score: 1 }, { label: 'Rarely', score: 2 }, { label: 'Sometimes', score: 3 }, { label: 'Regularly', score: 4 }] },
  { text: 'If your partner asked to see your phone right now?', category: 'Communication', options: [{ label: 'Panicked', score: 1 }, { label: 'Nervous', score: 2 }, { label: 'Mostly fine', score: 3 }, { label: 'Comfortable', score: 4 }] },
  { text: 'Have you deleted messages or history before they could see?', category: 'Trust', options: [{ label: 'Yes, regularly', score: 1 }, { label: 'A few times', score: 2 }, { label: 'Once or twice', score: 3 }, { label: 'Never', score: 4 }] },
  { text: 'Does your partner trust how you spend time online?', category: 'Trust', options: [{ label: 'No — real conflict', score: 1 }, { label: 'They have doubts', score: 2 }, { label: 'Mostly', score: 3 }, { label: 'Yes — transparent', score: 4 }] },
  { text: 'Do you have agreed rules about phone use?', category: 'Boundaries', options: [{ label: 'No rules', score: 1 }, { label: 'Talked but don\'t follow', score: 2 }, { label: 'Loose agreements', score: 3 }, { label: 'Clear boundaries', score: 4 }] },
  { text: 'How often do you use your phone while your partner talks?', category: 'Boundaries', options: [{ label: 'All the time', score: 1 }, { label: 'Frequently', score: 2 }, { label: 'Sometimes', score: 3 }, { label: 'Rarely', score: 4 }] },
  { text: 'Hours of undistracted time with your partner last week?', category: 'Quality Time', options: [{ label: 'Almost none', score: 1 }, { label: '1-2 hours', score: 2 }, { label: '3-5 hours', score: 3 }, { label: '5+ hours', score: 4 }] },
  { text: 'Does your phone feel like a third person in the room?', category: 'Quality Time', options: [{ label: 'Constantly', score: 1 }, { label: 'More than I\'d like', score: 2 }, { label: 'Occasionally', score: 3 }, { label: 'No — we\'re present', score: 4 }] },
];

function getLabel(score: number) {
  if (score <= 12) return { label: 'Needs Attention', color: '#f87171' };
  if (score <= 20) return { label: 'Room to Grow', color: '#fbbf24' };
  if (score <= 28) return { label: 'Mostly Healthy', color: '#22d3ee' };
  return { label: 'Thriving', color: '#34d399' };
}

export default function EmbedRelationshipHealth() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = getLabel(totalScore);

  const handleAnswer = useCallback((score: number) => {
    const next = [...answers, score];
    setAnswers(next);
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(currentQ + 1);
    else setDone(true);
  }, [answers, currentQ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0c1214', color: '#fff', padding: '24px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>
        Relationship Health Check
      </h2>
      <p style={{ fontSize: '13px', color: '#a8a29e', textAlign: 'center', margin: '0 0 20px' }}>
        How are digital habits affecting your relationship?
      </p>

      {!done ? (
        <div>
          <div style={{ fontSize: '12px', color: '#78716c', marginBottom: '4px' }}>
            {currentQ + 1} / {QUESTIONS.length} &middot; {QUESTIONS[currentQ].category}
          </div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}>
            <div style={{ height: '100%', borderRadius: '2px', background: '#06b6d4', width: `${(currentQ / QUESTIONS.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            {QUESTIONS[currentQ].text}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {QUESTIONS[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.score)}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#d6d3d1',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '4px' }}>Your digital relationship health</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: result.color, marginBottom: '4px' }}>
            {result.label}
          </div>
          <div style={{ fontSize: '14px', color: '#a8a29e' }}>
            Score: {totalScore} / 32
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="https://becandid.io/tools/relationship-health?utm_source=embed"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#06b6d4', fontSize: '12px', textDecoration: 'none' }}
        >
          Powered by Be Candid — Take the full assessment
        </a>
      </div>
    </div>
  );
}
