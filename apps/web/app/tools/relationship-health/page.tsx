import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema } from '@/lib/structuredData';
import HealthCheckClient from './HealthCheckClient';

export const metadata: Metadata = {
  title: 'Relationship Health Check — How Digital Habits Affect Your Relationship',
  description: 'A free quick check to see how your digital habits impact trust, communication, and quality time in your closest relationship.',
  alternates: { canonical: 'https://becandid.io/tools/relationship-health' },
  openGraph: {
    title: 'Relationship Health Check — How Digital Habits Affect Your Relationship',
    description: 'Quick assessment: how are your digital habits affecting your closest relationship?',
    url: 'https://becandid.io/tools/relationship-health',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Relationship%20Health%20Check&subtitle=How%20digital%20habits%20affect%20your%20relationship', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RelationshipHealthPage() {
  return (
    <>
      <JsonLd
        data={toolApplicationSchema({
          name: 'Relationship Health Check',
          description: 'A quick assessment that reveals how your digital habits affect trust, communication, and quality time in your relationship.',
          url: 'https://becandid.io/tools/relationship-health',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <HealthCheckClient />
        </Suspense>
      </main>
    </>
  );
}
