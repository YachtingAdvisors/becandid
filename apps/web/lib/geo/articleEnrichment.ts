// GEO article enrichment utilities
// Extract mentions, derive sections, compute word counts for enhanced schema

const KNOWN_PRODUCTS = [
  'Covenant Eyes',
  'Ever Accountable',
  'Accountable2You',
  'Bark',
  'Qustodio',
  'Net Nanny',
  'Canopy',
  'Mobicip',
  'Circle',
  'Screen Time',
  'Apple Screen Time',
  'Google Family Link',
  'Be Candid',
];

const KNOWN_ENTITIES = [
  'Jay Stringer',
  'Brené Brown',
  'HIPAA',
  'APA',
  'World Health Organization',
  'WHO',
  'CDC',
  'NIH',
  'American Psychological Association',
];

export function extractMentions(html: string): string[] {
  const text = html.replace(/<[^>]+>/g, ' ');
  const found = new Set<string>();

  for (const product of KNOWN_PRODUCTS) {
    if (text.includes(product)) found.add(product);
  }
  for (const entity of KNOWN_ENTITIES) {
    if (text.includes(entity)) found.add(entity);
  }

  return Array.from(found);
}

const SECTION_MAP: Record<string, string> = {
  'porn addiction': 'Addiction Recovery',
  recovery: 'Addiction Recovery',
  accountability: 'Digital Accountability',
  'screen time': 'Digital Wellness',
  'phone addiction': 'Digital Wellness',
  'mental health': 'Mental Health',
  relationships: 'Relationships',
  faith: 'Faith & Recovery',
  christian: 'Faith & Recovery',
  statistics: 'Research & Statistics',
  research: 'Research & Statistics',
  'covenant eyes': 'Product Comparisons',
  comparison: 'Product Comparisons',
  'self-compassion': 'Personal Growth',
  'digital wellness': 'Digital Wellness',
};

export function deriveSection(tags: string[]): string {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    for (const [keyword, section] of Object.entries(SECTION_MAP)) {
      if (lower.includes(keyword)) return section;
    }
  }
  return 'Digital Wellness';
}

export function computeWordCount(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.split(' ').filter(Boolean).length;
}

export function extractAboutTopics(
  tags: string[]
): { '@type': string; name: string }[] {
  return tags.slice(0, 5).map((tag) => ({
    '@type': 'Thing',
    name: tag,
  }));
}
