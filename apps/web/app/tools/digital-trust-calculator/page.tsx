import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema, breadcrumbSchema } from '@/lib/structuredData';
import DigitalTrustCalculatorClient from './DigitalTrustCalculatorClient';

export const metadata: Metadata = {
  title: 'Couple\'s Digital Trust Calculator — Measure Trust in 12 Questions',
  description: 'Free 12-question assessment for couples to measure digital trust. Get your score, percentile, and personalized improvement areas.',
  alternates: { canonical: 'https://becandid.io/tools/digital-trust-calculator' },
  openGraph: {
    title: 'Couple\'s Digital Trust Calculator — Measure Trust in 12 Questions',
    description: 'Free 12-question assessment for couples to measure digital trust.',
    url: 'https://becandid.io/tools/digital-trust-calculator',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Digital%20Trust%20Calculator&subtitle=12%20questions%20for%20couples', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  keywords: ['digital trust calculator', 'couples trust quiz', 'relationship trust test', 'digital trust assessment', 'phone trust couples'],
};

export default function DigitalTrustCalculatorPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Tools', url: 'https://becandid.io/tools' },
          { name: 'Digital Trust Calculator', url: 'https://becandid.io/tools/digital-trust-calculator' },
        ])}
      />
      <JsonLd
        data={toolApplicationSchema({
          name: 'Couple\'s Digital Trust Calculator',
          description: 'Free 12-question assessment measuring digital trust between partners. Get your score, percentile, and improvement areas.',
          url: 'https://becandid.io/tools/digital-trust-calculator',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <DigitalTrustCalculatorClient />
        </Suspense>
      </main>
    </>
  );
}
