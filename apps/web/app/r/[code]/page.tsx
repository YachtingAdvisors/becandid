import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function ReferralRedirectPage({ params }: Props) {
  const { code } = await params;
  redirect(`/auth/signup?ref=${encodeURIComponent(code)}`);
}
