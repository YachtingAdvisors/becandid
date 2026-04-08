import type { Metadata, Viewport } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import LegalFooter from '@/components/LegalFooter';
import PWAInstallBanner from '@/components/PWAInstallBanner';

const GA_ID = 'G-CK9VDX3HKT';

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
  description: 'AI-powered screen time accountability app for digital wellness. Track habits, build streaks, and align your digital life with your values — with an accountability partner, not surveillance. Free trial.',
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
    description: 'AI-powered screen time accountability app. Track digital habits, build streaks, and align your digital life with your values — with a partner, not surveillance.',
    siteName: 'Be Candid',
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'Be Candid — Align Your Digital Life' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Be Candid — Align Your Digital Life',
    description: 'AI-powered accountability. Your screen time should match who you want to be.',
    images: ['/api/og'],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'Lgjx6bN3vT8JQZeYC0NBlF92UgzgqlGnlNhb4rhTW_k',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c1214',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontHeadline.variable} ${fontBody.variable} ${fontLabel.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })()
        ` }} />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="font-body bg-background text-on-surface">
        {children}
        <LegalFooter />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
