import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Be Candid',
  description: 'Simple, transparent pricing for Be Candid. Start free and upgrade when you\'re ready.',
  keywords: ['Be Candid pricing', 'accountability app cost', 'digital wellness pricing', 'Covenant Eyes alternative price', 'free accountability app'],
  alternates: { canonical: 'https://becandid.io/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
