'use client';

import { useState, useCallback } from 'react';

const QUESTIONS = [
  {
    text: 'When you fall short of a goal, what\'s your first instinct?',
    options: [
      { label: 'Hide it', score: 1 },
      { label: 'Feel bad but move on', score: 2 },
      { label: 'Reflect on what happened', score: 3 },
      { label: 'Tell someone I trust', score: 4 },
    ],
  },
  {
    text: 'How comfortable are you sharing struggles?',
    options: [
      { label: 'Very uncomfortable', score: 1 },
      { label: 'Depends on the person', score: 2 },
      { label: 'I can open up if safe', score: 3 },
      { label: 'I actively seek support', score: 4 },
    ],
  },
  {
    text: 'If someone pointed out a blind spot, how would you react?',
    options: [
      { label: 'Defensive', score: 1 },
      { label: 'Uncomfortable but thinking', score: 2 },
      { label: 'Grateful', score: 3 },
      { label: 'Ask for more detail', score: 4 },
    ],
  },
  {
    text: 'How often do you track or journal about habits?',
    options: [
      { label: 'Never', score: 1 },
      { label: 'Tried but can\'t stick', score: 2 },
      { label: 'Occasionally', score: 3 },
      { label: 'Regularly', score: 4 },
    ],
  },
  {
    text: 'When temptation hits, what typically happens?',
    options: [
      { label: 'I give in most times', score: 1 },
      { label: 'I often slip', score: 2 },
      { label: 'Strategies work half the time', score: 3 },
      { label: 'I have a plan and support', score: 4 },
    ],
  },
  {
    text: 'How do you feel about someone seeing your screen time?',
    options: [
      { label: 'Absolutely not', score: 1 },
      { label: 'Nervous but maybe helpful', score: 2 },
      { label: 'Open with the right person', score: 3 },
      { label: 'Transparency makes me stronger', score: 4 },
    ],
  },
  {
    text: 'What\'s your relationship with consistency?',
    options: [
      { label: 'Start strong, always fizzle', score: 1 },
      { label: 'Streaks break easily', score: 2 },
      { label: 'Can maintain for weeks', score: 3 },
      { label: 'Built lasting habits for months', score: 4 },
    ],
  },
  {
    text: 'Why are you taking this quiz?',
    options: [
      { label: 'Just curious', score: 1 },
      { label: 'Something needs to change', score: 2 },
      { label: 'Exploring options', score: 3 },
      { label: 'Ready to commit', score: 4 },
    ],
  },
];

const LEVELS: Record<string, { label: string; color: string }> = {
  'not-ready': { label: 'Not Ready Yet', color: '#a8a29e' },
  'getting-there': { label: 'Getting There', color: '#fbbf24' },
  'ready': { label: 'Ready', color: '#22d3ee' },
  'highly-motivated': { label: 'Highly Motivated', color: '#34d399' },
};

function getLevel(score: number) {
  if (score <= 12) return 'not-ready';
  if (score <= 20) return 'getting-there';
  if (score <= 28) return 'ready';
  return 'highly-motivated';
}

export default function EmbedQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const level = getLevel(totalScore);
  const levelData = LEVELS[level];

  const handleAnswer = useCallback((score: number) => {
    const next = [...answers, score];
    setAnswers(next);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setDone(true);
    }
  }, [answers, currentQ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0c1214', color: '#fff', padding: '24px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>
        Accountability Readiness Quiz
      </h2>
      <p style={{ fontSize: '13px', color: '#a8a29e', textAlign: 'center', margin: '0 0 20px' }}>
        8 questions &middot; No sign-up required
      </p>

      {!done ? (
        <div>
          <div style={{ fontSize: '12px', color: '#78716c', marginBottom: '8px' }}>
            {currentQ + 1} / {QUESTIONS.length}
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
          <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '4px' }}>Your readiness level</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: levelData.color, marginBottom: '4px' }}>
            {levelData.label}
          </div>
          <div style={{ fontSize: '14px', color: '#a8a29e', marginBottom: '16px' }}>
            Score: {totalScore} / 32
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', maxWidth: '200px', margin: '0 auto' }}>
            <div style={{ height: '100%', borderRadius: '4px', background: levelData.color, width: `${(totalScore / 32) * 100}%` }} />
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="https://becandid.io/tools/accountability-quiz?utm_source=embed"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#06b6d4', fontSize: '12px', textDecoration: 'none' }}
        >
          Powered by Be Candid — Take the full quiz
        </a>
      </div>
    </div>
  );
}
