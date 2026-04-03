'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface SessionReport {
  client_name: string;
  generated_at: string;
  period_days: number;
  overall_summary: string;
  mood_trajectory: {
    trend: string;
    average: number | null;
    notable_shifts: string[];
  };
  journal_themes: {
    tributaries: string[];
    longings: string[];
    roadmap_insights: string[];
    recurring_tags: string[];
  };
  behavioral_patterns: {
    summary: string;
    frequency_note: string;
    time_patterns: string;
  };
  talking_points: string[];
  risk_flags: string[];
  growth_observations: string[];
  data_summary: {
    journal_entries: number;
    mood_readings: number;
    focus_segments: number;
    events: number;
    outcomes: number;
    family_notes: number;
    nudges: number;
  };
}

export default function SessionReportPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/therapist/session-prep?client_id=${clientId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to generate report');
        return;
      }
      setReport(await res.json());
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const dateRange = report
    ? `${new Date(new Date(report.generated_at).getTime() - report.period_days * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(report.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#226779] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Generating session prep report...</p>
          <p className="text-xs text-gray-400">Analyzing 14 days of client data with AI</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchReport}
            className="text-sm text-[#226779] underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { padding: 0 !important; max-width: 100% !important; box-shadow: none !important; }
          .report-section { break-inside: avoid; }
          @page { margin: 0.75in; size: letter; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print button bar */}
        <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Session Prep Report &mdash; {report.client_name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.close()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#226779] text-white text-sm font-medium rounded-lg hover:bg-[#1b5463] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report content */}
        <div className="print-page max-w-3xl mx-auto bg-white shadow-sm print:shadow-none p-8 sm:p-10 my-6 print:my-0 space-y-6">

          {/* Header */}
          <header className="border-b border-gray-200 pb-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Session Prep Report &mdash; {report.client_name}
            </h1>
            <p className="text-sm text-gray-500">
              {report.period_days}-day window &middot; {dateRange}
            </p>
            <p className="text-sm text-gray-500">
              Data: {report.data_summary.journal_entries} journal entries,{' '}
              {report.data_summary.mood_readings} mood readings,{' '}
              {report.data_summary.events} events,{' '}
              {report.data_summary.outcomes} outcomes
            </p>
          </header>

          {/* Overall summary */}
          {report.overall_summary && (
            <section className="report-section">
              <p className="text-sm text-gray-700 leading-relaxed">{report.overall_summary}</p>
            </section>
          )}

          {/* Mood Trajectory */}
          <section className="report-section">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#226779] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mood</span>
              Mood Trajectory
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
              <p><strong>Trend:</strong> {report.mood_trajectory?.trend || 'N/A'}</p>
              {report.mood_trajectory?.average != null && (
                <p><strong>Average:</strong> {report.mood_trajectory.average}/5</p>
              )}
              {report.mood_trajectory?.notable_shifts?.length > 0 && (
                <p><strong>Notable shifts:</strong> {report.mood_trajectory.notable_shifts.join('; ')}</p>
              )}
            </div>
          </section>

          {/* Journal Themes */}
          {report.journal_themes && (
            <section className="report-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#7c3aed] mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>book</span>
                Journal Themes
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                {report.journal_themes.tributaries?.length > 0 && (
                  <div>
                    <strong>Tributaries:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                      {report.journal_themes.tributaries.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}
                {report.journal_themes.longings?.length > 0 && (
                  <div>
                    <strong>Longings:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                      {report.journal_themes.longings.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                )}
                {report.journal_themes.roadmap_insights?.length > 0 && (
                  <div>
                    <strong>Roadmap Insights:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                      {report.journal_themes.roadmap_insights.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {report.journal_themes.recurring_tags?.length > 0 && (
                  <p><strong>Recurring Tags:</strong> {report.journal_themes.recurring_tags.join(', ')}</p>
                )}
              </div>
            </section>
          )}

          {/* Behavioral Patterns */}
          {report.behavioral_patterns && (
            <section className="report-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#d97706] mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>analytics</span>
                Behavioral Patterns
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
                <p>{report.behavioral_patterns.summary}</p>
                {report.behavioral_patterns.frequency_note && (
                  <p className="text-gray-500 text-xs">{report.behavioral_patterns.frequency_note}</p>
                )}
                {report.behavioral_patterns.time_patterns && (
                  <p className="text-gray-500 text-xs">{report.behavioral_patterns.time_patterns}</p>
                )}
              </div>
            </section>
          )}

          {/* Suggested Talking Points */}
          {report.talking_points?.length > 0 && (
            <section className="report-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7] mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                Suggested Talking Points
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  {report.talking_points.map((point, i) => (
                    <li key={i} className="leading-relaxed">
                      <strong>{point}</strong>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* Risk Flags */}
          {report.risk_flags?.length > 0 && (
            <section className="report-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                Risk Flags
              </h2>
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {report.risk_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">!</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Growth Observations */}
          {report.growth_observations?.length > 0 && (
            <section className="report-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                Growth Observations
              </h2>
              <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {report.growth_observations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                      <span className="text-emerald-600 shrink-0 mt-0.5">&#10003;</span>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-4 mt-8">
            <p className="text-xs text-gray-400 text-center">
              Generated by Be Candid &mdash; becandid.io &middot;{' '}
              {new Date(report.generated_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
