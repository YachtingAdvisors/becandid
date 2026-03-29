import type { Metadata, Viewport } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LegalFooter from '@/components/LegalFooter';

const fontHeadline = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const fontBody = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontLabel = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Be Candid — Accountability That Heals',
    template: '%s | Be Candid',
  },
  description: 'An accountability app that monitors device activity, alerts your partner, and generates AI-powered conversation guides. No shame, by design.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io'),
  openGraph: {
    title: 'Be Candid — Accountability That Heals',
    description: 'Monitor screen activity, alert your accountability partner, and get AI-powered conversation guides built on Motivational Interviewing. Zero shame.',
    siteName: 'Be Candid',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Be Candid — Accountability That Heals',
    description: 'AI-powered accountability conversations. No shame, by design.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#226779',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontHeadline.variable} ${fontBody.variable} ${fontLabel.variable}`}>
      <body className="font-body bg-background text-on-surface">
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
