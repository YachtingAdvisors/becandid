'use client';

import { useState } from 'react';
import {
  CATEGORY_GROUPS,
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  getCategoryEmoji,
  type GoalCategory,
  type CategoryGroup,
} from '@be-candid/shared';

interface GoalSelectorProps {
  selected: GoalCategory[];
  onChange: (goals: GoalCategory[]) => void;
  disabled?: boolean;
}

export default function GoalSelector({ selected, onChange, disabled }: GoalSelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  function toggleGoal(goal: GoalCategory) {
    if (disabled) return;
    if (selected.includes(goal)) {
      onChange(selected.filter(g => g !== goal));
    } else {
      onChange([...selected, goal]);
    }
  }

  function toggleGroup(group: CategoryGroup) {
    if (disabled) return;
    const allSelected = group.categories.every(c => selected.includes(c));
    if (allSelected) {
      onChange(selected.filter(g => !group.categories.includes(g)));
    } else {
      const newSelected = [...new Set([...selected, ...group.categories])];
      onChange(newSelected);
    }
  }

  function getGroupSelectionCount(group: CategoryGroup): number {
    return group.categories.filter(c => selected.includes(c)).length;
  }

  return (
    <div className="space-y-3">
      {CATEGORY_GROUPS.map((group) => {
        const selectedCount = getGroupSelectionCount(group);
        const totalCount = group.categories.length;
        const isExpanded = expandedGroup === group.label;
        const hasAnySelected = selectedCount > 0;

        return (
          <div
            key={group.label}
            className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
              hasAnySelected
                ? 'border-primary bg-primary-container/20'
                : 'border-outline-variant bg-surface-container-lowest hover:border-primary/30'
            }`}
          >
            {/* Group header */}
            <button
              type="button"
              onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
              disabled={disabled}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left disabled:opacity-50"
            >
              <span className="text-2xl flex-shrink-0">{group.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-on-surface font-label">{group.label}</span>
                  {selectedCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug font-body">{group.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {totalCount > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group);
                    }}
                    disabled={disabled}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg font-label transition-colors ${
                      selectedCount === totalCount
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary'
                    }`}
                  >
                    {selectedCount === totalCount ? 'All ✓' : 'All'}
                  </button>
                )}
                <svg
                  className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded category list */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-1.5 border-t border-outline-variant/50 pt-2">
                {group.categories.map((cat) => {
                  const isSelected = selected.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleGoal(cat)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-primary-container border-2 border-primary'
                          : 'bg-surface-container-lowest border-2 border-outline-variant hover:border-primary/30'
                      } disabled:opacity-50`}
                    >
                      <span className="text-lg flex-shrink-0">{getCategoryEmoji(cat)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-on-surface font-label">{GOAL_LABELS[cat]}</div>
                        <div className="text-[11px] text-on-surface-variant leading-snug mt-0.5 font-body">
                          {GOAL_DESCRIPTIONS[cat]}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Collapsed but has selections — show selected pills */}
            {!isExpanded && hasAnySelected && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {group.categories
                  .filter(c => selected.includes(c))
                  .map(cat => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container text-primary text-[11px] font-medium font-label"
                    >
                      {getCategoryEmoji(cat)} {GOAL_LABELS[cat]}
                    </span>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom option — always visible at bottom */}
      <button
        type="button"
        onClick={() => toggleGoal('custom')}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
          selected.includes('custom')
            ? 'border-primary bg-primary-container/20'
            : 'border-dashed border-outline-variant hover:border-primary/30'
        } disabled:opacity-50`}
      >
        <span className="text-2xl">⚙️</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-on-surface font-label">Custom</div>
          <p className="text-xs text-on-surface-variant mt-0.5 font-body">Define your own category to monitor</p>
        </div>
        {selected.includes('custom') && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      {/* Selection summary */}
      <div className="text-center pt-1">
        <span className={`text-sm font-medium font-label ${selected.length > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
          {selected.length === 0
            ? 'Select at least one area to monitor'
            : `${selected.length} area${selected.length !== 1 ? 's' : ''} selected`}
        </span>
      </div>
    </div>
  );
}
