import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema } from '@/lib/structuredData';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Accountability Readiness Quiz — Are You Ready for Real Change?',
  description: 'Take this free 8-question quiz to discover if you\'re truly ready for accountability. Get a personalized readiness score and tips.',
  alternates: { canonical: 'https://becandid.io/tools/accountability-quiz' },
  openGraph: {
    title: 'Accountability Readiness Quiz — Are You Ready for Real Change?',
    description: 'Take this free 8-question quiz to discover your accountability readiness level.',
    url: 'https://becandid.io/tools/accountability-quiz',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Accountability%20Readiness%20Quiz&subtitle=Are%20you%20ready%20for%20real%20change%3F', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function AccountabilityQuizPage() {
  return (
    <>
      <JsonLd
        data={toolApplicationSchema({
          name: 'Accountability Readiness Quiz',
          description: 'An 8-question assessment that reveals whether you\'re prepared for lasting behavioral change through accountability.',
          url: 'https://becandid.io/tools/accountability-quiz',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <QuizClient />
        </Suspense>
      </main>
    </>
  );
}
