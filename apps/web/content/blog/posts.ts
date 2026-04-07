// ============================================================
// Blog Posts — Static content for SEO and content marketing
// ============================================================

import { BLOG_POSTS_BATCH2 } from './posts-batch2';
import { BLOG_POSTS_BATCH3 } from './posts-batch3';
import { BLOG_POSTS_BATCH4 } from './posts-batch4';

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
  {
    slug: 'covenant-eyes-alternatives',
    title: 'Covenant Eyes Alternatives: Why Accountability Beats Surveillance',
    description:
      'Comparing accountability-first tools like Be Candid with screenshot-based monitoring like Covenant Eyes — and why the philosophical difference matters for lasting change.',
    date: '2026-04-04',
    author: 'Be Candid Team',
    readTime: '7 min read',
    tags: ['accountability', 'covenant eyes', 'porn addiction recovery'],
    content: `
      <p>If you have ever searched for accountability software, you have almost certainly come across Covenant Eyes. It has been around for over two decades, and for many people it has been a genuine lifeline. We respect that. But if you are here reading about alternatives, something about the approach probably does not feel right for you — and that instinct is worth exploring.</p>

      <h2>How Covenant Eyes Works</h2>
      <p>Covenant Eyes monitors your devices by capturing screenshots of your activity at regular intervals. Those screenshots are analyzed by an AI system and flagged if they contain potentially problematic content. Your accountability partner — a spouse, friend, pastor, or mentor — receives a report that may include those flagged screenshots along with a summary of your browsing patterns.</p>
      <p>For some people, this works. The knowledge that someone will literally see what you are looking at creates a strong deterrent. If that is what you need right now, there is no shame in using it.</p>
      <p>But for many others, this model creates problems that undermine the very recovery it is trying to support.</p>

      <h2>The Problem with Screenshot Surveillance</h2>
      <h3>It Erodes Dignity</h3>
      <p>Recovery requires rebuilding your sense of self. When every click is captured and reviewed, the implicit message is: you cannot be trusted. That framing keeps you in a shame cycle rather than helping you grow out of it. Research consistently shows that shame is one of the least effective motivators for lasting behavior change.</p>

      <h3>It Strains Relationships</h3>
      <p>When a spouse is the accountability partner receiving screenshots, the dynamic shifts from partner to parole officer. The person in recovery feels surveilled. The partner receiving reports feels burdened with the role of monitor. Neither person asked for that dynamic, and it can damage the very relationship both people are trying to protect.</p>

      <h3>It Focuses on the Wrong Layer</h3>
      <p>Screenshots tell you <em>what</em> someone looked at. They tell you nothing about <em>why</em>. Was it a moment of loneliness? Stress from work? An old trigger pattern? The surface behavior is just the visible tip. Real recovery happens when you understand and address the emotional currents underneath.</p>

      <h2>The Accountability-First Alternative</h2>
      <p>Be Candid takes a fundamentally different approach. We believe that accountability should respect your dignity while still keeping you honest. Here is what that looks like in practice:</p>

      <h3>No Screenshots, No Browsing History</h3>
      <p>We do not capture screenshots of your screen. We do not log the specific websites you visit. Instead, Be Candid tracks patterns — categories of usage, time spent, and behavioral trends — without exposing the granular details that make surveillance feel dehumanizing.</p>

      <h3>Conversation Guides Instead of Reports</h3>
      <p>When Be Candid detects a pattern worth discussing, it does not just send a report to your accountability partner. It generates a conversation guide — a structured prompt that helps both of you talk about what is actually going on. Instead of "here is what they looked at," the framing becomes "here is a pattern worth exploring together."</p>

      <h3>A Therapist Portal for Professional Support</h3>
      <p>Be Candid includes a dedicated therapist portal so licensed professionals can be part of your accountability circle. Your therapist sees the patterns that matter for clinical insight without the voyeuristic detail of screenshot reports. This keeps accountability grounded in therapeutic best practices rather than surveillance logic.</p>

      <h3>Built on Research, Not Fear</h3>
      <p>Our approach draws on motivational interviewing principles, self-determination theory, and the work of researchers like Jay Stringer who study the emotional tributaries behind unwanted sexual behavior. Fear of being caught is a short-term motivator. Understanding yourself is a long-term one.</p>

      <h2>Who Is Be Candid For?</h2>
      <p>Be Candid is built for people who want to change — not people who need to be caught. If you are someone who has already acknowledged a problem and wants support that treats you like an adult, this approach will resonate.</p>
      <p>It is also built for partners and spouses who want to support recovery without becoming a warden. And for therapists who want clinical-grade insight without ethically questionable monitoring tools.</p>

      <h2>A Fair Comparison</h2>
      <p>Covenant Eyes and Be Candid are solving different problems with different philosophies. Covenant Eyes asks: how do we prevent someone from accessing harmful content? Be Candid asks: how do we help someone understand why they reach for it in the first place?</p>
      <p>Neither question is wrong. But we believe the second one leads to deeper, more sustainable change.</p>

      <h2>Try Be Candid Free</h2>
      <p>If you are looking for accountability that respects your dignity — software that helps you grow instead of just monitoring you — <strong>try Be Candid free</strong>. Accountability that treats you like the person you are becoming, not the person you are afraid of being.</p>
    `,
  },
  {
    slug: 'how-to-talk-to-partner-about-porn-addiction',
    title: 'How to Talk to Your Partner About Porn Addiction',
    description:
      'A practical guide to having the conversation about porn addiction with your partner — what to say, what not to say, and how to create space for honesty instead of shame.',
    date: '2026-03-31',
    author: 'Be Candid Team',
    readTime: '8 min read',
    tags: ['relationships', 'porn addiction', 'communication', 'couples'],
    content: `
      <p>This might be the hardest conversation you will ever have. Whether you are the one struggling or the one who just found out, the words you choose in this moment will shape everything that comes after. Get it right, and you open a door to real healing. Get it wrong, and that door slams shut — sometimes for years.</p>
      <p>This guide is for both sides of the conversation. The principles are the same regardless of which seat you are in: lead with honesty, stay curious, and resist the pull of shame.</p>

      <h2>Before You Say Anything</h2>
      <h3>Check Your Timing</h3>
      <p>Do not have this conversation in the heat of a fight. Do not bring it up right before bed, during a family gathering, or when either of you is exhausted. Choose a moment when you both have emotional bandwidth — a quiet evening, a weekend morning, a walk where you are side by side rather than face to face. Side-by-side conversations feel less confrontational and often lead to more honest exchanges.</p>

      <h3>Get Clear on Your Intention</h3>
      <p>Ask yourself: am I bringing this up to punish or to heal? If there is any part of you that wants to weaponize this information, wait. Process your own feelings first — with a therapist, a trusted friend, or in a journal. The conversation will still be there when you are ready to approach it with care instead of fury.</p>

      <h3>Prepare for Imperfection</h3>
      <p>This conversation will not go perfectly. Someone will say the wrong thing. There will be awkward silences. That is normal. You are not aiming for a flawless exchange — you are aiming for an honest one.</p>

      <h2>If You Are the One Struggling</h2>
      <h3>Lead with Vulnerability, Not Confession</h3>
      <p>There is a difference between dumping every detail on your partner and honestly naming what you are going through. Your partner does not need a forensic account of your behavior. They need to hear three things: that you are struggling, that you want to change, and that you are asking for their support.</p>
      <p>Try something like: <em>"I need to tell you something that is hard for me to say. I have been struggling with porn, and it is not who I want to be. I am telling you because I do not want to carry this alone anymore, and because you deserve honesty."</em></p>

      <h3>Do Not Minimize or Rationalize</h3>
      <p>Resist the urge to soften the truth with qualifiers like "it was only a few times" or "everyone does it." Minimizing signals that you are not taking it seriously, which makes your partner feel like their reaction is an overreaction. Name the problem plainly. Your partner can handle the truth better than they can handle feeling gaslit.</p>

      <h3>Give Them Space to React</h3>
      <p>Your partner may cry, get angry, go quiet, or ask to leave the room. All of those responses are valid. Do not rush to fix their feelings. Do not say "please do not be upset." Sit with the discomfort. Their reaction is not your enemy — it is their honest response, and it deserves room to exist.</p>

      <h2>If You Are the One Who Found Out</h2>
      <h3>Ask "What Do You Need?" Not "Why Did You Do This?"</h3>
      <p>Your first instinct will be to ask why. That is understandable. But "why" in this moment almost always sounds like an accusation, and it will push your partner into defense mode. A more productive opening is: <em>"I need some time to process this. Can you tell me what you need from me right now?"</em></p>
      <p>This does two things: it buys you processing time, and it signals that you are willing to engage rather than just react.</p>

      <h3>Separate the Person from the Behavior</h3>
      <p>This is critical. Your partner is not their worst behavior. Addiction — and compulsive sexual behavior often functions like addiction — hijacks the brain's reward system. That does not excuse anything, but it does provide context. You can be deeply hurt by what someone did while still holding space for the person they are trying to become.</p>

      <h3>Resist the Urge to Investigate</h3>
      <p>The desire to know every detail — what, when, how often, what kind — is powerful. But that information rarely helps you heal. It usually creates intrusive mental images that haunt you for months. Ask for what you genuinely need to feel safe. That might be transparency about current behavior and a plan for change. It probably is not a full browsing history.</p>

      <h2>What Not to Say</h2>
      <ul>
        <li><strong>"Am I not enough for you?"</strong> — This frames their struggle as your failure, which it is not. Porn addiction is not about the partner's attractiveness or adequacy.</li>
        <li><strong>"You are disgusting."</strong> — Shame drives compulsive behavior underground. It does not end it. The research is unambiguous on this point.</li>
        <li><strong>"I will never trust you again."</strong> — You might feel this right now, and that is valid. But stating it as a permanent verdict closes the door on the very recovery you might want later.</li>
        <li><strong>"Just stop."</strong> — If willpower alone could fix this, no one would struggle. Dismissing the complexity of the issue signals that you do not understand what they are facing.</li>
        <li><strong>"I need to see your phone."</strong> — Surveillance is not the same as accountability. One is imposed; the other is chosen. The difference matters enormously for long-term trust.</li>
      </ul>

      <h2>Building a Path Forward Together</h2>
      <h3>Agree on What Accountability Looks Like</h3>
      <p>Talk about what transparency and accountability mean to both of you. This is not one person setting rules for the other — it is a shared agreement. Maybe it means using an accountability tool together. Maybe it means regular check-in conversations. Maybe it means involving a therapist. The form matters less than the fact that you are both choosing it willingly.</p>

      <h3>Set Realistic Expectations</h3>
      <p>Recovery is not linear. There will be setbacks. Agreeing in advance on how to handle setbacks — without panic, without punishment, with honest conversation — makes them survivable rather than catastrophic.</p>

      <h3>Get Professional Support</h3>
      <p>A therapist who specializes in sexual behavior or addiction can provide a framework that neither of you has to build from scratch. Couples therapy can also help you navigate the relational damage while individual therapy addresses the underlying patterns. You do not have to figure this out alone.</p>

      <h2>When You Need Help with the Conversation</h2>
      <p><strong>Be Candid generates conversation guides for exactly these moments.</strong> When patterns emerge that are worth discussing, Be Candid does not just flag them — it provides a structured, compassionate framework for the conversation itself. Because knowing something needs to be said is only half the battle. Knowing <em>how</em> to say it is the other half.</p>
    `,
  },
  ...BLOG_POSTS_BATCH2,
  ...BLOG_POSTS_BATCH3,
  ...BLOG_POSTS_BATCH4,
];
