import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema, breadcrumbSchema } from '@/lib/structuredData';
import DigitalShadowSelfClient from './DigitalShadowSelfClient';

export const metadata: Metadata = {
  title: 'Digital Shadow Self Discovery — Which Shadow Pattern Runs Your Scroll?',
  description: 'Free 8-question quiz identifying your primary digital shadow pattern: Numb-er, Performer, Escaper, or Controller. Based on the Stringer framework.',
  alternates: { canonical: 'https://becandid.io/tools/digital-shadow-self' },
  openGraph: {
    title: 'Digital Shadow Self Discovery — Which Shadow Pattern Runs Your Scroll?',
    description: 'Discover your primary digital shadow archetype in 8 questions.',
    url: 'https://becandid.io/tools/digital-shadow-self',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Digital%20Shadow%20Self%20Discovery&subtitle=Find%20your%20shadow%20archetype', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  keywords: ['digital shadow self', 'shadow work phone', 'stringer framework', 'digital archetype quiz', 'phone addiction archetype'],
};

export default function DigitalShadowSelfPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Tools', url: 'https://becandid.io/tools' },
          { name: 'Digital Shadow Self Discovery', url: 'https://becandid.io/tools/digital-shadow-self' },
        ])}
      />
      <JsonLd
        data={toolApplicationSchema({
          name: 'Digital Shadow Self Discovery',
          description: 'Free 8-question Stringer-framework quiz revealing your primary digital shadow pattern — Numb-er, Performer, Escaper, or Controller.',
          url: 'https://becandid.io/tools/digital-shadow-self',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <DigitalShadowSelfClient />
        </Suspense>
      </main>
    </>
  );
}
