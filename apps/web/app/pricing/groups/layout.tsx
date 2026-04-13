import type { Metadata } from 'next';

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
  return children;
}
