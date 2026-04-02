// ============================================================
// Blog Posts — Static content for SEO and content marketing
// ============================================================

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  author: string;
  readTime: string;
  tags: string[];
  image?: string; // Featured image URL
  content: string; // HTML
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-break-phone-addiction',
    title: 'How to Break a Phone Addiction: A Science-Based Guide',
    description: 'Practical strategies backed by neuroscience research to reduce screen time and build healthier digital habits without willpower alone.',
    date: '2026-03-28',
    author: 'Be Candid Team',
    readTime: '8 min read',
    tags: ['screen time', 'digital wellness', 'habits'],
    content: `
      <p>Your phone isn't just a device — it's a dopamine delivery system engineered by thousands of the world's brightest minds to keep you scrolling. Breaking free isn't about willpower. It's about understanding the mechanics and building systems that work <em>with</em> your brain, not against it.</p>

      <h2>Why Willpower Alone Fails</h2>
      <p>Research from the American Psychological Association shows that willpower is a finite resource. Every time you resist checking your phone, you deplete a small amount of self-control. By evening, most people have exhausted their daily supply — which is why late-night scrolling is so common.</p>
      <p>The solution isn't trying harder. It's designing your environment so you don't need to try at all.</p>

      <h2>The Accountability Approach</h2>
      <p>Studies consistently show that people who share their goals with an accountability partner are 65% more likely to achieve them. When it comes to screen time, having someone who sees your patterns — without judgment — creates a powerful incentive to stay aligned with your values.</p>
      <p>This is the core insight behind Be Candid: accountability works better than restriction. Instead of blocking apps (which you'll just work around), you build awareness of your patterns and share that awareness with someone you trust.</p>

      <h2>Practical Steps to Start Today</h2>
      <h3>1. Track Before You Change</h3>
      <p>Spend one week simply observing your screen time without trying to change it. Note when you reach for your phone, what you're feeling, and what triggers the impulse. Awareness is the first step — you can't change what you can't see.</p>

      <h3>2. Identify Your Triggers</h3>
      <p>Most phone use isn't random. It's triggered by specific emotions: boredom, anxiety, loneliness, stress. Jay Stringer's research shows that unwanted behavior always has tributaries — emotional currents that feed into the moment of action. Map yours.</p>

      <h3>3. Create Friction</h3>
      <p>Move your most-used apps off the home screen. Turn off all non-essential notifications. Charge your phone in another room at night. Each layer of friction gives your conscious mind a chance to intervene before autopilot takes over.</p>

      <h3>4. Find an Accountability Partner</h3>
      <p>Share your screen time goals with someone you trust. Not to be policed, but to be known. The research is clear: transparency — not surveillance — is what drives lasting behavior change.</p>

      <h3>5. Replace, Don't Just Remove</h3>
      <p>If you remove scrolling without replacing it with something meaningful, the void will pull you back. Identify what you're actually seeking (connection, stimulation, rest) and find healthier ways to meet that need.</p>

      <h2>The Role of Self-Compassion</h2>
      <p>Here's what most productivity content gets wrong: shame doesn't work. Research by Dr. Kristin Neff shows that self-compassion — not self-criticism — is the strongest predictor of behavior change. When you slip up, curiosity beats contempt every time.</p>
      <p>As Fred Rogers said: anything that's human is mentionable, and anything that is mentionable can be more manageable.</p>

      <h2>Start Your Journey</h2>
      <p>Breaking a phone addiction isn't a single decision — it's a series of small, honest moments where you choose alignment over autopilot. Be Candid was built to support exactly this kind of journey: no shame, no surveillance, just radical honesty with yourself and someone you trust.</p>
    `,
  },
  {
    slug: 'screen-time-accountability-for-couples',
    title: 'Screen Time Accountability for Couples: Building Trust in the Digital Age',
    description: 'How couples can navigate screen time transparency, rebuild digital trust, and strengthen their relationship through honest accountability.',
    date: '2026-03-25',
    author: 'Be Candid Team',
    readTime: '7 min read',
    tags: ['relationships', 'accountability', 'couples'],
    content: `
      <p>Digital trust is the new frontier of modern relationships. When a partner's screen time becomes a source of anxiety, secrecy, or conflict, the issue isn't really about the phone — it's about connection.</p>

      <h2>The Trust Paradox</h2>
      <p>Here's the paradox: demanding to see a partner's phone destroys trust. But hiding your screen habits also destroys trust. The solution isn't surveillance or secrecy — it's voluntary transparency.</p>
      <p>When one partner willingly shares their digital patterns with the other, it communicates something powerful: "I have nothing to hide, and I want you to feel safe."</p>

      <h2>What Healthy Digital Accountability Looks Like</h2>
      <p>Healthy accountability between partners isn't about control. It's about creating a shared commitment to honesty. Here's what it looks like in practice:</p>

      <h3>Mutual, Not One-Sided</h3>
      <p>Both partners participate. Accountability that only flows in one direction breeds resentment. When both people are open about their screen habits, it creates equality and shared vulnerability.</p>

      <h3>Pattern-Focused, Not Surveillance</h3>
      <p>Good accountability tracks categories and time, not specific URLs or messages. Your partner sees that you spent 2 hours on social media — not which posts you liked. Privacy and transparency can coexist.</p>

      <h3>Compassionate, Not Punitive</h3>
      <p>When a difficult pattern shows up, the response should be curiosity, not punishment. "I noticed your screen time spiked this week — how are you doing?" is fundamentally different from "Why were you on your phone so much?"</p>

      <h2>Starting the Conversation</h2>
      <p>If you're considering introducing digital accountability into your relationship, lead with vulnerability. Share your own struggles first. Explain what you're hoping to gain — not what you're afraid your partner is doing.</p>
      <p>Frame it as a shared project, not an intervention. You're building something together, not fixing something broken.</p>

      <h2>When Professional Help Is Needed</h2>
      <p>If screen time has become a source of significant conflict, betrayal, or addiction in your relationship, consider working with a therapist who specializes in digital wellness or relationship recovery. Be Candid integrates with therapist connections for exactly this reason.</p>
    `,
  },
  {
    slug: 'digital-wellness-guide',
    title: 'The Complete Digital Wellness Guide: Aligning Screen Time with Your Values',
    description: 'A comprehensive guide to digital wellness — understanding your relationship with technology and building habits that reflect who you want to be.',
    date: '2026-03-20',
    author: 'Be Candid Team',
    readTime: '10 min read',
    tags: ['digital wellness', 'values', 'self-improvement'],
    content: `
      <p>Digital wellness isn't about using your phone less. It's about using it in ways that align with the person you want to be. The goal isn't zero screen time — it's intentional screen time.</p>

      <h2>What Is Digital Wellness?</h2>
      <p>Digital wellness is the practice of using technology in a way that supports your physical, mental, and relational health. It means your screen habits reflect your values, not your impulses.</p>
      <p>For some people, that means cutting social media. For others, it means being more present during family dinners. There's no universal prescription — only your honest assessment of whether your digital life matches your actual priorities.</p>

      <h2>The Alignment Framework</h2>
      <p>At Be Candid, we use an alignment framework: your digital behavior should align with your stated values. When there's a gap between who you say you want to be and how you actually spend your time online, that gap is worth exploring.</p>

      <h3>Step 1: Define Your Values</h3>
      <p>Write down the 5 things that matter most to you. Family. Faith. Health. Career. Creativity. Whatever they are, name them explicitly.</p>

      <h3>Step 2: Audit Your Screen Time</h3>
      <p>Look at your actual screen time data (your phone tracks this automatically). Compare how you spend your hours with your stated values. Where are the gaps?</p>

      <h3>Step 3: Set Alignment Goals</h3>
      <p>Instead of "use my phone less," try "spend less time on apps that don't serve my top 5 values." This is a fundamentally different — and more motivating — framing.</p>

      <h3>Step 4: Build Accountability</h3>
      <p>Share your alignment goals with someone you trust. Regular check-ins create gentle pressure to stay honest with yourself. This is the principle behind every accountability system, from AA to fitness coaching.</p>

      <h2>The Science of Digital Habits</h2>
      <p>Neuroscience research shows that digital habits follow the same loop as all habits: cue, routine, reward. Your phone buzzes (cue), you check it (routine), you get a dopamine hit from new information (reward).</p>
      <p>To change the habit, you can intervene at any point in the loop. Change the cue (turn off notifications). Change the routine (pick up a book instead). Change the reward (find the satisfaction in presence instead of scrolling).</p>

      <h2>Digital Wellness for Families</h2>
      <p>If you're a parent, your digital habits are being watched and absorbed by your children. Modeling healthy screen use is more effective than any screen time rule you could impose.</p>
      <p>Consider making digital wellness a family project: everyone shares their goals, everyone checks in, everyone celebrates progress. Be Candid's family features are designed for exactly this kind of shared journey.</p>

      <h2>The Long Game</h2>
      <p>Digital wellness is a practice, not a destination. You'll have good weeks and bad weeks. The goal isn't perfection — it's awareness. As long as you're paying attention to the gap between your values and your habits, you're moving in the right direction.</p>
    `,
  },
];
