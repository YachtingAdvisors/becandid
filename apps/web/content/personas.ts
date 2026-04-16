// ============================================================
// Persona Use Case Pages — programmatic SEO / GEO content
// ============================================================
// Each persona represents a specific audience with their own
// pain points, language, and path to Be Candid. Pages at
// /accountability-for/[slug] are generated from this data.
// ============================================================

export interface PersonaUseCase {
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  challenges: string[];
  howBeCandidHelps: string[];
  relevantFeatures: string[];
  testimonial?: { quote: string; name: string; role: string };
  faqs: { q: string; a: string }[];
  relatedBlogSlugs: string[];
}

export const PERSONAS: PersonaUseCase[] = [
  {
    slug: 'pastors',
    name: 'Pastors',
    heroImage:
      'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Accountability for the people who hold accountability for everyone else.',
    challenges: [
      'Carrying the weight of a congregation\'s expectations while privately struggling with phone, screen, or sexual integrity issues.',
      'The professional risk of asking for help — most accountability tools expose you to a board, an elder team, or a denominational review.',
      'Living in a fishbowl where any data leak, credit card entry, or app icon could become a story.',
      'Working long, isolated hours that push you toward compulsive screen use as a regulator.',
      'Being expected to model digital integrity to staff, students, and teenagers without a trustworthy path to get support yourself.',
    ],
    howBeCandidHelps: [
      'Never shows your partner your browsing history, search terms, or URLs — only behavioral signals that warrant a check-in.',
      'Runs on-device inference where possible so your patterns never become a searchable record anyone else can subpoena or screenshot.',
      'Lets you choose your accountability partner — a mentor, another pastor, a friend outside the congregation — not an elder board or denominational watchdog.',
      'Generates Motivational-Interviewing-based conversation guides so the partner knows how to walk with you without triggering shame.',
      'Gives you a Stringer-framework journaling tool that helps you understand the emotional tributaries underneath the behavior rather than just tracking incidents.',
      'Cancel anytime, no public billing trail — the charge on your statement is discreet and the account is yours alone.',
    ],
    relevantFeatures: [
      'Partner alerts without URLs or screenshots',
      'AES-256 encrypted journaling with therapist-aligned prompts',
      'Stringer Framework assessment for root-cause clarity',
      'Desktop screenshot analysis that never leaves your device',
      'One-tap contest for false positives (the research article, the sermon prep, the news story)',
      'Crisis check-ins routed to your chosen partner, not a system default',
    ],
    testimonial: {
      quote:
        'I\'ve been in ministry for 23 years. I\'ve used every accountability tool there is. Be Candid is the first one that didn\'t make me feel like my elders were watching me in the shower.',
      name: 'Lead pastor, midsize Evangelical church',
      role: 'Anonymous user, Be Candid Pro',
    },
    faqs: [
      {
        q: 'Will my accountability partner see what websites I visited?',
        a: 'No. Be Candid never shares URLs, search terms, or timestamps with your partner. They receive a behavioral signal — essentially a prompt that says "your partner could use your support right now" — and a conversation guide. The content itself is never in their view.',
      },
      {
        q: 'I\'m a pastor. Can I use this without my elder board having access?',
        a: 'Yes. Be Candid is an individual account. You choose your partner. There is no organizational admin, no elder-board dashboard, and no reporting tier that exposes you to ministry leadership unless you explicitly invite them as your partner.',
      },
      {
        q: 'What does the charge on my credit card look like?',
        a: 'It appears as "BeCandid" — not "porn addiction app" or any similar descriptor. If you need additional discretion, we accept payment via any standard method and never send marketing email that references specific content categories.',
      },
      {
        q: 'Does Be Candid integrate with my counselor?',
        a: 'Yes. If you already see a licensed therapist, our Therapy tier lets you grant read-only access to trend-level insights and (if you choose) shared journal entries. Your therapist sees what helps them help you, not a surveillance log.',
      },
      {
        q: 'I preach on digital integrity. How do I recommend this to my congregation without disclosing my own use?',
        a: 'Be Candid is built to be recommended by leaders who also need it. Because the app is dignity-first and does not depend on shame narratives, you can share it as a resource without implying anything about your own story — and continue to use it yourself privately.',
      },
    ],
    relatedBlogSlugs: [
      'accountability-dignity-privacy',
      'best-covenant-eyes-alternative-privacy',
      'accountability-app-without-vpn-no-screenshots',
      'covenant-eyes-vs-be-candid-comparison',
    ],
  },
  {
    slug: 'therapists',
    name: 'Therapists and Counselors',
    heroImage:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Clinical-grade insight between sessions — without becoming a surveillance vendor.',
    challenges: [
      'Spending the first 15 minutes of each session trying to reconstruct what happened in your client\'s life since the last meeting.',
      'Clients who rely on memory (and defense mechanisms) to report their week, meaning the most important material never surfaces.',
      'Existing accountability tools force you into a surveillance role — reviewing browsing history you never wanted to see and that erodes the therapeutic alliance.',
      'No HIPAA-appropriate way to get continuous behavioral data without violating privacy norms or adding a compliance burden.',
      'Groups and SAA/SLAA clients who need ongoing support structure between weekly sessions.',
    ],
    howBeCandidHelps: [
      'Therapist portal shows trend-level data — sleep-disrupted usage, compulsive spikes, journal affect, Stringer-framework patterns — without URLs or screenshots.',
      'Journal entries your client chooses to share arrive pre-tagged with the tributary, unmet longing, and roadmap mapping — saving you assessment time.',
      'HIPAA-ready encryption architecture (AES-256 at rest, TLS 1.3 in transit, zero-knowledge partner access) designed for clinical use.',
      'Automated session-prep summary highlights what changed and what you should probably ask about, without ever exposing content you don\'t need.',
      'Client consent flows are explicit and revocable, so you stay aligned with professional ethics boards.',
      'Works alongside your existing EHR and practice management tools — Be Candid is a data source, not a replacement.',
    ],
    relevantFeatures: [
      'Therapist portal with trend-level dashboards',
      'Session-prep auto-summary',
      'Shared journal entries with Stringer tagging',
      'HIPAA-ready infrastructure and signed BAAs available',
      'Group practice and SAA/SLAA facilitator support',
      'Client consent, audit logs, and revocable access',
    ],
    testimonial: {
      quote:
        'I used to spend the first 15 minutes of every session trying to reconstruct what happened since our last meeting. Now I walk in already knowing — and my clients feel seen rather than watched.',
      name: 'Licensed Clinical Psychologist',
      role: 'Be Candid Therapy tier user',
    },
    faqs: [
      {
        q: 'Is Be Candid HIPAA-compliant?',
        a: 'Be Candid\'s infrastructure is HIPAA-ready: AES-256 encryption at rest, TLS 1.3 in transit, role-based access, audit logs, and a signed Business Associate Agreement available for the Therapy tier. Like any HIPAA workflow, compliance depends on your configuration; we provide the substrate your practice needs.',
      },
      {
        q: 'What exactly does the therapist portal show?',
        a: 'Trend-level behavioral data (daily/weekly patterns, compulsive spikes, sleep-disrupted usage), Stringer-framework tags from the journaling flow, affect trendlines, and any entries the client has explicitly chosen to share. It does not show URLs, search terms, app names, or screenshots.',
      },
      {
        q: 'How is this different from Covenant Eyes for clinical use?',
        a: 'Covenant Eyes was built as a surveillance product with a therapy add-on. Be Candid was built from the ground up for therapists: the portal, data model, and ethics flow were designed with licensed clinicians, not retrofitted for them. And nothing in Be Candid relies on the therapist acting as a content reviewer.',
      },
      {
        q: 'Can I recommend Be Candid to clients who aren\'t yet working with me?',
        a: 'Yes. The Pro tier (self-guided) and Therapy tier (clinician-linked) both exist. A client can start on Pro and upgrade to Therapy with you when they\'re ready. You\'re also welcome to use our free Therapist Resources library.',
      },
      {
        q: 'What about group therapy or recovery groups?',
        a: 'Be Candid supports facilitator views for SAA, SLAA, 12-step, and Christian recovery groups. Each member retains individual privacy; the facilitator sees participation signals and whatever the group has opted into — never content.',
      },
    ],
    relatedBlogSlugs: [
      'accountability-dignity-privacy',
      'accountability-industry-rising-addiction-rates-2026',
      'accountability-app-without-vpn-no-screenshots',
      'best-covenant-eyes-alternative-privacy',
    ],
  },
  {
    slug: 'college-students',
    name: 'College Students',
    heroImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Reclaim your attention without the parental-control vibes.',
    challenges: [
      'Phones designed to hijack your attention while you\'re trying to study, sleep, and build a life.',
      'Screen time numbers that quietly creep past 8–10 hours a day with nothing to show for it.',
      'Late-night doomscroll, reels binge, and pornography loops that eat sleep and mental clarity.',
      'Roommates, group chats, and dating app algorithms that all feel like variable-reward slot machines.',
      'Every existing accountability tool either treats you like a child (parental controls) or a suspect (surveillance apps).',
    ],
    howBeCandidHelps: [
      'Adult-peer accountability — pick a roommate, a friend, a sibling, or a mentor. No parental dashboards, no shaming reports.',
      'Measures what actually matters: attention fragmentation, sleep-displacing use, compulsive pattern spikes — not raw minutes.',
      'Stringer-framework journaling helps you name what you\'re actually reaching for when you pick up the phone (boredom, loneliness, avoidance, anxiety).',
      'Works without a VPN, without screenshots, without root access — your data stays yours.',
      'Free tier that actually works for a broke student budget, with Pro available at student pricing.',
      'Built for people who believe in values-based living rather than rule-based compliance.',
    ],
    relevantFeatures: [
      'Peer partner accountability (no parents required)',
      'Attention-fragmentation metrics, not just minutes',
      'Late-night and sleep-displacement alerts',
      'Stringer Framework journaling prompts',
      'Free forever tier with meaningful functionality',
      'Privacy architecture that treats students as adults',
    ],
    testimonial: {
      quote:
        'I tried every screen-time tool in the App Store. They all felt like they were built to punish me. Be Candid is the first one that feels like it actually respects that I\'m 21 and trying to figure my life out.',
      name: 'Junior, state university',
      role: 'Be Candid free-tier user',
    },
    faqs: [
      {
        q: 'Is Be Candid a parental control app?',
        a: 'No. Be Candid is designed for adults choosing their own accountability. There are no parent dashboards, no admin override modes, no "kid settings." If you\'re 18 or older and want to be responsible for your own digital life, this is built for you.',
      },
      {
        q: 'Will my accountability partner see my DMs or search history?',
        a: 'No. Be Candid never exposes URLs, DMs, search terms, or app-level content to your partner. They receive behavioral-pattern signals and conversation prompts — nothing else.',
      },
      {
        q: 'I\'m a student on a tight budget. What does this cost?',
        a: 'There is a genuinely useful free tier. Pro is $9.99/month (or less annually), and we offer student pricing. You can do most of the real work without ever paying.',
      },
      {
        q: 'Does it work on just my phone, or also my laptop?',
        a: 'Both. The mobile app covers iOS and Android, and the desktop app covers macOS and Windows. You get a unified picture across your devices.',
      },
      {
        q: 'Can I use this to get off porn without telling my parents?',
        a: 'Yes. Be Candid is an individual adult account. You pick your accountability partner — it can be a trusted friend, a therapist, no one at all, or nobody your family knows. Your account activity is never visible to anyone you haven\'t explicitly invited.',
      },
    ],
    relatedBlogSlugs: [
      'escaping-to-presence-grounding-screen-addiction',
      'numbing-to-experiencing-feeling-emotions-without-phone',
      'performing-to-belonging-enough-without-audience',
      'big-tech-mental-health-crisis-profit',
    ],
  },
  {
    slug: 'married-couples',
    name: 'Married Couples',
    heroImage:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Rebuild digital trust without turning your marriage into a surveillance operation.',
    challenges: [
      'One or both partners want accountability around phone use, porn, or emotional affairs, but every tool on the market feels like it\'s designed for suspects, not spouses.',
      'Post-discovery, the non-struggling partner often needs peace of mind while also not wanting to become a prison guard.',
      'Old-school accountability software sends browsing history that creates daily fights rather than real conversation.',
      'You want to stay together, grow together, and heal together — and the tools you\'ve tried so far have made you more isolated, not less.',
      'Different faith backgrounds, different intensities, different tolerances — and no tool that flexes for a real marriage.',
    ],
    howBeCandidHelps: [
      'Behavioral signals only — your spouse gets a "this is worth a check-in" alert, not a spreadsheet of URLs to obsess over.',
      'Motivational-Interviewing-based conversation guides help the non-struggling partner respond with curiosity rather than accusation.',
      'Shared commitments: both partners can be on the app, with mutual accountability rather than one-way surveillance.',
      'Disclosure and re-commitment workflows designed with couples therapists who specialize in infidelity recovery.',
      'Stringer-framework journal prompts give the struggling partner a structured path out of shame toward insight.',
      'Privacy architecture preserves dignity even during the hardest months — AES-256, local-first, no third-party sharing.',
    ],
    relevantFeatures: [
      'Mutual partner setup (both spouses accountable)',
      'Conversation guides for couples, not interrogations',
      'Post-disclosure rebuilding workflows',
      'Stringer-framework journaling for root-cause work',
      'Shared values and commitments dashboard',
      'Integration with licensed couples therapists',
    ],
    testimonial: {
      quote:
        'After the discovery we tried a major accountability app for six months. It turned our marriage into a stakeout. Be Candid is the first tool that actually helped us talk again — like partners, not like a parole officer and an inmate.',
      name: 'Married 14 years',
      role: 'Couples therapy client, Be Candid Therapy tier',
    },
    faqs: [
      {
        q: 'My spouse discovered my porn use. Should we use Be Candid?',
        a: 'Be Candid was explicitly designed for couples navigating discovery. The surveillance-style tools most couples try first often extend the shame cycle. Be Candid\'s behavioral-signal approach, conversation guides, and Stringer-framework journaling are built to support both partners through actual repair.',
      },
      {
        q: 'Does my spouse see every site I visit?',
        a: 'No. Your spouse sees behavioral signals — essentially a prompt that something warrants a conversation — along with guidance on how to check in. URLs, search terms, and content categories are never shown to them.',
      },
      {
        q: 'Can we both be on the app?',
        a: 'Yes, and we recommend it. Mutual accountability, where both spouses are working on their own digital integrity, produces much better outcomes than one-way monitoring.',
      },
      {
        q: 'What if we\'re not religious? Is this still for us?',
        a: 'Yes. Be Candid is values-based rather than religion-based. Many of our users come from Christian backgrounds, but the framework (Stringer) is clinically grounded and works for couples of any or no faith tradition.',
      },
      {
        q: 'Can our couples therapist see our Be Candid data?',
        a: 'Only if you invite them. The Therapy tier supports a shared read-only view for licensed clinicians, with explicit consent from both partners and full revocation controls.',
      },
    ],
    relatedBlogSlugs: [
      'husband-phone-addiction-signs',
      'guarding-to-trusting-learning-safety-without-surveillance',
      'fantasizing-to-connecting-risking-real-intimacy',
      'accountability-dignity-privacy',
    ],
  },
  {
    slug: 'christian-singles',
    name: 'Christian Singles',
    heroImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Pursue sexual integrity without building your identity around what you don\'t do.',
    challenges: [
      'Walking out of a sermon on purity with no actual tool to help you when you\'re alone at 11:47 PM.',
      'Shame-based accountability that confuses hiding for holiness — you stop getting caught, but nothing underneath actually changes.',
      'A Christian accountability market that\'s stuck in screenshot-and-surveillance mode and hasn\'t caught up with what clinical research actually says about compulsive behavior.',
      'Friends and small-group leaders who love you but don\'t know how to talk about this well.',
      'The awkwardness of signing up for an "accountability app" when half the existing ones feel like they\'re run by 1998.',
    ],
    howBeCandidHelps: [
      'Framework rooted in Jay Stringer\'s clinical work (Unwanted, The Journey of the Broken) — the gold standard in Christian-integrated sexual integrity.',
      'Your accountability partner gets conversation tools, not a URL log — meaning your friend becomes a companion, not a probation officer.',
      'Journaling prompts help you name the tributaries: the loneliness, the rejection, the comparison, the specific longings that get funneled toward porn or fantasy.',
      'Integrity measured over time — the app rewards re-commitment and honesty, not streaks-by-terror.',
      'No church-admin tier that lets your pastor pull your logs. Your account is yours.',
      'Scripture-compatible but never manipulative — Be Candid is a technology, not a ministry, and it respects your agency.',
    ],
    relevantFeatures: [
      'Stringer Framework assessment and journaling',
      'Partner conversation guides for Christian friendships',
      'Discreet billing and account privacy',
      'Cross-device (mobile + desktop) coverage',
      'Values-based commitments, not fear-based blocking',
      'Recovery-informed relapse workflow',
    ],
    testimonial: {
      quote:
        'I was on Covenant Eyes for eight years. Eight years of shame management that never got to the root. The Stringer work inside Be Candid helped me see in six months what none of that surveillance ever did.',
      name: 'Christian single, mid-30s',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'Is Be Candid a Christian app?',
        a: 'Be Candid is values-compatible with a Christian worldview, but we are not a ministry and we don\'t preach at users. Many of our users are Christian; many are not. The Stringer Framework that underpins our methodology comes from a clinician who works extensively with Christian clients but is grounded in peer-reviewed research, not doctrine.',
      },
      {
        q: 'Can my accountability partner be my pastor or small-group leader?',
        a: 'Yes, if you choose them. Be Candid does not add them automatically, and they cannot see your account unless you invite them. They receive behavioral signals and conversation guides, never URLs or search terms.',
      },
      {
        q: 'How is this different from Covenant Eyes or Accountable2You?',
        a: 'Those tools show your accountability partner a list of websites you visited. Be Candid does not. Instead, it gives the partner enough signal to know something is worth a conversation, plus clinically-grounded conversation tools to have that conversation well. We think that\'s what accountability was always supposed to be.',
      },
      {
        q: 'Does Be Candid block websites?',
        a: 'No. Blocking is a different class of tool and often counterproductive for adults — it teaches avoidance rather than integration. Be Candid focuses on awareness, partner conversation, and root-cause journaling. If you want a blocker, pair Be Candid with a separate tool like BlockerX or Cold Turkey.',
      },
      {
        q: 'What if I slip?',
        a: 'Slipping is treated as information, not moral failure. The app gently prompts you into a re-commitment and journaling flow based on the Stringer Framework, helping you name what actually happened emotionally — which is the only way the next moment goes differently.',
      },
    ],
    relatedBlogSlugs: [
      'fantasizing-to-connecting-risking-real-intimacy',
      'performing-to-belonging-enough-without-audience',
      'punishing-to-compassion-treating-yourself-like-someone-you-love',
      'covenant-eyes-vs-be-candid-comparison',
    ],
  },
  {
    slug: 'parents-of-teens',
    name: 'Parents of Teens',
    heroImage:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Model the digital life you want your kids to grow into.',
    challenges: [
      'You set rules for your teens about phones, games, and screens — and you secretly know your own use is just as compulsive.',
      'Teens who watch everything: they notice when your rules for them don\'t match how you actually live.',
      'Parental-control tools like Bark, Qustodio, and Canopy do useful work for kids — but there\'s nothing credible at the adult tier that isn\'t surveillance-coded.',
      'Guilt about modeling phone addiction to your children while also carrying the full cognitive load of family logistics through that same phone.',
      'Not wanting to trade one kind of shame (I\'m on my phone too much) for another (now there\'s an app monitoring me).',
    ],
    howBeCandidHelps: [
      'Built for adults who want genuine change, not performance — the whole product is oriented around self-awareness, not catching you.',
      'Partner with your spouse, a friend, or a peer mentor — no children or teens involved.',
      'Stringer-framework journaling helps you see the connection between your phone use and stress, family dynamics, and unmet longings.',
      'Sleep-displacement and late-night alerts give you a real picture of how screens are affecting family presence.',
      'Pairs cleanly with Bark, Qustodio, or Canopy on the kids\' devices — different tools for different life stages.',
      'You become the model for digital integrity in your household by actually doing the work, not by enforcement alone.',
    ],
    relevantFeatures: [
      'Adult-peer partner accountability',
      'Sleep and family-presence metrics',
      'Stringer-framework parenting journaling prompts',
      'Pairs with existing parental-control stacks',
      'Couples view (both parents accountable together)',
      'Values-based weekly reviews',
    ],
    testimonial: {
      quote:
        'I had a whole screen-time lecture ready for my 14-year-old until he calmly said, "Dad, you\'re on your phone for six hours a day." That was the moment I realized the problem wasn\'t his phone. Be Candid is how I\'m finally doing my own work.',
      name: 'Father of three',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'Is Be Candid a parental-control app?',
        a: 'No. Be Candid is for adults holding themselves accountable. For parental controls, we recommend Bark, Qustodio, or Canopy — and we\'ve written comparison posts to help you choose. Be Candid is what you use for yourself.',
      },
      {
        q: 'Should I use Be Candid on my teen\'s phone?',
        a: 'We don\'t recommend it. Teens need developmentally-appropriate parental tools. Be Candid is designed around adult self-determination and peer accountability — those assumptions don\'t hold for a 13-year-old.',
      },
      {
        q: 'My spouse and I both want accountability. Can we do it together?',
        a: 'Yes — we actively recommend it. Both spouses on the app, accountable to each other (and optionally a third mentor), tends to produce the best outcomes for families.',
      },
      {
        q: 'How is this going to change how I parent?',
        a: 'Modeling matters more than rules. When kids watch a parent do real work on their own phone habits — and talk about it honestly — it teaches them the metacognition that rules alone can\'t. Many of our parent users report the biggest impact wasn\'t on their own screen time, but on how their kids started relating to phones.',
      },
      {
        q: 'Can I pair this with my existing Bark setup?',
        a: 'Yes. Be Candid on the parents\' devices and Bark/Qustodio/Canopy on the kids\' devices is a clean, coherent setup. They don\'t overlap — they cover different life stages.',
      },
    ],
    relatedBlogSlugs: [
      'be-candid-vs-bark',
      'be-candid-vs-qustodio',
      'be-candid-vs-canopy',
      'big-tech-mental-health-crisis-profit',
    ],
  },
  {
    slug: 'remote-workers',
    name: 'Remote Workers',
    heroImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'When work and life share the same screen, you need an ally who knows the difference.',
    challenges: [
      'Work, social, news, and compulsive content all happen in the same browser, on the same laptop, often in the same hour.',
      'No commute, no office door, no built-in transitions — meaning the phone is the only buffer between deep work and collapse.',
      'Slack, email, and project tools that reward immediate response trained you into an always-on nervous system.',
      'Screen time metrics from iOS or Android don\'t distinguish between work and compulsion, which makes them almost useless for remote workers.',
      'Late-night doomscroll or porn relapse after a long day of Zoom fatigue, because your nervous system never got a proper off-ramp.',
    ],
    howBeCandidHelps: [
      'Distinguishes deep work from compulsive-pattern engagement by analyzing timing, duration, and behavioral signature, not just app minutes.',
      'Desktop-native app processes screenshots locally — your work documents and code never leave your machine.',
      'Stringer-framework journaling helps you see the exact moments work stress hands off to compulsive behavior.',
      'End-of-day transitions: a guided wind-down flow that shuts the work brain and prevents the midnight spiral.',
      'Works alongside focus apps (Opal, One Sec, Freedom) rather than competing with them.',
      'Partner alerts fire on real patterns, not on "you opened X app" — so your spouse or accountability partner isn\'t getting false alarms during a deadline sprint.',
    ],
    relevantFeatures: [
      'Local-first desktop screenshot analysis',
      'Deep work vs compulsive engagement detection',
      'End-of-day wind-down flow',
      'Stringer-framework journaling',
      'Sleep-displacement alerts for late-night spirals',
      'Plays nice with Opal, Freedom, One Sec',
    ],
    testimonial: {
      quote:
        'I work from home 100%. My laptop is my office, my distraction machine, my porn machine, and my relationship lifeline. Be Candid is the first tool that seems to understand all four are happening on the same device.',
      name: 'Product manager, fully remote',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'I look at a lot of random sites for work. Will Be Candid trigger false positives?',
        a: 'Sometimes, yes. Every detection system occasionally flags a research article, a documentary clip, or a news piece. Be Candid is built with a one-tap contest flow — you say "this wasn\'t what it looked like" and that feedback tunes the model, both globally and for your account. False positive rates drop meaningfully after a few weeks of use.',
      },
      {
        q: 'Does the desktop app send my screen to your servers?',
        a: 'No. The desktop app processes screenshots locally on your device. Only anonymized behavioral signals — not the raw images, not the text on your screen — are ever transmitted. Your client documents, your code, your messages: those stay on your machine.',
      },
      {
        q: 'Will this slow down my machine?',
        a: 'The desktop app is built in Electron with native-module performance optimizations and takes negligible CPU on modern laptops. If you notice any performance impact, our settings let you throttle scan frequency.',
      },
      {
        q: 'Can I pair this with Freedom or Opal?',
        a: 'Yes. Freedom and Opal are blockers — they gate access. Be Candid is an awareness and accountability layer. Running them together is a common, effective stack for remote workers.',
      },
      {
        q: 'Do I need an accountability partner, or can I use this solo?',
        a: 'You can use Be Candid entirely solo. The journaling, pattern analysis, and wind-down flows all work without a partner. A partner accelerates the process for many people, but it\'s optional.',
      },
    ],
    relatedBlogSlugs: [
      'escaping-to-presence-grounding-screen-addiction',
      'controlling-to-surrendering-trusting-uncertainty',
      'numbing-to-experiencing-feeling-emotions-without-phone',
      'accountability-app-without-vpn-no-screenshots',
    ],
  },
  {
    slug: 'content-creators',
    name: 'Content Creators',
    heroImage:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Your business runs on the platforms your nervous system can\'t handle.',
    challenges: [
      'Your livelihood depends on the same algorithmic feeds that are wrecking your attention.',
      'Analytics dopamine loops that keep you refreshing numbers instead of making things.',
      'Parasocial comment threads that chew through your day and your sense of self.',
      'No healthy off-ramp at the end of a post — the dopamine stays in the phone, and so do you.',
      'Existing "digital wellness" tools that tell you to touch grass without acknowledging that grass-touching doesn\'t pay your rent.',
    ],
    howBeCandidHelps: [
      'Distinguishes strategic platform time (posting, responding, research) from compulsive refresh — so your work hours count as work.',
      'Compulsive-pattern detection catches the 90-minute Reels spiral that started as "five minutes of competitive research."',
      'Stringer-framework journaling helps you see what you\'re actually reaching for when the numbers don\'t come in — validation, safety, belonging, or numbing.',
      'Sleep-displacement alerts catch the 2 AM analytics check that was never going to change anything.',
      'Partner accountability lets a peer creator or spouse hold you to the work-life boundary you publicly advocate for.',
      'Works on mobile and desktop, so the full spectrum of your platform life is visible.',
    ],
    relevantFeatures: [
      'Strategic vs compulsive platform-time detection',
      'Analytics-refresh pattern alerts',
      'Stringer-framework journaling',
      'Peer-creator partner accountability',
      'Sleep and recovery metrics',
      'Pairs with focus apps like One Sec and Opal',
    ],
    testimonial: {
      quote:
        'I post about mental health. And I was privately in the worst relationship with my own phone that I\'d ever had. Be Candid gave me a way to do real work without becoming my own cautionary tale.',
      name: 'Creator, 180K followers',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'My job is literally on social media. Will Be Candid treat all of that as bad?',
        a: 'No. Be Candid distinguishes strategic, work-aligned platform engagement from compulsive refresh and pattern escalation. It measures the shape of your engagement, not the category.',
      },
      {
        q: 'Can I use this without my audience finding out?',
        a: 'Yes. Be Candid is a private tool between you and your chosen accountability partner. Nothing is visible to your audience, your followers, or any public surface.',
      },
      {
        q: 'I\'m on the platforms 8–10 hours a day. Is there any hope?',
        a: 'Yes. The goal isn\'t to quit — it\'s to restore agency. Many creators we work with reduce reactive use dramatically without reducing output. The point is to take back the time the feed was taking from you without your consent.',
      },
      {
        q: 'Does Be Candid help with analytics addiction specifically?',
        a: 'Yes. The app detects repetitive analytics-refresh patterns and can (optionally) surface a gentle intervention, along with journaling prompts that help you work with the emotional material underneath.',
      },
      {
        q: 'Will my sponsors or agencies see any of this?',
        a: 'No. Be Candid has no integrations with brand platforms, ad accounts, or agency tools. Your data is exclusively yours.',
      },
    ],
    relatedBlogSlugs: [
      'performing-to-belonging-enough-without-audience',
      'chasing-to-building-channeling-energy-into-creation',
      'numbing-to-experiencing-feeling-emotions-without-phone',
      'big-tech-mental-health-crisis-profit',
    ],
  },
  {
    slug: 'recovery-community',
    name: 'Recovery Community',
    heroImage:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Accountability that fits 12-step and SAA-style recovery without the surveillance relapse.',
    challenges: [
      'Most accountability software wasn\'t built by people who\'ve actually worked a program — the assumptions are wrong.',
      'Surveillance-style tools that retraumatize people who already lived years under secrecy, hiding, and shame.',
      'Sponsors who want a way to support their sponsees between meetings without becoming digital prison guards.',
      'A recovery culture that knows relapse is information, not identity — paired with software culture that still treats it as failure.',
      'The need for a tool that respects anonymity, one of recovery\'s core principles, at every architectural level.',
    ],
    howBeCandidHelps: [
      'Anonymity-respecting by design — account names, payment details, and partner relationships never connect to public profiles.',
      'Relapse workflow treats the event as information: structured journaling, Stringer-framework mapping, and re-commitment — not a scoreboard.',
      'Sponsor access is invite-only, revocable, and read-only at the signal level — no content exposure.',
      'Daily check-ins and trigger-pattern detection help you see patterns between meetings, the way meeting reports alone cannot.',
      'Pairs with SAA, SLAA, CoSA, Sex Addicts Anonymous, and Christian recovery ministries without forcing a doctrinal fit.',
      'Crisis flow routes to your pre-chosen sponsor or therapist, not to a corporate hotline.',
    ],
    relevantFeatures: [
      'Anonymity-first account architecture',
      'Sponsor partner role (read-only, signal-level)',
      'Relapse-as-information workflow',
      'Between-meeting pattern tracking',
      'Stringer-framework assessment and journaling',
      'HIPAA-ready for therapist integration',
    ],
    testimonial: {
      quote:
        'I\'ve sponsored 30+ men over 12 years. Be Candid is the first accountability tool I\'ve ever recommended to my sponsees, because it\'s the first one that doesn\'t undo the work the program is doing.',
      name: 'SAA sponsor, 12 years sobriety',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'Does Be Candid fit with SAA or SLAA?',
        a: 'Yes. Be Candid\'s behavioral-signal model, sponsor access tier, and relapse-as-information workflow are aligned with how SAA, SLAA, CoSA, and similar fellowships actually function. We built the tool in conversation with members of these fellowships.',
      },
      {
        q: 'Will my sponsor see exactly what I did?',
        a: 'No. Your sponsor sees that a pattern worth a check-in occurred, along with a conversation prompt. They do not see URLs, search terms, or specific content categories.',
      },
      {
        q: 'Is using an app compatible with traditional 12-step principles?',
        a: 'Be Candid is a between-meeting awareness tool. It does not replace meetings, sponsorship, step work, or the fellowship itself. Many people in recovery find that a tool that provides between-meeting awareness actually reinforces program work rather than competing with it.',
      },
      {
        q: 'What if I relapse?',
        a: 'You are met with a structured journaling and re-commitment flow, not a red "X." The app\'s framing of relapse-as-information follows decades of clinical addiction research: shame-based relapse response worsens outcomes; curiosity and structured reflection improve them.',
      },
      {
        q: 'Can I stay anonymous?',
        a: 'Yes. You can sign up with a pseudonymous email and a payment method that does not tie back to your legal identity. We do not require real-name verification for standard accounts.',
      },
    ],
    relatedBlogSlugs: [
      'punishing-to-compassion-treating-yourself-like-someone-you-love',
      'accountability-industry-rising-addiction-rates-2026',
      'accountability-dignity-privacy',
      'fantasizing-to-connecting-risking-real-intimacy',
    ],
  },
  {
    slug: 'small-group-leaders',
    name: 'Small Group Leaders',
    heroImage:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Hold space for the group without becoming its surveillance officer.',
    challenges: [
      'Men\'s or women\'s group members want accountability but the leader doesn\'t want to become a URL-reading police officer.',
      'Traditional accountability apps push all activity to the leader\'s inbox, creating an uncomfortable power dynamic.',
      'No good way to get group-level signal (who\'s struggling this week, who\'s disengaged) without violating individual privacy.',
      'Members who are afraid to sign up because they assume the leader will see their history.',
      'Pastors and elders asking for "reports" that would compromise the relational trust the group is built on.',
    ],
    howBeCandidHelps: [
      'Group facilitator view shows participation and aggregate signal — never individual content.',
      'Each member chooses their own accountability partner inside or outside the group, preserving relational integrity.',
      'Conversation guides calibrated for small-group discussion — prompts that work for a coffee-shop catch-up or a weekly meeting, not a courtroom.',
      'Stringer-framework journaling gives members a private path to root-cause work they can choose to share or not.',
      'Leader dashboards focus on engagement (is someone drifting away?) rather than behavior surveillance (what did they look at?).',
      'Works with Christian accountability groups, AA/SAA-style fellowships, men\'s ministries, and secular peer-support groups.',
    ],
    relevantFeatures: [
      'Group facilitator view (aggregate, not individual)',
      'Member-chosen accountability partners',
      'Engagement-drift alerts',
      'Conversation guides for group check-ins',
      'Stringer-framework journaling',
      'Christian recovery and secular group support',
    ],
    testimonial: {
      quote:
        'I lead a men\'s group of 12. We tried three other accountability tools and every one of them turned me into a warden. Be Candid is the first one that actually deepens our group conversation instead of replacing it.',
      name: 'Small-group leader',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'As a group leader, do I see individual members\' behavior?',
        a: 'No. You see group-level participation and engagement signals — who showed up, who\'s drifting, who might benefit from a check-in. Individual members\' accountability data stays between them and their chosen partner.',
      },
      {
        q: 'Can I still pair members up for one-on-one accountability?',
        a: 'Yes. Members inside the same group can pair with each other as accountability partners, or pair with someone outside the group. You as the leader facilitate the structure; you do not read the content.',
      },
      {
        q: 'Is there a group pricing tier?',
        a: 'Yes. Be Candid offers a Groups tier with per-member pricing and facilitator tools. Details at becandid.io/pricing/groups.',
      },
      {
        q: 'Can my pastor or elder team see what\'s happening in the group?',
        a: 'Only at the aggregate engagement level, and only if the group opts into that. There is no path to individual-level exposure through the leadership chain.',
      },
      {
        q: 'Does this replace meeting together?',
        a: 'No. Be Candid is a between-meeting awareness and accountability tool. It makes your group time more focused by giving each member a clearer sense of what they\'re actually bringing in, but it does not replace the group itself.',
      },
    ],
    relatedBlogSlugs: [
      'accountability-dignity-privacy',
      'accountability-industry-rising-addiction-rates-2026',
      'covenant-eyes-vs-be-candid-comparison',
      'punishing-to-compassion-treating-yourself-like-someone-you-love',
    ],
  },
  {
    slug: 'software-engineers',
    name: 'Software Engineers',
    heroImage:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'Accountability architecture for people who build systems for a living.',
    challenges: [
      'Your workflow demands always-on notifications, always-open browsers, and always-accessible terminals — the same substrate addictive behavior lives in.',
      'Hacker News, Twitter/X, Discord, Slack, and GitHub all compete for the same attention your deep work needs.',
      'Legitimate "I\'m just looking something up" that turns into 90 minutes of threads before you notice.',
      'Existing accountability tools are technically unimpressive, send data you can inspect, and feel built for an audience that can\'t read their own network traffic.',
      'Late-night coding sessions that bleed into compulsive content loops once the work finishes.',
    ],
    howBeCandidHelps: [
      'Technical transparency: we publish our data schema, we encrypt at rest with AES-256, we open-source what we can, and we don\'t pretend to do magic we\'re not doing.',
      'Behavioral-signal detection respects engineering reality — a 2 AM docs dive looks different from a 2 AM doomscroll, and the app knows the difference.',
      'Stringer-framework journaling gives you a structured way to work through the emotional substrate underneath compulsive engagement, without woo.',
      'Desktop app runs local-first inference — your screen contents stay on your machine.',
      'Pairs cleanly with focus-mode tools you already use (Cold Turkey, Freedom, One Sec).',
      'Respect for your agency: no dark patterns, no streak-terror UX, no "your partner will be disappointed" shame tactics.',
    ],
    relevantFeatures: [
      'Local-first desktop inference',
      'Publicly documented data model',
      'Deep-work vs compulsive-engagement detection',
      'Peer-engineer partner option',
      'No dark-pattern UX',
      'Stringer-framework journaling',
    ],
    testimonial: {
      quote:
        'I can read your network traffic. I did. You\'re not sending what you shouldn\'t be sending. That alone is more than every other accountability app I\'ve tested.',
      name: 'Senior staff engineer',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'What data does the desktop app actually send?',
        a: 'Local inference produces derived behavioral signals (compulsive-pattern flags, category-level tags, engagement timings). Those signals are transmitted over TLS 1.3. Raw screenshots, raw URLs, and raw page content are not transmitted.',
      },
      {
        q: 'Can I self-host any of this?',
        a: 'Not currently. We are a SaaS product with a hosted inference pipeline. For users who require stronger guarantees, our enterprise tier includes BYO-cloud deployment options.',
      },
      {
        q: 'Is any of this open source?',
        a: 'The mobile apps include open-source components, and we publish our data schema and encryption approach publicly. The core inference model is proprietary, but our privacy architecture is inspectable.',
      },
      {
        q: 'Does this work with my focus stack (Cold Turkey, Freedom)?',
        a: 'Yes. Those tools are blockers and focus timers. Be Candid is an awareness and accountability layer. They coexist cleanly.',
      },
      {
        q: 'I work on the kind of product that critics would say is part of the problem. Can I still use this?',
        a: 'Yes. Many of our users work at companies that ship attention-economy products. Using Be Candid for your own integrity is orthogonal to what you build. We are not a morality tribunal.',
      },
    ],
    relatedBlogSlugs: [
      'accountability-app-without-vpn-no-screenshots',
      'accountability-dignity-privacy',
      'escaping-to-presence-grounding-screen-addiction',
      'chasing-to-building-channeling-energy-into-creation',
    ],
  },
  {
    slug: 'healthcare-workers',
    name: 'Healthcare Workers',
    heroImage:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
    tagline:
      'A tool that holds up to HIPAA-grade standards and long-shift reality.',
    challenges: [
      '12-hour shifts that end with the phone as the only available regulator — scrolling, shopping, gaming, porn — because the nervous system has nothing left.',
      'High-stress environments that make you especially vulnerable to compulsive screen use without much room for self-compassion.',
      'Sleep schedules that don\'t look like anyone else\'s, which breaks most screen-time tools\' assumptions.',
      'Any tool you choose has to respect HIPAA thinking — you\'ve been trained in privacy at a level most software hasn\'t caught up to.',
      'Peer accountability is hard because colleagues already know too much of your stress and schedule.',
    ],
    howBeCandidHelps: [
      'Shift-aware analytics that understand a 3 AM phone session on a night shift is different from a 3 AM phone session on a day off.',
      'Privacy architecture built to HIPAA standards — AES-256 at rest, TLS 1.3 in transit, zero-knowledge partner access — the kind of baseline you already expect from your own systems.',
      'Stringer-framework journaling addresses burnout and secondary trauma substrate underneath compulsive behavior, not just the behavior itself.',
      'Partner options include non-colleague peers — so you can have accountability without involving the department.',
      'Sleep-displacement metrics calibrated to irregular schedules.',
      'Crisis escalation routes to your pre-chosen therapist or EAP-compatible contact, not a generic hotline.',
    ],
    relevantFeatures: [
      'Shift-aware usage analytics',
      'HIPAA-grade privacy infrastructure',
      'Burnout-aware Stringer journaling',
      'Non-colleague partner recommendations',
      'Irregular-sleep metrics',
      'EAP-compatible crisis routing',
    ],
    testimonial: {
      quote:
        'I work nights in an ICU. Every other screen-time app told me I was using my phone "during sleep hours" when I was literally at work. Be Candid actually understood that my schedule is different.',
      name: 'Registered nurse, night ICU',
      role: 'Be Candid Pro user',
    },
    faqs: [
      {
        q: 'Does Be Candid handle shift work?',
        a: 'Yes. Shift-aware analytics adjust for night shifts, rotating schedules, and on-call patterns — so the app doesn\'t misread your work hours as compulsion. You configure your schedule once and usage analysis adapts.',
      },
      {
        q: 'Is this HIPAA-compliant if I want my therapist involved?',
        a: 'Be Candid\'s Therapy tier includes HIPAA-ready infrastructure and a signed BAA. Like any HIPAA workflow, compliance also depends on your configuration and your clinician\'s practice, but we provide the underlying substrate.',
      },
      {
        q: 'Will my colleagues or employer see anything?',
        a: 'No. Be Candid is an individual account. There is no employer dashboard, no HR tier, and no hospital-system integration that exposes your data to your workplace.',
      },
      {
        q: 'I\'m worried about burnout, not porn. Does Be Candid help with general screen compulsion?',
        a: 'Yes. Be Candid is not porn-specific. It detects compulsive patterns across content categories — social media, shopping, gaming, news, sports betting — and the Stringer-framework journaling addresses the underlying nervous-system dynamics.',
      },
      {
        q: 'What does crisis routing look like?',
        a: 'You designate a crisis contact during setup — typically a therapist, an EAP contact, or a trusted friend. If the app detects a concerning pattern (or you trigger a flag manually), it surfaces your pre-chosen contact, not a generic hotline.',
      },
    ],
    relatedBlogSlugs: [
      'escaping-to-presence-grounding-screen-addiction',
      'numbing-to-experiencing-feeling-emotions-without-phone',
      'punishing-to-compassion-treating-yourself-like-someone-you-love',
      'accountability-dignity-privacy',
    ],
  },
];

export function getPersona(slug: string): PersonaUseCase | undefined {
  return PERSONAS.find(p => p.slug === slug);
}
