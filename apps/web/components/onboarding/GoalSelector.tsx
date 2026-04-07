'use client';

import { useState, useEffect } from 'react';
import {
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  SUBSTANCE_LABELS,
  SUBSTANCES_BY_CATEGORY,
  type GoalCategory,
  type TrackedSubstance,
} from '@be-candid/shared';
import { isNonScanUser } from '@/lib/isolationMode';

interface GoalSelectorProps {
  selected: GoalCategory[];
  onChange: (goals: GoalCategory[]) => void;
  trackedSubstances?: TrackedSubstance[];
  onSubstancesChange?: (substances: TrackedSubstance[]) => void;
  disabled?: boolean;
}

/* Category-specific accent glow colors */
const CATEGORY_GLOW: Partial<Record<GoalCategory, string>> = {
  pornography: 'shadow-red-500/20',
  sexting: 'shadow-pink-500/20',
  social_media: 'shadow-blue-500/20',
  binge_watching: 'shadow-indigo-500/20',
  impulse_shopping: 'shadow-emerald-500/20',
  alcohol_drugs: 'shadow-purple-500/20',
  vaping_tobacco: 'shadow-purple-400/20',
  eating_disorder: 'shadow-orange-500/20',
  body_checking: 'shadow-rose-500/20',
  gambling: 'shadow-amber-500/20',
  sports_betting: 'shadow-amber-400/20',
  day_trading: 'shadow-green-500/20',
  dating_apps: 'shadow-pink-400/20',
  gaming: 'shadow-violet-500/20',
  rage_content: 'shadow-red-400/20',
  isolation: 'shadow-violet-500/20',
};

const CATEGORY_ACCENT_RING: Partial<Record<GoalCategory, string>> = {
  pornography: 'ring-red-500/20',
  sexting: 'ring-pink-500/20',
  social_media: 'ring-blue-500/20',
  binge_watching: 'ring-indigo-500/20',
  impulse_shopping: 'ring-emerald-500/20',
  alcohol_drugs: 'ring-purple-500/20',
  vaping_tobacco: 'ring-purple-400/20',
  eating_disorder: 'ring-orange-500/20',
  body_checking: 'ring-rose-500/20',
  gambling: 'ring-amber-500/20',
  sports_betting: 'ring-amber-400/20',
  day_trading: 'ring-green-500/20',
  dating_apps: 'ring-pink-400/20',
  gaming: 'ring-violet-500/20',
  rage_content: 'ring-red-400/20',
  isolation: 'ring-violet-500/20',
};

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
  { id: 'isolation', icon: 'door_open' },
];

export default function GoalSelector({ selected, onChange, trackedSubstances = [], onSubstancesChange, disabled }: GoalSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger stagger animation on mount
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  function toggleGoal(goal: GoalCategory) {
    if (disabled) return;
    if (selected.includes(goal)) {
      onChange(selected.filter(g => g !== goal));
      // Clear substances for this category when deselected
      if (onSubstancesChange && (goal === 'alcohol_drugs' || goal === 'vaping_tobacco')) {
        const categorySubstances = SUBSTANCES_BY_CATEGORY[goal] ?? [];
        onSubstancesChange(trackedSubstances.filter(s => !categorySubstances.includes(s)));
      }
    } else {
      onChange([...selected, goal]);
    }
  }

  function toggleSubstance(substance: TrackedSubstance) {
    if (disabled || !onSubstancesChange) return;
    if (trackedSubstances.includes(substance)) {
      onSubstancesChange(trackedSubstances.filter(s => s !== substance));
    } else {
      onSubstancesChange([...trackedSubstances, substance]);
    }
  }

  const hasSubstanceGoal = selected.includes('alcohol_drugs') || selected.includes('vaping_tobacco');

  return (
    <div>
      {/* Counter badge */}
      {selected.length > 0 && (
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-label font-semibold backdrop-blur-sm border border-primary/20">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {selected.length} rival{selected.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORY_CARDS.map((cat, index) => {
          const isSelected = selected.includes(cat.id);
          const glowClass = CATEGORY_GLOW[cat.id] ?? 'shadow-slate-500/20';
          const accentRing = CATEGORY_ACCENT_RING[cat.id] ?? 'ring-white/10';

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleGoal(cat.id)}
              disabled={disabled}
              style={{
                opacity: mounted ? undefined : 0,
                transform: mounted ? undefined : 'translateY(12px)',
                transition: `opacity 0.4s ease-out ${index * 50}ms, transform 0.4s ease-out ${index * 50}ms`,
              }}
              className={`group relative flex flex-col p-5 rounded-xl text-left transition-all duration-300 active:scale-[0.98] outline-none disabled:opacity-50 min-h-[140px] ${
                isSelected
                  ? `bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg ${glowClass} -translate-y-1 ring-2 ring-primary`
                  : `bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ${accentRing} opacity-80 hover:opacity-100 hover:shadow-md ${glowClass}`
              }`}
            >
              {/* Selected checkmark badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md animate-[scale-in_0.2s_ease-out]"
                  style={{ animation: 'scale-in 0.2s ease-out' }}>
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>check</span>
                </div>
              )}

              <div className="mb-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-400'
                }`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{cat.icon}</span>
                </div>
              </div>

              <h3 className={`font-headline font-bold text-sm mb-1 transition-colors ${
                isSelected ? 'text-white' : 'text-slate-200'
              }`}>{GOAL_LABELS[cat.id]}</h3>
              <p className={`font-body text-xs leading-snug transition-colors ${
                isSelected ? 'text-slate-300' : 'text-slate-400'
              }`}>{GOAL_DESCRIPTIONS[cat.id]}</p>
            </button>
          );
        })}
      </div>

      {/* Substance specificity selector */}
      {hasSubstanceGoal && onSubstancesChange && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 ring-1 ring-purple-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-lg">science</span>
            <h4 className="font-headline font-bold text-sm text-white">Which substances are you working on?</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Be specific so we can tailor detection and coaching to your situation. Select all that apply.
          </p>

          {selected.includes('alcohol_drugs') && (
            <div className="space-y-2">
              <p className="text-xs font-label font-semibold text-purple-300 uppercase tracking-wider">Alcohol & Drugs</p>
              <div className="flex flex-wrap gap-2">
                {(SUBSTANCES_BY_CATEGORY['alcohol_drugs'] ?? []).map((substance) => {
                  const isActive = trackedSubstances.includes(substance);
                  return (
                    <button
                      key={substance}
                      type="button"
                      onClick={() => toggleSubstance(substance)}
                      disabled={disabled}
                      className={`px-3 py-1.5 rounded-full text-xs font-label font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-200 ring-1 ring-purple-400/50 shadow-sm shadow-purple-500/20'
                          : 'bg-slate-700/50 text-slate-400 ring-1 ring-slate-600/30 hover:bg-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {isActive && (
                        <span className="inline-block mr-1">&#10003;</span>
                      )}
                      {SUBSTANCE_LABELS[substance]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selected.includes('vaping_tobacco') && (
            <div className="space-y-2">
              <p className="text-xs font-label font-semibold text-purple-300 uppercase tracking-wider">Vaping & Tobacco</p>
              <div className="flex flex-wrap gap-2">
                {(SUBSTANCES_BY_CATEGORY['vaping_tobacco'] ?? []).map((substance) => {
                  const isActive = trackedSubstances.includes(substance);
                  return (
                    <button
                      key={substance}
                      type="button"
                      onClick={() => toggleSubstance(substance)}
                      disabled={disabled}
                      className={`px-3 py-1.5 rounded-full text-xs font-label font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-200 ring-1 ring-purple-400/50 shadow-sm shadow-purple-500/20'
                          : 'bg-slate-700/50 text-slate-400 ring-1 ring-slate-600/30 hover:bg-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {isActive && (
                        <span className="inline-block mr-1">&#10003;</span>
                      )}
                      {SUBSTANCE_LABELS[substance]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom option */}
      <button
        type="button"
        onClick={() => toggleGoal('custom')}
        disabled={disabled}
        className={`w-full mt-4 flex items-center gap-4 p-5 rounded-xl text-left transition-all duration-300 active:scale-[0.98] outline-none disabled:opacity-50 ${
          selected.includes('custom')
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg shadow-primary/20 ring-2 ring-primary'
            : 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-dashed border-white/10 opacity-80 hover:opacity-100'
        }`}
      >
        <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>tune</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-sm text-white">Custom</h3>
          <p className="font-body text-xs text-slate-400">Define your own category to monitor</p>
        </div>
        {selected.includes('custom') && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md"
            style={{ animation: 'scale-in 0.2s ease-out' }}>
            <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>check</span>
          </div>
        )}
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

      {/* Non-scan mode explanation */}
      {isNonScanUser(selected) && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-violet-50 ring-1 ring-violet-200/40 flex items-start gap-3">
          <span className="material-symbols-outlined text-violet-700 text-lg mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>door_open</span>
          <p className="text-xs text-violet-900 font-body leading-relaxed">
            <strong>No scanning needed:</strong> Your selected rivals are behavioral — not screen-based — so you won&rsquo;t need the desktop app or browser extension. We&rsquo;ll focus on check-ins, journaling, and nudges to help you build better habits.
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

    </div>
  );
}
