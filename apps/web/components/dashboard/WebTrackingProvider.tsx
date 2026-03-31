'use client';

import { useEffect } from 'react';
import { initWebTracker } from '@/lib/webTracker';

export default function WebTrackingProvider() {
  useEffect(() => {
    const cleanup = initWebTracker();
    return cleanup;
  }, []);

  return null;
}
