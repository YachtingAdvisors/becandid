import type { Metadata } from 'next';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { toolApplicationSchema, breadcrumbSchema } from '@/lib/structuredData';
import PhoneAddictionSeverityClient from './PhoneAddictionSeverityClient';

export const metadata: Metadata = {
  title: 'Phone Addiction Severity Assessment — Free 10-Question Test',
  description: 'Free validated-style assessment measuring compulsive phone use severity. 10 questions, instant results, completely private.',
  alternates: { canonical: 'https://becandid.io/tools/phone-addiction-severity' },
  openGraph: {
    title: 'Phone Addiction Severity Assessment — Free 10-Question Test',
    description: 'Free validated-style assessment measuring compulsive phone use severity.',
    url: 'https://becandid.io/tools/phone-addiction-severity',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Phone%20Addiction%20Severity%20Assessment&subtitle=10%20questions.%20Instant%20results.', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  keywords: ['phone addiction test', 'phone addiction assessment', 'smartphone addiction quiz', 'compulsive phone use', 'nomophobia test'],
};

export default function PhoneAddictionSeverityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Tools', url: 'https://becandid.io/tools' },
          { name: 'Phone Addiction Severity Assessment', url: 'https://becandid.io/tools/phone-addiction-severity' },
        ])}
      />
      <JsonLd
        data={toolApplicationSchema({
          name: 'Phone Addiction Severity Assessment',
          description: 'Free validated-style assessment measuring compulsive phone use severity across 10 research-informed questions.',
          url: 'https://becandid.io/tools/phone-addiction-severity',
        })}
      />
      <main className="pt-28 pb-20 px-6">
        <Suspense fallback={null}>
          <PhoneAddictionSeverityClient />
        </Suspense>
      </main>
    </>
  );
}
