'use client';

// ============================================================
// FamilySystemsPanel — Therapist Portal Hero Section
//
// Displays Stringer's six family-of-origin dynamics with:
//   1. Hero cards: Primary Dynamic, Rival Constellation, Top Signals
//   2. Hexagonal radar chart showing all 6 dynamics
//   3. Data quality indicator
//   4. Therapist notes timeline with add/edit
// ============================================================

import { useState } from 'react';
import type { GoalCategory } from '@be-candid/shared';
import { GOAL_LABELS, getCategoryEmoji } from '@be-candid/shared';

// ─── Types ──────────────────────────────────────────────────

interface DynamicScore {
  dynamic: string;
  label: string;
  description: string;
  confidence: number;
  signals: string[];
  parenting_style: string;
  parenting_label: string;
}

interface FamilySystemsAnalysis {
  user_id: string;
  analyzed_at: string;
  rivals: GoalCategory[];
  dynamics: DynamicScore[];
  primary_dynamic: string | null;
  primary_parenting_style: string | null;
  data_quality: 'insufficient' | 'low' | 'moderate' | 'strong';
  journal_count: number;
  event_count: number;
  summary: string;
}

interface TherapistNote {
  id: string;
  dynamic: string | null;
  confirmed: boolean | null;
  confidence_override: number | null;
  parenting_style: string | null;
  note: string;
  note_type: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  analysis: FamilySystemsAnalysis;
  notes: TherapistNote[];
  clientName: string;
  onAddNote?: (note: { dynamic?: string; note: string; note_type: string; confirmed?: boolean; parenting_style?: string }) => Promise<void>;
}

// ─── Constants ──────────────────────────────────────────────

const DYNAMIC_COLORS: Record<string, string> = {
  rigidity: '#a83836',
  enmeshment: '#845500',
  triangulation: '#7c3aed',
  dismissiveness: '#226779',
  abdication: '#4a7c59',
  incongruence: '#b45309',
};

const DYNAMIC_ICONS: Record<string, string> = {
  rigidity: 'gavel',
  enmeshment: 'link',
  triangulation: 'call_split',
  dismissiveness: 'visibility_off',
  abdication: 'exit_to_app',
  incongruence: 'masks',
};

const DATA_QUALITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  insufficient: { label: 'Insufficient Data', color: 'text-on-surface-variant', bg: 'bg-surface-container' },
  low: { label: 'Low Confidence', color: 'text-tertiary', bg: 'bg-tertiary-container/30' },
  moderate: { label: 'Moderate', color: 'text-primary', bg: 'bg-primary-container/30' },
  strong: { label: 'Strong Signal', color: 'text-emerald-700', bg: 'bg-emerald-50' },
};

const NOTE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  observation: { label: 'Observation', icon: 'visibility' },
  family_history: { label: 'Family History', icon: 'family_restroom' },
  attachment_pattern: { label: 'Attachment Pattern', icon: 'favorite' },
  treatment_note: { label: 'Treatment Note', icon: 'clinical_notes' },
  dynamic_assessment: { label: 'Dynamic Assessment', icon: 'psychology' },
};

// ─── Radar Chart (SVG) ─────────────────────────────────────

function RadarChart({ dynamics }: { dynamics: DynamicScore[] }) {
  const size = 280;
  const center = size / 2;
  const maxRadius = 110;
  const levels = 4;

  // 6 dynamics = hexagonal shape
  const angleStep = (Math.PI * 2) / 6;
  const startAngle = -Math.PI / 2; // Start from top

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = startAngle + index * angleStep;
    const radius = (value / 100) * maxRadius;
    return [
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle),
    ];
  };

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, level) => {
    const r = ((level + 1) / levels) * maxRadius;
    const points = Array.from({ length: 6 }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    });
    return `M${points.join('L')}Z`;
  });

  // Axis lines
  const axisLines = Array.from({ length: 6 }, (_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: center + maxRadius * Math.cos(angle),
      y2: center + maxRadius * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = dynamics.map((d, i) => getPoint(i, d.confidence));
  const dataPath = `M${dataPoints.map(p => p.join(',')).join('L')}Z`;

  // Labels
  const labelPositions = dynamics.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = maxRadius + 28;
    return {
      x: center + labelR * Math.cos(angle),
      y: center + labelR * Math.sin(angle),
      label: d.label,
      confidence: d.confidence,
      color: DYNAMIC_COLORS[d.dynamic] || '#226779',
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Grid */}
      {gridPaths.map((path, i) => (
        <path key={i} d={path} fill="none" stroke="var(--color-outline-variant)" strokeWidth="0.5" opacity={0.4} />
      ))}

      {/* Axes */}
      {axisLines.map((line, i) => (
        <line key={i} x1={center} y1={center} x2={line.x2} y2={line.y2} stroke="var(--color-outline-variant)" strokeWidth="0.5" opacity={0.3} />
      ))}

      {/* Data fill */}
      <path d={dataPath} fill="rgba(34,103,121,0.15)" stroke="#226779" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={DYNAMIC_COLORS[dynamics[i].dynamic] || '#226779'} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {labelPositions.map((pos, i) => (
        <g key={i}>
          <text
            x={pos.x}
            y={pos.y - 6}
            textAnchor="middle"
            className="text-[9px] font-semibold"
            fill="var(--color-on-surface)"
          >
            {pos.label}
          </text>
          <text
            x={pos.x}
            y={pos.y + 6}
            textAnchor="middle"
            className="text-[8px]"
            fill={pos.color}
          >
            {pos.confidence}%
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Confidence Ring ────────────────────────────────────────

function ConfidenceRing({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-headline font-extrabold" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function FamilySystemsPanel({ analysis, notes, clientName, onAddNote }: Props) {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('observation');
  const [noteDynamic, setNoteDynamic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const primary = analysis.dynamics[0];
  const secondary = analysis.dynamics[1];
  const topSignals = analysis.dynamics
    .flatMap(d => d.signals.map(s => ({ signal: s, dynamic: d.label, color: DYNAMIC_COLORS[d.dynamic] || '#226779' })))
    .slice(0, 5);

  const qualityConfig = DATA_QUALITY_CONFIG[analysis.data_quality];

  const handleSubmitNote = async () => {
    if (!noteText.trim() || !onAddNote) return;
    setSubmitting(true);
    try {
      await onAddNote({
        note: noteText,
        note_type: noteType,
        dynamic: noteDynamic || undefined,
      });
      setNoteText('');
      setNoteDynamic('');
      setShowNoteForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Section Header ──────────────────────────────────── */}
      <section className="relative pb-4">
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest">Family Systems Analysis</p>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          {clientName}&apos;s Family of Origin
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Based on Jay Stringer&apos;s <em>Unwanted</em> framework — {analysis.journal_count} journal entries, {analysis.event_count} events
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary" />
      </section>

      {/* ── Data Quality Banner ──────────────────────────────── */}
      {analysis.data_quality !== 'strong' && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${qualityConfig.bg} border border-outline-variant/20`}>
          <span className={`material-symbols-outlined text-lg ${qualityConfig.color}`}>
            {analysis.data_quality === 'insufficient' ? 'hourglass_empty' : 'info'}
          </span>
          <div className="flex-1">
            <p className={`text-xs font-label font-bold ${qualityConfig.color}`}>{qualityConfig.label}</p>
            <p className="text-[10px] text-on-surface-variant font-body">
              {analysis.data_quality === 'insufficient'
                ? 'Encourage continued journaling \u2014 the Stringer prompts surface family patterns over time.'
                : `${25 - analysis.journal_count} more journal entries will sharpen these predictions.`}
            </p>
          </div>
        </div>
      )}

      {/* ── Hero Cards (3-column) ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Primary Dynamic Card */}
        <div className="md:col-span-1 bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-xl"
              style={{ color: primary ? DYNAMIC_COLORS[primary.dynamic] : undefined }}
            >
              {primary ? DYNAMIC_ICONS[primary.dynamic] : 'psychology'}
            </span>
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Primary Dynamic</p>
          </div>

          {primary && primary.confidence > 0 ? (
            <>
              <ConfidenceRing value={primary.confidence} color={DYNAMIC_COLORS[primary.dynamic] || '#226779'} size={88} />
              <h3 className="font-headline text-lg font-extrabold text-on-surface mt-3">{primary.label}</h3>
              <p className="text-xs font-label font-semibold mt-1" style={{ color: DYNAMIC_COLORS[primary.dynamic] }}>
                Likely {primary.parenting_label}
              </p>
              <p className="text-[10px] text-on-surface-variant font-body leading-relaxed mt-2">
                {primary.description}
              </p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant font-body mt-4">Not enough data yet</p>
          )}
        </div>

        {/* Rival Constellation Card */}
        <div className="md:col-span-1 bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">hub</span>
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Active Rivals</p>
          </div>

          {analysis.rivals.length > 0 ? (
            <div className="space-y-2">
              {analysis.rivals.slice(0, 6).map((rival) => (
                <div key={rival} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-low">
                  <span className="text-base">{getCategoryEmoji(rival)}</span>
                  <span className="text-xs font-label font-medium text-on-surface truncate">{GOAL_LABELS[rival] || rival}</span>
                </div>
              ))}
              {analysis.rivals.length > 6 && (
                <p className="text-[10px] text-on-surface-variant font-label text-center">+{analysis.rivals.length - 6} more</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant font-body">No rivals selected</p>
          )}

          <div className="mt-4 pt-3 border-t border-outline-variant/30 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-lg font-headline font-extrabold text-on-surface">{analysis.journal_count}</p>
              <p className="text-[9px] font-label text-on-surface-variant">Journals</p>
            </div>
            <div>
              <p className="text-lg font-headline font-extrabold text-on-surface">{analysis.event_count}</p>
              <p className="text-[9px] font-label text-on-surface-variant">Events</p>
            </div>
          </div>
        </div>

        {/* Top Signals Card */}
        <div className="md:col-span-1 bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">trending_up</span>
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Top Signals</p>
          </div>

          {topSignals.length > 0 ? (
            <div className="space-y-2.5">
              {topSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: signal.color }} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-body text-on-surface leading-snug">{signal.signal}</p>
                    <p className="text-[9px] font-label font-medium" style={{ color: signal.color }}>{signal.dynamic}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant font-body">No signals detected yet</p>
          )}
        </div>
      </section>

      {/* ── Radar Chart ──────────────────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">hexagon</span>
          <h3 className="font-headline text-base font-bold text-on-surface">Dynamic Profile</h3>
          <span className={`ml-auto inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold ${qualityConfig.bg} ${qualityConfig.color}`}>
            {qualityConfig.label}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant font-body mb-4">
          Six family-of-origin dynamics from Stringer&apos;s research, scored by rival selection, journal analysis, and behavioral patterns.
        </p>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Radar */}
          <div className="flex-1 w-full max-w-xs">
            <RadarChart dynamics={analysis.dynamics} />
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5 w-full">
            {analysis.dynamics.map((d) => (
              <div key={d.dynamic} className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: DYNAMIC_COLORS[d.dynamic] }}
                >
                  {DYNAMIC_ICONS[d.dynamic]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-label font-bold text-on-surface">{d.label}</span>
                    <span className="text-[10px] font-label" style={{ color: DYNAMIC_COLORS[d.dynamic] }}>
                      {d.confidence}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-container-low rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${d.confidence}%`,
                        backgroundColor: DYNAMIC_COLORS[d.dynamic],
                      }}
                    />
                  </div>
                </div>
                <span className="text-[9px] font-label text-on-surface-variant whitespace-nowrap">{d.parenting_label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Summary ───────────────────────────────────────── */}
      {analysis.summary && (
        <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl border border-primary/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg text-primary">auto_awesome</span>
            <h3 className="font-headline text-sm font-bold text-on-surface">Analysis Summary</h3>
          </div>
          <p className="text-sm text-on-surface-variant font-body leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </p>
        </section>
      )}

      {/* ── Therapist Notes Timeline ─────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">clinical_notes</span>
            <h3 className="font-headline text-base font-bold text-on-surface">Clinical Notes</h3>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold bg-surface-container text-on-surface-variant">
              {notes.length}
            </span>
          </div>
          {onAddNote && (
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Note
            </button>
          )}
        </div>

        {/* Add note form */}
        {showNoteForm && onAddNote && (
          <div className="px-5 py-4 border-b border-outline-variant/30 bg-surface-container-low/50 space-y-3">
            <div className="flex gap-3">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-label focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {Object.entries(NOTE_TYPE_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={noteDynamic}
                onChange={(e) => setNoteDynamic(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-label focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">General (no dynamic)</option>
                {analysis.dynamics.map((d) => (
                  <option key={d.dynamic} value={d.dynamic}>{d.label}</option>
                ))}
              </select>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Clinical observation, family history, attachment pattern..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNoteForm(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
              <button
                onClick={handleSubmitNote}
                disabled={!noteText.trim() || submitting}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {notes.map((note) => {
              const typeConfig = NOTE_TYPE_LABELS[note.note_type] || NOTE_TYPE_LABELS.observation;
              const dynamicColor = note.dynamic ? DYNAMIC_COLORS[note.dynamic] : undefined;
              return (
                <div key={note.id} className="px-5 py-4 hover:bg-surface-container-low/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{typeConfig.icon}</span>
                    <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">{typeConfig.label}</span>
                    {note.dynamic && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-label font-semibold" style={{ backgroundColor: `${dynamicColor}15`, color: dynamicColor }}>
                        <span className="material-symbols-outlined text-[10px]">{DYNAMIC_ICONS[note.dynamic]}</span>
                        {analysis.dynamics.find(d => d.dynamic === note.dynamic)?.label}
                      </span>
                    )}
                    {note.confirmed === true && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-label font-semibold bg-emerald-50 text-emerald-700">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Confirmed
                      </span>
                    )}
                    {note.confirmed === false && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-label font-semibold bg-red-50 text-error">
                        <span className="material-symbols-outlined text-[10px]">cancel</span>
                        Denied
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-on-surface-variant/60 font-body">
                      {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface font-body leading-relaxed pl-6">{note.note}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">edit_note</span>
            <p className="text-sm text-on-surface-variant font-body">No clinical notes yet</p>
            <p className="text-[10px] text-on-surface-variant/60 font-body mt-1">
              Add family-of-origin observations, attachment patterns, and treatment notes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
