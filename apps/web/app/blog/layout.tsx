import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | Be Candid Blog',
  },
  description: 'Articles on digital wellness, screen time accountability, and building healthier relationships with technology.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark-sanctuary min-h-screen">
      <PublicNav />

      {children}
    </div>
  );
}
