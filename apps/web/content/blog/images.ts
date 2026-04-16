// Curated stock images for blog articles
// Uses Unsplash source URLs (free, no API key needed)
import type { BlogImage } from './posts';

// Topic-based inline image pools — each article gets 2 inline images matched to its theme.
// Pools are intentionally large (10+ each) so adjacent articles rarely collide.
const IMAGE_POOLS: Record<string, BlogImage[]> = {
  'phone-addiction': [
    { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80', alt: 'Person looking at phone in dim light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1200&q=80', alt: 'Smartphone on wooden table', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', alt: 'Person walking outdoors without phone', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=1200&q=80', alt: 'Phone screen glowing in the dark', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80', alt: 'Hands reaching for smartphone on nightstand', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80', alt: 'Person scrolling phone in cafe', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=1200&q=80', alt: 'Phone notifications at night', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1606293926249-ed22bf0bf5f4?w=1200&q=80', alt: 'Phone face-down on desk', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&q=80', alt: 'Screen time limit displayed', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=1200&q=80', alt: 'Person choosing to put phone away', credit: 'Unsplash' },
  ],
  'accountability': [
    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80', alt: 'Friends having a supportive conversation', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80', alt: 'Two people shaking hands in trust', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1200&q=80', alt: 'People sitting together in deep conversation', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80', alt: 'Group gathered around table in community', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80', alt: 'People supporting each other outdoors', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1522202195465-4f0b3a635d9b?w=1200&q=80', alt: 'Mentor talking with another person', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&q=80', alt: 'Two friends walking and talking', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?w=1200&q=80', alt: 'Hand offering support to another', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80', alt: 'Small group circle of support', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1530041539828-114de669390e?w=1200&q=80', alt: 'People in honest conversation at sunset', credit: 'Unsplash' },
  ],
  'mental-health': [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80', alt: 'Person meditating at sunrise', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80', alt: 'Peaceful nature scene with sunlight', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&q=80', alt: 'Person journaling in quiet space', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=1200&q=80', alt: 'Calm lake reflecting mountains', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&q=80', alt: 'Person sitting quietly with eyes closed', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&q=80', alt: 'Hands holding warm drink and journal', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1502325966718-85a90488dc29?w=1200&q=80', alt: 'Window light on a resting hand', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&q=80', alt: 'Quiet morning with plants and light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=1200&q=80', alt: 'Person looking out window thoughtfully', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&q=80', alt: 'Person standing in warm sunlight', credit: 'Unsplash' },
  ],
  'recovery': [
    { url: 'https://images.unsplash.com/photo-1502101872923-d48509bff386?w=1200&q=80', alt: 'Sunrise over mountain path', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80', alt: 'Foggy forest trail leading forward', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', alt: 'Mountain peak at golden hour', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', alt: 'Sunlight streaming through forest canopy', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1200&q=80', alt: 'Path winding toward the horizon', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', alt: 'Stars over mountain silhouette', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', alt: 'Reflective lake with mountains', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=1200&q=80', alt: 'Person walking through light forest', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1520962922320-2038eebab146?w=1200&q=80', alt: 'Sunrise breaking through clouds', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1200&q=80', alt: 'Ocean meeting sky at dawn', credit: 'Unsplash' },
  ],
  'relationships': [
    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80', alt: 'Couple walking together on a path', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=80', alt: 'Two people holding hands', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&q=80', alt: 'Group of friends laughing together', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&q=80', alt: 'Couple having coffee and talking', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1200&q=80', alt: 'Two people sharing a quiet moment together', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80', alt: 'Family sharing a meal', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80', alt: 'Intimate conversation by window light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1523008099718-2fabf3a9ed9a?w=1200&q=80', alt: 'Partners walking on beach at sunset', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80', alt: 'Two hands linked together', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1595035207848-a6c6c6da01d9?w=1200&q=80', alt: 'Couple laughing together authentically', credit: 'Unsplash' },
  ],
  'technology': [
    { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80', alt: 'Abstract technology network', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80', alt: 'People working with screens', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80', alt: 'Code on computer screen', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80', alt: 'Laptop with abstract digital display', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80', alt: 'Matrix-style data visualization', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', alt: 'Circuit board macro view', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80', alt: 'Abstract code patterns on dark background', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80', alt: 'Data analytics dashboard', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80', alt: 'Blurred server network lights', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80', alt: 'Minimalist workspace with laptop', credit: 'Unsplash' },
  ],
  'self-compassion': [
    { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80', alt: 'Person sitting peacefully by water', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80', alt: 'Warm light through window', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&q=80', alt: 'Person running freely outdoors', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&q=80', alt: 'Hourglass with warm golden light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=1200&q=80', alt: 'Person stretching in morning light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&q=80', alt: 'Open hand reaching toward sunlight', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80', alt: 'Gentle morning light on grass', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=1200&q=80', alt: 'Soft candlelight in quiet room', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=1200&q=80', alt: 'Hands cradling hot tea mug', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=1200&q=80', alt: 'Person breathing in open air', credit: 'Unsplash' },
  ],
  'faith': [
    { url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80', alt: 'Open Bible with warm light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80', alt: 'Church steeple against blue sky', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80', alt: 'People praying together in circle', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=1200&q=80', alt: 'Cross silhouetted against sunrise', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519491050282-cf00c82a28a4?w=1200&q=80', alt: 'Small group Bible study', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80', alt: 'Candle and old Bible', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=1200&q=80', alt: 'Sanctuary with warm light', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1507692812060-98338d07aca3?w=1200&q=80', alt: 'Hands clasped in prayer', credit: 'Unsplash' },
  ],
  'privacy': [
    { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80', alt: 'Lock icon on digital screen representing privacy', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&q=80', alt: 'Laptop with privacy shield concept', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&q=80', alt: 'Person using laptop with secure connection', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80', alt: 'Closed padlock symbolizing data protection', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80', alt: 'Server room with secure infrastructure', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80', alt: 'Curtained window symbolizing private space', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1526925539332-aa3b66e35444?w=1200&q=80', alt: 'Hand pulling back a curtain', credit: 'Unsplash' },
  ],
  'statistics': [
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80', alt: 'Laptop showing graphs and statistics', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80', alt: 'Notebook with charts and pen', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80', alt: 'Research papers and data on desk', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80', alt: 'Abstract pie chart and bar graphs', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80', alt: 'Hands pointing at printed chart', credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80', alt: 'Abstract data visualization on screen', credit: 'Unsplash' },
  ],
};

// HERO_IMAGES: explicit, curated, UNIQUE hero image per article slug.
// Every entry below is guaranteed distinct — no two articles share a hero.
// Selected for topical relevance and visual quality.
const HERO_IMAGES: Record<string, BlogImage> = {
  // Original / foundational posts
  'accountability-dignity-privacy': {
    url: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=1600&q=80',
    alt: 'Dignified silhouette at sunrise',
    credit: 'Unsplash',
  },
  'accountability-industry-rising-addiction-rates-2026': {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80',
    alt: 'Rising analytics chart representing addiction trends',
    credit: 'Unsplash',
  },
  'big-tech-mental-health-crisis-profit': {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80',
    alt: 'Dense big-tech city lights from above',
    credit: 'Unsplash',
  },
  'chasing-to-building-channeling-energy-into-creation': {
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80',
    alt: 'Craftsman at workbench building with hands',
    credit: 'Unsplash',
  },
  'controlling-to-surrendering-trusting-uncertainty': {
    url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1600&q=80',
    alt: 'Open hands releasing in soft light',
    credit: 'Unsplash',
  },
  'escaping-to-presence-grounding-screen-addiction': {
    url: 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=1600&q=80',
    alt: 'Bare feet grounded on warm earth',
    credit: 'Unsplash',
  },
  'fantasizing-to-connecting-risking-real-intimacy': {
    url: 'https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=1600&q=80',
    alt: 'Two people in vulnerable conversation',
    credit: 'Unsplash',
  },
  'guarding-to-trusting-learning-safety-without-surveillance': {
    url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=1600&q=80',
    alt: 'Open gate leading into sunlight',
    credit: 'Unsplash',
  },
  'husband-phone-addiction-signs': {
    url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=1600&q=80',
    alt: 'Man distracted by phone at dinner table',
    credit: 'Unsplash',
  },
  'numbing-to-experiencing-feeling-emotions-without-phone': {
    url: 'https://images.unsplash.com/photo-1504199367641-aba8151af406?w=1600&q=80',
    alt: 'Person feeling rain on their face',
    credit: 'Unsplash',
  },
  'performing-to-belonging-enough-without-audience': {
    url: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=1600&q=80',
    alt: 'Empty theater seats and spotlight',
    credit: 'Unsplash',
  },
  'punishing-to-compassion-treating-yourself-like-someone-you-love': {
    url: 'https://images.unsplash.com/photo-1484069560501-87d72b0c3669?w=1600&q=80',
    alt: 'Arms wrapped around self in self-hug',
    credit: 'Unsplash',
  },
  'signs-husband-addicted-phone-what-to-do': {
    url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1600&q=80',
    alt: 'Couple on couch with phone between them',
    credit: 'Unsplash',
  },
  'why-covenant-eyes-fails-accountability-software-truth': {
    url: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1600&q=80',
    alt: 'Cracked screen representing broken surveillance model',
    credit: 'Unsplash',
  },
  'why-porn-blockers-dont-work': {
    url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1600&q=80',
    alt: 'Person stepping past a broken wall',
    credit: 'Unsplash',
  },

  // posts.ts main batch
  'how-to-break-phone-addiction': {
    url: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1600&q=80',
    alt: 'Hand placing phone in drawer at end of day',
    credit: 'Unsplash',
  },
  'digital-detox-guide': {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
    alt: 'Open trail into quiet mountains',
    credit: 'Unsplash',
  },
  'screen-time-impact-mental-health': {
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=80',
    alt: 'Calm nature contrast to screen overload',
    credit: 'Unsplash',
  },
  'accountability-partner-guide': {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80',
    alt: 'Two friends in honest conversation',
    credit: 'Unsplash',
  },
  'porn-addiction-recovery-guide': {
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=80',
    alt: 'Person walking into dawn along wooded path',
    credit: 'Unsplash',
  },
  'screen-time-accountability-for-couples': {
    url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=1600&q=80',
    alt: 'Couple having tea together without phones',
    credit: 'Unsplash',
  },
  'digital-wellness-guide': {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80',
    alt: 'Person meditating in morning light',
    credit: 'Unsplash',
  },
  'covenant-eyes-alternatives': {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
    alt: 'Circuit board representing accountability tech alternatives',
    credit: 'Unsplash',
  },
  'how-to-talk-to-partner-about-porn-addiction': {
    url: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=1600&q=80',
    alt: 'Couple having serious face-to-face conversation',
    credit: 'Unsplash',
  },

  // posts-batch2
  'science-behind-digital-accountability': {
    url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1600&q=80',
    alt: 'Scientific notebook with pen and brain sketch',
    credit: 'Unsplash',
  },
  'understanding-your-triggers': {
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1600&q=80',
    alt: 'Lightbulb moment of self-awareness',
    credit: 'Unsplash',
  },

  // posts-batch3
  'screen-time-mental-health': {
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1600&q=80',
    alt: 'Phone screen time chart displayed',
    credit: 'Unsplash',
  },
  'partners-guide-to-accountability': {
    url: 'https://images.unsplash.com/photo-1519635278078-669c89ac832e?w=1600&q=80',
    alt: 'Two partners walking path together',
    credit: 'Unsplash',
  },

  // posts-batch4
  'breaking-the-shame-cycle': {
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80',
    alt: 'Person emerging from dark into light',
    credit: 'Unsplash',
  },
  'gambling-addiction-digital-age': {
    url: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=1600&q=80',
    alt: 'Phone showing gambling app in dim light',
    credit: 'Unsplash',
  },

  // posts-batch5
  'signs-you-need-accountability-partner': {
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=80',
    alt: 'Small group of friends supporting one another',
    credit: 'Unsplash',
  },
  'therapists-guide-digital-accountability': {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80',
    alt: 'Therapist in clinical session with client',
    credit: 'Unsplash',
  },

  // posts-niche1
  'how-to-stop-doomscrolling': {
    url: 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=1600&q=80',
    alt: 'Endless scroll of feed on phone',
    credit: 'Unsplash',
  },
  'ai-chatbot-addiction': {
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80',
    alt: 'AI chat interface on laptop screen',
    credit: 'Unsplash',
  },

  // posts-niche2
  'revenge-bedtime-procrastination': {
    url: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=1600&q=80',
    alt: 'Bedroom at night lit only by phone screen',
    credit: 'Unsplash',
  },
  'signs-youre-a-workaholic': {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80',
    alt: 'Messy desk with laptop late at night',
    credit: 'Unsplash',
  },

  // posts-niche3
  'am-i-having-emotional-affair': {
    url: 'https://images.unsplash.com/photo-1552598105-e78f2cd78b60?w=1600&q=80',
    alt: 'Private text messages glowing on phone',
    credit: 'Unsplash',
  },
  'procrastination-shame-cycle': {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80',
    alt: 'Blank notebook awaiting action',
    credit: 'Unsplash',
  },

  // posts-niche4
  'social-media-addiction-adults': {
    url: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=1600&q=80',
    alt: 'Adult absorbed in social media feed',
    credit: 'Unsplash',
  },
  'self-harm-recovery-tools': {
    url: 'https://images.unsplash.com/photo-1528659882437-b89a74bc157f?w=1600&q=80',
    alt: 'Gentle hand cupping morning light',
    credit: 'Unsplash',
  },

  // posts-faith1 + faith2
  'should-christians-use-accountability-apps': {
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=80',
    alt: 'Open Bible with warm window light',
    credit: 'Unsplash',
  },
  'best-christian-accountability-apps-2026': {
    url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600&q=80',
    alt: 'Phone and Bible side by side',
    credit: 'Unsplash',
  },
  'porn-addiction-church-beyond-shame': {
    url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80',
    alt: 'Church interior bathed in forgiving light',
    credit: 'Unsplash',
  },
  'mens-accountability-group-church': {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1600&q=80',
    alt: "Men's small group in authentic conversation",
    credit: 'Unsplash',
  },

  // posts-stats (unique stat-themed heroes)
  'pornography-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80',
    alt: 'Analytics dashboard showing behavioral trends',
    credit: 'Unsplash',
  },
  'gambling-addiction-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=1600&q=80',
    alt: 'Poker chips with sobering statistics overlay',
    credit: 'Unsplash',
  },
  'social-media-addiction-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1600&q=80',
    alt: 'Social media icons and engagement metrics',
    credit: 'Unsplash',
  },
  'alcohol-substance-addiction-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1528806127525-a47f68f4b5d5?w=1600&q=80',
    alt: 'Dimly lit glass alongside research documents',
    credit: 'Unsplash',
  },
  'gaming-addiction-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    alt: 'Gaming controller beside data charts',
    credit: 'Unsplash',
  },
  'eating-disorder-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1600&q=80',
    alt: 'Empty plate on softly lit table',
    credit: 'Unsplash',
  },
  'ai-chatbot-addiction-statistics-2026': {
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=80',
    alt: 'AI brain graphic alongside usage data',
    credit: 'Unsplash',
  },

  // Comparison / alternative articles (newest)
  'best-covenant-eyes-alternative-privacy': {
    url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=80',
    alt: 'Digital lock representing privacy-first accountability',
    credit: 'Unsplash',
  },
  'accountability-app-without-vpn-no-screenshots': {
    url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&q=80',
    alt: 'Laptop with secure, unmonitored connection',
    credit: 'Unsplash',
  },
  'covenant-eyes-vs-be-candid-comparison': {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80',
    alt: 'Two paths diverging — comparing two approaches',
    credit: 'Unsplash',
  },
};

// Topic pool assignment for inline images (duplication here is fine — inlines are secondary)
const INLINE_POOL_MAP: Record<string, string> = {
  'accountability-dignity-privacy': 'accountability',
  'accountability-industry-rising-addiction-rates-2026': 'recovery',
  'big-tech-mental-health-crisis-profit': 'mental-health',
  'chasing-to-building-channeling-energy-into-creation': 'self-compassion',
  'controlling-to-surrendering-trusting-uncertainty': 'recovery',
  'escaping-to-presence-grounding-screen-addiction': 'mental-health',
  'fantasizing-to-connecting-risking-real-intimacy': 'relationships',
  'guarding-to-trusting-learning-safety-without-surveillance': 'accountability',
  'husband-phone-addiction-signs': 'relationships',
  'numbing-to-experiencing-feeling-emotions-without-phone': 'mental-health',
  'performing-to-belonging-enough-without-audience': 'self-compassion',
  'punishing-to-compassion-treating-yourself-like-someone-you-love': 'self-compassion',
  'signs-husband-addicted-phone-what-to-do': 'relationships',
  'why-covenant-eyes-fails-accountability-software-truth': 'privacy',
  'why-porn-blockers-dont-work': 'technology',
  'how-to-break-phone-addiction': 'phone-addiction',
  'digital-detox-guide': 'recovery',
  'screen-time-impact-mental-health': 'mental-health',
  'accountability-partner-guide': 'accountability',
  'porn-addiction-recovery-guide': 'recovery',
  'screen-time-accountability-for-couples': 'relationships',
  'digital-wellness-guide': 'self-compassion',
  'covenant-eyes-alternatives': 'privacy',
  'how-to-talk-to-partner-about-porn-addiction': 'relationships',
  'science-behind-digital-accountability': 'statistics',
  'understanding-your-triggers': 'mental-health',
  'screen-time-mental-health': 'phone-addiction',
  'partners-guide-to-accountability': 'accountability',
  'breaking-the-shame-cycle': 'self-compassion',
  'gambling-addiction-digital-age': 'technology',
  'signs-you-need-accountability-partner': 'accountability',
  'therapists-guide-digital-accountability': 'mental-health',
  'how-to-stop-doomscrolling': 'phone-addiction',
  'ai-chatbot-addiction': 'technology',
  'revenge-bedtime-procrastination': 'phone-addiction',
  'signs-youre-a-workaholic': 'mental-health',
  'am-i-having-emotional-affair': 'relationships',
  'procrastination-shame-cycle': 'self-compassion',
  'social-media-addiction-adults': 'phone-addiction',
  'self-harm-recovery-tools': 'recovery',
  'should-christians-use-accountability-apps': 'faith',
  'best-christian-accountability-apps-2026': 'faith',
  'porn-addiction-church-beyond-shame': 'faith',
  'mens-accountability-group-church': 'faith',
  'pornography-statistics-2026': 'statistics',
  'gambling-addiction-statistics-2026': 'statistics',
  'social-media-addiction-statistics-2026': 'statistics',
  'alcohol-substance-addiction-statistics-2026': 'statistics',
  'gaming-addiction-statistics-2026': 'statistics',
  'eating-disorder-statistics-2026': 'statistics',
  'ai-chatbot-addiction-statistics-2026': 'statistics',
  'best-covenant-eyes-alternative-privacy': 'accountability',
  'accountability-app-without-vpn-no-screenshots': 'privacy',
  'covenant-eyes-vs-be-candid-comparison': 'privacy',
};

export function getArticleImages(slug: string): { hero: BlogImage; inline: BlogImage[] } {
  // Hero: explicit, unique per article
  const hero =
    HERO_IMAGES[slug] ??
    {
      url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=80',
      alt: 'Path forward at sunrise',
      credit: 'Unsplash',
    };

  // Inline images: from topic pool, varied by slug hash
  const poolKey = INLINE_POOL_MAP[slug] ?? 'recovery';
  const inlinePool = IMAGE_POOLS[poolKey] ?? IMAGE_POOLS['recovery'];
  const hashCode = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const inlineStart = hashCode % inlinePool.length;
  const inlineNext = (hashCode + 3) % inlinePool.length;

  return {
    hero,
    inline: [
      inlinePool[inlineStart],
      inlinePool[inlineNext === inlineStart ? (inlineNext + 1) % inlinePool.length : inlineNext],
    ],
  };
}
