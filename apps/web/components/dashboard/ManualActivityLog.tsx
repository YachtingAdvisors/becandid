'use client';

import { useState, useEffect, useCallback } from 'react';
import { ALL_GOAL_CATEGORIES, GOAL_LABELS } from '@be-candid/shared';
import type { GoalCategory } from '@be-candid/shared';

interface ManualActivityLogProps {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
}

const DURATION_PRESETS = [5, 15, 30, 60];

function getSeverity(minutes: number): 'low' | 'medium' | 'high' {
  if (minutes < 15) return 'low';
  if (minutes <= 60) return 'medium';
  return 'high';
}

export default function ManualActivityLog({ open, onClose, onLogged }: ManualActivityLogProps) {
  const [category, setCategory] = useState<GoalCategory>(ALL_GOAL_CATEGORIES[0]);
  const [duration, setDuration] = useState<number>(15);
  const [customDuration, setCustomDuration] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const effectiveDuration = useCustom ? (parseInt(customDuration, 10) || 0) : duration;

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, handleEscape]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (effectiveDuration <= 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          severity: getSeverity(effectiveDuration),
          platform: 'web',
          app_name: appName.trim() || undefined,
          duration_seconds: effectiveDuration * 60,
          metadata: { type: 'self_report' },
        }),
      });

      if (res.ok) {
        onLogged();
        setToast(true);
        setTimeout(() => {
          setToast(false);
          onClose();
          // Reset form
          setCategory(ALL_GOAL_CATEGORIES[0]);
          setDuration(15);
          setCustomDuration('');
          setUseCustom(false);
          setAppName('');
        }, 1000);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-2xl p-6 w-full max-w-md">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-2 rounded-full font-label font-bold text-sm shadow-lg animate-pulse">
            Logged!
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-lg font-bold text-on-surface">Log Activity</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2 block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GoalCategory)}
            className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 ring-1 ring-outline-variant/10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all duration-200"
          >
            {ALL_GOAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {GOAL_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="mb-5">
          <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2 block">
            Duration (minutes)
          </label>
          <div className="flex gap-2 mb-2">
            {DURATION_PRESETS.map((mins) => (
              <button
                key={mins}
                onClick={() => { setDuration(mins); setUseCustom(false); }}
                className={`flex-1 py-2.5 rounded-xl font-label text-sm font-bold transition-all duration-200 cursor-pointer ${
                  !useCustom && duration === mins
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant hover:ring-1 hover:ring-primary/20'
                }`}
              >
                {mins}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            placeholder="Custom minutes..."
            value={customDuration}
            onChange={(e) => { setCustomDuration(e.target.value); setUseCustom(true); }}
            onFocus={() => setUseCustom(true)}
            className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 ring-1 ring-outline-variant/10 font-body text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          />
        </div>

        {/* App / Site name */}
        <div className="mb-6">
          <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2 block">
            App or site name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Instagram, YouTube..."
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 ring-1 ring-outline-variant/10 font-body text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          />
        </div>

        {/* Severity indicator */}
        {effectiveDuration > 0 && (
          <div className="mb-5 flex items-center gap-2">
            <span className="font-label text-xs text-on-surface-variant">Severity:</span>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-wider ${
              getSeverity(effectiveDuration) === 'low'
                ? 'bg-tertiary-container text-on-tertiary-container'
                : getSeverity(effectiveDuration) === 'medium'
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-error/10 text-error'
            }`}>
              {getSeverity(effectiveDuration)}
            </span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || effectiveDuration <= 0}
          className="w-full py-3.5 bg-primary text-on-primary rounded-full font-label font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Logging...
            </span>
          ) : (
            'Log Activity'
          )}
        </button>
      </div>
    </div>
  );
}
