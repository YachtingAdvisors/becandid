import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import LegalFooter from '@/components/LegalFooter';

const fontBody = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
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
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontDisplay.variable}`}>
      <body className="font-body">
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
