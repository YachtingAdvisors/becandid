'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';

/* ─── Widget registry ───────────────────────────────────── */
export interface WidgetDef {
  id: string;
  label: string;
  icon: string;
}

export const WIDGET_REGISTRY: WidgetDef[] = [
  { id: 'hero', label: 'Dashboard Hero', icon: 'dashboard' },
  { id: 'commitment', label: 'Daily Pledge', icon: 'wb_twilight' },
  { id: 'mood', label: 'Quick Mood', icon: 'mood' },
  { id: 'assessment', label: 'Rival Assessment', icon: 'psychology_alt' },
  { id: 'focus-board', label: 'Focus Board', icon: 'center_focus_strong' },
  { id: 'checkin', label: 'Check-in Status', icon: 'check_circle' },
  { id: 'featured', label: 'Featured Cards', icon: 'grid_view' },
  { id: 'whats-new', label: "What's New", icon: 'new_releases' },
  { id: 'coach', label: 'Scheduled Coach', icon: 'psychology' },
  { id: 'nudges', label: 'Nudges', icon: 'notifications_active' },
  { id: 'quote', label: 'Quote of the Day', icon: 'format_quote' },
  { id: 'challenge', label: 'Daily Challenge', icon: 'emoji_events' },
  { id: 'chips', label: 'Focus Chips', icon: 'military_tech' },
  { id: 'relationship', label: 'Relationship', icon: 'favorite' },
  { id: 'growth-journal', label: 'Growth Journal', icon: 'auto_stories' },
  { id: 'referral', label: 'Referral', icon: 'share' },
  { id: 'spouse', label: 'Partner Impact', icon: 'people' },
  { id: 'screen-content', label: 'Screen Time & Filter', icon: 'timer' },
  { id: 'inventory', label: 'Daily Inventory', icon: 'self_improvement' },
  { id: 'weekly-report', label: 'Weekly Report', icon: 'summarize' },
  { id: 'services', label: 'Other Services', icon: 'apps' },
  { id: 'events', label: 'Recent Events', icon: 'timeline' },
];

interface SavedLayout {
  order: string[];
  hidden: string[];
}

const DEFAULT_ORDER = WIDGET_REGISTRY.map(w => w.id);
// Hide advanced widgets by default — reduce new-user overwhelm
const DEFAULT_HIDDEN = ['referral', 'services', 'events', 'inventory', 'weekly-report', 'screen-content', 'spouse'];
const STORAGE_KEY = 'becandid-dashboard-layout';

function loadLayout(): SavedLayout {
  if (typeof window === 'undefined') return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedIds = new Set(parsed.order ?? []);
      const merged = [...(parsed.order ?? [])];
      for (const id of DEFAULT_ORDER) {
        if (!savedIds.has(id)) merged.push(id);
      }
      return { order: merged, hidden: parsed.hidden ?? [] };
    }
  } catch {}
  return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN };
}

function persistLayout(layout: SavedLayout) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  fetch('/api/dashboard/layout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(layout),
  }).catch(() => {});
}

/* ─── Component ──────────────────────────────────────────── */
interface Props {
  widgets: Record<string, ReactNode>;
}

export default function DashboardCustomizer({ widgets }: Props) {
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<SavedLayout>({ order: DEFAULT_ORDER, hidden: [] });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setLayout(loadLayout());
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setLayout(prev => {
      const hidden = prev.hidden.includes(id)
        ? prev.hidden.filter(h => h !== id)
        : [...prev.hidden, id];
      const next = { ...prev, hidden };
      persistLayout(next);
      return next;
    });
  }, []);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) setDragOverId(id);
  }

  function handleDrop(id: string) {
    if (draggedId && draggedId !== id) {
      setLayout(prev => {
        const order = [...prev.order];
        const fromIdx = order.indexOf(draggedId);
        const toIdx = order.indexOf(id);
        if (fromIdx === -1 || toIdx === -1) return prev;
        order.splice(fromIdx, 1);
        order.splice(toIdx, 0, draggedId);
        const next = { ...prev, order };
        persistLayout(next);
        return next;
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  function resetLayout() {
    const fresh = { order: DEFAULT_ORDER, hidden: [] };
    setLayout(fresh);
    persistLayout(fresh);
  }

  // Touch drag support — use move up/down buttons as fallback
  function moveUp(id: string) {
    setLayout(prev => {
      const order = [...prev.order];
      const idx = order.indexOf(id);
      if (idx <= 0) return prev;
      [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
      const next = { ...prev, order };
      persistLayout(next);
      return next;
    });
  }

  function moveDown(id: string) {
    setLayout(prev => {
      const order = [...prev.order];
      const idx = order.indexOf(id);
      if (idx === -1 || idx >= order.length - 1) return prev;
      [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      const next = { ...prev, order };
      persistLayout(next);
      return next;
    });
  }

  return (
    <>
      {/* Edit toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setEditing(!editing)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-label font-semibold transition-all duration-200 cursor-pointer ${
            editing
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container-lowest text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {editing ? 'check' : 'dashboard_customize'}
          </span>
          {editing ? 'Done Editing' : 'Customize'}
        </button>
      </div>

      {/* Widget manager panel */}
      {editing && (
        <div className="mb-6 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">widgets</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">Dashboard Widgets</h3>
            </div>
            <button
              onClick={resetLayout}
              className="text-xs font-label font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
          <p className="text-xs text-on-surface-variant font-body">
            Drag to reorder. Use the eye icon to show or hide widgets.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {layout.order.map(id => {
              const def = WIDGET_REGISTRY.find(w => w.id === id);
              if (!def) return null;
              const isHidden = layout.hidden.includes(id);
              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-label transition-all duration-200 ${
                    isHidden
                      ? 'bg-surface-container text-on-surface-variant/50'
                      : 'bg-primary/5 text-on-surface ring-1 ring-primary/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{def.icon}</span>
                  <span className="flex-1 truncate font-medium">{def.label}</span>
                  <button
                    onClick={() => toggleWidget(id)}
                    className="shrink-0 cursor-pointer hover:text-primary transition-colors"
                    title={isHidden ? 'Show widget' : 'Hide widget'}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isHidden ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rendered widgets in user's order */}
      <div className="space-y-8">
        {layout.order.map((id, idx) => {
          const content = widgets[id];
          if (!content) return null;
          const isHidden = layout.hidden.includes(id);
          if (isHidden && !editing) return null;

          return (
            <div
              key={id}
              draggable={editing}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 ${
                editing ? 'group/widget' : ''
              } ${isHidden && editing ? 'opacity-30' : ''
              } ${dragOverId === id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl' : ''
              } ${draggedId === id ? 'opacity-40 scale-[0.98]' : ''}`}
            >
              {editing && (
                <div className="absolute -left-3 top-2 z-10 flex flex-col items-center gap-0.5 opacity-0 group-hover/widget:opacity-100 transition-opacity">
                  <button onClick={() => moveUp(id)} className="w-6 h-6 rounded-md bg-surface-container-lowest ring-1 ring-outline-variant/30 shadow-sm flex items-center justify-center cursor-pointer hover:bg-primary/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-xs">keyboard_arrow_up</span>
                  </button>
                  <div className="w-6 h-6 rounded-md bg-surface-container-lowest ring-1 ring-outline-variant/30 shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <span className="material-symbols-outlined text-on-surface-variant text-xs">drag_indicator</span>
                  </div>
                  <button onClick={() => moveDown(id)} className="w-6 h-6 rounded-md bg-surface-container-lowest ring-1 ring-outline-variant/30 shadow-sm flex items-center justify-center cursor-pointer hover:bg-primary/10">
                    <span className="material-symbols-outlined text-on-surface-variant text-xs">keyboard_arrow_down</span>
                  </button>
                </div>
              )}
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
}
