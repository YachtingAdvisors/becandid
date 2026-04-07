'use client';

import { useState, useMemo } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface MoodHeatmapProps {
  moods: Array<{ date: string; mood: number }>; // date = 'YYYY-MM-DD', mood = 1-5
  journals: Array<{ date: string; count: number }>;
}

// ─── Constants ──────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-300',
  3: 'bg-gray-300 dark:bg-gray-600',
  4: 'bg-teal-300',
  5: 'bg-emerald-400',
};

const MOOD_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Below avg',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
};

function getMonthName(month: number): string {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][month];
}

function formatDateLabel(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────

export default function MoodHeatmap({ moods, journals }: MoodHeatmapProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Build lookup maps
  const moodMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of moods) map.set(m.date, m.mood);
    return map;
  }, [moods]);

  const journalMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const j of journals) map.set(j.date, j.count);
    return map;
  }, [journals]);

  // Calendar grid
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: Array<Array<number | null>> = [];
    let current = 1;

    // First row with leading nulls
    const firstRow: Array<number | null> = [];
    for (let i = 0; i < 7; i++) {
      firstRow.push(i < firstDay ? null : current++);
    }
    rows.push(firstRow);

    // Remaining rows
    while (current <= daysInMonth) {
      const row: Array<number | null> = [];
      for (let i = 0; i < 7; i++) {
        row.push(current <= daysInMonth ? current++ : null);
      }
      rows.push(row);
    }

    return rows;
  }, [year, month]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function goBack() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function goForward() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function dateKey(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function handleHover(e: React.MouseEvent, day: number) {
    const key = dateKey(day);
    const mood = moodMap.get(key);
    const jCount = journalMap.get(key) ?? 0;
    const label = formatDateLabel(year, month, day);
    const parts = [label];
    if (mood !== undefined) parts.push(`Mood: ${mood}/5`);
    if (jCount > 0) parts.push(`${jCount} journal${jCount !== 1 ? 's' : ''}`);
    if (mood === undefined && jCount === 0) parts.push('No data');

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parent = (e.currentTarget as HTMLElement).closest('[data-heatmap]')!.getBoundingClientRect();
    setTooltip({
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top - 8,
      text: parts.join(' \u2014 '),
    });
  }

  return (
    <div
      data-heatmap
      className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 sm:p-6 relative"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_left</span>
        </button>
        <h3 className="font-headline text-lg font-bold text-on-surface">
          {getMonthName(month)} {year}
        </h3>
        <button
          onClick={goForward}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_right</span>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-label font-medium text-on-surface-variant/60 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.flat().map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="w-full aspect-square" />;

          const key = dateKey(day);
          const mood = moodMap.get(key);
          const jCount = journalMap.get(key) ?? 0;
          const isToday = key === todayStr;
          const colorClass = mood !== undefined ? MOOD_COLORS[mood] : 'bg-surface-container-low';

          return (
            <div
              key={key}
              className={`
                relative w-full aspect-square rounded-lg flex items-center justify-center cursor-default
                transition-all duration-150
                ${colorClass}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
              onMouseEnter={e => handleHover(e, day)}
              onMouseLeave={() => setTooltip(null)}
            >
              <span className={`text-xs font-label font-medium ${
                mood !== undefined
                  ? mood >= 4 ? 'text-gray-800' : mood <= 2 ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                  : 'text-on-surface-variant/60'
              }`}>
                {day}
              </span>
              {/* Journal dot */}
              {jCount > 0 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface text-xs font-label font-medium whitespace-nowrap shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
        <span className="text-[10px] font-label text-on-surface-variant/60 mr-1">Low</span>
        {[1, 2, 3, 4, 5].map(m => (
          <div key={m} className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${MOOD_COLORS[m]}`} />
          </div>
        ))}
        <span className="text-[10px] font-label text-on-surface-variant/60 ml-1">High</span>
      </div>

      {/* Empty state when no moods logged */}
      {moods.length === 0 && (
        <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2 block">mood</span>
          <h3 className="font-headline text-base font-bold text-on-surface mb-1">No moods logged yet</h3>
          <p className="text-sm text-on-surface-variant font-body max-w-sm mx-auto leading-relaxed">
            Your mood colors will fill in as you journal and complete check-ins.
            Each day becomes a tile in your emotional story.
          </p>
        </div>
      )}
    </div>
  );
}
