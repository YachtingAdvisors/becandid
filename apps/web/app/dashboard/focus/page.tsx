// /dashboard/focus — Focus Board page
// Shows the 21-day morning/evening heatmap, trust points, milestones

import FocusBoard from '@/components/dashboard/FocusBoard';

export default function FocusPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Focus Board</h1>
          <p className="text-sm text-on-surface-variant font-body">
            Track your mornings and evenings. Stay focused, earn trust.
          </p>
        </div>
      </div>

      <FocusBoard />
    </div>
  );
}
