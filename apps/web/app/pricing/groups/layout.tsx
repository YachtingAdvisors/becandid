import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { faqSchema } from '@/lib/structuredData';

const GROUP_FAQ = [
  { q: 'How much does it cost?', a: '$7 per person per month — 30% off our standard Pro plan at $9.99/month. No annual commitment required.' },
  { q: 'Can leaders or pastors see individual member data?', a: 'No. Be Candid is built on privacy-first principles. Leaders never see individual browsing data, journal entries, or personal details. Each member controls their own consent settings.' },
  { q: 'What features are included?', a: 'Every member gets full Pro access: unlimited conversation guides, pattern detection, vulnerability windows, weekly reflections, up to 5 accountability partners, scheduled journal reminders, and 365-day data retention.' },
  { q: 'Is there a minimum group size?', a: 'We recommend at least 5 members to make the most of group pricing, but there is no hard minimum. Contact us and we will find the right fit.' },
  { q: 'Can members have their own accountability partners outside the group?', a: 'Absolutely. Group membership does not limit who a member can partner with. Be Candid supports up to 5 partners per Pro user.' },
  { q: 'Is my data encrypted?', a: 'Yes. All data is encrypted in transit and at rest. We use end-to-end encryption for sensitive content and maintain HIPAA-ready audit logging.' },
];

export const metadata: Metadata = {
  title: 'Group Plans for Churches & Organizations',
  description:
    'Equip your community with Be Candid accountability tools at $7/person/month. Privacy-first group plans for churches, ministries, and recovery programs.',
  alternates: {
    canonical: 'https://becandid.io/pricing/groups',
  },
  openGraph: {
    title: 'Group Plans for Churches & Organizations | Be Candid',
    description:
      'Equip your community with accountability tools at $7/person/month. Privacy-first — no leader sees individual data.',
    url: 'https://becandid.io/pricing/groups',
    type: 'website',
  },
};

export default function GroupPricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={faqSchema(GROUP_FAQ)} />
      {children}
    </>
  );
}
