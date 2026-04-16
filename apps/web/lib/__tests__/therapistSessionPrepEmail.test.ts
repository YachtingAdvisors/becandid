import { describe, expect, it } from 'vitest';
import { buildTherapistSessionPrepEmail } from '../therapistSessionPrepEmail';

describe('buildTherapistSessionPrepEmail', () => {
  it('escapes model and user derived content before inserting HTML', () => {
    const html = buildTherapistSessionPrepEmail({
      client_name: '<img src=x onerror=alert(1)>',
      overall_summary: '<script>alert("xss")</script>',
      generated_at: '2026-04-15T12:00:00.000Z',
      period_days: 14,
      mood_trajectory: {
        trend: '<b>volatile</b>',
        average: 3,
        notable_shifts: ['<a href="https://evil.test">click me</a>'],
      },
      journal_themes: {
        tributaries: ['fear'],
        longings: ['peace'],
        roadmap_insights: ['<iframe src="https://evil.test"></iframe>'],
        recurring_tags: ['support'],
      },
      behavioral_patterns: {
        summary: '<svg onload=alert(1)>pattern</svg>',
        frequency_note: 'Daily',
      },
      talking_points: ['Ask about <strong>triggers</strong>'],
      risk_flags: ['<script>bad()</script>'],
      growth_observations: ['<a href="https://evil.test">progress</a>'],
      data_summary: {
        journal_entries: 2,
        mood_readings: 3,
        events: 1,
        outcomes: 0,
      },
    });

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<a href="https://evil.test">');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;a href=&quot;https://evil.test&quot;&gt;click me&lt;/a&gt;');
    expect(html).toContain('&lt;strong&gt;triggers&lt;/strong&gt;');
  });
});
