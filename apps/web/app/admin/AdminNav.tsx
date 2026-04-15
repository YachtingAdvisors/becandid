'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/users', label: 'Users', icon: 'group' },
  { href: '/admin/activity', label: 'Activity', icon: 'timeline' },
  { href: '/admin/revenue', label: 'Revenue', icon: 'payments' },
  { href: '/admin/engagement', label: 'Engagement', icon: 'monitoring' },
  { href: '/admin/moderation', label: 'Moderation', icon: 'shield' },
  { href: '/admin/support', label: 'Support', icon: 'support_agent' },
  { href: '/admin/seo', label: 'SEO', icon: 'query_stats' },
  { href: '/admin/health', label: 'Health', icon: 'monitor_heart' },
  { href: '/admin/audit', label: 'Audit Log', icon: 'policy' },
  { href: '/admin/email', label: 'Email', icon: 'mail' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: 'mark_email_read' },
  { href: '/admin/features', label: 'Features', icon: 'toggle_on' },
  { href: '/admin/export', label: 'Export', icon: 'download' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 border-b border-outline-variant pb-px overflow-x-auto scrollbar-hide"
      aria-label="Admin navigation"
    >
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
              rounded-t-xl transition-colors whitespace-nowrap
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
