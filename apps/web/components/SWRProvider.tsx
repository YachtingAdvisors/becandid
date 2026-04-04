'use client';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/swr';

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      fetcher,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }}>
      {children}
    </SWRConfig>
  );
}
