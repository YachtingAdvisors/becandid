import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { code } = await params;
  const sp = await searchParams;
  const isTherapist = code.startsWith('DR-') || sp.ref === 'therapist';

  if (isTherapist) {
    return {
      title: 'Recommended by your therapist — Be Candid',
      description: 'Your therapist recommends Be Candid for digital accountability between sessions. AI-powered tools that help you align your digital life with who you want to be.',
      openGraph: {
        title: 'Recommended by a licensed therapist',
        description: 'Your therapist recommends Be Candid for accountability between sessions. Start free today.',
        images: ['/og-image.png'],
      },
    };
  }

  return {
    title: 'Your friend invited you to Be Candid',
    description: 'Join Be Candid and get 30 days free. AI-powered accountability that helps you align your digital life with who you want to be.',
    openGraph: {
      title: 'Your friend invited you to Be Candid',
      description: 'Join and both of you get 30 days free. Align your screen time with who you want to be.',
      images: ['/og-image.png'],
    },
  };
}

export default async function ReferralRedirectPage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const isTherapist = code.startsWith('DR-') || sp.ref === 'therapist';

  if (isTherapist) {
    redirect(`/auth/signup?ref=${encodeURIComponent(code)}&therapist=1`);
  }

  redirect(`/auth/signup?ref=${encodeURIComponent(code)}`);
}
