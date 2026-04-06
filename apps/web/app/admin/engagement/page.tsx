import type { Metadata } from 'next';
import EngagementClient from './EngagementClient';

export const metadata: Metadata = {
  title: 'Engagement',
  description: 'User engagement analytics for Be Candid.',
};

export default function EngagementPage() {
  return <EngagementClient />;
}
