import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: {
    default: 'Free Tools',
    template: '%s | Be Candid Tools',
  },
  description: 'Free digital wellness tools — screen time calculator, accountability readiness quiz, and relationship health check.',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark-sanctuary min-h-screen">
      <PublicNav />
      {children}
    </div>
  );
}
