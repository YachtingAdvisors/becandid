// /dashboard/focus — Focus Board page
// Shows the 21-day morning/evening heatmap, trust points, milestones

import FocusBoard from '@/components/dashboard/FocusBoard';

export default function FocusPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 stagger">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
        <div>
          <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Dashboard</p>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Focus Board</h1>
          <p className="text-sm text-on-surface-variant font-body">
            Track your mornings and evenings. Stay focused, earn trust.
          </p>
        </div>
      </div>

      {/* Philosophy callout */}
      <div className="bg-gradient-to-br from-emerald-50/80 to-primary-container/40 rounded-2xl ring-1 ring-emerald-200/30 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
          <div>
            <p className="text-sm text-on-surface leading-relaxed font-body italic">
              &ldquo;Begin with the end in mind.&rdquo;
            </p>
            <p className="text-xs text-on-surface-variant font-label mt-0.5 mb-2">&mdash; Stephen Covey</p>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              Your board starts fully green &mdash; every segment begins as <strong className="text-emerald-700">focused</strong>.
              This is intentional. We don&rsquo;t track what you&rsquo;re failing at; we start from the assumption that you are living in alignment.
              Only when monitoring detects something that conflicts with your goals does a segment change.
              The green isn&rsquo;t earned &mdash; it&rsquo;s your natural state. Your job is simply to stay true to it.
            </p>
          </div>
        </div>
      </div>

      <FocusBoard />
    </div>
  );
}
