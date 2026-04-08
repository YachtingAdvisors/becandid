// ============================================================
// lib/seo/contentEngine.ts — SEO Content Generation Engine
//
// Track A: Competitor spokes (BOFU, 3-5/week)
// Track B: Emotional health pillars (Authority, 2-4/month)
// ============================================================

import type { BlogPost } from '@/content/blog/posts';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

/* ─── Track A: Competitor Spoke Topics ────────────────────── */
export const TRACK_A_TOPICS = [
  {
    slug: 'be-candid-vs-covenant-eyes',
    title: 'Be Candid vs. Covenant Eyes: Which Is Better in 2026?',
    description: 'An honest comparison of Be Candid and Covenant Eyes — features, privacy, pricing, and philosophy. See which accountability app fits your values.',
    tags: ['comparison', 'covenant eyes', 'accountability'],
    competitor: 'Covenant Eyes',
    keywords: ['covenant eyes alternative', 'covenant eyes vs be candid', 'best accountability app 2026'],
  },
  {
    slug: 'accountable2you-alternatives',
    title: 'Best Accountable2You Alternatives for iOS and Android (2026)',
    description: 'Looking for an Accountable2You alternative? Compare the top accountability apps including Be Candid, Covenant Eyes, and Ever Accountable.',
    tags: ['comparison', 'accountable2you', 'alternatives'],
    competitor: 'Accountable2You',
    keywords: ['accountable2you alternative', 'accountability app for iphone', 'accountable2you review'],
  },
  {
    slug: 'switch-from-covenant-eyes-to-be-candid',
    title: 'How to Switch from Covenant Eyes to Be Candid in 5 Minutes',
    description: 'Step-by-step guide to migrating from Covenant Eyes to Be Candid. Keep your accountability while upgrading to a privacy-first, clinically-informed platform.',
    tags: ['migration', 'covenant eyes', 'getting started'],
    competitor: 'Covenant Eyes',
    keywords: ['switch from covenant eyes', 'leave covenant eyes', 'covenant eyes cancellation'],
  },
  {
    slug: 'ever-accountable-vs-be-candid',
    title: 'Ever Accountable vs. Be Candid: Privacy, Features, and Price Compared',
    description: 'Detailed comparison of Ever Accountable and Be Candid. See how they stack up on monitoring, privacy, journaling, and partner tools.',
    tags: ['comparison', 'ever accountable', 'accountability'],
    competitor: 'Ever Accountable',
    keywords: ['ever accountable alternative', 'ever accountable review', 'best porn blocker 2026'],
  },
  {
    slug: 'best-accountability-apps-2026',
    title: 'The 7 Best Accountability Apps in 2026 (Ranked by Real Users)',
    description: 'We tested every major accountability app. Here are the 7 best for privacy, effectiveness, and actually changing behavior — not just monitoring it.',
    tags: ['roundup', 'accountability', 'digital wellness'],
    competitor: 'Multiple',
    keywords: ['best accountability app', 'accountability software 2026', 'internet accountability app'],
  },
  {
    slug: 'covenant-eyes-review-2026',
    title: 'Covenant Eyes Review 2026: Still Worth It? (Honest Analysis)',
    description: 'An unbiased review of Covenant Eyes in 2026. Covers what works, what doesn\'t, privacy concerns, and who it\'s actually best for.',
    tags: ['review', 'covenant eyes', 'accountability'],
    competitor: 'Covenant Eyes',
    keywords: ['covenant eyes review', 'is covenant eyes worth it', 'covenant eyes problems'],
  },
  {
    slug: 'accountability-app-without-screenshots',
    title: 'Accountability Apps That Don\'t Take Screenshots (Privacy-First Options)',
    description: 'Most accountability apps spy on you with screenshots. Here are the ones that don\'t — and why privacy-first accountability actually works better.',
    tags: ['privacy', 'accountability', 'comparison'],
    competitor: 'Multiple',
    keywords: ['accountability app no screenshots', 'privacy accountability app', 'covenant eyes screenshots'],
  },
  {
    slug: 'best-porn-blocker-for-iphone',
    title: 'Best Porn Blockers for iPhone in 2026 (That Actually Work)',
    description: 'Most iPhone porn blockers are easy to bypass. Here are the ones that work — plus why blocking alone isn\'t enough for lasting change.',
    tags: ['ios', 'content filtering', 'digital wellness'],
    competitor: 'Multiple',
    keywords: ['best porn blocker iphone', 'iphone accountability app', 'block porn on iphone'],
  },
  {
    slug: 'accountability-partner-app',
    title: 'The Best Apps for Accountability Partners in 2026',
    description: 'Finding the right app for you and your accountability partner. Compare features, privacy, and how each app handles the partner relationship.',
    tags: ['accountability', 'partnerships', 'comparison'],
    competitor: 'Multiple',
    keywords: ['accountability partner app', 'accountability app for couples', 'partner accountability software'],
  },
  {
    slug: 'bark-vs-be-candid-for-teens',
    title: 'Bark vs. Be Candid for Teens: Monitoring vs. Accountability',
    description: 'Should you monitor your teen with Bark or empower them with accountability through Be Candid? A comparison of two very different approaches.',
    tags: ['comparison', 'bark', 'teens', 'parenting'],
    competitor: 'Bark',
    keywords: ['bark app alternative', 'teen accountability app', 'bark vs covenant eyes'],
  },
];

/* ─── Track B: Pillar Topics ─────────────────────────────── */
export const TRACK_B_TOPICS = [
  {
    slug: 'psychology-of-digital-accountability',
    title: 'The Psychology of Digital Accountability: Why Monitoring Alone Fails',
    description: 'Deep dive into why surveillance-based accountability apps fail — and what the science says about building lasting digital integrity.',
    tags: ['psychology', 'digital wellness', 'research'],
    keywords: ['digital accountability psychology', 'why porn blockers fail', 'accountability science'],
  },
  {
    slug: 'rebuilding-trust-after-digital-betrayal',
    title: 'Rebuilding Trust After Digital Betrayal: A Complete Guide',
    description: 'A clinically-informed guide for couples rebuilding trust after discovering compulsive digital behavior. Based on Jay Stringer\'s Unwanted research.',
    tags: ['relationships', 'trust', 'recovery'],
    keywords: ['rebuilding trust after porn', 'digital betrayal recovery', 'partner trust after addiction'],
  },
  {
    slug: 'stringer-framework-explained',
    title: 'The Stringer Framework: Understanding Why, Not Just What',
    description: 'A comprehensive guide to Jay Stringer\'s Unwanted framework — tributaries, longing, and roadmap — and how Be Candid applies it to digital wellness.',
    tags: ['methodology', 'stringer', 'research'],
    keywords: ['jay stringer unwanted', 'stringer framework', 'why do i watch porn'],
  },
  {
    slug: 'screen-time-and-mental-health-research',
    title: 'Screen Time & Mental Health: What 47 Studies Actually Say',
    description: 'A meta-analysis of the research on screen time and mental health. What the science supports, what it doesn\'t, and what to actually do about it.',
    tags: ['research', 'mental health', 'screen time'],
    keywords: ['screen time mental health research', 'does screen time cause depression', 'screen time studies'],
  },
];

/* ─── System Prompts ──────────────────────────────────────── */
export const TRACK_A_SYSTEM_PROMPT = `You are an expert SEO content writer for Be Candid, a privacy-first digital accountability app. You write highly structured software comparison articles.

BRAND CONTEXT:
- Be Candid is NOT surveillance. It's accountability through self-awareness.
- Core differentiators: Stringer journal framework, AI conversation coach, coping transformation system (Escaping→Presence, Numbing→Experiencing, etc.), end-to-end encryption, no screenshots, no URL logging.
- Pricing: Free tier, Pro $9.99/mo, Therapy $19.99/mo
- Competitors (Covenant Eyes, Accountable2You, Ever Accountable) use screenshot monitoring and URL tracking.

ARTICLE REQUIREMENTS:
1. Start with a hook that acknowledges the reader's search intent
2. Include a comparison table (markdown table) within the first 500 words
3. Use H2 headings optimized for featured snippets (question format when possible)
4. Include Pros and Cons sections for each product
5. Address privacy directly — this is Be Candid's biggest advantage
6. Include a "Bottom Line" section with a clear recommendation
7. Include an FAQ section with 4-5 questions (for FAQPage schema)
8. Include 2 internal link placeholders: [INTERNAL_LINK:methodology] and [INTERNAL_LINK:assessment]
9. Tone: objective but persuasive. Acknowledge competitor strengths honestly.
10. Length: 1,500-2,000 words
11. Do NOT make up features. Stick to what's described above.

OUTPUT FORMAT: Valid HTML content (no <html>, <head>, <body> tags — just the article body).`;

export const TRACK_B_SYSTEM_PROMPT = `You are an expert health and psychology writer for Be Candid, a clinically-informed digital accountability platform. You write comprehensive, authoritative guides.

BRAND CONTEXT:
- Built on Jay Stringer's "Unwanted" research framework
- Coping transformation model: Escaping→Presence, Numbing→Experiencing, Chasing→Building, Performing→Belonging, Punishing→Compassion, Controlling→Surrendering, Fantasizing→Connecting, Guarding→Trusting
- HIPAA compliant, end-to-end encrypted, zero-knowledge architecture

ARTICLE REQUIREMENTS:
1. 2,000+ words, comprehensive and authoritative
2. Cite real research — reference published studies, use author names and years
3. Use extensive formatting: bullet points, blockquotes for key insights, bold key terms
4. Include an "About the Author" note referencing the Be Candid clinical advisory approach
5. Structure with clear H2/H3 hierarchy for featured snippet optimization
6. Include practical, actionable takeaways (not just theory)
7. Reference the coping transformation framework where relevant
8. Include internal links: [INTERNAL_LINK:assessment], [INTERNAL_LINK:journal], [INTERNAL_LINK:methodology]
9. Tone: warm, authoritative, never preachy. Write like a thoughtful clinician, not a marketer.
10. Include a "Key Takeaways" summary box at the top
11. Do NOT make medical claims or diagnose. This is educational content.

OUTPUT FORMAT: Valid HTML content (no <html>, <head>, <body> tags — just the article body).
IMPORTANT: This is YMYL content. Be accurate, cite sources, and never overstate claims.`;

/* ─── Post-Processing ─────────────────────────────────────── */
export function processContent(html: string): string {
  return html
    .replace(/\[INTERNAL_LINK:methodology\]/g, `<a href="${BASE_URL}/methodology">our methodology</a>`)
    .replace(/\[INTERNAL_LINK:assessment\]/g, `<a href="${BASE_URL}/assessment">Take the Rival Assessment</a>`)
    .replace(/\[INTERNAL_LINK:journal\]/g, `<a href="${BASE_URL}/dashboard/stringer-journal">the Candid Journal</a>`)
    .replace(/\[INTERNAL_LINK:pricing\]/g, `<a href="${BASE_URL}/pricing">pricing</a>`)
    .replace(/\[INTERNAL_LINK:signup\]/g, `<a href="${BASE_URL}/auth/signup">Start your free trial</a>`)
    // Strip any script tags for safety
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

export function buildFaqSchema(faqs: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

export function buildArticleSchema(post: BlogPost): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'Be Candid',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Be Candid',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
  };
}
