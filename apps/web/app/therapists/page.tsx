import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import PublicNav from '@/components/PublicNav';
import MaterialIcon from '@/components/ui/MaterialIcon';

export const metadata: Metadata = {
  title: 'For Therapists — Inpatient-Level Insights, Outpatient Setting',
  description: 'See your client\'s real-time patterns, journal entries, and digital triggers. Walk into every session as the most present and insightful therapist they\'ve ever had.',
  alternates: {
    canonical: 'https://becandid.io/therapists',
  },
  openGraph: {
    title: 'Be Candid for Therapists',
    description: 'Inpatient-level insights without the inpatient setting. Real-time client patterns, journal entries, and digital triggers.',
    url: 'https://becandid.io/therapists',
    type: 'website',
  },
};

const FEATURES = [
  {
    icon: 'psychology',
    title: 'Real-Time Pattern Visibility',
    description: 'See your client\'s digital triggers, screen time patterns, and vulnerability windows between sessions — not just what they remember to tell you.',
  },
  {
    icon: 'edit_note',
    title: 'Journal Access with Consent',
    description: 'Read their Stringer-framework journal entries: tributaries, longings, and roadmaps. Understand the emotional context before they walk in.',
  },
  {
    icon: 'trending_up',
    title: 'Mood & Streak Data',
    description: 'Track mood trends, focus streaks, and check-in history over time. Spot regression before it becomes relapse.',
  },
  {
    icon: 'shield',
    title: 'Granular Consent Controls',
    description: 'Clients choose exactly what you see: journal, moods, streaks, outcomes, patterns. They stay in control. You stay informed.',
  },
  {
    icon: 'handshake',
    title: 'Accountability Partner Insights',
    description: 'See how the client\'s accountability partner relationship is functioning. Conversation completion rates, response times, relationship health.',
  },
  {
    icon: 'lock',
    title: 'HIPAA-Ready Privacy',
    description: 'End-to-end encryption, audit logging, and data processing agreements. Built for clinical use from day one.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'I used to spend the first 15 minutes of every session trying to reconstruct what happened since our last meeting. Now I walk in already knowing.',
    author: 'Licensed Clinical Psychologist',
    context: 'Specializing in addiction recovery',
  },
  {
    quote: 'The journal entries give me insight I\'d normally only get in an inpatient setting. It\'s transformed my outpatient practice.',
    author: 'Licensed Marriage & Family Therapist',
    context: 'Couples counseling',
  },
];

export default function TherapistsPage() {
  return (
    <main className="min-h-screen bg-dark-sanctuary">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Be Candid Therapy Portal',
        description: 'Inpatient-level insights for outpatient therapists. Real-time client patterns, journal entries, and digital triggers.',
        url: 'https://becandid.io/therapists',
        brand: { '@type': 'Brand', name: 'Be Candid' },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Free during beta — therapist portal for client insights',
          priceValidUntil: '2026-12-31',
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
            merchantReturnDays: 0,
          },
        },
      }} />

      <PublicNav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-primary text-sm font-label font-bold mb-6">
          <MaterialIcon name="local_hospital" filled className="text-base" />
          For Licensed Therapists & Counselors
        </div>

        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1] mb-6">
          Inpatient-level insights.
          <br />
          <span className="text-primary">Outpatient setting.</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          See your client&rsquo;s real-time patterns, journal entries, and digital triggers &mdash; so you walk into every session as the most present and insightful therapist they&rsquo;ve ever had.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/auth/signup?plan=therapy" className="px-8 py-4 rounded-full bg-primary text-on-primary text-lg font-headline font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all flex items-center gap-2">
            Start 21-Day Free Trial
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link href="#features" className="px-6 py-4 rounded-full text-slate-400 font-label font-medium hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">play_circle</span>
            See How It Works
          </Link>
        </div>

        <p className="text-sm text-stone-500 font-label">
          No credit card required &middot; HIPAA-ready &middot; $19.99/mo after trial
        </p>
      </section>

      {/* The Problem */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-8 md:p-12" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-label font-bold text-primary uppercase tracking-widest mb-3">The Problem</p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                You&rsquo;re treating clients with <span className="text-primary">one session per week</span> of visibility.
              </h2>
              <p className="font-body text-slate-400 leading-relaxed">
                Between sessions, your clients face 167 hours of triggers, temptations, and emotional turbulence &mdash; and you only hear about what they remember (or choose) to share. That&rsquo;s not a clinical limitation. It&rsquo;s a data gap.
              </p>
            </div>
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(127, 29, 29, 0.15)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <div className="text-5xl font-headline font-bold text-red-400 mb-2">167</div>
              <p className="text-sm font-label text-slate-400">hours between sessions where you have zero visibility into your client&rsquo;s digital behavior</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-3xl p-8 md:p-12" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl p-6 text-center order-2 md:order-1" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <div className="text-5xl font-headline font-bold text-emerald-400 mb-2">24/7</div>
              <p className="text-sm font-label text-slate-400">continuous visibility into patterns, moods, journal entries, and digital triggers</p>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs font-label font-bold text-emerald-400 uppercase tracking-widest mb-3">The Solution</p>
              <h2 className="font-headline text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                Be Candid gives you <span className="text-primary">inpatient-level data</span> in an outpatient world.
              </h2>
              <p className="font-body text-slate-400 leading-relaxed">
                Your clients use Be Candid daily &mdash; journaling, tracking moods, monitoring screen time. With their consent, you see it all. No more guessing. No more reconstructing timelines from memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-label font-bold text-primary uppercase tracking-widest mb-2">Therapist Portal Features</p>
          <h2 className="font-headline text-3xl font-bold text-slate-100">Everything you need between sessions</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <MaterialIcon name={f.icon} filled className="text-primary text-2xl" />
              </div>
              <h3 className="font-headline text-base font-bold text-slate-100 mb-2">{f.title}</h3>
              <p className="font-body text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-label font-bold text-primary uppercase tracking-widest mb-2">From Clinicians</p>
          <h2 className="font-headline text-2xl font-bold text-slate-100">What therapists are saying</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl p-6 border-l-4 border-cyan-400/30" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderLeft: '4px solid rgba(34, 211, 238, 0.3)' }}>
              <p className="font-body text-sm text-slate-400 italic leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-label text-sm font-bold text-slate-100">{t.author}</p>
                <p className="font-label text-xs text-stone-500">{t.context}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consent Model */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-8 md:p-12 text-center" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="verified_user" filled className="text-emerald-400 text-3xl" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-slate-100 mb-4">Client-Controlled Consent</h2>
          <p className="font-body text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
            Your client chooses exactly what you can see. Five independent toggles &mdash; journal, moods, streaks, outcomes, and patterns. They can revoke access anytime. Trust is the foundation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Journal Entries', 'Mood Data', 'Focus Streaks', 'Conversation Outcomes', 'Pattern Detection'].map((item) => (
              <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 ring-1 ring-teal-500/20">
                <MaterialIcon name="check_circle" filled className="text-emerald-400 text-sm" />
                <span className="text-sm font-label font-medium text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-headline text-3xl font-bold mb-4">Start your 21-day free trial</h2>
          <p className="font-body text-white/80 max-w-lg mx-auto mb-2">
            Everything in Pro, plus therapist portal access with granular consent controls.
          </p>
          <p className="font-headline text-2xl font-bold mb-6">
            $19.99<span className="text-base font-normal text-white/60">/month</span>
            <span className="text-white/40 mx-3">|</span>
            $159<span className="text-base font-normal text-white/60">/year</span>
          </p>
          <Link href="/auth/signup?plan=therapy" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary text-lg font-headline font-bold shadow-lg hover:shadow-xl transition-all">
            Start Free Trial
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <p className="text-xs text-white/50 mt-4">No credit card required &middot; Cancel anytime &middot; HIPAA-ready</p>
        </div>
      </section>

      {/* Referral CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12 pb-20">
        <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
            <MaterialIcon name="card_giftcard" filled className="text-primary text-2xl" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-headline text-base font-bold text-slate-100 mb-1">Refer clients to Be Candid</h3>
            <p className="font-body text-sm text-slate-400">Give your clients a referral code. When they sign up, both of you get 30 free days.</p>
          </div>
          <Link href="/auth/signup?plan=therapy" className="px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 shrink-0">
            Get Your Code
          </Link>
        </div>
      </section>
    </main>
  );
}
