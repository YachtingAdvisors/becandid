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
    sameAs: [
      'https://github.com/YachtingAdvisors/becandid',
    ],
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '247',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Marcus T.' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: 'After years of Covenant Eyes making me feel like I was being watched, Be Candid feels like the first tool that actually treats me like a person. My partner gets what he needs without seeing every site I visit.',
        datePublished: '2026-02-14',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Dr. Sarah Miller, LPC' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: 'The therapist portal is what clinical accountability tools should have been from the start. The Stringer Framework integration gives me actionable insights for session prep that I\'ve never had from surveillance-based tools.',
        datePublished: '2026-01-28',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'James R.' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: 'The journaling prompts helped me understand patterns I\'ve been blind to for years. Real change — not just guilt management.',
        datePublished: '2026-03-05',
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
  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    merchantReturnDays: 0,
  };

  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
    },
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Be Candid ${tier.name}`,
    description: tier.description,
    image: `${BASE_URL}/icon-512.png`,
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
              hasMerchantReturnPolicy: returnPolicy,
              shippingDetails,
            },
          ]
        : [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              name: `${tier.name} Free`,
              hasMerchantReturnPolicy: returnPolicy,
              shippingDetails,
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
              hasMerchantReturnPolicy: returnPolicy,
              shippingDetails,
            },
          ]
        : []),
    ],
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Licensed Clinical Psychologist' },
        reviewBody: 'I used to spend the first 15 minutes of every session trying to reconstruct what happened since our last meeting. Now I walk in already knowing.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Licensed Marriage & Family Therapist' },
        reviewBody: "The journal entries give me insight I'd normally only get in an inpatient setting. It's transformed my outpatient practice.",
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Recovery Ministry Leader' },
        reviewBody: "We've equipped 30 men in our recovery group with Be Candid. The therapist portal gives our counselors real insight into patterns between sessions — without anyone feeling watched.",
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '3',
      bestRating: '5',
    },
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
  // GEO-enhanced fields
  keywords?: string[];
  wordCount?: number;
  articleSection?: string;
  about?: { '@type': string; name: string }[];
  mentions?: string[];
  dateModified?: string;
  // Optional: attribute authorship to a real Person (E-E-A-T / GEO)
  authorPerson?: {
    name: string;
    slug: string;
    jobTitle?: string;
    description?: string;
    image?: string;
    sameAs?: string[];
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ToolProps {
  name: string;
  description: string;
  url: string;
}

export function toolApplicationSchema(props: ToolProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: props.name,
    description: props.description,
    url: props.url,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: {
      '@type': 'Organization',
      name: 'Be Candid',
      url: BASE_URL,
    },
  };
}

export function articleSchema(props: ArticleProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: props.headline,
    description: props.description,
    datePublished: props.datePublished,
    ...(props.dateModified ? { dateModified: props.dateModified } : {}),
    author: props.authorPerson
      ? {
          '@type': 'Person',
          name: props.authorPerson.name,
          url: `${BASE_URL}/authors/${props.authorPerson.slug}`,
          ...(props.authorPerson.jobTitle ? { jobTitle: props.authorPerson.jobTitle } : {}),
          ...(props.authorPerson.description ? { description: props.authorPerson.description } : {}),
          ...(props.authorPerson.image ? { image: props.authorPerson.image } : {}),
          ...(props.authorPerson.sameAs?.length ? { sameAs: props.authorPerson.sameAs } : {}),
          worksFor: { '@type': 'Organization', name: 'Be Candid', url: BASE_URL },
        }
      : { '@type': 'Organization', name: props.author },
    publisher: {
      '@type': 'Organization',
      name: 'Be Candid',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/apple-touch-icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': props.url },
    inLanguage: 'en-US',
    ...(props.image ? { image: props.image } : {}),
    ...(props.keywords?.length ? { keywords: props.keywords.join(', ') } : {}),
    ...(props.wordCount ? { wordCount: props.wordCount } : {}),
    ...(props.articleSection ? { articleSection: props.articleSection } : {}),
    ...(props.about?.length ? { about: props.about } : {}),
    ...(props.mentions?.length
      ? {
          mentions: props.mentions.map(name => ({
            '@type': 'Thing',
            name,
          })),
        }
      : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2', 'article > p:first-of-type'],
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface PersonProps {
  name: string;
  slug: string; // used for URL
  jobTitle?: string;
  description?: string;
  image?: string;
  knowsAbout?: string[];
  alumniOf?: string;
  sameAs?: string[]; // social profiles
}

export function personSchema(props: PersonProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    url: `${BASE_URL}/authors/${props.slug}`,
    ...(props.jobTitle ? { jobTitle: props.jobTitle } : {}),
    ...(props.description ? { description: props.description } : {}),
    ...(props.image ? { image: props.image } : {}),
    ...(props.knowsAbout?.length ? { knowsAbout: props.knowsAbout } : {}),
    ...(props.alumniOf ? { alumniOf: { '@type': 'Organization', name: props.alumniOf } } : {}),
    ...(props.sameAs?.length ? { sameAs: props.sameAs } : {}),
    worksFor: {
      '@type': 'Organization',
      name: 'Be Candid',
      url: BASE_URL,
    },
  };
}

export function reviewSchema(review: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished?: string;
}) {
  return {
    '@type': 'Review',
    author: { '@type': 'Person', name: review.author },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.reviewBody,
    ...(review.datePublished ? { datePublished: review.datePublished } : {}),
  };
}

export function aggregateRatingSchema(ratingValue: number, reviewCount: number) {
  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function howToSchema(props: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration like "P21D"
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: props.name,
    description: props.description,
    ...(props.totalTime ? { totalTime: props.totalTime } : {}),
    step: props.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
    })),
  };
}

export function medicalWebPageSchema(props: {
  name: string;
  description: string;
  url: string;
  about?: string[]; // medical conditions/topics
  audience?: 'Patient' | 'MedicalProfessional' | 'Consumer';
  lastReviewed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: props.name,
    description: props.description,
    url: props.url,
    inLanguage: 'en-US',
    ...(props.lastReviewed ? { lastReviewed: props.lastReviewed } : {}),
    ...(props.audience
      ? {
          audience: {
            '@type': props.audience === 'MedicalProfessional' ? 'MedicalAudience' : 'Audience',
            audienceType: props.audience,
          },
        }
      : {}),
    ...(props.about?.length
      ? {
          about: props.about.map(topic => ({
            '@type': 'MedicalCondition',
            name: topic,
          })),
        }
      : {}),
  };
}

export function datasetSchema(props: {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  keywords?: string[];
  creator?: string;
  license?: string;
  variableMeasured?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: props.name,
    description: props.description,
    url: props.url,
    datePublished: props.datePublished,
    ...(props.keywords?.length ? { keywords: props.keywords.join(', ') } : {}),
    ...(props.license ? { license: props.license } : {}),
    creator: {
      '@type': 'Organization',
      name: props.creator ?? 'Be Candid',
      url: BASE_URL,
    },
    ...(props.variableMeasured?.length
      ? {
          variableMeasured: props.variableMeasured.map(v => ({
            '@type': 'PropertyValue',
            name: v,
          })),
        }
      : {}),
  };
}

export function definedTermSetSchema(
  name: string,
  description: string,
  terms: { name: string; description: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name,
    description,
    hasDefinedTerm: terms.map(t => ({
      '@type': 'DefinedTerm',
      name: t.name,
      description: t.description,
    })),
  };
}
