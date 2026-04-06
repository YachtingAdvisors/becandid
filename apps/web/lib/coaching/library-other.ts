import type { CoachingEntry } from './types';

export const COACHING_LIBRARY_OTHER: CoachingEntry[] = [
  // ── EATING DISORDER ─────────────────────────────────────────
  // Tributaries (general + shame + exhaustion)
  { category: 'eating_disorder', tag: null, phase: 'tributaries', content: "The relationship with food and your body didn't start today. Something triggered the urge to restrict, purge, or binge. Let's trace it back gently — there's always a before.", followUp: "What happened today that made you feel out of control?" },
  { category: 'eating_disorder', tag: 'shame', phase: 'tributaries', content: "Shame about your body is one of the cruelest loops — it drives the behavior, then the behavior deepens the shame. You're not broken for being in this loop. You're caught in a current that predates you.", followUp: "Whose voice do you hear when you look in the mirror?" },
  { category: 'eating_disorder', tag: 'exhaustion', phase: 'tributaries', content: "When you're depleted, food becomes either the comfort or the one thing you can control. Exhaustion strips away every coping tool except the oldest ones. It makes sense — and it's also data about how you're living.", followUp: "What drained you before the urge hit?" },

  // Longing
  { category: 'eating_disorder', tag: null, phase: 'longing', content: "Under the food rules is usually a longing for control, safety, or worthiness. Those needs are legitimate — your body just became the battlefield.", followUp: "What would feeling safe in your own body feel like?" },
  { category: 'eating_disorder', tag: null, phase: 'longing', content: "You're not hungry for food or afraid of food — you're hungry for something the food can't give you and afraid of something the restriction can't protect you from. Let's name it.", followUp: "If the eating pattern disappeared overnight, what would still hurt?" },

  // Roadmap
  { category: 'eating_disorder', tag: null, phase: 'roadmap', content: "Your body has carried you through everything you've survived. It's not the enemy — it's the home. What would it look like to treat it like one?", followUp: "What's one kind thing you could do for your body today?" },

  // Opening
  { category: 'eating_disorder', tag: null, phase: 'opening', content: "This is sensitive territory, and you're brave for looking at it. Let's go slowly — there's no rush.", followUp: "How are you feeling about food and your body right now?" },

  // Affirmation
  { category: 'eating_disorder', tag: null, phase: 'affirmation', content: "Healing your relationship with food and your body is some of the hardest work there is. The fact that you're here, looking at it honestly, means the healing has already started.", followUp: "" },

  // ── BODY CHECKING ─────────────────────────────────────────
  // Tributaries (general + anxiety + rejection)
  { category: 'body_checking', tag: null, phase: 'tributaries', content: "The mirror check, the scale, the measuring — it feels like information, but it's really reassurance-seeking. Something made you need reassurance today. Let's find it.", followUp: "How many times did you check today?" },
  { category: 'body_checking', tag: 'anxiety', phase: 'tributaries', content: "Anxiety often lands in the body first, and when it does, the mirror becomes a place to look for evidence that something is wrong. The checking isn't really about your body — it's about the anxiety looking for a target.", followUp: "What were you anxious about before the checking started?" },
  { category: 'body_checking', tag: 'rejection', phase: 'tributaries', content: "After rejection, the mind searches for reasons — and the body becomes the easiest suspect. You start checking because part of you believes if you could just fix how you look, you'd be safe from being hurt again.", followUp: "What did the rejection stir up in you?" },

  // Longing
  { category: 'body_checking', tag: null, phase: 'longing', content: "Under the checking is a longing to feel okay in your skin. To know you're enough without measuring. That longing is worth listening to — it's pointing you toward real freedom.", followUp: "When was the last time you felt at peace with your body?" },
  { category: 'body_checking', tag: null, phase: 'longing', content: "The mirror can't give you the thing you're actually looking for. Acceptance doesn't live in a reflection — it lives in how you talk to yourself when no one's watching.", followUp: "What do you say to yourself when you don't like what you see?" },

  // Roadmap
  { category: 'body_checking', tag: null, phase: 'roadmap', content: "What if your worth wasn't measured in inches or pounds? What would you measure it in instead? The goal isn't to stop caring about your body — it's to stop letting your worth be determined by it.", followUp: "What makes you valuable that has nothing to do with how you look?" },

  // Opening
  { category: 'body_checking', tag: null, phase: 'opening', content: "Body checking can feel like a small thing, but you know it's become something bigger. Let's talk about it — with honesty, not shame.", followUp: "What prompted the check today?" },

  // Affirmation
  { category: 'body_checking', tag: null, phase: 'affirmation', content: "Every time you choose not to check is a quiet act of rebellion against a culture that profits from your insecurity. You're reclaiming territory.", followUp: "" },

  // ── DATING APPS ───────────────────────────────────────────
  // Tributaries (general + loneliness + boredom)
  { category: 'dating_apps', tag: null, phase: 'tributaries', content: "The swipe is quick, but the need behind it isn't. What were you looking for when you opened the app — connection, validation, distraction? Name it.", followUp: "Were you hoping to find someone, or hoping to feel something?" },
  { category: 'dating_apps', tag: 'loneliness', phase: 'tributaries', content: "When you're lonely, a match feels like proof that you matter. But the dopamine from a match fades in seconds, and the loneliness is still there underneath. The app can't fix what it didn't break.", followUp: "What kind of connection are you actually looking for?" },
  { category: 'dating_apps', tag: 'boredom', phase: 'tributaries', content: "Boredom and dating apps are a dangerous combination. When there's nothing filling the space, the app offers the illusion of possibility. But scrolling through faces isn't the same as living.", followUp: "What would you be doing right now if the app didn't exist?" },

  // Longing
  { category: 'dating_apps', tag: null, phase: 'longing', content: "Under the compulsive swiping is a longing to be chosen, to be desired, to not be alone. Those are some of the most human needs there are — they deserve more than an algorithm.", followUp: "What would being truly known by someone feel like?" },
  { category: 'dating_apps', tag: null, phase: 'longing', content: "The app promises connection but usually delivers evaluation. You're not looking for another match — you're looking for someone who stays. That's a different search entirely.", followUp: "What would a relationship that actually fulfills you look like?" },

  // Roadmap
  { category: 'dating_apps', tag: null, phase: 'roadmap', content: "If you spent the same time you spend swiping on deepening one real relationship — a friendship, a family bond, a community — what would change?", followUp: "Who in your life deserves more of your attention?" },

  // Opening
  { category: 'dating_apps', tag: null, phase: 'opening', content: "Dating apps are designed to be addictive. There's no shame in getting caught in the loop. Let's understand what's driving it for you.", followUp: "How much time did you spend swiping today?" },

  // Affirmation
  { category: 'dating_apps', tag: null, phase: 'affirmation', content: "Choosing to be present in your real life instead of swiping through possibilities — that's choosing depth over breadth. That takes guts.", followUp: "" },

  // ── IMPULSE SHOPPING ──────────────────────────────────────
  // Tributaries (general + stress + exhaustion)
  { category: 'impulse_shopping', tag: null, phase: 'tributaries', content: "The cart wasn't about what you were buying — it was about how buying it made you feel. Something was happening emotionally before the browsing started. Let's find it.", followUp: "What emotion were you trying to buy your way out of?" },
  { category: 'impulse_shopping', tag: 'stress', phase: 'tributaries', content: "Retail therapy is real — dopamine spikes when you click 'buy.' But the high fades and the credit card statement doesn't. What stress were you medicating?", followUp: "What's the stress actually about?" },
  { category: 'impulse_shopping', tag: 'exhaustion', phase: 'tributaries', content: "When you're exhausted, willpower is gone and the brain defaults to the easiest dopamine hit available. Online shopping is engineered to be frictionless for exactly this reason.", followUp: "How much sleep did you get last night?" },

  // Longing
  { category: 'impulse_shopping', tag: null, phase: 'longing', content: "Under the shopping is often a longing to feel in control, to treat yourself, to fill an emptiness that stuff can't fill. The packages arrive, but the emptiness stays.", followUp: "What would actually make you feel full?" },
  { category: 'impulse_shopping', tag: null, phase: 'longing', content: "The moment of clicking 'buy' feels like a decision, but it's actually a reaction. The real decision is what you do with this awareness right now.", followUp: "What were you really shopping for — the item, or the feeling?" },

  // Roadmap
  { category: 'impulse_shopping', tag: null, phase: 'roadmap', content: "Every purchase is a vote for the life you're building. Are you buying the life you want, or numbing the one you have?", followUp: "What's one thing money can't buy that you need more of?" },

  // Opening
  { category: 'impulse_shopping', tag: null, phase: 'opening', content: "Shopping isn't usually what people think of as a struggle — but you know it's become one. That honesty matters more than you realize.", followUp: "What did you buy today, and how do you feel about it now?" },

  // Affirmation
  { category: 'impulse_shopping', tag: null, phase: 'affirmation', content: "Closing the cart instead of clicking checkout takes more willpower than people realize. You're building the muscle that matters most — awareness.", followUp: "" },

  // ── RAGE CONTENT ──────────────────────────────────────────
  // Tributaries (general + anger + conflict)
  { category: 'rage_content', tag: null, phase: 'tributaries', content: "Outrage is addictive — it gives you a target for feelings that might otherwise have nowhere to go. What were you feeling before the rage content pulled you in?", followUp: "What are you actually angry about — not the content, but in your life?" },
  { category: 'rage_content', tag: 'anger', phase: 'tributaries', content: "When you're already angry, rage content feels validating — someone else is furious too. But the algorithm isn't your ally. It's feeding the fire because fire keeps you watching.", followUp: "What were you angry about before the scrolling started?" },
  { category: 'rage_content', tag: 'conflict', phase: 'tributaries', content: "After a conflict, consuming rage content can feel like gathering ammunition. But the more you consume, the more combative your inner world becomes — and that bleeds into every conversation you have next.", followUp: "Who were you in conflict with, and what were you feeling afterward?" },

  // Longing
  { category: 'rage_content', tag: null, phase: 'longing', content: "Under the outrage is often a longing for justice, for things to make sense, for the world to be fair. Those longings are good — but comment sections aren't where justice lives.", followUp: "Where in your actual life can you make things more just?" },
  { category: 'rage_content', tag: null, phase: 'longing', content: "The anger feels righteous, and maybe it is. But righteous anger consumed passively through a screen doesn't build anything. What would it look like to channel this toward something real?", followUp: "What constructive action could you take for the thing that's bothering you?" },

  // Roadmap
  { category: 'rage_content', tag: null, phase: 'roadmap', content: "If anger is your default emotion, it's usually covering something softer underneath — hurt, fear, sadness. Rage feels powerful; the thing beneath it feels vulnerable. Freedom starts with looking under the armor.", followUp: "What's the feeling underneath the anger?" },

  // Opening
  { category: 'rage_content', tag: null, phase: 'opening', content: "Getting pulled into outrage content is more common than people admit. There's no judgment here — let's look at what's driving it.", followUp: "What kind of content were you consuming, and for how long?" },

  // Affirmation
  { category: 'rage_content', tag: null, phase: 'affirmation', content: "Choosing to step away from the outrage machine and deal with your own life takes more courage than firing off another comment. You're choosing your peace.", followUp: "" },

  // ── UNIVERSAL TAG CONTENT ─────────────────────────────────
  // One tributaries entry per JOURNAL_TAG with category='general'
  { category: 'general', tag: 'late-night', phase: 'tributaries', content: "Late at night your defenses are down and your brain defaults to comfort-seeking. There's nothing wrong with you — but the choices you make at midnight rarely reflect who you want to be at noon.", followUp: "What would help you wind down differently tonight?" },
  { category: 'general', tag: 'stress', phase: 'tributaries', content: "Stress doesn't justify the behavior, but it explains it. When your nervous system is maxed out, it reaches for the fastest exit. Let's find what's maxing it out.", followUp: "What's weighing on you most?" },
  { category: 'general', tag: 'loneliness', phase: 'tributaries', content: "Loneliness drives more compulsive behavior than any other emotion. Your brain is wired for connection — when it can't find the real thing, it settles for substitutes.", followUp: "When did you last feel genuinely connected to someone?" },
  { category: 'general', tag: 'conflict', phase: 'tributaries', content: "After a conflict, your body is flooded with cortisol looking for an outlet. The behavior you turned to was your nervous system's attempt to regulate. Now let's deal with the actual conflict.", followUp: "What was the conflict about?" },
  { category: 'general', tag: 'exhaustion', phase: 'tributaries', content: "When you're running on empty, willpower is the first thing to go. This isn't weakness — it's biology. But it's also a signal that something about how you're living is unsustainable.", followUp: "What's draining you most?" },
  { category: 'general', tag: 'boredom', phase: 'tributaries', content: "Boredom is often restlessness in disguise — a life that doesn't have enough of what matters to you. The behavior fills the gap temporarily, but the gap remains.", followUp: "What used to excite you that you've stopped doing?" },
  { category: 'general', tag: 'rejection', phase: 'tributaries', content: "Rejection hits the same brain circuits as physical pain. When that pain shows up, you reach for relief. That's not weakness — it's wiring. But you can learn to sit with the sting.", followUp: "What happened? Who rejected you?" },
  { category: 'general', tag: 'shame', phase: 'tributaries', content: "Shame is the most isolating emotion there is — it tells you you're fundamentally broken, and that if anyone saw the real you, they'd leave. Shame lies. You're here proving it wrong.", followUp: "What are you most ashamed of right now?" },
  { category: 'general', tag: 'anger', phase: 'tributaries', content: "Anger is usually a bodyguard for a softer emotion underneath — hurt, fear, helplessness. The behavior you turned to was about the anger. Let's look at what the anger is about.", followUp: "What's underneath the anger?" },
  { category: 'general', tag: 'anxiety', phase: 'tributaries', content: "Anxiety is future-pain felt in the present. Your brain is running worst-case scenarios, and the behavior offered a way to hit pause on the projector. What's the movie your mind is playing?", followUp: "What are you most worried about?" },
  { category: 'general', tag: 'travel', phase: 'tributaries', content: "Travel disrupts your routines, your support systems, and your accountability structures. Hotel rooms are lonely. New cities are anonymous. Makes sense that old patterns resurface.", followUp: "What routine did travel disrupt that usually keeps you grounded?" },
  { category: 'general', tag: 'celebration', phase: 'tributaries', content: "It's counterintuitive, but celebrations can trigger relapses — the good feeling wants more good feeling, and boundaries get loose when the mood is high.", followUp: "What were you celebrating?" },
  { category: 'general', tag: 'weekend', phase: 'tributaries', content: "Weekends have less structure, more free time, and fewer people watching. That combination is high-risk for most patterns. What's your weekend routine look like?", followUp: "What could you do differently this weekend?" },
  { category: 'general', tag: 'morning', phase: 'tributaries', content: "How you start the morning sets the trajectory for the day. If the behavior is the first thing you reach for, it means you're waking up already needing something you're not getting.", followUp: "What would a morning that set you up for a good day look like?" },
  { category: 'general', tag: 'work', phase: 'tributaries', content: "Work stress, work boredom, work conflict — the behavior often lives in the margins of the workday. A bathroom break, a lunch scroll, an after-work wind-down that goes too far.", followUp: "When during the workday are you most vulnerable?" },

  // ── CRISIS CONTENT ────────────────────────────────────────
  // De-escalation (4 entries)
  { category: 'crisis', tag: null, phase: 'tributaries', content: "You're in pain right now, and that's real. But this moment will pass. It doesn't feel like it — pain never does when you're in the middle of it — but you have survived every hard moment before this one.", followUp: "Can you name one person you trust enough to call right now?" },
  { category: 'crisis', tag: null, phase: 'tributaries', content: "Right now your brain is telling you a story that feels permanent. It isn't. Pain lies about its own duration. You don't have to solve anything tonight — you just have to get through tonight.", followUp: "What's one thing you can do in the next ten minutes to be kind to yourself?" },
  { category: 'crisis', tag: null, phase: 'tributaries', content: "I hear you. This is heavy, and you don't have to carry it alone. Whatever you're feeling right now makes sense given what you've been through. But there are people trained to help you hold this.", followUp: "Would you be willing to reach out to someone who can help right now?" },
  { category: 'crisis', tag: null, phase: 'tributaries', content: "You are not a burden for struggling. You are a human being in pain, and pain is supposed to be shared — that's what people are for. Please don't go through this alone.", followUp: "Is there someone you can be with — physically, not just digitally — tonight?" },

  // Safety resources (2 entries)
  { category: 'crisis', tag: null, phase: 'roadmap', content: "If you're in crisis, please reach out now. The 988 Suicide & Crisis Lifeline is available 24/7 — call or text 988. You can also text HOME to 741741 to reach the Crisis Text Line. These are real people who want to help.", followUp: "" },
  { category: 'crisis', tag: null, phase: 'roadmap', content: "You don't have to be in immediate danger to reach out. The 988 Suicide & Crisis Lifeline (call or text 988) and Crisis Text Line (text HOME to 741741) exist for moments exactly like this one. No threshold required — just the willingness to talk.", followUp: "" },

  // You are not alone (2 entries)
  { category: 'crisis', tag: null, phase: 'affirmation', content: "You are not alone in this. Right now it feels like you are — that's what crisis does, it isolates. But people care about you, even when you can't feel it. You matter, and this moment is not the whole story.", followUp: "" },
  { category: 'crisis', tag: null, phase: 'affirmation', content: "You are not alone. Millions of people have stood in this exact darkness and found their way through. Not because they were stronger than you — but because they let someone help. Let someone help.", followUp: "" },

  // ── GENERAL FALLBACK ──────────────────────────────────────
  // Openings (2)
  { category: 'general', tag: null, phase: 'opening', content: "You're here, and that matters. Whatever brought you to this moment, we're going to look at it together — with curiosity, not judgment.", followUp: "What's on your mind?" },
  { category: 'general', tag: null, phase: 'opening', content: "Something happened, or something's about to happen, and you chose to come here instead of acting on autopilot. That's already a different choice than last time.", followUp: "What's going on?" },

  // Affirmations (2)
  { category: 'general', tag: null, phase: 'affirmation', content: "You showed up. You were honest. That's the work. Everything else builds on this foundation.", followUp: "" },
  { category: 'general', tag: null, phase: 'affirmation', content: "Progress isn't a straight line — it's a direction. And right now, you're pointed the right way.", followUp: "" },

  // Roadmap questions (2)
  { category: 'general', tag: null, phase: 'roadmap', content: "Your patterns are a map. They're not showing you what's wrong with you — they're showing you where your life needs attention.", followUp: "What does your pattern keep pointing to?" },
  { category: 'general', tag: null, phase: 'roadmap', content: "Imagine telling your future self about this moment. What would you want them to know you chose?", followUp: "What choice would make you proud tomorrow morning?" },

  // Longing explorations (2)
  { category: 'general', tag: null, phase: 'longing', content: "Every struggle has a legitimate need underneath it. Not the behavior — but the ache that drove you to it. Name the ache.", followUp: "What did you actually need in that moment?" },
  { category: 'general', tag: null, phase: 'longing', content: "You were reaching for something real — belonging, rest, significance, tenderness. The method was wrong, but the longing was right. Let's honor the longing.", followUp: "Which of those words resonates most: belonging, rest, significance, or tenderness?" },
];
