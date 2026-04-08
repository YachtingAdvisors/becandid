// ============================================================
// components/dashboard/WidgetManager.tsx
//
// Slide-over panel for adding/removing/reordering dashboard
// widgets. Accessed via a "Customize" button on the dashboard.
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { WIDGET_REGISTRY, getCategoryLabel, getDefaultWidgets, type WidgetDef } from '@/lib/widgets/registry';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: (widgets: string[]) => void;
  userGoals?: string[];
  userMotivator?: string;
}

export default function WidgetManager({ open, onClose, onUpdate, userGoals = [], userMotivator = 'general' }: Props) {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current widget config
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/widgets')
      .then(r => r.json())
      .then(data => setActiveWidgets(data.widgets ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // Available widgets (filtered by user's goals)
  const available = WIDGET_REGISTRY.filter(w => {
    if (w.requiresGoal && !userGoals.includes(w.requiresGoal)) return false;
    return true;
  });

  // Group by category
  const categories = ['daily', 'monitoring', 'growth', 'social', 'info'];
  const grouped = categories.map(cat => ({
    category: cat,
    label: getCategoryLabel(cat),
    widgets: available.filter(w => w.category === cat),
  })).filter(g => g.widgets.length > 0);

  const toggleWidget = useCallback(async (widgetId: string, enabled: boolean) => {
    const action = enabled ? 'add' : 'remove';
    setSaving(true);
    try {
      const res = await fetch('/api/widgets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, widgetId }),
      });
      const data = await res.json();
      if (data.widgets) {
        setActiveWidgets(data.widgets);
        onUpdate(data.widgets);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }, [onUpdate]);

  const resetToDefaults = useCallback(async () => {
    setSaving(true);
    const defaults = getDefaultWidgets(userGoals, userMotivator);
    try {
      const res = await fetch('/api/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: defaults }),
      });
      const data = await res.json();
      if (data.widgets) {
        setActiveWidgets(data.widgets);
        onUpdate(data.widgets);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }, [userGoals, userMotivator, onUpdate]);

  const moveWidget = useCallback(async (widgetId: string, direction: 'up' | 'down') => {
    const idx = activeWidgets.indexOf(widgetId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= activeWidgets.length) return;

    const updated = [...activeWidgets];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];

    setActiveWidgets(updated);
    setSaving(true);
    try {
      const res = await fetch('/api/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updated }),
      });
      const data = await res.json();
      if (data.widgets) onUpdate(data.widgets);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }, [activeWidgets, onUpdate]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-surface-container-lowest shadow-2xl overflow-y-auto transform transition-transform">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Customize Dashboard</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Add, remove, or reorder your widgets</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-on-surface-variant">close</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 skeleton-shimmer rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="p-6">
            {/* Active widgets — reorderable */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-headline font-bold text-on-surface">Active Widgets</h3>
                <span className="text-[10px] font-label text-on-surface-variant">{activeWidgets.length} active</span>
              </div>
              <div className="space-y-2">
                {activeWidgets.map((id, idx) => {
                  const w = WIDGET_REGISTRY.find(r => r.id === id);
                  if (!w) return null;
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10">
                      <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {w.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-label font-semibold text-on-surface truncate">{w.name}</p>
                      </div>
                      {!w.alwaysOn && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveWidget(id, 'up')}
                            disabled={idx === 0 || saving}
                            className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_upward</span>
                          </button>
                          <button
                            onClick={() => moveWidget(id, 'down')}
                            disabled={idx === activeWidgets.length - 1 || saving}
                            className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_downward</span>
                          </button>
                          <button
                            onClick={() => toggleWidget(id, false)}
                            disabled={saving}
                            className="p-1 rounded hover:bg-error/10 transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm text-error">remove_circle</span>
                          </button>
                        </div>
                      )}
                      {w.alwaysOn && (
                        <span className="text-[10px] font-label text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Required</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available widgets by category */}
            {grouped.map(group => {
              const inactiveInGroup = group.widgets.filter(w => !activeWidgets.includes(w.id) && !w.alwaysOn);
              if (inactiveInGroup.length === 0) return null;

              return (
                <div key={group.category} className="mb-6">
                  <h3 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {inactiveInGroup.map(w => (
                      <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                        <span className="material-symbols-outlined text-base text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {w.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-label font-semibold text-on-surface">{w.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate">{w.description}</p>
                        </div>
                        <button
                          onClick={() => toggleWidget(w.id, true)}
                          disabled={saving}
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm text-primary">add_circle</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Reset button */}
            <div className="pt-4 border-t border-outline-variant/10">
              <button
                onClick={resetToDefaults}
                disabled={saving}
                className="w-full py-2.5 text-sm font-label font-medium text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : 'Reset to Recommended Defaults'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
