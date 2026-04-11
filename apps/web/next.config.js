const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Prevent source maps in production
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'i.gr-assets.com',
      },
    ],
  },

  // Powered-by header removed for security
  poweredByHeader: false,

  // Typed routes (moved from experimental in Next.js 16)
  typedRoutes: false,

  // Redirects
  async redirects() {
    return [
      // becandid.org → becandid.io/org (vanity domain for the nonprofit page)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'becandid.org' }],
        destination: 'https://becandid.io/org',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.becandid.org' }],
        destination: 'https://becandid.io/org',
        permanent: true,
      },
      // /organization → /org (canonical path)
      {
        source: '/organization',
        destination: '/org',
        permanent: true,
      },
    ];
  },
};

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
