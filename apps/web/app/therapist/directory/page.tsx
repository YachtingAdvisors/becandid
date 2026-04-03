import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import TherapistDirectoryClient from './TherapistDirectoryClient';

export const metadata: Metadata = {
  title: 'Find a Therapist — Be Candid Therapist Directory',
  description:
    'Find a therapist who understands unwanted behavior patterns. These therapists use Be Candid\'s portal and specialize in addiction, betrayal trauma, family systems, and more.',
  openGraph: {
    title: 'Find a Therapist Who Gets It — Be Candid',
    description:
      'Browse therapists who use Be Candid\'s portal and understand the patterns behind unwanted behavior.',
    type: 'website',
  },
};

export default function TherapistDirectoryPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen bg-surface">
        {/* Hero */}
        <section className="pt-28 pb-12 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Find a Therapist Who Gets It
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-on-surface-variant text-base leading-relaxed">
            These therapists use Be Candid&apos;s portal and understand the
            patterns behind unwanted behavior.
          </p>
        </section>

        {/* Client-side filters + grid */}
        <TherapistDirectoryClient />

        {/* Footer CTA */}
        <section className="pb-20 px-4 text-center">
          <p className="text-sm text-on-surface-variant mb-3">
            Are you a therapist?
          </p>
          <Link
            href="/therapists"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">medical_services</span>
            Learn about the Therapist Portal
          </Link>
        </section>
      </main>
    </>
  );
}
