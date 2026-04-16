import { Suspense } from 'react';
import BadgeClient from './BadgeClient';

export default function TherapistBadgePage() {
  return (
    <Suspense fallback={null}>
      <BadgeClient />
    </Suspense>
  );
}
