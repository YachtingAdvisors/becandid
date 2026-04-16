import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Digital Wellness Glossary | Be Candid',
  description:
    'Comprehensive glossary of digital wellness, accountability, and behavioral health terms. Understand the language of digital self-awareness and recovery.',
  keywords: [
    'digital wellness glossary',
    'accountability terms',
    'screen time definitions',
    'digital health vocabulary',
    'Stringer framework',
    'behavioral health terms',
  ],
  openGraph: {
    title: 'Digital Wellness Glossary | Be Candid',
    description:
      'Comprehensive glossary of digital wellness, accountability, and behavioral health terms.',
    url: 'https://becandid.io/glossary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Wellness Glossary | Be Candid',
    description:
      'Comprehensive glossary of digital wellness, accountability, and behavioral health terms.',
  },
  alternates: { canonical: 'https://becandid.io/glossary' },
};

/* ------------------------------------------------------------------ */
/*  Term data                                                         */
/* ------------------------------------------------------------------ */

interface Term {
  name: string;
  slug: string;
  definition: string;
}

const TERMS: Term[] = [
  {
    name: 'Accountability Partner',
    slug: 'accountability-partner',
    definition:
      'A trusted person (friend, spouse, mentor, or therapist) who receives behavioral insights and engages in supportive conversations about digital habits. Effective accountability partners focus on understanding triggers rather than enforcing rules.',
  },
  {
    name: 'Behavioral Pattern Detection',
    slug: 'behavioral-pattern-detection',
    definition:
      'The use of algorithms and data analysis to identify recurring sequences of digital behavior that may indicate compulsive usage. Pattern detection can reveal time-of-day vulnerabilities, emotional triggers, and escalation cycles.',
  },
  {
    name: 'Check-in System',
    slug: 'check-in-system',
    definition:
      'Scheduled prompts that invite users to reflect on their current emotional state and digital behavior. Check-ins serve as micro-interventions that increase self-awareness and create data points for pattern analysis.',
  },
  {
    name: 'Compulsive Digital Behavior',
    slug: 'compulsive-digital-behavior',
    definition:
      'Repetitive engagement with digital content or devices despite negative consequences and a desire to stop. Compulsive digital behavior is understood as a symptom of deeper emotional needs rather than a character flaw.',
  },
  {
    name: 'Content Filtering',
    slug: 'content-filtering',
    definition:
      'Technology that categorizes web content into sensitivity levels to support user-defined boundaries. Unlike blockers that restrict access, content filters in accountability apps provide awareness without removing user agency.',
  },
  {
    name: 'Digital Accountability',
    slug: 'digital-accountability',
    definition:
      'The practice of voluntarily sharing digital behavior data with a trusted partner to foster honest self-reflection. Unlike surveillance, accountability is consensual, dignity-preserving, and focused on patterns rather than policing specific actions.',
  },
  {
    name: 'Digital Detox',
    slug: 'digital-detox',
    definition:
      'A period of voluntary abstention from digital devices or specific apps to reset habitual usage patterns. Effective digital detoxes combine device restriction with reflection on what the absence reveals about underlying needs.',
  },
  {
    name: 'Digital Wellness',
    slug: 'digital-wellness',
    definition:
      'A holistic approach to maintaining healthy relationships with technology. Digital wellness encompasses intentional screen time management, awareness of digital triggers, and alignment of online behavior with personal values.',
  },
  {
    name: 'End-to-End Encryption',
    slug: 'end-to-end-encryption',
    definition:
      'A security method where data is encrypted on the sender\'s device and can only be decrypted by the intended recipient. In accountability apps, E2E encryption ensures that journal entries and sensitive data remain private even from the platform operator.',
  },
  {
    name: 'Focus Segments',
    slug: 'focus-segments',
    definition:
      'Structured time periods (morning and evening) during which users commit to intentional digital behavior. Focus segments create accountability rhythms and help build consistent habits through daily commitment tracking.',
  },
  {
    name: 'HIPAA Compliance',
    slug: 'hipaa-compliance',
    definition:
      'Health Insurance Portability and Accountability Act standards that govern the handling of protected health information. HIPAA-compliant accountability apps use encryption, access controls, and audit trails to protect sensitive behavioral data.',
  },
  {
    name: 'Screen Time Accountability',
    slug: 'screen-time-accountability',
    definition:
      'A systematic approach to monitoring and reflecting on device usage patterns. Modern screen time accountability goes beyond simple tracking to include contextual analysis, trigger identification, and partner-shared insights.',
  },
  {
    name: 'Shame Cycle',
    slug: 'shame-cycle',
    definition:
      'A self-reinforcing loop where unwanted behavior leads to shame, which triggers emotional numbing, which leads back to the unwanted behavior. Breaking the shame cycle requires replacing judgment with curiosity and self-compassion.',
  },
  {
    name: 'Stringer Framework',
    slug: 'stringer-framework',
    definition:
      'A clinical approach to understanding unwanted behaviors, developed by therapist Jay Stringer based on research with over 3,800 individuals. The framework identifies three core dimensions: Tributaries (upstream influences), Unmet Longings (core needs), and The Roadmap (path forward).',
  },
  {
    name: 'The Roadmap',
    slug: 'the-roadmap',
    definition:
      'The third dimension of the Stringer Framework, focusing on what unwanted behaviors reveal about the person you want to become. The roadmap transforms shame into self-understanding by asking "What is this pattern telling me about my deeper desires?"',
  },
  {
    name: 'Therapist Portal',
    slug: 'therapist-portal',
    definition:
      'A read-only clinical interface that allows licensed therapists to review client behavioral data with explicit consent. The portal supports session preparation by surfacing patterns, journal themes, and progress metrics.',
  },
  {
    name: 'Tributaries',
    slug: 'tributaries',
    definition:
      'In Jay Stringer\'s framework, the upstream life experiences and environmental factors that flow into unwanted behaviors. Tributaries include family dynamics, relational patterns, emotional wounds, and situational triggers that create vulnerability.',
  },
  {
    name: 'Trust Points',
    slug: 'trust-points',
    definition:
      'A gamification system that rewards consistent engagement with accountability practices. Points are earned through journaling, completing focus segments, responding to check-ins, and maintaining engagement streaks.',
  },
  {
    name: 'Unmet Longings',
    slug: 'unmet-longings',
    definition:
      'The core human needs (connection, significance, safety, autonomy) that unwanted digital behaviors attempt to fulfill. Identifying unmet longings helps redirect energy toward healthy fulfillment rather than relying on willpower alone.',
  },
  {
    name: 'Zero-Knowledge Architecture',
    slug: 'zero-knowledge-architecture',
    definition:
      'A system design where the service provider cannot access user data even if compelled. Zero-knowledge architectures use client-side encryption so that sensitive information like journal entries never exist in readable form on servers.',
  },
];

/* ------------------------------------------------------------------ */
/*  Alphabetical letter index                                         */
/* ------------------------------------------------------------------ */

function getLetterIndex(terms: Term[]): string[] {
  const letters = new Set(terms.map((t) => t.name[0].toUpperCase()));
  return Array.from(letters).sort();
}

function termsByLetter(terms: Term[]): Map<string, Term[]> {
  const map = new Map<string, Term[]>();
  for (const t of terms) {
    const letter = t.name[0].toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(t);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  JSON-LD structured data                                           */
/* ------------------------------------------------------------------ */

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'Digital Wellness Glossary',
  description:
    'Key terms in digital wellness, accountability, and behavioral health',
  url: 'https://becandid.io/glossary',
  publisher: {
    '@type': 'Organization',
    name: 'Be Candid',
    url: 'https://becandid.io',
  },
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.name,
    description: t.definition,
    url: `https://becandid.io/glossary#${t.slug}`,
    inDefinedTermSet: 'https://becandid.io/glossary',
  })),
};

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function GlossaryPage() {
  const letters = getLetterIndex(TERMS);
  const grouped = termsByLetter(TERMS);

  return (
    <div className="min-h-screen bg-dark-sanctuary text-white">
      <PublicNav />
      <JsonLd data={jsonLdData} />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5" />
        <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-28 text-center sm:pt-32">
          <p className="mb-3 font-body text-sm font-medium uppercase tracking-widest text-teal-400">
            Knowledge Base
          </p>
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
            Digital Wellness Glossary
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
            A comprehensive reference for the terms, frameworks, and concepts
            behind digital accountability, behavioral health, and intentional
            technology use.
          </p>
        </div>
      </header>

      {/* Letter navigation */}
      <nav
        aria-label="Alphabetical index"
        className="sticky top-0 z-30 border-b border-white/10 bg-dark-sanctuary/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-1 px-6 py-3">
          <span className="mr-2 font-body text-xs font-medium uppercase tracking-wider text-white/40">
            Jump to
          </span>
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="rounded px-2.5 py-1 font-headline text-sm font-semibold text-teal-400 transition-colors hover:bg-teal-400/10 hover:text-teal-300"
            >
              {letter}
            </a>
          ))}
        </div>
      </nav>

      {/* Definitions */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <dl>
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="mb-14">
              {/* Letter heading */}
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 font-headline text-xl font-bold text-teal-400">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Term cards */}
              <div className="space-y-6">
                {grouped.get(letter)!.map((term) => (
                  <div
                    key={term.slug}
                    id={term.slug}
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 transition-colors hover:border-teal-500/20 hover:bg-white/[0.05]"
                  >
                    <dt className="font-headline text-xl font-semibold text-white">
                      <a
                        href={`#${term.slug}`}
                        className="group-hover:text-teal-300 transition-colors"
                      >
                        {term.name}
                      </a>
                    </dt>
                    <dd className="mt-2 font-body leading-relaxed text-white/70">
                      {term.definition}
                    </dd>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </dl>

        {/* CTA */}
        <div className="mt-20 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-cyan-500/5 p-8 text-center sm:p-12">
          <h2 className="font-headline text-2xl font-bold sm:text-3xl">
            Experience These Concepts in Action
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-white/70">
            Be Candid brings digital accountability to life with
            clinically-informed tools, partner conversations, and
            dignity-preserving design.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="rounded-full bg-teal-500 px-8 py-3 font-body text-sm font-semibold text-black transition-colors hover:bg-teal-400"
            >
              Get Started Free
            </Link>
            <Link
              href="/methodology"
              className="rounded-full border border-white/20 px-8 py-3 font-body text-sm font-semibold text-white transition-colors hover:border-white/40"
            >
              Our Methodology
            </Link>
          </div>
        </div>
      </main>

      {/* Back to top */}
      <div className="fixed bottom-8 right-8 z-40">
        <a
          href="#"
          aria-label="Back to top"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-dark-sanctuary/90 text-white/60 shadow-lg backdrop-blur transition-colors hover:border-teal-500/30 hover:text-teal-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center font-body text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} Be Candid. All rights reserved.</p>
      </footer>
    </div>
  );
}
