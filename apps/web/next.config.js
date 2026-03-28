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
    ],
  },

  // Powered-by header removed for security
  poweredByHeader: false,

  // Strict mode for imports
  experimental: {
    typedRoutes: false,
  },

  // Redirect root to dashboard if authenticated (handled by middleware)
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
