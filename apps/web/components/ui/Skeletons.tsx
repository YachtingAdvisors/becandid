// ============================================================
// components/ui/Skeletons.tsx
//
// Reusable loading skeletons for the dashboard.
// Matches the exact layout of real components so there's no
// layout shift when data loads.
//
// Usage:
//   import { DashboardSkeleton, JournalListSkeleton, ... } from '@/components/ui/Skeletons';
//   <Suspense fallback={<DashboardSkeleton />}>
//     <DashboardContent />
//   </Suspense>
// ============================================================

'use client';

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`;

function Bone({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-100 rounded-lg ${shimmer} ${className}`} style={style} />;
}

// ── Dashboard Overview Skeleton ─────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5">
            <Bone className="h-8 w-16 mb-2" />
            <Bone className="h-3 w-24" />
          </div>
        ))}
      </div>
      {/* Main content cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <Bone className="h-5 w-32" />
          <Bone className="h-24 w-full" />
          <Bone className="h-4 w-48" />
        </div>
        <div className="card p-5 space-y-4">
          <Bone className="h-5 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-8 w-8 rounded-full" style={{ flexShrink: 0 }} />
              <div className="flex-1">
                <Bone className="h-3 w-full mb-1.5" />
                <Bone className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ── Journal List Skeleton ───────────────────────────────────

export function JournalListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Bone className="h-6 w-40 mb-2" />
          <Bone className="h-3 w-56" />
        </div>
        <Bone className="h-9 w-24 rounded-lg" />
      </div>
      {/* Quote banner */}
      <Bone className="h-16 w-full rounded-xl" />
      {/* Search bar */}
      <Bone className="h-10 w-full rounded-xl" />
      {/* Entry cards */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Bone className="h-4 w-20" />
            <Bone className="h-3 w-12" />
            <Bone className="h-5 w-5 rounded-full" />
          </div>
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-4/5" />
          <div className="flex gap-2 mt-1">
            <Bone className="h-5 w-24 rounded-full" />
            <Bone className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ── Focus Board Skeleton ────────────────────────────────────

export function FocusBoardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <Bone className="h-12 w-20 mx-auto mb-2" />
        <Bone className="h-4 w-32 mx-auto" />
      </div>
      <div className="card p-5">
        <Bone className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <Bone key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
      <style jsx global>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

// ── Settings Page Skeleton ──────────────────────────────────

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Bone className="h-5 w-5 rounded" />
            <Bone className="h-4 w-32" />
          </div>
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-6 w-11 rounded-full" />
          </div>
        </div>
      ))}
      <style jsx global>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

// ── Conversation Guide Skeleton ─────────────────────────────

export function ConversationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Bone className="h-7 w-48 mb-1" />
      <Bone className="h-4 w-64" />
      <div className="card p-6 space-y-4">
        <Bone className="h-5 w-36" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-3/4" />
      </div>
      <div className="card p-6 space-y-4">
        <Bone className="h-5 w-40" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Bone className="h-6 w-6 rounded-full" style={{ flexShrink: 0 }} />
            <div className="flex-1">
              <Bone className="h-3 w-full mb-1" />
              <Bone className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

// ── Inline Stat Skeleton ────────────────────────────────────

export function StatSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1">
          <Bone className="h-8 w-12 mb-1" />
          <Bone className="h-3 w-16" />
        </div>
      ))}
      <style jsx global>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}
