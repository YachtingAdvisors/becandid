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
              className={`group relative flex flex-col p-5 rounded-xl text-left transition-all active:scale-[0.98] outline-none disabled:opacity-50 ${
                isSelected
                  ? 'bg-white shadow-[0_0_0_2px_#22d3ee] shadow-lg'
                  : 'bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1]'
              }`}
            >
              <div className="mb-4 flex justify-between items-start">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-white/10 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary' : 'border-white/20'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </div>
              <h3 className={`font-headline font-bold text-sm mb-1 transition-colors ${
                isSelected ? 'text-on-surface' : 'text-slate-200'
              }`}>{GOAL_LABELS[cat.id]}</h3>
              <p className={`font-body text-xs leading-snug transition-colors ${
                isSelected ? 'text-on-surface-variant' : 'text-slate-400'
              }`}>{GOAL_DESCRIPTIONS[cat.id]}</p>
            </button>
          );
        })}
      </div>

      {/* Custom option */}
      <button
        type="button"
        onClick={() => toggleGoal('custom')}
        disabled={disabled}
        className={`w-full mt-4 flex items-center gap-4 p-5 rounded-xl text-left transition-all active:scale-[0.98] outline-none disabled:opacity-50 ${
          selected.includes('custom')
            ? 'bg-white shadow-[0_0_0_2px_#22d3ee] shadow-lg'
            : 'bg-white/[0.06] backdrop-blur-md border-2 border-dashed border-white/10 hover:bg-white/[0.1]'
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

      {/* Custom category disclaimer */}
      {selected.includes('custom') && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200/40 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-700 text-lg mt-0.5 flex-shrink-0">info</span>
          <p className="text-xs text-amber-900 font-body leading-relaxed">
            <strong>Heads up:</strong> Our AI monitoring system is trained on the standard categories above. With a custom category, automated detection will be less accurate and the system will rely more heavily on your manual check-ins, journal entries, and self-reported activity to track your progress. You&rsquo;ll get the most out of Be Candid by pairing this with regular honest reflection.
          </p>
        </div>
      )}

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
