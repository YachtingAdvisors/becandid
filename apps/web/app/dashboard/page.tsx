import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { GOAL_LABELS, getCategoryEmoji, timeAgo } from '@be-candid/shared';
import type { GoalCategory, Severity } from '@be-candid/shared';
import { Suspense } from 'react';
import FocusBoardMini from '@/components/dashboard/FocusBoardMini';
import CheckInMini from '@/components/dashboard/CheckInMini';
import NudgeBanner from '@/components/dashboard/NudgeBanner';
import RelationshipMini from '@/components/dashboard/RelationshipMini';
import SpouseImpactAwareness from '@/components/dashboard/SpouseImpactAwareness';
import ScreenTimeCard from '@/components/dashboard/ScreenTimeCard';
import ContentFilterStatus from '@/components/dashboard/ContentFilterStatus';
import WalkthroughWrapper from '@/components/dashboard/WalkthroughWrapper';
import QuickMoodCheckin from '@/components/dashboard/QuickMoodCheckin';
import GrowthJournalWidget from '@/components/dashboard/GrowthJournalWidget';
import QuoteOfTheDay from '@/components/dashboard/QuoteOfTheDay';
import ReferralCard from '@/components/dashboard/ReferralCard';
import Link from 'next/link';

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

/* ── Image URLs for dashboard cards ──────────────────────── */
const IMAGES = {
  crisis: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2PCBqh0r0XvbXJDoIEsvChMXbblBdWZXVmPnPx8vluAlIIDucgY3v30rMZfGzihOLd5Ia0--KQVA4mZVnXJD-77rO0isDR-vo4892fqZvxWQgm7uSZq9OhnYDnxtgTqiCNcuPpT6Py4FSd930P4VzXmFVT1QixXQxljEZ4m50_VBnJ1Oh7jgkg9h-R962WCiwhhqBP58uSLVH1IcJ2hKPaiEAer8GxO6AKpqR1hzUhFxE9ah4094WMrEQ1KslZWYovr7C_kdy07eD',
  guardian: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfpF--KFSH1cy_6OBg93bKMc1gd14EqwcEEog-t6MRUe8QhOI5SPIUcmoh6l1T6YUBUy4LKdEeuUZrslDB416pE39KXKFVf2lk7_dwje-3Rv7l-EbjKvvro96ASsDf7LTpYNVX3p_gipILTXxWXcR0angm8imcdY9CnP4SZ1neORKJH138yUFYcWIghaEtDYvDyGYr3ELkonIOhGIJ7I2ey1L0cMlqigWN9Kql3bpW-K7ZRT_mIP8RyLiwzFBz7-uetTG33SpOnXgB',
  screenTime: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8r5F8dD28slCIYA2s9aKRnx0uApEyC-ppD8DLNUx2-X5FfNFQcdM8OKJUWui0FekVLb68kQfkT-1cwWb0gQV7j7ByCGkWlauhEnJpptHOuNCkSzngOUHFwqnGARySp03UjnzsxG7kMKD62daIP6dBtMNhegwofC7BfwigGdnW2DFs-PBFldta7m6qgayt5m2637au0Hs2oan7RWWi4Gr6M-_qVeB_u4D_pAQFDTMnkNLFI1oxFD0Xqz0DYl8ItG1JsYZqGUPlfwDc',
  partner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9z0_qFFcxPTynziBimlO4ZPOQFzK7CzCSyVCv0kNcrKCiAJBxSC5E1phNCkDn9xtVrExQQ87WeZIoheVpMKoAWKh41dsihbIIjOeUaFB8wHt5T--RFXDxFiuZTZO1vz6lISFQaOI04Tym26Ju5v_M3Car6glHvDiYJzZrxsZSfLbsTS8n4qUTvbU1Um6VgboqhHrYBMFUVZrJuwLBTCI0mDrRwx3eM2jkUnm56VUa29YoY5hiWJ-tcB-E4cNfJ-CTTJIPBiHFvTnT',
  conversation: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK75pW4vwBoIKZKqRfXv5nNixz53H86_XDRAM5lFE_qLDRDA_0EaBcExFNNcW2diDMzW7oHfniK5vT0VoDh8ORn6nDCr0bAoTYjdXoKn1JXHixWNHCN-flYfPlrnxYxeG5Q-eArpggt6kseUMEvlK-J3dB7Rfp0Tns9F2koKnKe904q18HbSiSBZrD9zSh5xQev-Mj2Rmdv4u19VE3ebdtEcecyMf1yeEMgGXxigV2uEAzs-KrJzjcwbLwiRFVLZnLuTzU2HNOJQcX',
  journal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfBxh_yzZ7uwgR50MZXnPl8QPW_ME7nN1lPEv_cD822RK8u7V3Of9E95ABemZ6rqV6rm8XlZxJ4wKTkxhiTM_BdCz20_ph4pMvKdJ0nnZ_vWe9SHbw_9L3pktumG67jQ9bcna8kWc8qkdjUObqfyMIRuBTqz8PcOF2YENphyR5zUA8P06cp0atPabHodQTd4U_R_CrPA0NsRlNWahv_-vNun8lbKvIeKrXMWssZuRwXhSxhjkg5EYMZoF14po0DPIq5w_QpV0AJlk5',
  contentFilter: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFXB-FLuFEzJSGvNSOMO371jUsqU4or47dt12RQUpFyGKy0QYOYry8Y8HDlzk5QZ67tgUAlb-B-d19tir4g-nQ8QL0YgqMU_Prwnu0TABcEXoLJzVSBziYz3qoolNAD6Y618dCgmPAfcj9r_yUuXtYbEKV-2f0zOq_YLPiwbTA4liYmq9KZqjL29E__6ceJEJiW-KUMZC0sNZ-qY2P0HeyFgrtebqakuqHa9UQTP1wb_29AmK24CSjQSB7l_J5O6Bc1DpMOAVtinG',
  alignment: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ys--kStjkPby9Zzm20_PmXM5uVfGTfSuggs9r3WJvReEscj7W60sLEU-bUDtF0AeqbE_btr3fg9RPmicpxh6qiQDyEz9kbkYiONgY96ZqIF0rZzvv8n6COzpeCPg7_kjrqpK7j3jkkolkA5PkecMAoDZ2zWxG-K47MB8kCTYKEVOWCWAZ27E-IKn6Qa76TU-IwTauc8Vmc8t8kt1CVrPbj6lj7BcLktihlUai5twB3UU1E20Azu2iAHz59zoPDPhHCQV_js88LSX',
  encryption: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_SmlA10dM0e2T2J0UiwgngHZsGaBJ4JuqCNZAMl1QG4NU9v7tdmC3VWKFAAgak_lSpbNYxCSYrvDlzgYvrmimwqt6xA3UityznZhg10haskT1rixoScFsfQlyOxUPSy4fdt2iwV5XzUl3aCzdGUJ8rHfFoly-qoTP62_ZTq7p6uIvSVJhgSMv1mYaAxBej4h_RoU7Zw7LVBfQJ8TMInGYqDcbbHd0MWedNtXiT--RHCjXowUWZwHMl-8etkYyMXnymYrHzoXbOK3x',
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  // Parallel data fetching (including walkthrough detection)
  const [profileRes, eventsRes, alertsRes, partnerRes, focusCountRes, journalCountRes, checkinCountRes] = await Promise.all([
    db.from('users').select('name, goals, monitoring_enabled, streak_mode, created_at, walkthrough_dismissed_at, check_in_hour, check_in_frequency, foundational_motivator, login_count').eq('id', user.id).single(),
    db.from('events').select('id, category, severity, platform, app_name, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5),
    db.from('alerts').select('id, sent_at, conversations(id, completed_at, outcome)').eq('user_id', user.id).order('sent_at', { ascending: false }).limit(5),
    db.from('partners').select('partner_name, status').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
    db.from('focus_segments').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    db.from('stringer_journal').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    db.from('check_ins').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').limit(1),
  ]);

  const profile = profileRes.data;
  const events = eventsRes.data ?? [];
  const alerts = alertsRes.data ?? [];
  const partner = partnerRes.data;

  const pendingConversations = alerts.filter((a: any) => !a.conversations?.[0]?.completed_at).length;

  // Walkthrough: detect which setup steps are complete
  // Show walkthrough only for first 2 logins, unless manually dismissed
  const loginCount = profile?.login_count ?? 0;
  const showWalkthrough = !profile?.walkthrough_dismissed_at && loginCount <= 2;

  // Increment login count (fire-and-forget, non-blocking)
  db.from('users')
    .update({ login_count: loginCount + 1 })
    .eq('id', user.id)
    .then(() => {});
  const completedSteps = {
    checkin_configured: (profile?.check_in_hour !== 21 || profile?.check_in_frequency !== 'daily'),
    focus_started: (focusCountRes.count ?? 0) > 0,
    first_journal: (journalCountRes.count ?? 0) > 0,
    first_checkin: (checkinCountRes.count ?? 0) > 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── First-Time Walkthrough ─────────────────────────── */}
      {showWalkthrough && (
        <WalkthroughWrapper
          userName={profile?.name?.split(' ')[0] ?? ''}
          completedSteps={completedSteps}
        />
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="relative pb-4">
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest mb-1">Welcome back</p>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-2">
          Quick Access Dashboard
        </h2>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Hey {profile?.name?.split(' ')[0] ?? 'there'} &mdash; immediate tools for your on-the-go safety management.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary" />
      </section>

      {/* ── Nudges ─────────────────────────────────────────── */}
      <NudgeBanner />

      {/* ── Quick Mood Check-in ────────────────────────────── */}
      <QuickMoodCheckin />

      {/* ── Quote of the Day ──────────────────────────────── */}
      <QuoteOfTheDay motivator={profile?.foundational_motivator ?? null} />

      {/* ── Referral Card ────────────────────────────────── */}
      <ReferralCard />

      {/* ── Featured Cards Grid ────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Crisis Detection — full width */}
        <Link href="/dashboard/activity" className="col-span-2 lg:col-span-3 group bg-surface-container-low rounded-2xl overflow-hidden shadow-sm ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
              profile?.monitoring_enabled
                ? 'bg-primary-container text-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {profile?.monitoring_enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.crisis} alt="Crisis Detection" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Crisis Detection</h3>
              <p className="text-xs text-on-surface-variant leading-tight mt-1">Real-time sentiment monitoring and support resources.</p>
            </div>
          </div>
        </Link>

        {/* Guardian Hub — half width */}
        <Link href="/guardian" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>
          </div>
          <div className="w-full aspect-square rounded-lg overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.guardian} alt="Guardian Dashboard" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Guardian Hub</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Central safety oversight.</p>
        </Link>

        {/* Screen Time */}
        <Link href="/dashboard/screen-time" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            </div>
            <span className="bg-tertiary-container text-on-tertiary-container text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Monitor</span>
          </div>
          <div className="w-full aspect-square rounded-lg overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.screenTime} alt="Screen Time" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Screen Time</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Conscious digital limits.</p>
        </Link>

        {/* Candid Journal */}
        <Link href="/dashboard/stringer-journal" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            </div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Reflect</span>
          </div>
          <div className="w-full aspect-square rounded-lg overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.journal} alt="Candid Journal" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Candid Journal</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Private space for reflective growth.</p>
        </Link>

        {/* Partner Awareness — full width */}
        <Link href="/dashboard/partner" className="col-span-2 lg:col-span-3 group bg-surface-container-low rounded-2xl ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer p-5 flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.partner} alt="Partner Awareness" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-headline font-bold text-base text-on-surface">Partner Awareness</h3>
              <div className="p-1.5 bg-surface-container-lowest rounded-lg shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {partner
                ? `Connected with ${partner.partner_name}. Mutual trust insights active.`
                : 'Mutual trust insights without compromising privacy.'}
            </p>
          </div>
        </Link>
      </section>

      {/* ── Focus Board & Check-in ─────────────────────────── */}
      <FocusBoardMini />
      <CheckInMini />

      {/* ── Relationship & Spouse Impact ────────────────────── */}
      <Suspense fallback={null}>
        <RelationshipMini />
      </Suspense>
      <Suspense fallback={null}>
        <SpouseImpactAwareness />
      </Suspense>

      {/* ── Screen Time & Content Filter Widgets ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Suspense fallback={null}>
          <ScreenTimeCard />
        </Suspense>
        <Suspense fallback={null}>
          <ContentFilterStatus />
        </Suspense>
      </div>

      {/* ── Growth Journal Widget ────────────────────────── */}
      <Suspense fallback={null}>
        <GrowthJournalWidget />
      </Suspense>

      {/* ── Other Services ─────────────────────────────────── */}
      <section>
        <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Other Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/dashboard/conversations" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.conversation} alt="Conversation Guides" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Conversation Guides</h4>
              <p className="text-[10px] text-on-surface-variant">Empathetic prompts for difficult talks.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/stringer-journal" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.journal} alt="Candid Journal" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Candid Journal</h4>
              <p className="text-[10px] text-on-surface-variant">Private space for reflective growth.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/content-filter" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.contentFilter} alt="AI Content Filtering" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">AI Content Filtering</h4>
              <p className="text-[10px] text-on-surface-variant">Shielding from toxic environments.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/streaks" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.alignment} alt="Alignment Tracking" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Alignment Tracking</h4>
              <p className="text-[10px] text-on-surface-variant">Sync habits with core values.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/security" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.encryption} alt="End-to-End Encryption" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">End-to-End Encryption</h4>
              <p className="text-[10px] text-on-surface-variant">Maximum privacy for interactions.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/checkins" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Quick Check-in</h4>
              <p className="text-[10px] text-on-surface-variant">Log how you&apos;re doing right now.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>
        </div>
      </section>

      {/* ── Recent Events ──────────────────────────────────── */}
      {events.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <h3 className="font-headline text-sm font-bold text-on-surface">Recent Events</h3>
            <Link href="/dashboard/activity" className="text-xs text-primary font-label font-medium hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
              View all
            </Link>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">
                  monitoring
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface font-body">
                    {GOAL_LABELS[event.category as GoalCategory] ?? event.category}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">
                    {event.app_name && `${event.app_name} \u00B7 `}
                    {event.platform} &middot; {timeAgo(event.timestamp)}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[event.severity as Severity]}`}>
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending Conversations ──────────────────────────── */}
      {pendingConversations > 0 && (
        <div className="bg-tertiary-container rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.conversation} alt="Conversations" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-sm font-bold text-on-tertiary-container mb-0.5">
                {pendingConversations} conversation{pendingConversations !== 1 ? 's' : ''} waiting
              </h3>
              <p className="text-xs text-on-tertiary-container/70 font-body">
                Complete conversations to earn trust points and keep your streak alive.
              </p>
            </div>
            <Link
              href="/dashboard/conversations"
              className="px-4 py-2 bg-primary text-on-primary text-sm font-label font-bold rounded-full hover:opacity-90 transition-opacity flex-shrink-0 uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
