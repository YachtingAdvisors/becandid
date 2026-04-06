'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

const BENEFITS = [
  {
    icon: 'bolt',
    title: 'Pro features for every member',
    text: 'Unlimited AI guides, pattern detection, vulnerability windows, and weekly reflections.',
  },
  {
    icon: 'savings',
    title: '30% off individual pricing',
    text: '$7/person/month instead of $9.99 — the more members, the more your community saves.',
  },
  {
    icon: 'admin_panel_settings',
    title: 'Admin dashboard (coming soon)',
    text: 'See aggregate engagement metrics for your group without ever seeing individual data.',
  },
  {
    icon: 'badge',
    title: 'Custom promo code',
    text: "Your organization's name as the code — easy to remember, easy to share.",
  },
  {
    icon: 'shield_lock',
    title: 'Privacy-first design',
    text: 'Leaders never see individual data. Members control what anyone sees through granular consent toggles.',
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Request a group plan',
    text: 'Fill out the form below. We respond within 24 hours.',
  },
  {
    num: '2',
    title: 'We create your promo code',
    text: 'Something memorable like GRACE-CHURCH-2026 or MENS-RECOVERY-2026.',
  },
  {
    num: '3',
    title: 'Share with your members',
    text: 'Distribute the code in your group, bulletin, or private channel.',
  },
  {
    num: '4',
    title: 'Members sign up',
    text: 'Each person creates an account and enters the code at checkout for instant access.',
  },
];

const FAQ = [
  {
    q: 'How much does it cost?',
    a: '$7 per person per month — 30% off our standard Pro plan at $9.99/month. No annual commitment required.',
  },
  {
    q: 'Can leaders or pastors see individual member data?',
    a: 'No. Be Candid is built on privacy-first principles. Leaders never see individual browsing data, journal entries, or personal details. Each member controls their own consent settings.',
  },
  {
    q: 'What features are included?',
    a: 'Every member gets full Pro access: unlimited AI conversation guides, pattern detection, vulnerability windows, weekly AI reflections, up to 5 accountability partners, scheduled journal reminders, and 365-day data retention.',
  },
  {
    q: 'Is there a minimum group size?',
    a: 'We recommend at least 5 members to make the most of group pricing, but there is no hard minimum. Contact us and we will find the right fit.',
  },
  {
    q: 'Can members have their own accountability partners outside the group?',
    a: 'Absolutely. Group membership does not limit who a member can partner with. Be Candid supports up to 5 partners per Pro user.',
  },
  {
    q: 'Is my data encrypted?',
    a: 'Yes. All data is encrypted in transit and at rest. We use end-to-end encryption for sensitive content and maintain HIPAA-ready audit logging.',
  },
];

export default function GroupPricingPage() {
  const [form, setForm] = useState({
    org_name: '',
    contact_name: '',
    contact_email: '',
    estimated_users: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/billing/org-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimated_users: form.estimated_users ? parseInt(form.estimated_users, 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c1214]">
      <PublicNav />

      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">
              groups
            </span>
            <span className="text-emerald-300 text-xs font-label font-semibold uppercase tracking-wider">
              Group Plans
            </span>
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 mb-5">
            Group Plans for Churches<br className="hidden md:block" /> & Organizations
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed">
            Equip your community with accountability tools at{' '}
            <span className="text-emerald-400 font-semibold">$7/person/month</span>.
            Privacy-first. No leader sees individual data. Ever.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="font-headline text-2xl font-bold text-slate-100 mb-8 text-center">
            What your members get
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-emerald-400 text-xl mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {b.icon}
                  </span>
                  <div>
                    <h3 className="font-headline font-bold text-slate-100 text-sm mb-1">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-body leading-relaxed">
                      {b.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="font-headline text-2xl font-bold text-slate-100 mb-8 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-headline font-bold text-sm">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-slate-100 text-sm mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 font-body leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="mb-20">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-emerald-400/30 text-4xl mb-4 block">
              format_quote
            </span>
            <p className="text-slate-300 font-body text-base leading-relaxed italic mb-4">
              &ldquo;We&apos;ve equipped 30 men in our recovery group with Be Candid.
              The therapist portal gives our counselors real insight into patterns
              between sessions &mdash; without anyone feeling watched.&rdquo;
            </p>
            <p className="text-xs text-slate-500 font-label">
              &mdash; Recovery Ministry Leader
            </p>
          </div>
        </div>

        {/* Request Form */}
        <div className="mb-20" id="request">
          <h2 className="font-headline text-2xl font-bold text-slate-100 mb-2 text-center">
            Request a group plan
          </h2>
          <p className="text-sm text-slate-400 font-body text-center mb-8">
            Tell us about your organization and we&apos;ll set up your custom promo code within 24 hours.
          </p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center max-w-lg mx-auto">
              <span
                className="material-symbols-outlined text-emerald-400 text-4xl mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <h3 className="font-headline font-bold text-slate-100 text-lg mb-2">
                Request received!
              </h3>
              <p className="text-sm text-slate-400 font-body">
                We&apos;ll be in touch within 24 hours to set up your group plan
                and custom promo code.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl p-8 max-w-lg mx-auto space-y-4"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-body rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="org_name" className="block text-xs font-label text-slate-400 mb-1.5">
                  Organization name <span className="text-red-400">*</span>
                </label>
                <input
                  id="org_name"
                  type="text"
                  required
                  maxLength={100}
                  value={form.org_name}
                  onChange={(e) => setForm({ ...form, org_name: e.target.value })}
                  placeholder="e.g., Grace Community Church"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="contact_name" className="block text-xs font-label text-slate-400 mb-1.5">
                  Your name
                </label>
                <input
                  id="contact_name"
                  type="text"
                  maxLength={100}
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  placeholder="e.g., Pastor Mike"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-xs font-label text-slate-400 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact_email"
                  type="email"
                  required
                  maxLength={254}
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="mike@gracechurch.org"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="estimated_users" className="block text-xs font-label text-slate-400 mb-1.5">
                  Estimated number of members
                </label>
                <input
                  id="estimated_users"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.estimated_users}
                  onChange={(e) => setForm({ ...form, estimated_users: e.target.value })}
                  placeholder="e.g., 25"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-label text-slate-400 mb-1.5">
                  Anything else we should know?
                </label>
                <textarea
                  id="message"
                  maxLength={1000}
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your group, ministry, or recovery program..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-headline font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {submitting ? 'Submitting...' : 'Request Group Plan'}
              </button>

              <p className="text-[10px] text-slate-600 font-body text-center">
                We&apos;ll respond within 24 hours. No commitment required.
              </p>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="font-headline text-2xl font-bold text-slate-100 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer focus:outline-none"
                >
                  <span className="text-sm font-headline font-bold text-slate-200 pr-4">
                    {item.q}
                  </span>
                  <span className="material-symbols-outlined text-slate-500 text-[20px] flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-400 font-body leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back to pricing */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 font-body transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to individual pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
