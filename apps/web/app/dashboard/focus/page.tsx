// /dashboard/focus — Focus Board page (editorial bento layout)
// Shows the 21-day morning/evening heatmap, reputation points, milestones

import type { Metadata } from 'next';
import FocusBoard from '@/components/dashboard/FocusBoard';

export const metadata: Metadata = {
  title: 'Focus Board',
  description: 'Track your 21-day morning and evening focus streaks. Earn reputation points and hit milestones on your path to digital wellness.',
};

export default function FocusPage() {
  return (
    <div className="space-y-8 stagger">
      {/* ─── Hero Section ──────────────────────────────────── */}
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest mb-1">Dashboard</p>
        <h2 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
          Focus Board
        </h2>
        <p className="text-base text-on-surface-variant font-body mt-2">
          Track your mornings and evenings. Stay focused, earn trust.
        </p>
      </div>

      <FocusBoard />
    </div>
  );
}
