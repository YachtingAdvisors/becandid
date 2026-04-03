'use client';

// ============================================================
// app/therapist/directory/[id]/page.tsx — Therapist Profile
// Public page showing a single therapist's full profile
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Therapist {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  bio: string;
  insurance: string[];
  website: string;
}

export default function TherapistProfilePage() {
  const params = useParams();
  const therapistId = params.id as string;

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTherapist = useCallback(async () => {
    try {
      const res = await fetch('/api/therapist/directory');
      if (res.ok) {
        const data = await res.json();
        const found = (data.therapists || []).find((t: Therapist) => t.id === therapistId);
        if (found) {
          setTherapist(found);
        } else {
          setNotFound(true);
        }
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => { fetchTherapist(); }, [fetchTherapist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 animate-pulse">
            <div className="h-8 w-48 bg-surface-container-low rounded mb-4" />
            <div className="h-4 w-32 bg-surface-container-low rounded mb-6" />
            <div className="h-24 bg-surface-container-low rounded mb-4" />
            <div className="h-10 w-36 bg-surface-container-low rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !therapist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">person_off</span>
          <h2 className="text-lg font-semibold text-on-surface mb-2">Therapist not found</h2>
          <Link href="/therapist/directory" className="text-sm text-primary hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 sm:px-6">
          <Link href="/therapist/directory" className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Directory
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 sm:px-6">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary">person</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-on-surface">{therapist.name}</h1>
              {therapist.location && (
                <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {therapist.location}
                </p>
              )}
            </div>
          </div>

          {/* Specialties */}
          {therapist.specialty.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {therapist.specialty.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-label font-semibold bg-primary/10 text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">About</h2>
            <p className="text-sm text-on-surface leading-relaxed font-body whitespace-pre-line">
              {therapist.bio || 'No bio provided.'}
            </p>
          </div>

          {/* Insurance */}
          {therapist.insurance.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Insurance Accepted</h2>
              <div className="flex flex-wrap gap-2">
                {therapist.insurance.map((ins) => (
                  <span key={ins} className="px-3 py-1 rounded-full text-xs font-label bg-surface-container-low text-on-surface border border-outline-variant">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
            {therapist.website && (
              <a href={therapist.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-label font-semibold border border-outline-variant text-on-surface hover:border-primary/30 hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-base">language</span>
                Visit Website
              </a>
            )}
            <Link href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-label font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-base">handshake</span>
              Connect on Be Candid
            </Link>
          </div>
        </div>

        {/* Pitch */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 text-center">
          <p className="text-xs font-label font-semibold text-primary mb-1">Why connect through Be Candid?</p>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-lg mx-auto font-body">
            When you connect with a therapist through Be Candid, they get real-time access to your
            patterns, journal entries, and progress &mdash; with your consent. Every session starts with
            data, not guesswork.
          </p>
        </div>
      </div>
    </div>
  );
}
