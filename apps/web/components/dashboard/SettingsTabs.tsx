'use client';

import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'awareness', label: 'Awareness', icon: 'visibility' },
  { id: 'journal', label: 'Journal', icon: 'edit_note' },
  { id: 'billing', label: 'Plan & Billing', icon: 'credit_card' },
  { id: 'privacy', label: 'Privacy & Data', icon: 'lock' },
];

interface SettingsTabsProps {
  profile: ReactNode;
  awareness: ReactNode;
  journal: ReactNode;
  billing: ReactNode;
  privacy: ReactNode;
}

export default function SettingsTabs({ profile, awareness, journal, billing, privacy }: SettingsTabsProps) {
  const [active, setActive] = useState('profile');

  const panels: Record<string, ReactNode> = { profile, awareness, journal, billing, privacy };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-label font-medium whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              active === tab.id
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="space-y-6">
        {panels[active]}
      </div>
    </div>
  );
}
