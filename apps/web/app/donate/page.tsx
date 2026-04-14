import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import DonateButtons from './DonateButtons';

export const metadata: Metadata = {
  title: 'Give Access — Be Candid',
  description: 'Donate to provide free accountability tools to students in underprivileged communities. Every dollar gives a student access to Be Candid.',
};

const STATS = [
  { number: '1 in 3', label: 'teens report compulsive screen use' },
  { number: '73%', label: 'of students in Title I schools lack access to digital wellness tools' },
  { number: '$0', label: 'cost to students — your donation covers everything' },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-label font-bold mb-6">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            Give Access Initiative
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-tight mb-6">
            Every student deserves tools<br />to align their digital life
          </h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed max-w-2xl mx-auto">
            Students in underprivileged communities face the same digital struggles as everyone else — but without the resources to address them. Your donation provides free access to Be Candid&apos;s full platform: journaling, coaching, accountability partners, and support.
          </p>
        </div>
      </section>

      {/* Support Be Candid */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-label font-bold mb-6">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              Support Be Candid
            </span>
          </div>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface text-center mb-2">Support Be Candid</h2>
          <p className="text-sm text-on-surface-variant font-body text-center mb-8 max-w-lg mx-auto">
            Be Candid is free during beta. Your support keeps it that way.
          </p>

          <DonateButtons section="support" />

          <div className="text-center mt-6">
            <a
              href="https://discord.gg/sCkyPuqf6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-label font-bold text-[#5865F2] hover:underline"
            >
              <span className="material-symbols-outlined text-base">forum</span>
              Join our Discord for supporter perks
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="student-sponsorship" className="px-6 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center px-4 py-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
              <p className="font-headline text-2xl font-extrabold text-primary">{stat.number}</p>
              <p className="text-xs text-on-surface-variant font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Donation tiers */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface text-center mb-2">Choose Your Impact</h2>
          <p className="text-sm text-on-surface-variant font-body text-center mb-8">
            $10 gives one student a full year of Be Candid Pro — every feature, no limits.
          </p>

          <DonateButtons section="impact" />

          <p className="text-center text-xs text-on-surface-variant/60 font-body mt-4">
            Donations are processed securely via Stripe. Be Candid is not yet a registered 501(c)(3) — donations are not tax-deductible at this time.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-16 bg-surface-container-low py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: 'volunteer_activism',
                title: 'You donate',
                desc: 'Choose an amount. Every $10 sponsors one student for a full year.',
              },
              {
                step: '2',
                icon: 'school',
                title: 'We partner with schools',
                desc: 'We work with counselors and administrators at Title I schools to identify students who would benefit.',
              },
              {
                step: '3',
                icon: 'lock_open',
                title: 'Students get full access',
                desc: 'Each student receives a free Be Candid Pro account — journaling, coaching, accountability partners, and all features. No credit card required.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 font-headline font-bold text-lg">
                  {item.step}
                </div>
                <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{item.icon}</span>
                <h3 className="font-headline text-base font-bold text-on-surface mb-1">{item.title}</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface text-center mb-6">Why This Matters</h2>
          <div className="space-y-4 text-sm text-on-surface-variant font-body leading-relaxed">
            <p>
              Compulsive digital behavior doesn&apos;t discriminate by zip code — but access to help does. Students in underprivileged communities face the same struggles with pornography, gambling, social media, and isolation, but without the family resources, therapy access, or school programs to address them.
            </p>
            <p>
              Be Candid was built on the belief that everyone deserves tools for self-understanding. The Conversation Coach, the Stringer journal framework, the accountability partner system — these aren&apos;t luxury features. They&apos;re the foundation of digital wellness.
            </p>
            <p>
              Your donation doesn&apos;t just give a student an app. It gives them a coach who listens without judgment. A journal that helps them understand their patterns. A partner who walks with them. And the message that someone — someone they&apos;ve never met — believed they were worth investing in.
            </p>
          </div>

          {/* Quote */}
          <div className="mt-8 px-6 py-5 rounded-3xl bg-gradient-to-r from-primary/5 to-tertiary/5 border border-primary/10 text-center">
            <p className="text-sm text-on-surface font-body italic leading-relaxed">
              &ldquo;Anything that&apos;s human is mentionable, and anything that is mentionable can be more manageable.&rdquo;
            </p>
            <p className="text-xs text-primary font-label font-bold mt-2">&mdash; Fred Rogers</p>
          </div>
        </div>
      </section>

      {/* School partnership CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-primary mb-3 block">school</span>
          <h2 className="font-headline text-xl font-extrabold text-on-surface mb-2">Are you a school counselor or administrator?</h2>
          <p className="text-sm text-on-surface-variant font-body mb-4 max-w-lg mx-auto">
            We&apos;d love to partner with your school. Be Candid can be deployed to your students at no cost through our Give Access program.
          </p>
          <a
            href="mailto:shawn@becandid.io?subject=School%20Partnership%20—%20Give%20Access"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">email</span>
            Contact Us About a Partnership
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant font-body">
            &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-label">
            <Link href="/legal/privacy" className="text-on-surface-variant hover:text-primary">Privacy</Link>
            <Link href="/legal/terms" className="text-on-surface-variant hover:text-primary">Terms</Link>
            <Link href="/" className="text-on-surface-variant hover:text-primary">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
