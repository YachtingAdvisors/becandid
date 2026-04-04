'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────

interface Amend {
  id: string;
  person_name: string;
  relationship: string | null;
  what_happened: string | null;
  what_to_say: string | null;
  amend_type: 'direct' | 'indirect' | 'living' | 'not_appropriate';
  status: 'identified' | 'planned' | 'in_progress' | 'made';
  therapist_reviewed: boolean;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse / Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'coworker', label: 'Coworker' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const AMEND_TYPES = [
  {
    value: 'direct',
    label: 'Direct',
    icon: 'record_voice_over',
    desc: 'I can speak to them face-to-face',
    color: 'text-primary',
  },
  {
    value: 'indirect',
    label: 'Indirect',
    icon: 'volunteer_activism',
    desc: 'I can make amends through changed behavior',
    color: 'text-secondary',
  },
  {
    value: 'living',
    label: 'Living',
    icon: 'self_improvement',
    desc: 'This is ongoing — I make amends by how I live each day',
    color: 'text-tertiary',
  },
  {
    value: 'not_appropriate',
    label: 'Not Appropriate',
    icon: 'do_not_disturb_on',
    desc: 'Direct amends would cause more harm',
    color: 'text-on-surface-variant',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  identified: { label: 'Identified', color: 'text-on-surface-variant', bg: 'bg-surface-container', icon: 'person_search' },
  planned: { label: 'Planned', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'event_note' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', icon: 'pending' },
  made: { label: 'Made', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: 'check_circle' },
};

const STATUS_ORDER: Amend['status'][] = ['identified', 'planned', 'in_progress', 'made'];

function nextStatus(current: Amend['status']): Amend['status'] | null {
  const idx = STATUS_ORDER.indexOf(current);
  return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
}

function nextStatusLabel(current: Amend['status']): string {
  const labels: Record<string, string> = {
    identified: 'Plan This',
    planned: 'Start',
    in_progress: 'Mark Complete',
  };
  return labels[current] || '';
}

// ── Page Component ─────────────────────────────────────────

export default function AmendsPage() {
  const [amends, setAmends] = useState<Amend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [whatToSay, setWhatToSay] = useState('');
  const [amendType, setAmendType] = useState('direct');
  const [notes, setNotes] = useState('');

  // ── Fetch ────────────────────────────────────────────────

  const fetchAmends = useCallback(async () => {
    try {
      const res = await fetch('/api/amends');
      if (res.ok) {
        const data = await res.json();
        setAmends(data.amends || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAmends(); }, [fetchAmends]);

  // ── Create ───────────────────────────────────────────────

  const handleCreate = async () => {
    if (!personName.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/amends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_name: personName.trim(),
          relationship: relationship || null,
          what_happened: whatHappened.trim() || null,
          what_to_say: whatToSay.trim() || null,
          amend_type: amendType,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        setPersonName('');
        setRelationship('');
        setWhatHappened('');
        setWhatToSay('');
        setAmendType('direct');
        setNotes('');
        setShowForm(false);
        fetchAmends();
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── Update status ────────────────────────────────────────

  const handleStatusChange = async (amend: Amend) => {
    const next = nextStatus(amend.status);
    if (!next) return;
    try {
      const res = await fetch('/api/amends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: amend.id, status: next }),
      });
      if (res.ok) fetchAmends();
    } catch (e) { console.error(e); }
  };

  // ── Toggle therapist reviewed ────────────────────────────

  const handleTherapistToggle = async (amend: Amend) => {
    try {
      const res = await fetch('/api/amends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: amend.id, therapist_reviewed: !amend.therapist_reviewed }),
      });
      if (res.ok) fetchAmends();
    } catch (e) { console.error(e); }
  };

  // ── Delete ───────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/amends?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAmends();
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  // ── Group by status ──────────────────────────────────────

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = amends.filter((a) => a.status === s);
    return acc;
  }, {} as Record<string, Amend[]>);

  const totalAmends = amends.length;
  const madeCount = grouped.made.length;

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Making Amends
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant font-body">
          Steps 8 &amp; 9 — Identifying those we have harmed and making amends
        </p>
      </div>

      {/* Intro Card */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-primary">favorite</span>
          </div>
          <div>
            <p className="text-sm text-on-surface font-body leading-relaxed">
              Making amends is not about guilt — it is about freedom. This is a private space to identify
              who was affected, plan what you want to say, and track your progress.
              Share with your therapist when you are ready.
            </p>
            <p className="text-xs text-on-surface-variant font-body mt-2 italic">
              &ldquo;We made a list of all persons we had harmed, and became willing to make amends to them all.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {totalAmends > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-label font-medium text-on-surface">
              {madeCount} of {totalAmends} amends made
            </span>
            <span className="text-xs font-label text-on-surface-variant">
              {totalAmends > 0 ? Math.round((madeCount / totalAmends) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${totalAmends > 0 ? (madeCount / totalAmends) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].bg} ring-1 ring-black/5`} />
                <span className="text-[10px] font-label text-on-surface-variant">
                  {grouped[s].length} {STATUS_CONFIG[s].label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Person Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 py-4 rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-lowest/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 text-sm font-label font-medium text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add a person
        </button>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-headline font-bold text-on-surface">
              Add a person
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-1.5">
                Person&apos;s name
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="First name or initials"
                maxLength={200}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container ring-1 ring-outline-variant/20 text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
              <p className="text-[10px] text-on-surface-variant/60 font-label mt-1">
                Encrypted and private — only you can see this
              </p>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-1.5">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container ring-1 ring-outline-variant/20 text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
              >
                <option value="">Select relationship...</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* What happened */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-1.5">
                What happened
              </label>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Briefly describe the harm..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container ring-1 ring-outline-variant/20 text-on-surface text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* What to say */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-1.5">
                What I want to say
              </label>
              <textarea
                value={whatToSay}
                onChange={(e) => setWhatToSay(e.target.value)}
                placeholder="What would you say if you could?"
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container ring-1 ring-outline-variant/20 text-on-surface text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Amend type */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-2">
                Type of amend
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AMEND_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setAmendType(t.value)}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      amendType === t.value
                        ? 'border-primary bg-primary-container/20 ring-2 ring-primary/20'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-base ${t.color}`}>{t.icon}</span>
                      <span className="text-sm font-label font-medium text-on-surface">{t.label}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-body leading-snug">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-1.5">
                Notes <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any private notes for yourself..."
                rows={2}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container ring-1 ring-outline-variant/20 text-on-surface text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={!personName.trim() || saving}
              className={`w-full py-3.5 rounded-2xl text-sm font-label font-medium transition-all duration-300 ${
                personName.trim()
                  ? 'bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20'
                  : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Add to My List'}
            </button>
          </div>
        </div>
      )}

      {/* Amends List — grouped by status */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : amends.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">group</span>
          <p className="text-sm text-on-surface-variant font-body leading-relaxed max-w-sm mx-auto">
            No one added yet. When you are ready, begin by adding the names of people
            you want to make amends with. Take your time — there is no rush.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {STATUS_ORDER.map((statusKey) => {
            const items = grouped[statusKey];
            if (items.length === 0) return null;
            const config = STATUS_CONFIG[statusKey];
            return (
              <div key={statusKey}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-symbols-outlined text-lg ${config.color}`}>{config.icon}</span>
                  <h2 className="text-sm font-headline font-bold text-on-surface">{config.label}</h2>
                  <span className={`text-xs font-label ${config.color} ${config.bg} px-2 py-0.5 rounded-full`}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((amend) => {
                    const isExpanded = expandedId === amend.id;
                    const typeInfo = AMEND_TYPES.find((t) => t.value === amend.amend_type);
                    return (
                      <div
                        key={amend.id}
                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden transition-all duration-300"
                      >
                        {/* Summary row */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : amend.id)}
                          className="w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined ${config.color} text-lg`}>{config.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-label font-medium text-on-surface truncate">
                                {amend.person_name}
                              </span>
                              {amend.relationship && (
                                <span className="text-[10px] font-label text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full shrink-0">
                                  {amend.relationship}
                                </span>
                              )}
                            </div>
                            {typeInfo && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`material-symbols-outlined text-xs ${typeInfo.color}`}>{typeInfo.icon}</span>
                                <span className="text-[10px] text-on-surface-variant font-label">{typeInfo.label} amend</span>
                              </div>
                            )}
                          </div>
                          {amend.therapist_reviewed && (
                            <span className="material-symbols-outlined text-primary text-base shrink-0" title="Shared with therapist">
                              verified
                            </span>
                          )}
                          <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-0 border-t border-outline-variant/20 animate-fade-in">
                            <div className="space-y-3 mt-4">
                              {amend.what_happened && (
                                <div>
                                  <label className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">What happened</label>
                                  <p className="text-sm text-on-surface font-body leading-relaxed mt-1">{amend.what_happened}</p>
                                </div>
                              )}
                              {amend.what_to_say && (
                                <div>
                                  <label className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">What I want to say</label>
                                  <p className="text-sm text-on-surface font-body leading-relaxed mt-1">{amend.what_to_say}</p>
                                </div>
                              )}
                              {amend.notes && (
                                <div>
                                  <label className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">Notes</label>
                                  <p className="text-sm text-on-surface font-body leading-relaxed mt-1">{amend.notes}</p>
                                </div>
                              )}
                              {amend.completed_at && (
                                <p className="text-xs text-emerald-600 font-label">
                                  Completed {new Date(amend.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-outline-variant/20">
                              {/* Advance status */}
                              {nextStatus(amend.status) && (
                                <button
                                  onClick={() => handleStatusChange(amend)}
                                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-label font-medium cursor-pointer hover:opacity-90 transition-opacity"
                                >
                                  {nextStatusLabel(amend.status)}
                                </button>
                              )}

                              {/* Therapist toggle */}
                              <button
                                onClick={() => handleTherapistToggle(amend)}
                                className={`px-3 py-2 rounded-xl text-xs font-label font-medium cursor-pointer transition-all ${
                                  amend.therapist_reviewed
                                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm">
                                    {amend.therapist_reviewed ? 'check_box' : 'check_box_outline_blank'}
                                  </span>
                                  Shared with therapist
                                </span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(amend.id)}
                                disabled={deletingId === amend.id}
                                className="ml-auto px-3 py-2 rounded-xl text-xs font-label text-error/70 hover:text-error hover:bg-error/5 cursor-pointer transition-colors"
                              >
                                {deletingId === amend.id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
