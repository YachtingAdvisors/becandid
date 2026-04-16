import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: 'Press Kit & Media Resources — Be Candid',
  description: 'Official Be Candid press kit. Download logos, brand assets, screenshots, and get the latest company information for media coverage.',
  alternates: { canonical: 'https://becandid.io/press' },
  openGraph: {
    title: 'Press Kit & Media Resources — Be Candid',
    description: 'Official Be Candid press kit with logos, brand assets, and company information.',
    url: 'https://becandid.io/press',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Press%20Kit&subtitle=Media%20Resources%20%26%20Brand%20Assets', width: 1200, height: 630 }],
  },
};

function AssetCard({ name, description, path, preview }: { name: string; description: string; path: string; preview?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col">
      {preview && (
        <div className="rounded-lg bg-white/[0.05] p-4 mb-3 flex items-center justify-center h-24">
          <Image src={preview} alt={name} width={120} height={40} className="object-contain max-h-16" />
        </div>
      )}
      <div className="text-sm font-medium text-white mb-1">{name}</div>
      <div className="text-xs text-stone-500 mb-3 flex-1">{description}</div>
      <a
        href={path}
        download
        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        Download
      </a>
    </div>
  );
}

export default function PressPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary">
      <PublicNav />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Press Kit & Media Resources
            </h1>
            <p className="text-lg text-stone-400">
              Everything you need to write about Be Candid. For press inquiries, reach out to{' '}
              <a href="mailto:shawn@becandid.io" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                shawn@becandid.io
              </a>
            </p>
          </div>

          {/* Company Overview */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">About Be Candid</h2>
            <div className="space-y-4 text-sm text-stone-300 leading-relaxed">
              <p>
                <strong className="text-white">Be Candid</strong> is a digital accountability platform that combines AI-powered behavioral pattern recognition, guided journaling, and consent-based sharing to help people break unwanted digital habits.
              </p>
              <p>
                Unlike traditional monitoring software that relies on surveillance, Be Candid is built on the principle that lasting change comes from self-awareness, not shame. Users voluntarily track their patterns, journal about triggers, and share insights with trusted partners or therapists — on their own terms.
              </p>
              <p>
                The platform includes a full therapist portal with HIPAA-ready encryption, conversation guides based on clinical research, and a gamified accountability system with streaks and reputation points.
              </p>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <div className="text-xs text-stone-500 mb-1">Founded</div>
                <div className="text-sm font-medium text-white">2025</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">Category</div>
                <div className="text-sm font-medium text-white">Digital Wellness / Behavioral Health</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">Platforms</div>
                <div className="text-sm font-medium text-white">Web, iOS, Android, Desktop</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">Website</div>
                <div className="text-sm font-medium text-cyan-400">becandid.io</div>
              </div>
            </div>
          </section>

          {/* Boilerplate */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Boilerplate</h2>
            <div className="rounded-lg bg-black/30 p-4 text-sm text-stone-300 leading-relaxed">
              <p>
                Be Candid is an AI-powered digital accountability app that helps people align their screen time with who they actually want to be. Through behavioral pattern recognition, guided journaling, and consent-based sharing with partners and therapists, Be Candid provides a privacy-first alternative to traditional internet monitoring tools. Available on web, iOS, Android, and desktop. Free to start at becandid.io.
              </p>
            </div>
            <p className="text-xs text-stone-500 mt-2">Copy and use this description in your articles.</p>
          </section>

          {/* Key Differentiators */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Key Differentiators</h2>
            <ul className="space-y-3">
              {[
                { title: 'Accountability, not surveillance', desc: 'Partners see behavioral patterns and insights — never raw browsing history or screenshots.' },
                { title: 'Consent-based sharing', desc: 'Users choose exactly what to share with 5 granular consent toggles. Nothing is forced.' },
                { title: 'Therapist integration', desc: 'Full therapist portal with AI-powered session prep, granular consent, and HIPAA-ready encryption.' },
                { title: 'Clinical foundation', desc: 'Conversation guides and journal prompts developed with input from neurologists and therapists.' },
                { title: 'Gamified growth', desc: 'Streak tracking, reputation points, and milestone badges make accountability engaging, not punishing.' },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5 material-symbols-outlined text-base shrink-0">check_circle</span>
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-stone-400">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Brand Assets */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Brand Assets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AssetCard
                name="Primary Logo"
                description="Full logo on transparent background"
                path="/logo.png"
                preview="/logo.png"
              />
              <AssetCard
                name="Logo Mark (C)"
                description="Standalone C icon mark"
                path="/C logo.png"
                preview="/C logo.png"
              />
              <AssetCard
                name="OG Social Image"
                description="1200x630 branded social card"
                path="/og-image.png"
                preview="/og-image.png"
              />
              <AssetCard
                name="App Icon"
                description="512x512 app icon"
                path="/icon-512.png"
                preview="/icon-512.png"
              />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-sm font-medium text-white mb-2">Brand Colors</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Primary Teal', hex: '#226779' },
                  { name: 'Cyan Accent', hex: '#06b6d4' },
                  { name: 'Dark Sanctuary', hex: '#0c1214' },
                  { name: 'White', hex: '#ffffff' },
                ].map((c) => (
                  <div key={c.hex} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: c.hex }} />
                    <div>
                      <div className="text-xs text-stone-300">{c.name}</div>
                      <div className="text-xs text-stone-500 font-mono">{c.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Product Screenshots */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Product Screenshots</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Dashboard', path: '/images/features/hero-dashboard.webp' },
                { name: 'Journal', path: '/images/features/candid-journal.webp' },
                { name: 'Conversation Guides', path: '/images/features/conversation-guides.webp' },
                { name: 'Alignment Tracking', path: '/images/features/alignment-tracking.webp' },
              ].map((s) => (
                <div key={s.name} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <div className="aspect-video relative bg-white/[0.05]">
                    <Image src={s.path} alt={s.name} fill className="object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs text-stone-300">{s.name}</span>
                    <a href={s.path} download className="text-xs text-cyan-400 hover:text-cyan-300">
                      <span className="material-symbols-outlined text-sm">download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Press Inquiries</h2>
            <p className="text-stone-400 text-sm mb-4">
              For interviews, review copies, or additional information:
            </p>
            <a
              href="mailto:shawn@becandid.io"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              shawn@becandid.io
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
