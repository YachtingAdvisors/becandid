'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PartnerNavProps {
  monitoredName: string;
}

const NAV_ITEMS = [
  { href: '/partner',              label: 'Overview', icon: '◉' },
  { href: '/partner/focus',        label: 'Focus',    icon: '🎯' },
  { href: '/partner/checkins',     label: 'Check-ins', icon: '📋' },
  { href: '/partner/conversations', label: 'Convos',   icon: '💬' },
  { href: '/partner/encourage',    label: 'Encourage', icon: '💪' },
];

export default function PartnerNav({ monitoredName }: PartnerNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-surface-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="font-display text-base text-ink hidden sm:inline">Be Candid</span>
            </Link>
            <span className="text-ink-muted text-xs">·</span>
            <span className="text-xs font-medium text-brand-600">{monitoredName}</span>
          </div>

          <Link href="/dashboard"
            className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-muted rounded-lg transition-colors hidden sm:inline-flex">
            ← My Dashboard
          </Link>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const active = item.href === '/partner'
              ? pathname === '/partner'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-gray-300'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
