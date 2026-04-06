'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/users', label: 'Users', icon: 'group' },
  { href: '/admin/activity', label: 'Activity', icon: 'timeline' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-outline-variant pb-px" aria-label="Admin navigation">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-label font-medium
              rounded-t-xl transition-colors
              ${
                isActive
                  ? 'bg-primary/10 text-primary border-b-2 border-primary -mb-px'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }
            `}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
