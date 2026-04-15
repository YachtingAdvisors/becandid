'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuickActionFab() {
  const [open, setOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sending, setSending] = useState(false);

  const FEEDBACK_TYPES = [
    { key: 'idea', label: 'I have an idea', icon: 'lightbulb' },
    { key: 'need', label: 'I need this feature', icon: 'add_circle' },
    { key: 'bug', label: 'Something is broken', icon: 'bug_report' },
    { key: 'story', label: 'Share my story', icon: 'favorite' },
  ];

  const handleFeedbackSubmit = async () => {
    if (!feedbackType || !feedbackMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: feedbackType, message: feedbackMessage.trim() }),
      });
      if (res.ok) {
        setShowFeedback(false);
        setFeedbackType('');
        setFeedbackMessage('');
        setOpen(false);
      }
    } catch {}
    setSending(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-30 lg:hidden">
      {/* Feedback form */}
      {showFeedback && (
        <div className="absolute bottom-16 right-0 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl ring-1 ring-outline-variant/20 overflow-hidden mb-2">
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-on-surface">Build With Us</span>
              <button onClick={() => setShowFeedback(false)} className="text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Your voice shapes what we build next.</p>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {FEEDBACK_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFeedbackType(t.key)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-label font-medium transition-all ${
                    feedbackType === t.key
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedbackType || !feedbackMessage.trim() || sending}
              className="w-full py-2 bg-primary text-on-primary rounded-full font-label font-bold text-xs disabled:opacity-50 transition-all"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Action menu */}
      {open && !showFeedback && (
        <div className="absolute bottom-16 right-0 flex flex-col items-end gap-2 mb-2">
          <Link
            href="/dashboard/stringer-journal"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Write in Journal
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          </Link>
          <Link
            href="/dashboard/checkins"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Check In
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </Link>
          <Link
            href="/dashboard/focus"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Focus Board
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
          </Link>
          <button
            onClick={() => { setShowFeedback(true); }}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Build With Us
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => { setOpen(!open); if (open) setShowFeedback(false); }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 ${
          open
            ? 'bg-surface-container-lowest text-on-surface rotate-45 ring-1 ring-outline-variant/20'
            : 'bg-primary text-on-primary shadow-primary/30'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
