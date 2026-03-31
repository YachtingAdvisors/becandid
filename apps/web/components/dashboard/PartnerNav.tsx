'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PartnerNavProps {
  monitoredName: string;
}

const NAV_ITEMS = [
  { href: '/partner',              label: 'Overview', icon: 'dashboard' },
  { href: '/partner/focus',        label: 'Focus',    icon: 'center_focus_strong' },
  { href: '/partner/checkins',     label: 'Check-ins', icon: 'checklist' },
  { href: '/partner/conversations', label: 'Convos',   icon: 'forum' },
  { href: '/partner/encourage',    label: 'Encourage', icon: 'fitness_center' },
];

export default function PartnerNav({ monitoredName }: PartnerNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-surface-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Be Candid" className="h-10 w-auto" />
            </Link>
            <span className="text-ink-muted text-xs">·</span>
            <span className="text-xs font-medium text-brand-600">{monitoredName}</span>
          </div>

          <Link href="/dashboard"
            className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-muted rounded-lg transition-colors duration-200 hidden sm:inline-flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full">
            <span className="material-symbols-outlined text-sm">arrow_back</span> My Dashboard
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
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-t-lg ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
