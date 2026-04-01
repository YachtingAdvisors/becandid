// ============================================================
// components/dashboard/CommittedContender.tsx
//
// The spouse's dedicated dashboard section. This is what THEY
// see when they log in — not the generic partner view, but
// something that honors their unique position.
//
// Shows:
//   - Contender identity ("You are a Committed Contender")
//   - Milestones earned
//   - Impact check-in prompt
//   - Journal quick-entry
//   - Trust meter trend
//   - Stringer-informed encouragement
//
// This component should replace/extend the partner dashboard
// when the relationship type is "spouse".
// ============================================================

'use client';

import { useState, useEffect } from 'react';

const FEELINGS = [
  { value: 'hurt', emoji: 'heart_broken', label: 'Hurt' },
  { value: 'angry', emoji: 'sentiment_very_dissatisfied', label: 'Angry' },
  { value: 'numb', emoji: 'sentiment_neutral', label: 'Numb' },
  { value: 'anxious', emoji: 'psychology_alt', label: 'Anxious' },
  { value: 'hopeful', emoji: 'eco', label: 'Hopeful' },
  { value: 'exhausted', emoji: 'bedtime', label: 'Exhausted' },
  { value: 'betrayed', emoji: 'heart_broken', label: 'Betrayed' },
  { value: 'lonely', emoji: 'sentiment_dissatisfied', label: 'Lonely' },
  { value: 'determined', emoji: 'fitness_center', label: 'Determined' },
  { value: 'loved', emoji: 'favorite', label: 'Loved' },
  { value: 'confused', emoji: 'help', label: 'Confused' },
  { value: 'healing', emoji: 'healing', label: 'Healing' },
];

const CONTENDER_TITLES = [
  { level: 0, title: 'You are here. That matters.', subtitle: 'Start journaling to earn your first milestone.' },
  { level: 1, title: 'Rising Contender', subtitle: 'You\'re beginning to name what\'s true. Keep going.' },
  { level: 2, title: 'Committed Contender', subtitle: 'You\'re showing up with courage. Your partner sees it.' },
  { level: 3, title: 'Proven Contender', subtitle: 'You\'ve fought through the fire. Your strength is real.' },
];

export default function CommittedContender() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [contenderLevel, setContenderLevel] = useState(0);
  const [trustHistory, setTrustHistory] = useState<any[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Impact check-in form
  const [showImpact, setShowImpact] = useState(false);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [trustLevel, setTrustLevel] = useState<number | null>(null);
  const [feelsSafe, setFeelsSafe] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState('');
  const [shareWithPartner, setShareWithPartner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/spouse-journal?impact=true').then((r) => r.ok ? r.json() : null),
      fetch('/api/spouse-journal').then((r) => r.ok ? r.json() : null),
    ]).then(([impactData, journalData]) => {
      if (impactData?.impacts) {
        setTrustHistory(impactData.impacts.filter((i: any) => i.trust_level).slice(0, 10));
      }
      if (journalData?.entries) setJournalCount(journalData.entries.length);
      // TODO: fetch milestones from a dedicated endpoint
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const submitImpact = async () => {
    if (selectedFeelings.length === 0 && trustLevel === null) return;
    setSaving(true);
    try {
      const res = await fetch('/api/spouse-journal?impact=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feelings: selectedFeelings,
          trust_level: trustLevel,
          feels_safe: feelsSafe,
          reflection: reflection.trim() || undefined,
          visible_to_partner: shareWithPartner,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false); setShowImpact(false);
          setSelectedFeelings([]); setTrustLevel(null);
          setFeelsSafe(null); setReflection(''); setShareWithPartner(false);
        }, 1500);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5"><div className="h-48 animate-pulse bg-surface-container-low rounded-lg" /></div>;

  const contender = CONTENDER_TITLES[Math.min(contenderLevel, 3)];

  return (
    <div className="space-y-4">
      {/* Contender identity card */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-50 via-violet-50 to-amber-50 px-5 py-6 text-center">
          <span className="material-symbols-outlined text-3xl mb-2">{contenderLevel >= 3 ? 'swords' : contenderLevel >= 2 ? 'fitness_center' : contenderLevel >= 1 ? 'eco' : 'volunteer_activism'}</span>
          <h2 className="text-lg font-headline font-semibold text-on-surface mb-1">{contender.title}</h2>
          <p className="text-sm text-on-surface-variant">{contender.subtitle}</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-on-surface leading-relaxed">
            Being here isn't passive. You chose to stay, to engage, to fight for something when it would've been
            easier to walk away. That's not weakness — it's the most courageous thing a person can do.
          </p>
          <p className="text-xs text-violet-600 italic mt-3">
            "Healing is not about simply saying no; it is about saying yes to the good, the true, and the beautiful."
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/partner/journal" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:border-primary/30 transition-colors">
          <span className="material-symbols-outlined text-2xl block mb-1">edit_note</span>
          <p className="text-sm font-medium text-on-surface">My Journal</p>
          <p className="text-xs text-on-surface-variant">{journalCount} entries</p>
        </a>
        <button onClick={() => setShowImpact(!showImpact)}
          className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:border-primary/30 transition-colors w-full">
          <span className="material-symbols-outlined text-2xl block mb-1">volunteer_activism</span>
          <p className="text-sm font-medium text-on-surface">Impact Check-in</p>
          <p className="text-xs text-on-surface-variant">How am I doing?</p>
        </button>
      </div>

      {/* Impact check-in form */}
      {showImpact && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-on-surface">How are you doing right now?</h3>
          <p className="text-xs text-on-surface-variant">This is for you. You choose whether your partner sees it.</p>

          {/* Feelings */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-2">What are you feeling? <span className="text-on-surface-variant">(select all that apply)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {FEELINGS.map((f) => (
                <button key={f.value}
                  onClick={() => setSelectedFeelings((prev) => prev.includes(f.value) ? prev.filter((x) => x !== f.value) : [...prev, f.value])}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedFeelings.includes(f.value)
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container-low'
                  }`}>
                  <span className="material-symbols-outlined text-sm">{f.emoji}</span> {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust meter */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-2">Trust level right now</p>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                <button key={v} onClick={() => setTrustLevel(trustLevel === v ? null : v)}
                  className={`flex-1 py-2 rounded text-xs font-medium transition-all ${
                    trustLevel !== null && v <= trustLevel
                      ? v <= 3 ? 'bg-red-100 text-red-700' : v <= 6 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}>
                  {v}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
              <span>Broken</span>
              <span>Rebuilding</span>
              <span>Strong</span>
            </div>
          </div>

          {/* Safety */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-2">Do you feel safe in this relationship?</p>
            <div className="flex gap-2">
              {[
                { v: true, label: 'Yes', color: 'emerald' },
                { v: false, label: 'No', color: 'red' },
              ].map((opt) => (
                <button key={String(opt.v)} onClick={() => setFeelsSafe(feelsSafe === opt.v ? null : opt.v)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    feelsSafe === opt.v
                      ? `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-700`
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {feelsSafe === false && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-700 font-medium">Your safety comes first.</p>
                <p className="text-xs text-red-600 mt-1">
                  National Domestic Violence Hotline: <strong>1-800-799-7233</strong>
                </p>
              </div>
            )}
          </div>

          {/* Reflection */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-2">Anything else on your heart? <span className="text-on-surface-variant">(optional)</span></p>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
              placeholder="Whatever you need to say…"
              className="w-full h-20 px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50" />
          </div>

          {/* Consent toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-on-surface">Share with your partner?</p>
              <p className="text-[10px] text-on-surface-variant">They'll see your feelings and trust level — not your reflection</p>
            </div>
            <button onClick={() => setShareWithPartner(!shareWithPartner)}
              className={`relative w-10 h-5 rounded-full transition-colors ${shareWithPartner ? 'bg-primary' : 'bg-surface-container'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${shareWithPartner ? 'translate-x-[20px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button onClick={submitImpact}
            disabled={(selectedFeelings.length === 0 && trustLevel === null) || saving}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
              saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary disabled:opacity-50'
            }`}>
            {saved ? <><span className="material-symbols-outlined text-sm align-middle">check</span> Saved</> : saving ? 'Saving...' : 'Submit Check-in'}
          </button>
        </div>
      )}

      {/* Trust trend visualization */}
      {trustHistory.length > 1 && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Your Trust Journey</h3>
          <div className="flex items-end gap-1 h-16">
            {trustHistory.reverse().map((t: any, i: number) => {
              const h = (t.trust_level / 10) * 100;
              const color = t.trust_level <= 3 ? 'bg-red-300' : t.trust_level <= 6 ? 'bg-amber-300' : 'bg-emerald-400';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${color} transition-all`} style={{ height: `${h}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
            <span>Oldest</span>
            <span>Most recent</span>
          </div>
        </div>
      )}

      {/* Journal encouragement */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 bg-gradient-to-r from-violet-50 to-rose-50 border-violet-100">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">edit_note</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-on-surface">Your journal is your space</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              No one sees it unless you choose to share. Write what's true. It helps more than you think.
            </p>
          </div>
          <a href="/partner/journal"
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary">
            Write
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
