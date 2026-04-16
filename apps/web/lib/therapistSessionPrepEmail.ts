import { escapeHtml } from '@/lib/security';

export function buildTherapistSessionPrepEmail(report: any): string {
  const clientName = escapeHtml(String(report.client_name || 'Unknown'));
  const overallSummary = escapeHtml(String(report.overall_summary || ''));
  const moodTrend = escapeHtml(String(report.mood_trajectory?.trend || 'N/A'));
  const averageValue = report.mood_trajectory?.average != null
    ? escapeHtml(`${report.mood_trajectory.average}/5`)
    : 'N/A';
  const notableShifts = renderInlineList(report.mood_trajectory?.notable_shifts);
  const tributaries = renderInlineList(report.journal_themes?.tributaries);
  const longings = renderInlineList(report.journal_themes?.longings);
  const roadmapInsights = renderInlineList(report.journal_themes?.roadmap_insights);
  const recurringTags = renderInlineList(report.journal_themes?.recurring_tags);
  const behavioralSummary = escapeHtml(String(report.behavioral_patterns?.summary || 'N/A'));
  const behavioralFrequency = escapeHtml(String(report.behavioral_patterns?.frequency_note || ''));
  const talkingPoints = renderBulletList(report.talking_points);

  const riskSection = report.risk_flags?.length
    ? `<div style="background:#fef2f2;border-left:3px solid #ef4444;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#ef4444;margin:0 0 8px;">Risk Flags</h3>
        <ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
          ${renderBulletList(report.risk_flags)}
        </ul>
      </div>`
    : '';

  const growthSection = report.growth_observations?.length
    ? `<div style="background:#f0fdf4;border-left:3px solid #10b981;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#10b981;margin:0 0 8px;">Growth Observations</h3>
        <ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
          ${renderBulletList(report.growth_observations)}
        </ul>
      </div>`
    : '';

  return `
    <h2 style="color:#226779;font-size:20px;margin-bottom:4px;">Session Prep Report</h2>
    <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
      ${clientName} &mdash; ${escapeHtml(String(report.period_days || 14))}-day briefing &mdash; Generated ${escapeHtml(new Date(report.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))}
    </p>

    <p style="margin:0 0 20px;color:#374151;line-height:1.6;font-size:14px;">${overallSummary}</p>

    <div style="background:#f8f7ff;border-left:3px solid #226779;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#226779;margin:0 0 8px;">Mood Trajectory</h3>
      <p style="margin:0;color:#374151;line-height:1.6;font-size:14px;">
        <strong>Trend:</strong> ${moodTrend}<br/>
        <strong>Average:</strong> ${averageValue}
      </p>
      ${notableShifts ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Notable: ${notableShifts}</p>` : ''}
    </div>

    <div style="background:#f8f7ff;border-left:3px solid #7c3aed;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#7c3aed;margin:0 0 8px;">Journal Themes</h3>
      ${tributaries ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Tributaries:</strong> ${tributaries}</p>` : ''}
      ${longings ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Longings:</strong> ${longings}</p>` : ''}
      ${roadmapInsights ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Roadmap:</strong> ${roadmapInsights}</p>` : ''}
      ${recurringTags ? `<p style="margin:0;color:#374151;font-size:13px;"><strong>Tags:</strong> ${recurringTags}</p>` : ''}
    </div>

    <div style="background:#fefce8;border-left:3px solid #d97706;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#d97706;margin:0 0 8px;">Behavioral Patterns</h3>
      <p style="margin:0;color:#374151;line-height:1.6;font-size:14px;">${behavioralSummary}</p>
      ${behavioralFrequency ? `<p style="margin:6px 0 0;color:#6b7280;font-size:13px;">${behavioralFrequency}</p>` : ''}
    </div>

    <div style="background:#f0f9ff;border-left:3px solid #0284c7;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#0284c7;margin:0 0 8px;">Suggested Talking Points</h3>
      <ol style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
        ${talkingPoints}
      </ol>
    </div>

    ${riskSection}
    ${growthSection}

    <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;line-height:1.5;text-align:center;">
      Data summary: ${escapeHtml(String(report.data_summary?.journal_entries ?? 0))} journal entries, ${escapeHtml(String(report.data_summary?.mood_readings ?? 0))} mood readings, ${escapeHtml(String(report.data_summary?.events ?? 0))} events, ${escapeHtml(String(report.data_summary?.outcomes ?? 0))} outcomes
    </p>
  `;
}

function renderInlineList(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item) => escapeHtml(String(item))).join(', ');
}

function renderBulletList(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('');
}
