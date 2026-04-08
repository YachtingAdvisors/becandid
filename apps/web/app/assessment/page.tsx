import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import AssessmentClient from './AssessmentClient';

export const metadata: Metadata = {
  title: 'Rival Assessment — Be Candid',
  description: 'Discover which digital rivals are most likely to challenge you. A Predictive Index-style behavioral assessment based on emotional patterns, behaviors, triggers, and inner dialogue.',
};

export default function PublicAssessmentPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary text-white">
      <PublicNav />
      <main className="pt-28 pb-20 px-6">
        <AssessmentClient />
      </main>
    </div>
  );
}
