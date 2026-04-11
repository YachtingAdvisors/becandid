'use client';

import dynamic from 'next/dynamic';

export const HeroPlayer = dynamic(() => import('@/components/remotion/HeroPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-[#0e1a1d] to-[#0c1518] animate-pulse" />
  ),
});
