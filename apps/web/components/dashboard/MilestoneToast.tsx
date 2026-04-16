'use client';

import { useState, useEffect, useCallback } from 'react';

interface MilestoneToast {
  id: string;
  milestone: string;
  label: string;
  icon: string;
}

const MILESTONE_DISPLAY: Record<string, { label: string; icon: string }> = {
  focused_segments_10:  { label: '10 Focused Segments',   icon: 'eco' },
  focused_segments_25:  { label: '25 Focused Segments',   icon: 'park' },
  focused_segments_50:  { label: '50 Focused Segments',   icon: 'forest' },
  focused_segments_100: { label: '100 Focused Segments',  icon: 'landscape' },
  full_days_7:          { label: '7 Full Focused Days',    icon: 'star' },
  full_days_14:         { label: '14 Full Focused Days',   icon: 'star_rate' },
  full_days_30:         { label: '30 Full Focused Days',   icon: 'auto_awesome' },
  full_days_60:         { label: '60 Full Focused Days',   icon: 'local_fire_department' },
  full_days_90:         { label: '90 Full Focused Days',   icon: 'crown' },
  points_100:           { label: '100 Reputation Points',       icon: 'center_focus_strong' },
  points_500:           { label: '500 Reputation Points',       icon: 'diamond' },
  points_1000:          { label: '1,000 Reputation Points',     icon: 'emoji_events' },
  points_5000:          { label: '5,000 Reputation Points',     icon: 'pets' },
  conversations_5:      { label: '5 Conversations',        icon: 'forum' },
  conversations_10:     { label: '10 Conversations',       icon: 'handshake' },
  conversations_25:     { label: '25 Conversations',       icon: 'favorite' },
  streak_7:             { label: '7-Day Streak',           icon: 'local_fire_department' },
  streak_30:            { label: '30-Day Streak',          icon: 'bolt' },
  streak_90:            { label: '90-Day Streak',          icon: 'military_tech' },
};

/**
 * Renders milestone toast notifications.
 *
 * Usage:
 *   <MilestoneToastContainer ref={toastRef} />
 *
 *   // After an API call returns milestonesUnlocked:
 *   toastRef.current?.showMilestones(milestonesUnlocked);
 *
 * Or use the exported hook:
 *   const { ToastContainer, showMilestones } = useMilestoneToasts();
 */

export function useMilestoneToasts() {
  const [toasts, setToasts] = useState<MilestoneToast[]>([]);

  const showMilestones = useCallback((milestones: string[]) => {
    const newToasts = milestones.map((m) => {
      const display = MILESTONE_DISPLAY[m] || { label: m, icon: 'military_tech' };
      return {
        id: `${m}-${Date.now()}`,
        milestone: m,
        label: display.label,
        icon: display.icon,
      };
    });

    // Stagger the toasts
    newToasts.forEach((toast, i) => {
      setTimeout(() => {
        setToasts((prev) => [...prev, toast]);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 4000);
      }, i * 800); // 800ms stagger between toasts
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in-right"
          onClick={() => dismiss(toast.id)}
        >
          <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-xl border border-amber-200 cursor-pointer hover:shadow-2xl transition-shadow min-w-[280px]">
            {/* Icon with glow */}
            <div className="relative">
              <div className="material-symbols-outlined text-3xl animate-bounce-gentle">{toast.icon}</div>
              <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-lg -z-10" />
            </div>

            <div className="flex-1">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Milestone Unlocked!
              </div>
              <div className="text-sm font-headline font-bold text-on-surface mt-0.5">
                {toast.label}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">
                +50 Reputation Points
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out 2;
        }
      `}</style>
    </div>
  );

  return { ToastContainer, showMilestones };
}
