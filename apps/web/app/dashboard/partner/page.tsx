'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GoalCategory } from '@be-candid/shared';
import { GOAL_LABELS, getCategoryEmoji } from '@be-candid/shared';
import PartnerCompatibility from '@/components/dashboard/PartnerCompatibility';
import TrustMeter from '@/components/dashboard/TrustMeter';
import GrowthJourney from '@/components/dashboard/GrowthJourney';

interface PartnerData {
  id: string;
  partner_name: string;
  partner_email: string;
  partner_phone: string | null;
  status: 'pending' | 'active' | 'declined';
  relationship?: string;
  invited_at: string;
  accepted_at: string | null;
}

interface RelationshipData {
  level: number;
  levelTitle: string;
  levelEmoji: string;
  totalXP: number;
  streak: number;
  streakMultiplier: number;
  progressToNext: number;
}

const RELATIONSHIP_OPTIONS = [
  { key: 'friend', label: 'Friend' },
  { key: 'spouse', label: 'Spouse' },
  { key: 'mentor', label: 'Mentor' },
  { key: 'family', label: 'Family' },
  { key: 'coach', label: 'Coach' },
  { key: 'therapist', label: 'Therapist' },
  { key: 'spiritual_leader', label: 'Spiritual Leader' },
  { key: 'other', label: 'Other' },
];

const RELATIONSHIP_ICONS: Record<string, string> = {
  friend: 'group',
  spouse: 'favorite',
  mentor: 'school',
  family: 'family_restroom',
  coach: 'fitness_center',
  therapist: 'psychology',
  spiritual_leader: 'church',
  other: 'handshake',
};

const CONVERSATION_PROMPTS = [
  {
    text: 'I see you working toward presence and showing up even when it\'s hard. What does being present feel like for you today?',
    theme: 'presence',
    icon: 'self_improvement',
  },
  {
    text: 'I know you\'re building something meaningful. What\'s one thing you created or accomplished this week that you\'re proud of?',
    theme: 'building',
    icon: 'construction',
  },
  {
    text: 'I want you to know you belong here — not because of what you do, but because of who you are. How can I make that feel more real?',
    theme: 'belonging',
    icon: 'favorite',
  },
  {
    text: 'You\'ve been practicing compassion toward yourself. What\'s something kind you\'ve told yourself this week instead of the old script?',
    theme: 'compassion',
    icon: 'spa',
  },
  {
    text: 'I know trusting doesn\'t come easy. What would it look like for you to let go of one thing you\'re trying to control right now?',
    theme: 'surrendering',
    icon: 'water_drop',
  },
  {
    text: 'You\'re choosing real connection over the easy substitutes. What\'s one real conversation or moment of connection you had this week?',
    theme: 'connecting',
    icon: 'handshake',
  },
  {
    text: 'I notice you\'re learning to sit with difficult emotions instead of running. What have you experienced this week that surprised you?',
    theme: 'experiencing',
    icon: 'wb_sunny',
  },
  {
    text: 'You\'re learning to trust the process. What\'s one area where you let go of needing to know the outcome?',
    theme: 'trusting',
    icon: 'shield_with_heart',
  },
];

function getRelationshipLabel(raw: string | undefined): string {
  if (!raw) return 'Partner';
  const first = raw.split(',')[0].trim().toLowerCase();
  const match = RELATIONSHIP_OPTIONS.find(o => o.key === first);
  return match ? match.label : raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getRelationshipIcon(raw: string | undefined): string {
  if (!raw) return 'handshake';
  const first = raw.split(',')[0].trim().toLowerCase();
  return RELATIONSHIP_ICONS[first] || 'handshake';
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Connected', icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' };
    case 'pending':
      return { label: 'Pending', icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' };
    case 'declined':
      return { label: 'Declined', icon: 'cancel', color: 'text-red-500', bg: 'bg-red-50', ring: 'ring-red-200' };
    default:
      return { label: status, icon: 'info', color: 'text-on-surface-variant', bg: 'bg-surface-container-low', ring: 'ring-outline-variant' };
  }
}

function getRandomPrompts(count: number) {
  const shuffled = [...CONVERSATION_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function PartnerPage() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [maxPartners, setMaxPartners] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reinvitingId, setReinvitingId] = useState<string | null>(null);
  const [relationshipData, setRelationshipData] = useState<RelationshipData | null>(null);

  // Inline invite form state
  const [showForm, setShowForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [relationships, setRelationships] = useState<string[]>(['friend']);
  const [customRelationship, setCustomRelationship] = useState('');
  const relationship = relationships.includes('other') && customRelationship.trim()
    ? [...relationships.filter(r => r !== 'other'), customRelationship.trim()].join(', ')
    : relationships.join(', ');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    const d = digits.startsWith('1') ? digits : '1' + digits;
    if (d.length <= 1) return '+1';
    if (d.length <= 4) return `+1 (${d.slice(1)}`;
    if (d.length <= 7) return `+1 (${d.slice(1, 4)}) ${d.slice(4)}`;
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '+') { setPartnerPhone(''); return; }
    setPartnerPhone(formatPhone(raw));
  };
  const [userGoals, setUserGoals] = useState<GoalCategory[]>([]);
  const [sharedRivals, setSharedRivals] = useState<GoalCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [partnerScores, setPartnerScores] = useState<Array<{
    partnerId: string; partnerName: string; score: number;
    responseTime: number; checkInRate: number; avgRating: number;
    conversationCount: number;
  }>>([]);
  const [conversationPrompts] = useState(() => getRandomPrompts(3));
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Fetch partner data
  const fetchPartners = useCallback(() => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(d => {
        setPartners(d.partners ?? []);
        setMaxPartners(d.maxPartners ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPartners();
    fetch('/api/partners/scores')
      .then(r => r.json())
      .then(d => setPartnerScores(d.scores ?? []))
      .catch(console.error);
    fetch('/api/relationship')
      .then(r => { if (r.ok) return r.json(); throw new Error(); })
      .then(d => setRelationshipData(d))
      .catch(() => {});
  }, [fetchPartners]);

  // Fetch user profile to get goals when form opens
  useEffect(() => {
    if (!showForm) return;
    fetch('/api/auth/profile')
      .then(r => r.json())
      .then(d => {
        const goals: GoalCategory[] = d.profile?.goals ?? d.goals ?? [];
        setUserGoals(goals);
        setSharedRivals(goals); // pre-select all
      })
      .catch(console.error);
  }, [showForm]);

  async function handleReinvite(partnerId: string) {
    setReinvitingId(partnerId);
    await fetch('/api/partners/reinvite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: partnerId }),
    });
    setReinvitingId(null);
  }

  async function handleInvite() {
    setError('');
    if (!partnerName.trim()) { setError('Please enter your partner\'s name.'); return; }
    if (!partnerEmail.trim()) { setError('Please enter your partner\'s email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail.trim())) { setError('Please enter a valid email address.'); return; }
    if (partnerPhone.trim() && partnerPhone.trim().length < 7) { setError('Please enter a valid phone number (at least 7 digits).'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: partnerName.trim(),
          partner_email: partnerEmail.trim().toLowerCase(),
          partner_phone: partnerPhone.trim() || undefined,
          relationship_type: relationship,
          shared_rivals: sharedRivals,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const fields = data.details.fieldErrors;
          const messages: string[] = [];
          if (fields.partner_name) messages.push(`Name: ${fields.partner_name[0]}`);
          if (fields.partner_email) messages.push(`Email: ${fields.partner_email[0]}`);
          if (fields.partner_phone) messages.push(`Phone: ${fields.partner_phone[0]}`);
          if (fields.relationship_type) messages.push(`Relationship: ${fields.relationship_type[0]}`);
          setError(messages.length > 0 ? messages.join('. ') : (data.error || 'Failed to send invite'));
        } else {
          setError(data.error || 'Failed to send invite');
        }
      } else {
        // Success — reset form and refresh
        setShowForm(false);
        setPartnerName('');
        setPartnerEmail('');
        setPartnerPhone('');
        setRelationships(['friend']);
        setCustomRelationship('');
        setSharedRivals([]);
        setLoading(true);
        fetchPartners();
      }
    } catch {
      setError('Failed to send invite');
    }
    setSubmitting(false);
  }

  function toggleRival(goal: GoalCategory) {
    setSharedRivals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  }

  function handleCancel() {
    setShowForm(false);
    setError('');
    setPartnerName('');
    setPartnerEmail('');
    setPartnerPhone('');
    setRelationships(['friend']);
    setCustomRelationship('');
    setSharedRivals([]);
  }

  async function copyPrompt(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-8 animate-pulse">
          <div className="h-6 bg-surface-container rounded w-48 mb-4" />
          <div className="h-4 bg-surface-container-low rounded w-64" />
        </div>
      </div>
    );
  }

  // Derived state
  const activePartner = partners.find(p => p.status === 'active') ?? null;
  const canAddMore = partners.length < maxPartners;

  // Compute trust meter data from partner scores
  const primaryScore = partnerScores.length > 0 ? partnerScores[0] : null;
  const checkInRate = primaryScore?.checkInRate ?? 0;
  const totalCheckIns = primaryScore?.conversationCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Accountability</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Your Partners</h1>
        <p className="text-sm text-on-surface-variant font-body">Manage your accountability partnerships.</p>
      </div>

      {/* ── Partner Cards ──────────────────────────────────────── */}
      {partners.length > 0 && (
        <div className="space-y-3">
          {partners.map((p) => {
            const cfg = getStatusConfig(p.status);
            const days = p.accepted_at
              ? Math.floor((Date.now() - new Date(p.accepted_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            return (
              <div key={p.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container/30 to-surface-container-lowest p-5 ring-1 ring-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary font-headline font-bold text-xl flex-shrink-0 ring-2 ring-primary/20">
                    {p.partner_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-headline text-lg font-bold text-on-surface truncate">{p.partner_name}</h2>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-label font-semibold ${cfg.bg} ${cfg.color} ring-1 ${cfg.ring}`}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant/60">
                        {getRelationshipIcon(p.relationship)}
                      </span>
                      <span className="text-sm text-on-surface-variant font-label">
                        {getRelationshipLabel(p.relationship)}
                      </span>
                      {p.accepted_at && (
                        <>
                          <span className="text-on-surface-variant/30">{'·'}</span>
                          <span className="text-sm text-on-surface-variant font-label">
                            {days} day{days !== 1 ? 's' : ''} connected
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant/60 font-body mt-0.5">{p.partner_email}</p>
                  </div>
                </div>

                {/* Pending: inline resend */}
                {p.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                    <p className="text-xs text-on-surface-variant font-body">
                      {p.partner_name} hasn&apos;t accepted yet.
                    </p>
                    <button
                      onClick={() => handleReinvite(p.id)}
                      disabled={reinvitingId === p.id}
                      className="px-4 py-2 min-h-[36px] bg-tertiary text-on-primary text-xs font-label font-medium rounded-xl cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {reinvitingId === p.id ? 'Sending\u2026' : 'Resend Invite'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Partner Button ─────────────────────────────────── */}
      {canAddMore && !showForm && (
        partners.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">handshake</span>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Accountability changes everything</h3>
            <p className="text-sm text-on-surface-variant font-body mb-3 max-w-md mx-auto leading-relaxed">
              Invite someone you trust &mdash; a friend, spouse, mentor, or coach.
              They&apos;ll see your focus status, never your browsing.
            </p>
            <div className="flex items-center justify-center gap-3 mb-3 px-4 py-3 rounded-2xl bg-primary-container/20">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Simeon_Solomon_-_King_Solomon.jpg/200px-Simeon_Solomon_-_King_Solomon.jpg" alt="King Solomon" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/20 shrink-0" />
              <p className="text-xs text-on-surface font-body italic text-left">&ldquo;A cord of three strands is not easily broken.&rdquo; <span className="not-italic font-label font-medium text-on-surface-variant">&mdash; King Solomon</span></p>
            </div>
            <p className="text-[10px] text-primary font-label font-medium mb-6">
              Add 1 partner free. Upgrade to Pro for up to 5.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex px-6 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
              Invite a Partner
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl ring-1 ring-dashed ring-outline-variant/30 bg-surface-container-lowest hover:ring-primary/30 hover:bg-primary-container/10 transition-all duration-200 cursor-pointer group"
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant/50 group-hover:text-primary transition-colors duration-200">person_add</span>
            <span className="text-sm font-label font-medium text-on-surface-variant/70 group-hover:text-primary transition-colors duration-200">
              Add Another Partner
            </span>
            <span className="text-[10px] font-label text-on-surface-variant/40 ml-1">
              ({partners.length}/{maxPartners})
            </span>
          </button>
        )
      )}

      {/* ── Invite Form ────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6 space-y-6">
          {/* Section 1: Partner Details */}
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface mb-1">Partner details</h3>
            <p className="text-sm text-on-surface-variant font-body mb-4">
              A friend, spouse, mentor, or coach who&apos;ll walk with you.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their email</label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@email.com"
                  className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">
                  Their phone <span className="text-on-surface-variant font-normal">(optional — for SMS alerts)</span>
                </label>
                <input
                  type="tel"
                  value={partnerPhone}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Relationship <span className="text-on-surface-variant font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIP_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setRelationships(prev =>
                        prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
                      )}
                      className={`px-4 py-2 rounded-full text-sm font-label font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        relationships.includes(key)
                          ? 'border-primary bg-primary-container text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                {relationships.includes('other') && (
                  <input
                    type="text"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    placeholder="Describe your relationship"
                    maxLength={50}
                    className="mt-2 w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/20" />

          {/* Section 2: Rival Sharing */}
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface mb-1">What would you like your partner to see?</h3>
            <p className="text-sm text-on-surface-variant font-body mb-4">
              Choose which rivals your partner will have visibility into. You can change this later.
            </p>

            {userGoals.length === 0 ? (
              <div className="px-4 py-3 rounded-2xl bg-surface-container-low text-center">
                <p className="text-sm text-on-surface-variant font-body">
                  No rivals configured yet. Your partner will see all future rivals by default.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userGoals.map((goal) => {
                  const isSelected = sharedRivals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleRival(goal)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-label font-medium border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        isSelected
                          ? 'border-primary bg-primary-container/40 text-primary'
                          : 'border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:border-primary/30'
                      }`}>
                      <span className="text-base">{getCategoryEmoji(goal)}</span>
                      <span>{GOAL_LABELS[goal]}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {userGoals.length > 0 && (
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setSharedRivals([...userGoals])}
                  className="text-xs font-label font-medium text-primary hover:underline cursor-pointer">
                  Select all
                </button>
                <button
                  onClick={() => setSharedRivals([])}
                  className="text-xs font-label font-medium text-on-surface-variant hover:underline cursor-pointer">
                  Deselect all
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-sm text-error font-body">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-3 min-h-[44px] text-sm font-label font-semibold rounded-2xl ring-1 ring-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={!partnerName.trim() || !partnerEmail.trim() || submitting}
              className="flex-1 px-6 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200">
              {submitting ? 'Sending invite\u2026' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}

      {/* ── Active Partner Detail Sections ──────────────────────── */}
      {activePartner && (
        <>
          {/* ── Partner Streak & Momentum ────────────────────── */}
          {relationshipData && (
            <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-lg text-on-surface-variant">local_fire_department</span>
                <h3 className="font-headline text-base font-bold text-on-surface">Partnership Momentum</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Streak */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low">
                  <span className={`font-headline text-2xl font-extrabold leading-none ${
                    relationshipData.streak >= 7 ? 'text-tertiary' : relationshipData.streak >= 3 ? 'text-primary' : 'text-on-surface'
                  }`}>
                    {relationshipData.streak}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-1">
                    day streak
                  </span>
                  {relationshipData.streakMultiplier > 1 && (
                    <span className="mt-1.5 text-[9px] px-2 py-0.5 rounded-full font-label bg-tertiary-container text-on-tertiary-container font-bold">
                      {relationshipData.streakMultiplier}x bonus
                    </span>
                  )}
                </div>

                {/* Level */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low">
                  <span className="text-2xl leading-none">{relationshipData.levelEmoji}</span>
                  <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-1">
                    Level {relationshipData.level}
                  </span>
                  <span className="mt-1.5 text-[10px] font-label font-medium text-primary truncate max-w-full px-1">
                    {relationshipData.levelTitle}
                  </span>
                </div>

                {/* XP */}
                <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low">
                  <span className="font-headline text-2xl font-extrabold text-on-surface leading-none">
                    {relationshipData.totalXP.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-1">
                    total XP
                  </span>
                  {/* Progress to next level */}
                  <div className="w-full mt-2">
                    <div className="h-1.5 w-full rounded-full bg-outline-variant/15">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${relationshipData.progressToNext}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Trust Meter ─────────────────────────────────── */}
          <TrustMeter checkInRate={checkInRate} totalCheckIns={totalCheckIns} />

          {/* ── Growth Journey Visualization ──────────────────── */}
          <GrowthJourney
            partnerName={activePartner.partner_name || 'Partner'}
            streakDays={relationshipData?.streak ?? 0}
            checkInRate={checkInRate}
            journalCount={0}
            focusRate={relationshipData?.streak ? Math.min(relationshipData.streak * 5, 100) : 50}
            daysSinceSignup={30}
          />

          {/* Partner effectiveness scores */}
          {partnerScores.length > 0 && (
            <PartnerCompatibility partners={partnerScores} />
          )}

          {/* ── Conversation Prompts ────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <h3 className="font-headline text-base font-bold text-on-surface">Conversation Starters</h3>
              </div>
              <Link
                href="/partner/conversations"
                className="text-xs font-label font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant font-body mb-4 -mt-2">
              Open a meaningful conversation with {activePartner.partner_name}
            </p>

            <div className="space-y-3">
              {conversationPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 to-primary/5 ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant/50 mt-0.5 shrink-0">{prompt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-on-surface leading-relaxed italic">
                      &ldquo;{prompt.text}&rdquo;
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-label font-medium uppercase tracking-wide bg-surface-container-low text-on-surface-variant">
                      {prompt.theme}
                    </span>
                  </div>
                  <button
                    onClick={() => copyPrompt(prompt.text, idx)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-label font-medium text-primary bg-primary/8 hover:bg-primary/15 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedIdx === idx ? 'check' : 'content_copy'}
                    </span>
                    {copiedIdx === idx ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>

            {/* Suggest a Conversation CTA */}
            <div className="mt-4 pt-4 border-t border-outline-variant/15">
              <Link
                href="/partner/conversations"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">forum</span>
                Suggest a Conversation
              </Link>
            </div>
          </div>

          {/* ── Quick Actions ────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/partner/focus"
              className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-4 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] cursor-pointer transition-all duration-200 text-center">
              <div className="text-2xl mb-1">{'\uD83C\uDFAF'}</div>
              <div className="text-sm font-label font-medium text-on-surface">Their Focus Board</div>
            </Link>
            <Link href="/partner/checkins"
              className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-4 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] cursor-pointer transition-all duration-200 text-center">
              <div className="text-2xl mb-1">{'\uD83D\uDCCB'}</div>
              <div className="text-sm font-label font-medium text-on-surface">Check-ins</div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
