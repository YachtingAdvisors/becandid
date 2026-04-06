import type { Metadata } from 'next';
import RevenueClient from './RevenueClient';

export const metadata: Metadata = {
  title: 'Revenue',
  description: 'Revenue analytics and MRR breakdown for Be Candid.',
};

export default function RevenuePage() {
  return <RevenueClient />;
}
