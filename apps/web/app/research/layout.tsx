import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: {
    default: 'Research & Statistics',
    template: '%s | Be Candid Research',
  },
  description: 'Data-driven research on screen time, digital addiction, and behavioral accountability.',
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark-sanctuary min-h-screen">
      <PublicNav />
      {children}
    </div>
  );
}
