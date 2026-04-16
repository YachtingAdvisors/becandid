export interface Hub {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string; // Unsplash URL
  intro: string; // 2-3 paragraph intro with markdown
  keywords: string[];
  sections: HubSection[];
}

export interface HubSection {
  title: string;
  description: string;
  articleSlugs: string[]; // blog post slugs to include
}

export const HUBS: Hub[] = [
  {
    slug: 'porn-addiction-recovery',
    title: 'Porn Addiction Recovery: A Complete Resource',
    tagline: 'Understanding, healing, and moving forward',
    description:
      'Comprehensive resources on pornography addiction recovery — why traditional approaches fail, what actually works, and how to rebuild trust.',
    heroImage:
      'https://images.unsplash.com/photo-1502101872923-d48509bff386?w=1600&q=80',
    intro:
      'Recovery from pornography addiction is not a willpower problem — it is a meaning problem. This resource hub organizes everything Be Candid has published on recovery, spanning the clinical frameworks that actually work, the surveillance-based approaches that fail, and the path toward restored intimacy and integrity.\n\nEach section below contains articles, tools, and research. Start anywhere — the hub is designed to meet you where you are.',
    keywords: [
      'porn addiction recovery',
      'pornography addiction help',
      'overcoming porn addiction',
      'porn recovery resources',
      'porn addiction therapy',
    ],
    sections: [
      {
        title: 'Why Traditional Approaches Fail',
        description:
          'Understanding why blockers and surveillance software produce short-term change but long-term shame.',
        articleSlugs: [
          'why-porn-blockers-dont-work',
          'why-covenant-eyes-fails-accountability-software-truth',
          'big-tech-mental-health-crisis-profit',
        ],
      },
      {
        title: 'The Stringer Framework',
        description:
          "Jay Stringer's research-backed approach to understanding unwanted sexual behavior.",
        articleSlugs: [
          'numbing-to-experiencing-feeling-emotions-without-phone',
          'escaping-to-presence-grounding-screen-addiction',
          'fantasizing-to-connecting-risking-real-intimacy',
        ],
      },
      {
        title: 'Dignity-Based Accountability',
        description:
          'How to build accountability that preserves dignity and produces real change.',
        articleSlugs: [
          'accountability-dignity-privacy',
          'guarding-to-trusting-learning-safety-without-surveillance',
          'best-covenant-eyes-alternative-privacy',
        ],
      },
      {
        title: 'For Spouses and Partners',
        description:
          'Support and resources for partners navigating discovery and recovery.',
        articleSlugs: [
          'husband-phone-addiction-signs',
          'signs-husband-addicted-phone-what-to-do',
        ],
      },
      {
        title: 'Moving Forward',
        description: 'Practical guidance for long-term recovery and rebuilding.',
        articleSlugs: [
          'performing-to-belonging-enough-without-audience',
          'punishing-to-compassion-treating-yourself-like-someone-you-love',
          'controlling-to-surrendering-trusting-uncertainty',
        ],
      },
    ],
  },
  {
    slug: 'screen-time-accountability',
    title: 'Screen Time Accountability: The Complete Guide',
    tagline: 'Building awareness, not surveillance',
    description:
      'Everything you need to know about screen time accountability — how it works, why partnership-based approaches succeed, and how to choose the right tools.',
    heroImage:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600&q=80',
    intro:
      'Screen time accountability has evolved. The first generation was surveillance — logging every URL, sending screenshots, treating adults like suspects. It produced shame, not change.\n\nThe second generation — what Be Candid pioneers — is dignity-based accountability. Partners see patterns, not content. Therapists see themes, not transcripts. This hub explains how it works.',
    keywords: [
      'screen time accountability',
      'accountability partner apps',
      'digital accountability',
      'phone accountability software',
      'screen time tracking',
    ],
    sections: [
      {
        title: 'Foundations',
        description:
          'Understanding what accountability is and why the partnership matters.',
        articleSlugs: [
          'accountability-dignity-privacy',
          'accountability-industry-rising-addiction-rates-2026',
        ],
      },
      {
        title: 'Tool Comparisons',
        description: 'How Be Candid compares to popular accountability apps.',
        articleSlugs: [
          'covenant-eyes-vs-be-candid-comparison',
          'be-candid-vs-accountable2you',
          'be-candid-vs-ever-accountable',
          'be-candid-vs-bark',
        ],
      },
      {
        title: 'Privacy & Dignity',
        description:
          'The philosophical difference between surveillance and accountability.',
        articleSlugs: [
          'accountability-app-without-vpn-no-screenshots',
          'best-covenant-eyes-alternative-privacy',
          'guarding-to-trusting-learning-safety-without-surveillance',
        ],
      },
    ],
  },
  {
    slug: 'phone-addiction-help',
    title: 'Phone Addiction Help: Science-Based Resources',
    tagline: 'Understanding compulsive phone use and what actually works',
    description:
      'Comprehensive resources on phone addiction — from research and statistics to practical recovery approaches based on behavioral psychology.',
    heroImage:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1600&q=80',
    intro:
      'Phone addiction is real. The average American checks their phone 96 times a day — once every 10 minutes of waking life. But the solution is not more willpower or stricter blockers. It is understanding what the behavior is trying to fulfill.\n\nThis hub combines statistics, research, and practical recovery resources.',
    keywords: [
      'phone addiction help',
      'phone addiction recovery',
      'compulsive phone use',
      'smartphone addiction',
      'breaking phone addiction',
    ],
    sections: [
      {
        title: 'Signs and Self-Assessment',
        description:
          'Recognizing problematic phone use in yourself or a loved one.',
        articleSlugs: [
          'husband-phone-addiction-signs',
          'signs-husband-addicted-phone-what-to-do',
        ],
      },
      {
        title: 'Recovery Approaches',
        description:
          'Evidence-based methods for reducing compulsive phone use.',
        articleSlugs: [
          'numbing-to-experiencing-feeling-emotions-without-phone',
          'escaping-to-presence-grounding-screen-addiction',
          'chasing-to-building-channeling-energy-into-creation',
        ],
      },
      {
        title: 'Emotional Roots',
        description:
          'Why phone addiction is often about emotional needs, not technology.',
        articleSlugs: [
          'performing-to-belonging-enough-without-audience',
          'punishing-to-compassion-treating-yourself-like-someone-you-love',
        ],
      },
    ],
  },
  {
    slug: 'digital-wellness',
    title: 'Digital Wellness: Building a Healthy Relationship with Technology',
    tagline: 'Aligning your digital life with your values',
    description:
      'Practical guides and research on digital wellness — from screen time management to rebuilding relationships impacted by tech use.',
    heroImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80',
    intro:
      'Digital wellness is not about eliminating technology — it is about being intentional with it. This hub provides the research, frameworks, and practical tools for aligning your digital life with what you actually value.',
    keywords: [
      'digital wellness',
      'digital minimalism',
      'healthy technology use',
      'intentional technology',
      'digital balance',
    ],
    sections: [
      {
        title: 'The Research',
        description:
          'Current data on screen time, digital addiction, and mental health.',
        articleSlugs: [
          'big-tech-mental-health-crisis-profit',
          'accountability-industry-rising-addiction-rates-2026',
        ],
      },
      {
        title: 'Transformation Paths',
        description:
          'Stringer Framework articles on moving from compulsive to intentional behavior.',
        articleSlugs: [
          'numbing-to-experiencing-feeling-emotions-without-phone',
          'escaping-to-presence-grounding-screen-addiction',
          'chasing-to-building-channeling-energy-into-creation',
          'controlling-to-surrendering-trusting-uncertainty',
        ],
      },
      {
        title: 'Self-Compassion Approaches',
        description: 'Replacing shame cycles with self-understanding.',
        articleSlugs: [
          'punishing-to-compassion-treating-yourself-like-someone-you-love',
          'performing-to-belonging-enough-without-audience',
        ],
      },
    ],
  },
  {
    slug: 'accountability-partnerships',
    title: 'Accountability Partnerships: How to Build Them That Actually Work',
    tagline: 'The science of supportive accountability',
    description:
      'Everything you need to build effective accountability partnerships — from choosing the right partner to structuring conversations that produce real change.',
    heroImage:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80',
    intro:
      'Most accountability partnerships fail within 90 days. The ones that succeed share common features: they focus on patterns over policing, they use structured conversation starters, and they preserve dignity. This hub shows you how to build one.',
    keywords: [
      'accountability partnership',
      'accountability partner',
      'how to be an accountability partner',
      'accountability relationships',
      'supportive accountability',
    ],
    sections: [
      {
        title: 'Philosophy',
        description: 'What accountability is — and what it is not.',
        articleSlugs: [
          'accountability-dignity-privacy',
          'guarding-to-trusting-learning-safety-without-surveillance',
        ],
      },
      {
        title: 'For Couples',
        description: 'Navigating accountability in marriage and partnership.',
        articleSlugs: [
          'husband-phone-addiction-signs',
          'signs-husband-addicted-phone-what-to-do',
          'fantasizing-to-connecting-risking-real-intimacy',
        ],
      },
      {
        title: 'Choosing Tools',
        description: 'Comparing accountability software options.',
        articleSlugs: [
          'best-covenant-eyes-alternative-privacy',
          'covenant-eyes-vs-be-candid-comparison',
          'accountability-app-without-vpn-no-screenshots',
        ],
      },
    ],
  },
];

export function getHub(slug: string): Hub | undefined {
  return HUBS.find(h => h.slug === slug);
}
