export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  credentials?: string; // e.g., "LPC, LMFT"
  bio: string;
  longBio: string; // Full bio for author page
  image?: string;
  knowsAbout: string[];
  alumniOf?: string;
  sameAs?: string[]; // LinkedIn, Twitter, etc.
}

export const AUTHORS: Author[] = [
  {
    slug: 'be-candid-team',
    name: 'Be Candid Editorial Team',
    jobTitle: 'Editorial',
    bio: 'The Be Candid editorial team curates research-backed content on digital wellness, accountability, and behavioral health. All articles are reviewed by clinicians before publication.',
    longBio: 'The Be Candid Editorial Team is a group of writers, researchers, and clinicians dedicated to producing evidence-based content on digital accountability, screen time habits, and behavioral health. Every article on the Be Candid blog is reviewed by licensed clinicians to ensure accuracy and responsible messaging. We combine Jay Stringer\'s clinical framework, peer-reviewed research, and real-world user data to give you the most current and nuanced understanding of digital wellness.',
    knowsAbout: [
      'Digital wellness',
      'Screen time accountability',
      'Stringer Framework',
      'Compulsive digital behavior',
      'Accountability partnerships',
      'Digital addiction recovery',
    ],
    image: 'https://becandid.io/apple-touch-icon.png',
  },
  {
    slug: 'clinical-advisory',
    name: 'Be Candid Clinical Advisory Board',
    jobTitle: 'Clinical Review',
    credentials: 'Licensed therapists and counselors',
    bio: 'Be Candid\'s Clinical Advisory Board reviews research content for accuracy and therapeutic appropriateness. Board members are licensed in their respective jurisdictions.',
    longBio: 'The Be Candid Clinical Advisory Board comprises licensed professional counselors (LPC), marriage and family therapists (LMFT), and licensed clinical social workers (LCSW) who specialize in behavioral health, sexual integrity, and digital addiction. The board reviews all clinically-focused content on Be Candid before publication to ensure accuracy, ethical framing, and alignment with established therapeutic practices. Members must hold active licenses and have at least 5 years of clinical practice in relevant specialties.',
    knowsAbout: [
      'Clinical psychology',
      'Behavioral health',
      'Addiction recovery',
      'Stringer Framework',
      'Therapeutic interventions',
      'HIPAA compliance',
    ],
    image: 'https://becandid.io/apple-touch-icon.png',
  },
];

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find(a => a.slug === slug);
}

export function getAuthorByName(name: string): Author | undefined {
  const normalized = name.toLowerCase();
  if (normalized.includes('be candid team') || normalized.includes('editorial')) {
    return AUTHORS.find(a => a.slug === 'be-candid-team');
  }
  if (normalized.includes('clinical')) {
    return AUTHORS.find(a => a.slug === 'clinical-advisory');
  }
  return AUTHORS.find(a => a.name.toLowerCase() === normalized);
}
