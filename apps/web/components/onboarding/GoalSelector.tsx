'use client';

import {
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  type GoalCategory,
} from '@be-candid/shared';

interface GoalSelectorProps {
  selected: GoalCategory[];
  onChange: (goals: GoalCategory[]) => void;
  disabled?: boolean;
}

/* Individual category cards with material icons */
const CATEGORY_CARDS: { id: GoalCategory; icon: string }[] = [
  { id: 'pornography', icon: 'visibility_off' },
  { id: 'sexting', icon: 'chat_bubble' },
  { id: 'social_media', icon: 'phone_android' },
  { id: 'binge_watching', icon: 'live_tv' },
  { id: 'impulse_shopping', icon: 'shopping_cart' },
  { id: 'alcohol_drugs', icon: 'local_bar' },
  { id: 'vaping_tobacco', icon: 'smoking_rooms' },
  { id: 'eating_disorder', icon: 'restaurant' },
  { id: 'body_checking', icon: 'accessibility_new' },
  { id: 'gambling', icon: 'casino' },
  { id: 'sports_betting', icon: 'sports_football' },
  { id: 'day_trading', icon: 'trending_up' },
  { id: 'dating_apps', icon: 'favorite' },
  { id: 'gaming', icon: 'sports_esports' },
  { id: 'rage_content', icon: 'mode_comment' },
];

export default function GoalSelector({ selected, onChange, disabled }: GoalSelectorProps) {
  function toggleGoal(goal: GoalCategory) {
    if (disabled) return;
    if (selected.includes(goal)) {
      onChange(selected.filter(g => g !== goal));
    } else {
      onChange([...selected, goal]);
    }
  }

  return (
    <div>
      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORY_CARDS.map((cat) => {
          const isSelected = selected.includes(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleGoal(cat.id)}
              disabled={disabled}
              className={`group relative flex flex-col p-5 rounded-xl text-left transition-all hover:bg-surface-container-low active:scale-[0.98] outline-none disabled:opacity-50 ${
                isSelected
                  ? 'bg-primary-container/20 shadow-[0_0_0_2px_#226779]'
                  : 'bg-surface-container-lowest'
              }`}
            >
              <div className="mb-4 flex justify-between items-start">
                <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary' : 'border-outline-variant'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </div>
              <h3 className="font-headline font-bold text-sm text-on-surface mb-1">{GOAL_LABELS[cat.id]}</h3>
              <p className="font-body text-xs text-on-surface-variant leading-snug">{GOAL_DESCRIPTIONS[cat.id]}</p>
            </button>
          );
        })}
      </div>

      {/* Custom option */}
      <button
        type="button"
        onClick={() => toggleGoal('custom')}
        disabled={disabled}
        className={`w-full mt-4 flex items-center gap-4 p-5 rounded-xl text-left transition-all hover:bg-surface-container-low active:scale-[0.98] outline-none disabled:opacity-50 ${
          selected.includes('custom')
            ? 'bg-primary-container/20 shadow-[0_0_0_2px_#226779]'
            : 'bg-surface-container-lowest border-2 border-dashed border-outline-variant'
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-xl">tune</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-sm text-on-surface">Custom</h3>
          <p className="font-body text-xs text-on-surface-variant">Define your own category to monitor</p>
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
      <div className="mt-8 p-5 rounded-2xl bg-surface-container-low flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
        </div>
        <div>
          <p className="font-headline font-bold text-on-surface text-sm mb-1">Not sure where to start?</p>
          <p className="text-on-surface-variant text-xs leading-relaxed">Most members start with one or two rivals to build focus before expanding their journey. You can always add more later.</p>
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
