'use client';

import {
  CATEGORY_GROUPS,
  type GoalCategory,
  type CategoryGroup,
} from '@be-candid/shared';

interface GoalSelectorProps {
  selected: GoalCategory[];
  onChange: (goals: GoalCategory[]) => void;
  disabled?: boolean;
}

/* Material icon for each group label */
const GROUP_ICONS: Record<string, string> = {
  'Sexual Content': 'volcano',
  'Compulsive Consumption': 'shopping_basket',
  'Substances & Recovery': 'pill',
  'Body Image & Eating Disorders': 'accessibility_new',
  'Gambling & Financial': 'account_balance_wallet',
  'Dating & Relationships': 'favorite',
  'Gaming': 'sports_esports',
  'Rage & Outrage': 'mode_comment',
};

/* Short user-facing descriptions for the bento cards */
const GROUP_SHORT_DESC: Record<string, string> = {
  'Sexual Content': 'Navigating digital consumption and boundaries.',
  'Compulsive Consumption': 'Managing the urge for excessive buying or scrolling.',
  'Substances & Recovery': 'Staying clean and maintaining sobriety goals.',
  'Body Image & Eating Disorders': 'Developing a healthy relationship with yourself.',
  'Gambling & Financial': 'Restoring balance to your finances and risk-taking.',
  'Dating & Relationships': 'Cultivating meaningful connections, not just clicks.',
  'Gaming': 'Reclaiming time from virtual worlds and loops.',
  'Rage & Outrage': 'Breaking the cycle of reactionary digital behavior.',
};

export default function GoalSelector({ selected, onChange, disabled }: GoalSelectorProps) {
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

  function isGroupSelected(group: CategoryGroup): boolean {
    return group.categories.some(c => selected.includes(c));
  }

  return (
    <div>
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_GROUPS.map((group) => {
          const isSelected = isGroupSelected(group);
          const materialIcon = GROUP_ICONS[group.label] ?? 'category';
          const shortDesc = GROUP_SHORT_DESC[group.label] ?? group.description;

          return (
            <button
              key={group.label}
              type="button"
              onClick={() => toggleGroup(group)}
              disabled={disabled}
              className={`group relative flex flex-col p-6 rounded-xl text-left transition-all hover:bg-surface-container-low active:scale-[0.98] outline-none disabled:opacity-50 ${
                isSelected
                  ? 'bg-primary-container/20 shadow-[0_0_0_2px_#226779]'
                  : 'bg-surface-container-lowest'
              }`}
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">{materialIcon}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary' : 'border-outline-variant'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">{group.label}</h3>
              <p className="font-body text-sm text-on-surface-variant">{shortDesc}</p>
            </button>
          );
        })}
      </div>

      {/* Custom option */}
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (selected.includes('custom')) {
            onChange(selected.filter(g => g !== 'custom'));
          } else {
            onChange([...selected, 'custom']);
          }
        }}
        disabled={disabled}
        className={`w-full mt-4 flex items-center gap-4 p-6 rounded-xl text-left transition-all hover:bg-surface-container-low active:scale-[0.98] outline-none disabled:opacity-50 ${
          selected.includes('custom')
            ? 'bg-primary-container/20 shadow-[0_0_0_2px_#226779]'
            : 'bg-surface-container-lowest border-2 border-dashed border-outline-variant'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">tune</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-lg text-on-surface">Custom</h3>
          <p className="font-body text-sm text-on-surface-variant">Define your own category to monitor</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected.includes('custom') ? 'border-primary' : 'border-outline-variant'
        }`}>
          <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
            selected.includes('custom') ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      </button>

      {/* Informational prompt */}
      <div className="mt-8 p-6 rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
        </div>
        <div>
          <p className="font-headline font-bold text-on-surface mb-1">Not sure where to start?</p>
          <p className="text-on-surface-variant text-sm">Most members start with one or two rivals to build focus before expanding their journey. You can always add more later.</p>
        </div>
      </div>

      {/* Selection summary */}
      <div className="text-center pt-4">
        <span className={`text-sm font-medium font-label ${selected.length > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
          {selected.length === 0
            ? 'Select at least one area to monitor'
            : `${selected.length} area${selected.length !== 1 ? 's' : ''} selected`}
        </span>
      </div>
    </div>
  );
}
