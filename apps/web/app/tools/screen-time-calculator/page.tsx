import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema } from '@/lib/structuredData';
import ScreenTimeClient from './ScreenTimeClient';

export const metadata: Metadata = {
  title: 'Screen Time Calculator — How Much of Your Life Is Spent on Screens?',
  description: 'Calculate how many years of your life you\'ll spend on screens. See what you could accomplish with that time instead. Free, private, embeddable.',
  alternates: { canonical: 'https://becandid.io/tools/screen-time-calculator' },
  openGraph: {
    title: 'Screen Time Calculator — How Much of Your Life Is Spent on Screens?',
    description: 'Calculate how many years of your life you\'ll spend on screens.',
    url: 'https://becandid.io/tools/screen-time-calculator',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og/screen-time', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function ScreenTimeCalculatorPage() {
  return (
    <>
      <JsonLd
        data={toolApplicationSchema({
          name: 'Screen Time Calculator',
          description: 'Calculate how many years of your life you\'ll spend staring at screens and what you could do with that time instead.',
          url: 'https://becandid.io/tools/screen-time-calculator',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <ScreenTimeClient />
        </Suspense>
      </main>
    </>
  );
}
