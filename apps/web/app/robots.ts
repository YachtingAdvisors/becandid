import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      // AI crawlers — allow public content, point to llms.txt
      {
        userAgent: 'GPTBot',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: ['/', '/blog/', '/tools/', '/glossary', '/methodology', '/about', '/pricing', '/research/'],
        disallow: ['/dashboard/', '/api/', '/partner/', '/therapist/', '/onboarding', '/guardian'],
      },
    ],
    sitemap: 'https://becandid.io/sitemap.xml',
  };
}
