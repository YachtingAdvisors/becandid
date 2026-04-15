export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import SeoStrategyClient from './SeoStrategyClient';

export const metadata: Metadata = {
  title: 'SEO Strategy',
  description: 'AI-generated content performance and personalization recommendations.',
};

export default function SeoStrategyPage() {
  return <SeoStrategyClient />;
}
