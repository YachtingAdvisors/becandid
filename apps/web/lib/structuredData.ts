/**
 * Structured data (JSON-LD) helpers for SEO.
 * Import the schema you need, then render it via <JsonLd data={schema} />.
 */

const BASE_URL = 'https://becandid.io';

/* ─── Organization ───────────────────────────────────────────── */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Be Candid',
    url: BASE_URL,
    logo: `${BASE_URL}/apple-touch-icon.png`,
    description:
      'AI-powered screen time accountability app for digital wellness. Build awareness, track habits, and align your digital life with your values.',
    sameAs: [],
  };
}

/* ─── SoftwareApplication ────────────────────────────────────── */

export function softwareAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Be Candid',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web, iOS, Android',
    description:
      'AI-powered screen time accountability app for digital wellness. Build streaks, share with an accountability partner, and align your digital life with your values.',
    url: BASE_URL,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: 'Core features with 1 accountability partner',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '9.99',
        priceCurrency: 'USD',
        description: 'Unlimited AI guides, 5 partners, pattern detection',
        priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      },
      {
        '@type': 'Offer',
        name: 'Therapy',
        price: '19.99',
        priceCurrency: 'USD',
        description: 'Full therapist portal, HIPAA-ready encryption, daily mood trends',
        priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      },
    ],
  };
}

/* ─── FAQ Page ───────────────────────────────────────────────── */

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/* ─── Product (for pricing tiers) ────────────────────────────── */

interface ProductTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

export function productSchema(tier: ProductTier) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Be Candid ${tier.name}`,
    description: tier.description,
    brand: { '@type': 'Brand', name: 'Be Candid' },
    offers: [
      ...(tier.monthlyPrice > 0
        ? [
            {
              '@type': 'Offer',
              price: tier.monthlyPrice.toString(),
              priceCurrency: 'USD',
              priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
              availability: 'https://schema.org/InStock',
              name: `${tier.name} Monthly`,
            },
          ]
        : [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              name: `${tier.name} Free`,
            },
          ]),
      ...(tier.annualPrice > 0
        ? [
            {
              '@type': 'Offer',
              price: tier.annualPrice.toString(),
              priceCurrency: 'USD',
              priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
              availability: 'https://schema.org/InStock',
              name: `${tier.name} Annual`,
            },
          ]
        : []),
    ],
  };
}

/* ─── Article (for blog posts) ───────────────────────────────── */

interface ArticleProps {
  headline: string;
  description: string;
  datePublished: string;
  author: string;
  url: string;
  image?: string;
}

export function articleSchema(props: ArticleProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.headline,
    description: props.description,
    datePublished: props.datePublished,
    author: { '@type': 'Organization', name: props.author },
    publisher: {
      '@type': 'Organization',
      name: 'Be Candid',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': props.url },
    ...(props.image ? { image: props.image } : {}),
  };
}
