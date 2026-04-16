// Curated stock images for blog articles
// Uses Unsplash source URLs (free, no API key needed)
import type { BlogImage } from './posts';

// Topic-based image pools — each article gets images matched to its theme
const IMAGE_POOLS: Record<string, BlogImage[]> = {
  // Digital wellness / phone addiction
  'phone-addiction': [
    { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80', alt: 'Person looking at phone in dim light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80', alt: 'Smartphone on wooden table', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', alt: 'Person walking outdoors without phone', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=800&q=80', alt: 'Phone screen glowing in the dark', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80', alt: 'Hands reaching for smartphone on nightstand', credit: 'Unsplash' },
  ],
  // Accountability / partnership
  'accountability': [
    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', alt: 'Friends having a supportive conversation', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', alt: 'Two people shaking hands in trust', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80', alt: 'People sitting together in deep conversation', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80', alt: 'Group gathered around table in community', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', alt: 'People supporting each other outdoors', credit: 'Unsplash' },
  ],
  // Mental health / emotions
  'mental-health': [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', alt: 'Person meditating at sunrise', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80', alt: 'Peaceful nature scene with sunlight', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80', alt: 'Person journaling in quiet space', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&q=80', alt: 'Calm lake reflecting mountains', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80', alt: 'Person sitting quietly with eyes closed', credit: 'Unsplash' },
  ],
  // Recovery / growth / transformation
  'recovery': [
    { url: 'https://images.unsplash.com/photo-1502101872923-d48509bff386?w=800&q=80', alt: 'Sunrise over mountain path', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', alt: 'Foggy forest trail leading forward', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', alt: 'Mountain peak at golden hour', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80', alt: 'Person standing with arms open at sunset', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', alt: 'Sunlight streaming through forest canopy', credit: 'Unsplash' },
  ],
  // Relationships / intimacy
  'relationships': [
    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80', alt: 'Couple walking together on a path', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80', alt: 'Two people holding hands', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80', alt: 'Group of friends laughing together', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80', alt: 'Couple having coffee and talking', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&q=80', alt: 'Two people sharing a quiet moment together', credit: 'Unsplash' },
  ],
  // Technology / big tech
  'technology': [
    { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', alt: 'Abstract technology network', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', alt: 'People working with screens', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', alt: 'Code on computer screen', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80', alt: 'Laptop with abstract digital display', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', alt: 'Matrix-style data visualization', credit: 'Unsplash' },
  ],
  // Self-compassion / inner work
  'self-compassion': [
    { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', alt: 'Person sitting peacefully by water', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', alt: 'Warm light through window', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', alt: 'Person running freely outdoors', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80', alt: 'Hourglass with warm golden light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&q=80', alt: 'Person stretching in morning light', credit: 'Unsplash' },
  ],
  // Faith / Christian accountability
  'faith': [
    { url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80', alt: 'Open Bible with warm light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80', alt: 'Church steeple against blue sky', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80', alt: 'People praying together in circle', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=800&q=80', alt: 'Cross silhouetted against sunrise', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519491050282-cf00c82a28a4?w=800&q=80', alt: 'Small group Bible study', credit: 'Unsplash' },
  ],
  // Privacy / security / comparison
  'privacy': [
    { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80', alt: 'Lock icon on digital screen representing privacy', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80', alt: 'Laptop with privacy shield concept', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80', alt: 'Person using laptop with secure connection', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80', alt: 'Closed padlock symbolizing data protection', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', alt: 'Server room with secure infrastructure', credit: 'Unsplash' },
  ],
  // Statistics / data / research
  'statistics': [
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', alt: 'Data charts and analytics dashboard', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', alt: 'Laptop showing graphs and statistics', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80', alt: 'Abstract data visualization on screen', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80', alt: 'Notebook with charts and pen', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80', alt: 'Research papers and data on desk', credit: 'Unsplash' },
  ],
};

// Map each slug to its primary topic pool + a hero image
const SLUG_IMAGE_MAP: Record<string, { hero: string; pool: string }> = {
  // Legacy / original posts
  'accountability-dignity-privacy': { hero: 'accountability', pool: 'accountability' },
  'accountability-industry-rising-addiction-rates-2026': { hero: 'technology', pool: 'recovery' },
  'big-tech-mental-health-crisis-profit': { hero: 'technology', pool: 'mental-health' },
  'chasing-to-building-channeling-energy-into-creation': { hero: 'recovery', pool: 'self-compassion' },
  'controlling-to-surrendering-trusting-uncertainty': { hero: 'self-compassion', pool: 'recovery' },
  'escaping-to-presence-grounding-screen-addiction': { hero: 'phone-addiction', pool: 'mental-health' },
  'fantasizing-to-connecting-risking-real-intimacy': { hero: 'relationships', pool: 'self-compassion' },
  'guarding-to-trusting-learning-safety-without-surveillance': { hero: 'relationships', pool: 'accountability' },
  'husband-phone-addiction-signs': { hero: 'phone-addiction', pool: 'relationships' },
  'numbing-to-experiencing-feeling-emotions-without-phone': { hero: 'mental-health', pool: 'phone-addiction' },
  'performing-to-belonging-enough-without-audience': { hero: 'self-compassion', pool: 'relationships' },
  'punishing-to-compassion-treating-yourself-like-someone-you-love': { hero: 'self-compassion', pool: 'recovery' },
  'signs-husband-addicted-phone-what-to-do': { hero: 'phone-addiction', pool: 'relationships' },
  'why-covenant-eyes-fails-accountability-software-truth': { hero: 'technology', pool: 'accountability' },
  'why-porn-blockers-dont-work': { hero: 'technology', pool: 'accountability' },
  'how-to-break-phone-addiction': { hero: 'phone-addiction', pool: 'recovery' },
  'digital-detox-guide': { hero: 'mental-health', pool: 'phone-addiction' },
  'screen-time-impact-mental-health': { hero: 'mental-health', pool: 'technology' },
  'accountability-partner-guide': { hero: 'accountability', pool: 'relationships' },
  'porn-addiction-recovery-guide': { hero: 'recovery', pool: 'accountability' },

  // posts.ts batch
  'screen-time-accountability-for-couples': { hero: 'relationships', pool: 'phone-addiction' },
  'digital-wellness-guide': { hero: 'mental-health', pool: 'self-compassion' },
  'covenant-eyes-alternatives': { hero: 'technology', pool: 'accountability' },
  'how-to-talk-to-partner-about-porn-addiction': { hero: 'relationships', pool: 'recovery' },

  // posts-batch2
  'science-behind-digital-accountability': { hero: 'technology', pool: 'accountability' },
  'understanding-your-triggers': { hero: 'mental-health', pool: 'recovery' },

  // posts-batch3
  'screen-time-mental-health': { hero: 'phone-addiction', pool: 'mental-health' },
  'partners-guide-to-accountability': { hero: 'relationships', pool: 'accountability' },

  // posts-batch4
  'breaking-the-shame-cycle': { hero: 'self-compassion', pool: 'recovery' },
  'gambling-addiction-digital-age': { hero: 'technology', pool: 'recovery' },

  // posts-batch5
  'signs-you-need-accountability-partner': { hero: 'accountability', pool: 'self-compassion' },
  'therapists-guide-digital-accountability': { hero: 'accountability', pool: 'mental-health' },

  // posts-niche1
  'how-to-stop-doomscrolling': { hero: 'phone-addiction', pool: 'mental-health' },
  'ai-chatbot-addiction': { hero: 'technology', pool: 'mental-health' },

  // posts-niche2
  'revenge-bedtime-procrastination': { hero: 'phone-addiction', pool: 'self-compassion' },
  'signs-youre-a-workaholic': { hero: 'mental-health', pool: 'self-compassion' },

  // posts-niche3
  'am-i-having-emotional-affair': { hero: 'relationships', pool: 'self-compassion' },
  'procrastination-shame-cycle': { hero: 'self-compassion', pool: 'mental-health' },

  // posts-niche4
  'social-media-addiction-adults': { hero: 'phone-addiction', pool: 'technology' },
  'self-harm-recovery-tools': { hero: 'recovery', pool: 'mental-health' },

  // posts-faith1 + faith2
  'should-christians-use-accountability-apps': { hero: 'faith', pool: 'accountability' },
  'best-christian-accountability-apps-2026': { hero: 'faith', pool: 'technology' },
  'porn-addiction-church-beyond-shame': { hero: 'faith', pool: 'recovery' },
  'mens-accountability-group-church': { hero: 'faith', pool: 'accountability' },

  // posts-stats1 through stats5
  'pornography-statistics-2026': { hero: 'statistics', pool: 'recovery' },
  'gambling-addiction-statistics-2026': { hero: 'statistics', pool: 'technology' },
  'social-media-addiction-statistics-2026': { hero: 'statistics', pool: 'phone-addiction' },
  'alcohol-substance-addiction-statistics-2026': { hero: 'statistics', pool: 'recovery' },
  'gaming-addiction-statistics-2026': { hero: 'statistics', pool: 'technology' },
  'eating-disorder-statistics-2026': { hero: 'statistics', pool: 'mental-health' },
  'ai-chatbot-addiction-statistics-2026': { hero: 'statistics', pool: 'technology' },

  // Comparison / alternative articles
  'best-covenant-eyes-alternative-privacy': { hero: 'privacy', pool: 'accountability' },
  'accountability-app-without-vpn-no-screenshots': { hero: 'technology', pool: 'privacy' },
  'covenant-eyes-vs-be-candid-comparison': { hero: 'accountability', pool: 'privacy' },
};

export function getArticleImages(slug: string): { hero: BlogImage; inline: BlogImage[] } {
  const mapping = SLUG_IMAGE_MAP[slug];

  // Fallback for unknown slugs
  if (!mapping) {
    const fallbackPool = IMAGE_POOLS['recovery'];
    return {
      hero: fallbackPool[0],
      inline: [fallbackPool[1], fallbackPool[2]],
    };
  }

  const heroPool = IMAGE_POOLS[mapping.hero];
  const inlinePool = IMAGE_POOLS[mapping.pool];

  // Use slug hash to vary which image from the pool is selected
  // This prevents adjacent articles in the same pool from getting identical images
  const hashCode = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heroIndex = hashCode % heroPool.length;
  const inlineStart = (hashCode + 1) % inlinePool.length;
  const inlineNext = (hashCode + 2) % inlinePool.length;

  return {
    hero: heroPool[heroIndex],
    inline: [
      inlinePool[inlineStart],
      inlinePool[inlineNext],
    ],
  };
}
