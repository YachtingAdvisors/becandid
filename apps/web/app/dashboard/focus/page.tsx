// /dashboard/focus — Focus Board page
// Shows the 21-day morning/evening heatmap, trust points, milestones

import FocusBoard from '@/components/dashboard/FocusBoard';

export default function FocusPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">
          🔥 Focus Board
        </h1>
        <p className="text-sm text-on-surface-variant font-body">
          Track your mornings and evenings. Stay focused, earn trust.
        </p>
      </div>

      <FocusBoard />
    </div>
  );
}
