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
    default: 'Be Candid — Align Your Digital Life',
    template: '%s | Be Candid',
  },
  description: 'The most confident, inspiring people are those whose screen time matches the person they want to be. AI-powered accountability with zero shame.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io'),
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  openGraph: {
    title: 'Be Candid — Align Your Digital Life',
    description: 'The most confident, inspiring people are those whose screen time matches the person they want to be. AI-powered accountability for teens and adults.',
    siteName: 'Be Candid',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 1200, alt: 'Be Candid Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Be Candid — Align Your Digital Life',
    description: 'AI-powered accountability. Your screen time should match who you want to be.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-on-surface">
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
