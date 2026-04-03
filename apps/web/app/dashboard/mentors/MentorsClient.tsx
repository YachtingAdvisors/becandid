'use client';

import { useState } from 'react';

/* ─── Types ─────────────────────────────────────────────── */

interface MentorProfile {
  id: string;
  display_name: string;
  bio: string | null;
  specialties: string[];
  max_mentees: number;
  active: boolean;
  streak_at_signup: number;
  created_at: string;
}

interface Mentor {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  specialties: string[];
  max_mentees: number;
  streak_at_signup: number;
  created_at: string;
  active_mentees: number;
  spots_open: number;
  is_mine: boolean;
}

interface Mentee {
  id: string;
  mentee_user_id: string;
  started_at: string;
}

interface MyConnection {
  id: string;
  mentor_id: string;
  started_at: string;
  mentor: {
    display_name: string;
    bio: string | null;
    specialties: string[];
    streak_at_signup: number;
  };
}

interface Props {
  streak: number;
  myMentorProfile: MentorProfile | null;
  myMentees: Mentee[];
  myMentorConnection: MyConnection | null;
  initialMentors: Mentor[];
}

const SPECIALTIES = [
  { value: 'pornography', label: 'Pornography' },
  { value: 'gambling', label: 'Gambling' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'doomscrolling', label: 'Doomscrolling' },
  { value: 'sexting', label: 'Sexting' },
  { value: 'general', label: 'General' },
];

const SPECIALTY_LABELS: Record<string, string> = {};
SPECIALTIES.forEach((s) => { SPECIALTY_LABELS[s.value] = s.label; });

/* ─── Component ─────────────────────────────────────────── */

export default function MentorsClient({
  streak,
  myMentorProfile: initialProfile,
  myMentees: initialMentees,
  myMentorConnection: initialConnection,
  initialMentors,
}: Props) {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [myProfile, setMyProfile] = useState<MentorProfile | null>(initialProfile);
  const [myMentees] = useState<Mentee[]>(initialMentees);
  const [myConnection, setMyConnection] = useState<MyConnection | null>(initialConnection);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');

  // Mentor signup form
  const [showSignup, setShowSignup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [signupLoading, setSignupLoading] = useState(false);

  // Edit form
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(myProfile?.display_name ?? '');
  const [editBio, setEditBio] = useState(myProfile?.bio ?? '');
  const [editSpecialties, setEditSpecialties] = useState<string[]>(myProfile?.specialties ?? []);
  const [editLoading, setEditLoading] = useState(false);

  const [error, setError] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [endingConnection, setEndingConnection] = useState(false);

  const canBeMentor = streak >= 90;

  /* ── Become a mentor ─────────────────────────────────── */

  async function handleSignup() {
    if (!displayName.trim()) return;
    setSignupLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim(),
          specialties: selectedSpecialties,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMyProfile({ ...data.mentor, active: true });
        setShowSignup(false);
      }
    } catch {
      setError('Failed to sign up as mentor.');
    }
    setSignupLoading(false);
  }

  /* ── Edit mentor profile ─────────────────────────────── */

  async function handleEdit() {
    setEditLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mentors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: editName.trim(),
          bio: editBio.trim(),
          specialties: editSpecialties,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMyProfile((prev) => prev ? { ...prev, ...data.mentor } : null);
        setShowEdit(false);
      }
    } catch {
      setError('Failed to update profile.');
    }
    setEditLoading(false);
  }

  /* ── Request mentorship ──────────────────────────────── */

  async function handleConnect(mentorId: string) {
    setConnectingId(mentorId);
    setError('');
    try {
      const res = await fetch('/api/mentors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_id: mentorId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Find the mentor to build connection display
        const mentor = mentors.find((m) => m.id === mentorId);
        if (mentor) {
          setMyConnection({
            id: data.connection.id,
            mentor_id: mentorId,
            started_at: data.connection.started_at,
            mentor: {
              display_name: mentor.display_name,
              bio: mentor.bio,
              specialties: mentor.specialties,
              streak_at_signup: mentor.streak_at_signup,
            },
          });
          // Update spots
          setMentors((prev) =>
            prev.map((m) =>
              m.id === mentorId
                ? { ...m, active_mentees: m.active_mentees + 1, spots_open: m.spots_open - 1 }
                : m,
            ),
          );
        }
      }
    } catch {
      setError('Failed to connect.');
    }
    setConnectingId(null);
  }

  /* ── End mentorship ──────────────────────────────────── */

  async function handleEndConnection() {
    if (!myConnection) return;
    setEndingConnection(true);
    setError('');
    try {
      const res = await fetch('/api/mentors/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: myConnection.id }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const prevMentorId = myConnection.mentor_id;
        setMyConnection(null);
        setMentors((prev) =>
          prev.map((m) =>
            m.id === prevMentorId
              ? { ...m, active_mentees: Math.max(0, m.active_mentees - 1), spots_open: m.spots_open + 1 }
              : m,
          ),
        );
      }
    } catch {
      setError('Failed to end connection.');
    }
    setEndingConnection(false);
  }

  /* ── Toggle specialty ────────────────────────────────── */

  function toggleSpecialty(list: string[], value: string, setter: (v: string[]) => void) {
    if (list.includes(value)) {
      setter(list.filter((s) => s !== value));
    } else if (list.length < 5) {
      setter([...list, value]);
    }
  }

  /* ── Filtered mentors ────────────────────────────────── */

  const filteredMentors = mentors.filter((m) => {
    if (m.is_mine) return false; // Don't show own profile in mentor list
    if (filterSpecialty && !m.specialties.includes(filterSpecialty)) return false;
    return true;
  });

  /* ── Format date ─────────────────────────────────────── */

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="material-symbols-outlined text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          supervised_user_circle
        </span>
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Mentors</h1>
          <p className="text-sm text-on-surface-variant mt-0.5 font-body">
            Connect with someone who&apos;s walked this road and come out the other side.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* ── My Active Mentor Connection ─────────────────── */}
      {myConnection && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-primary/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              link
            </span>
            <span className="text-sm font-semibold text-on-surface">Your Mentor</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-on-surface">{myConnection.mentor.display_name}</h3>
              {myConnection.mentor.bio && (
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{myConnection.mentor.bio}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {myConnection.mentor.specialties.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                    {SPECIALTY_LABELS[s] || s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Connected since {formatDate(myConnection.started_at)}
              </p>
            </div>
            <button
              onClick={handleEndConnection}
              disabled={endingConnection}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-red-600 hover:bg-red-50 border border-outline-variant transition-colors"
            >
              {endingConnection ? 'Ending...' : 'End Mentorship'}
            </button>
          </div>
        </div>
      )}

      {/* ── Become a Mentor (90+ streak) ────────────────── */}
      {canBeMentor && !myProfile && !showSignup && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-amber-600">military_tech</span>
          </div>
          <h2 className="text-lg font-headline font-semibold text-on-surface mb-1">Become a Mentor</h2>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto mb-4">
            You&apos;ve maintained a {streak}-day streak. Your experience can guide someone
            just starting their journey.
          </p>
          <button
            onClick={() => setShowSignup(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-label font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">volunteer_activism</span>
            Sign Up as Mentor
          </button>
        </div>
      )}

      {/* ── Mentor Signup Form ──────────────────────────── */}
      {showSignup && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
          <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">person_add</span>
            Mentor Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How mentees will see you"
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Bio <span className="text-on-surface-variant font-normal">(optional, max 500 chars)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Share a little about your journey and what you can offer..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1.5">Specialties</label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggleSpecialty(selectedSpecialties, s.value, setSelectedSpecialties)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedSpecialties.includes(s.value)
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowSignup(false)}
                className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignup}
                disabled={!displayName.trim() || signupLoading}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {signupLoading ? 'Saving...' : 'Become a Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── My Mentor Profile ───────────────────────────── */}
      {myProfile && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-primary/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
              <span className="text-sm font-semibold text-on-surface">Your Mentor Profile</span>
              {!myProfile.active && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactive</span>
              )}
            </div>
            <button
              onClick={() => {
                setEditName(myProfile.display_name);
                setEditBio(myProfile.bio ?? '');
                setEditSpecialties(myProfile.specialties ?? []);
                setShowEdit(!showEdit);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              Edit
            </button>
          </div>

          <h3 className="text-base font-semibold text-on-surface">{myProfile.display_name}</h3>
          {myProfile.bio && (
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{myProfile.bio}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {myProfile.specialties.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                {SPECIALTY_LABELS[s] || s}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">group</span>
              {myMentees.length} active mentee{myMentees.length !== 1 ? 's' : ''} / {myProfile.max_mentees} max
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">local_fire_department</span>
              {myProfile.streak_at_signup}-day streak at signup
            </span>
          </div>

          {/* Edit form */}
          {showEdit && (
            <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Display name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1.5">Specialties</label>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => toggleSpecialty(editSpecialties, s.value, setEditSpecialties)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        editSpecialties.includes(s.value)
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="px-5 py-2 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Find a Mentor ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-semibold text-on-surface">Find a Mentor</h2>
          {/* Specialty filter */}
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {filteredMentors.length > 0 ? (
          <div className="space-y-3 stagger">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 transition-all hover:border-primary/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {mentor.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-on-surface">{mentor.display_name}</h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="inline-flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs text-amber-500">local_fire_department</span>
                            {mentor.streak_at_signup}+ days
                          </span>
                          <span className={`${mentor.spots_open > 0 ? 'text-emerald-600' : 'text-on-surface-variant'}`}>
                            {mentor.spots_open > 0
                              ? `${mentor.spots_open} spot${mentor.spots_open !== 1 ? 's' : ''} open`
                              : 'Full'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed line-clamp-2 pl-12">
                        {mentor.bio}
                      </p>
                    )}

                    {mentor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pl-12">
                        {mentor.specialties.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                            {SPECIALTY_LABELS[s] || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connect button */}
                  <div className="shrink-0 ml-3">
                    {myConnection?.mentor_id === mentor.id ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Connected
                      </span>
                    ) : mentor.spots_open > 0 && !myConnection ? (
                      <button
                        onClick={() => handleConnect(mentor.id)}
                        disabled={connectingId === mentor.id}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {connectingId === mentor.id ? 'Connecting...' : 'Request Mentorship'}
                      </button>
                    ) : mentor.spots_open <= 0 ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant bg-surface-container-low">
                        Full
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">person_search</span>
            </div>
            <h2 className="text-lg font-headline font-semibold text-on-surface mb-2">
              No Mentors Yet
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed font-body">
              {canBeMentor
                ? 'No other mentors have signed up yet. Be the first to help someone on their journey.'
                : 'Mentors with 90+ day streaks will appear here. Keep going \u2014 your consistency is building something.'}
            </p>
            {!canBeMentor && streak > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Your streak: {streak} day{streak !== 1 ? 's' : ''} &mdash; {90 - streak} to go until you can mentor
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
