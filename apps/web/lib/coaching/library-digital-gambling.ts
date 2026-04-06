import type { CoachingEntry } from './types';

export const COACHING_LIBRARY_DIGITAL_GAMBLING: CoachingEntry[] = [
  // ── SOCIAL MEDIA ──────────────────────────────────────────
  // Tributaries
  { category: 'social_media', tag: null, phase: 'tributaries', content: "You didn't just randomly open the app. Something was happening — or not happening — before the scroll started. Let's rewind and find the moment your thumb reached for the phone.", followUp: "What were you feeling right before you started scrolling?" },
  { category: 'social_media', tag: 'loneliness', phase: 'tributaries', content: "When you're lonely, the feed feels like a room full of people. But it's a room where nobody actually sees you. The pull to scroll makes sense — you wanted to feel less alone. It's worth asking whether the scrolling delivered.", followUp: "Did you feel more or less connected after the session?" },
  { category: 'social_media', tag: 'stress', phase: 'tributaries', content: "When life gets heavy, the phone offers an escape hatch — thirty seconds of someone else's life instead of sitting in your own. That's not weakness. It's your brain reaching for a pressure valve.", followUp: "What were you trying to get a break from?" },
  { category: 'social_media', tag: 'boredom', phase: 'tributaries', content: "Boredom and your phone are best friends — the second one shows up, the other is already in your hand. But boredom is usually a mask for something else. Restlessness. Avoidance. A life that needs something you haven't named yet.", followUp: "If you couldn't scroll, what would you have had to sit with?" },
  { category: 'social_media', tag: 'late-night', phase: 'tributaries', content: "Late-night scrolling is its own kind of trap — your body is tired but your brain won't quit. The blue light and the infinite feed keep you just awake enough to stay stuck. Something is keeping you from putting it down.", followUp: "What time did you pick up the phone, and what were you avoiding by not sleeping?" },

  // Longing
  { category: 'social_media', tag: null, phase: 'longing', content: "Underneath the scrolling is usually a longing — to feel included, to be entertained, to matter, to not miss out. What were you actually reaching for when you opened the app?", followUp: "If you could have what you really needed in that moment, what would it be?" },
  { category: 'social_media', tag: 'loneliness', phase: 'longing', content: "You were looking for connection, and the feed offered a counterfeit version. Likes, comments, stories — they mimic closeness without the vulnerability. What would real connection feel like for you right now?", followUp: "Who in your life could you actually reach out to today?" },

  // Roadmap
  { category: 'social_media', tag: null, phase: 'roadmap', content: "Your screen time is a mirror — it reflects what's missing, not what's wrong with you. If you keep reaching for the phone, your pattern is telling you something about what your life needs more of.", followUp: "What would a day look like where you didn't need the scroll?" },
  { category: 'social_media', tag: null, phase: 'roadmap', content: "Freedom from the feed isn't about willpower — it's about building a life compelling enough that the phone isn't the most interesting thing in the room.", followUp: "What's one thing you could do this week that would make your real life feel more full?" },

  // Opening
  { category: 'social_media', tag: null, phase: 'opening', content: "You noticed the pattern and you're here. That's not small — most people just keep scrolling. Let's talk about what's going on.", followUp: "How are you feeling about your phone use right now?" },

  // Affirmation
  { category: 'social_media', tag: null, phase: 'affirmation', content: "Awareness is the first crack in any cycle. You noticed what you were doing and chose to be honest about it. That's real progress.", followUp: "" },

  // ── BINGE WATCHING ────────────────────────────────────────
  // Tributaries
  { category: 'binge_watching', tag: null, phase: 'tributaries', content: "One more episode turned into five. That didn't happen by accident — something made it hard to turn off. Let's look at what was happening before you hit play.", followUp: "What was your day like before you started watching?" },
  { category: 'binge_watching', tag: 'loneliness', phase: 'tributaries', content: "When the house is quiet and the loneliness gets loud, a show gives you characters to be with. They become familiar — almost like company. It makes sense that you'd stay in that world a little longer.", followUp: "Were you watching alone? What did the show give you that the silence didn't?" },
  { category: 'binge_watching', tag: 'stress', phase: 'tributaries', content: "After a stressful day, sinking into a story is the easiest way to stop thinking. You're not lazy for doing it — you're exhausted and your brain wanted to check out for a while.", followUp: "What were you carrying today that made the escape feel necessary?" },
  { category: 'binge_watching', tag: 'boredom', phase: 'tributaries', content: "When nothing in your real life feels engaging, a well-written show is always available. But if boredom keeps driving you to the couch, it might be pointing to something deeper than not having plans.", followUp: "What would you have done with those hours if the show didn't exist?" },
  { category: 'binge_watching', tag: 'late-night', phase: 'tributaries', content: "Late-night bingeing is a way of postponing tomorrow. If you stay in the show, you don't have to face whatever's waiting in the morning. What is it about tomorrow that made tonight hard to end?", followUp: "What's waiting for you tomorrow that you're putting off?" },

  // Longing
  { category: 'binge_watching', tag: null, phase: 'longing', content: "Behind the binge is a need — for rest, for a world that makes sense, for feeling something without the risk of real life. What were you actually hungry for?", followUp: "If you could have what you truly needed tonight, what would it be?" },
  { category: 'binge_watching', tag: 'loneliness', phase: 'longing', content: "The characters on screen can start to feel like friends. That longing for companionship is real and important — it just can't be fully met through a screen that can't look back at you.", followUp: "What kind of real-life connection are you missing most?" },

  // Roadmap
  { category: 'binge_watching', tag: null, phase: 'roadmap', content: "If you keep losing evenings to shows, the question isn't about more discipline. It's about what your evenings are missing. What would an evening you actually chose look like?", followUp: "What's one thing you'd want to do with your evenings if the default wasn't the couch?" },
  { category: 'binge_watching', tag: null, phase: 'roadmap', content: "There's nothing wrong with watching a good show. The signal is when it stops being a choice and starts being the only thing. Your pattern is telling you something about what your life needs.", followUp: "What would need to change for watching to feel like a choice again?" },

  // Opening
  { category: 'binge_watching', tag: null, phase: 'opening', content: "You caught yourself in the pattern and decided to talk about it. That honesty matters more than the number of episodes.", followUp: "How long did the session go, and how do you feel about it?" },

  // Affirmation
  { category: 'binge_watching', tag: null, phase: 'affirmation', content: "You could have just kept watching. Instead you paused and got honest. That's not a small thing — that's the muscle you're building.", followUp: "" },

  // ── GAMBLING ──────────────────────────────────────────────
  // Tributaries
  { category: 'gambling', tag: null, phase: 'tributaries', content: "The urge to place a bet doesn't come from nowhere. Something was building before the impulse took over. Let's trace it back — what was happening in your day?", followUp: "When did you first feel the pull today?" },
  { category: 'gambling', tag: 'loneliness', phase: 'tributaries', content: "Gambling can fill a silence. The rush, the anticipation, the highs and lows — it's a conversation with chance when there's no one else to talk to. What was the loneliness about today?", followUp: "Were you alone when you placed the bet, and what did you need that the bet was standing in for?" },
  { category: 'gambling', tag: 'stress', phase: 'tributaries', content: "When the pressure is unbearable, a bet offers a strange kind of hope — the fantasy that one win could change everything. That hope is the hook. What's the real pressure about?", followUp: "What would actually relieve the stress you're carrying?" },
  { category: 'gambling', tag: 'boredom', phase: 'tributaries', content: "Boredom and gambling are a dangerous pair — the bet makes time speed up, makes ordinary moments feel electric. But that electricity always has a bill attached.", followUp: "What was boring about today — and what would genuine excitement look like for you?" },
  { category: 'gambling', tag: 'late-night', phase: 'tributaries', content: "Late at night, the guardrails come down. The apps are open, no one's watching, and the bets feel less real. But the losses are just as real at midnight as they are at noon.", followUp: "What kept you up, and at what point did the betting start?" },

  // Longing
  { category: 'gambling', tag: null, phase: 'longing', content: "Under every bet is a longing — for control, for a rush, for proof that luck is on your side, for escape. What were you really chasing when you placed it?", followUp: "What would it feel like to get what you actually need without the risk?" },
  { category: 'gambling', tag: 'stress', phase: 'longing', content: "The fantasy of a big win is really a fantasy of relief — of the stress disappearing all at once. That need for relief is valid. The roulette wheel just isn't the answer.", followUp: "What would genuine relief look like in your situation?" },

  // Roadmap
  { category: 'gambling', tag: null, phase: 'roadmap', content: "Gambling tells you something about what you believe you deserve — that you need luck to get ahead, that the normal path isn't enough. What if the normal path is actually where the freedom is?", followUp: "What would your life look like a year from now if you stopped betting today?" },
  { category: 'gambling', tag: null, phase: 'roadmap', content: "Recovery from gambling isn't just about stopping the bets. It's about building a life where the thrill of the wager isn't the most alive you ever feel.", followUp: "When was the last time you felt a rush from something that didn't cost you?" },

  // Opening
  { category: 'gambling', tag: null, phase: 'opening', content: "You're here, which means something in you knows this matters. Whatever happened with the bet, let's look at it honestly together.", followUp: "What happened — did you place a bet, or are you fighting the urge?" },

  // Affirmation
  { category: 'gambling', tag: null, phase: 'affirmation', content: "Gambling thrives in secrecy. The fact that you're naming it out loud is already breaking the cycle's power. Keep going.", followUp: "" },

  // ── SPORTS BETTING ────────────────────────────────────────
  // Tributaries
  { category: 'sports_betting', tag: null, phase: 'tributaries', content: "The game was on and the bet felt like it would make it mean more. But something was happening before you opened the app. Let's find the real starting point.", followUp: "Were you watching the game first, or did you go looking for something to bet on?" },
  { category: 'sports_betting', tag: 'loneliness', phase: 'tributaries', content: "Sports betting can feel like being part of something — you've got skin in the game, you're invested, you're in it with strangers online. When you're lonely, that simulation of belonging is magnetic.", followUp: "What would it feel like to care about a game without money on it?" },
  { category: 'sports_betting', tag: 'stress', phase: 'tributaries', content: "When life feels out of control, a well-researched bet can feel like you're exercising skill and control. But the illusion of control is part of what makes sports betting so hard to walk away from.", followUp: "What in your life feels out of your control right now?" },
  { category: 'sports_betting', tag: 'boredom', phase: 'tributaries', content: "Without a bet, the game is just a game. With one, every play matters. The problem is that you start needing the stakes to feel anything at all.", followUp: "When did regular games stop being enough?" },
  { category: 'sports_betting', tag: 'late-night', phase: 'tributaries', content: "Late-night lines, live bets, overseas leagues you don't even follow — when the betting extends past the sports you actually care about, that's the habit talking, not the fan.", followUp: "Were you betting on something you'd normally watch, or were you just looking for action?" },

  // Longing
  { category: 'sports_betting', tag: null, phase: 'longing', content: "Under the bet is usually a longing to feel sharp, to prove you know something, to matter in the outcome. Those needs are real — the sportsbook just isn't where they get met.", followUp: "Where else in your life do you feel that kind of engagement?" },
  { category: 'sports_betting', tag: 'boredom', phase: 'longing', content: "The bet turns a boring Tuesday into an event. You're craving intensity, engagement, something that makes you feel alive. Those are legitimate needs — the parlay just isn't the healthiest delivery system.", followUp: "What used to make you feel that kind of excitement before betting?" },

  // Roadmap
  { category: 'sports_betting', tag: null, phase: 'roadmap', content: "You can love sports without the line. The question is whether you've forgotten how — and if so, how to get back to watching a game just because you love the game.", followUp: "What sport did you fall in love with before betting was part of it?" },
  { category: 'sports_betting', tag: null, phase: 'roadmap', content: "Every bet you don't place isn't deprivation — it's a vote for the life you actually want. The wins never lasted. The losses always did.", followUp: "What's one thing you'd do with the money you'd save in a month without betting?" },

  // Opening
  { category: 'sports_betting', tag: null, phase: 'opening', content: "Hey — you came here instead of placing another bet. Or maybe you already placed one and you're trying to figure out what just happened. Either way, let's talk.", followUp: "Where are you right now — before a bet, or after one?" },

  // Affirmation
  { category: 'sports_betting', tag: null, phase: 'affirmation', content: "It takes guts to admit that something you enjoy has turned into something that controls you. Honesty like that is the beginning of getting free.", followUp: "" },

  // ── DAY TRADING ───────────────────────────────────────────
  // Tributaries
  { category: 'day_trading', tag: null, phase: 'tributaries', content: "The charts were moving and you couldn't look away. But something was going on before you opened the trading app. What was the real trigger?", followUp: "Were you checking positions, or were you looking for a new trade to feel something?" },
  { category: 'day_trading', tag: 'loneliness', phase: 'tributaries', content: "The market is always there — ticking, moving, responding. When people aren't, the charts become a kind of companion. A volatile, expensive companion.", followUp: "How much of your day was spent with the market versus with actual people?" },
  { category: 'day_trading', tag: 'stress', phase: 'tributaries', content: "Day trading under stress is like doubling down on chaos. Your nervous system is already overloaded, and then you add leveraged positions to the mix. What's the stress really about?", followUp: "What's the pressure underneath — is it financial, or is the trading making it financial?" },
  { category: 'day_trading', tag: 'boredom', phase: 'tributaries', content: "When life feels flat, the market offers a constant stream of drama. Green candles, red candles, the rush of being right, the sting of being wrong. It's entertainment disguised as productivity.", followUp: "If someone watched how you traded today, would it look more like investing or more like gambling?" },
  { category: 'day_trading', tag: 'late-night', phase: 'tributaries', content: "Watching futures at 2 a.m. or trading foreign markets in the middle of the night — when the trading follows you to bed, it's stopped being a strategy and started being a compulsion.", followUp: "How much sleep did you lose to the screen last night?" },

  // Longing
  { category: 'day_trading', tag: null, phase: 'longing', content: "Under the trades is usually a longing for financial freedom, for proving you're smart enough, for control in a world that feels chaotic. Those are real desires — but is the daily grind of the chart actually getting you closer?", followUp: "What would financial peace actually look like — not a windfall, but real peace?" },
  { category: 'day_trading', tag: 'stress', phase: 'longing', content: "The dream is that one big trade solves everything. That's the same promise gambling makes — a shortcut past the hard, slow work of building stability. What would real stability require?", followUp: "If you added up your trading P&L honestly, has it moved you closer to or further from where you want to be?" },

  // Roadmap
  { category: 'day_trading', tag: null, phase: 'roadmap', content: "There's a difference between investing and compulsive trading. Investing is boring on purpose. If you need the dopamine hit of the daily chart, the trading has become about something other than money.", followUp: "What would it look like to have a financial plan that didn't require you to watch candles all day?" },
  { category: 'day_trading', tag: null, phase: 'roadmap', content: "The market will always be there tomorrow. Your health, your relationships, your sleep — those have limits. What are you sacrificing for the next trade?", followUp: "What has trading cost you that isn't measured in dollars?" },

  // Opening
  { category: 'day_trading', tag: null, phase: 'opening', content: "You're stepping back from the charts to look at the bigger picture. That takes more discipline than any trade. Let's talk about what's really going on.", followUp: "How was today — was it a good day or a hard day in the market?" },

  // Affirmation
  { category: 'day_trading', tag: null, phase: 'affirmation', content: "Admitting that the trading has become something more than a strategy is one of the hardest things to say out loud. You just did. That's real strength.", followUp: "" },

  // ── GAMING ────────────────────────────────────────────────
  // Tributaries
  { category: 'gaming', tag: null, phase: 'tributaries', content: "The session went longer than you planned. It always does when something else is going on. Let's look at what was happening before you picked up the controller.", followUp: "What was your day like before the gaming session started?" },
  { category: 'gaming', tag: 'loneliness', phase: 'tributaries', content: "Online lobbies, guild chats, co-op missions — gaming offers a version of friendship that's always available. When the real world feels empty, it makes sense that you'd go where people know your name, even if it's a gamertag.", followUp: "Are your closest relationships online or offline right now?" },
  { category: 'gaming', tag: 'stress', phase: 'tributaries', content: "After a brutal day, loading into a game is the fastest way to become someone else for a while — someone with clear objectives and measurable wins. Real life doesn't offer that kind of clarity.", followUp: "What happened today that made escaping feel necessary?" },
  { category: 'gaming', tag: 'boredom', phase: 'tributaries', content: "Games are engineered to be the most interesting thing in the room. When your real life can't compete with that level of stimulation, the controller wins every time. That's not a character flaw — it's a design problem.", followUp: "What would your day need to include for the game not to be the highlight?" },
  { category: 'gaming', tag: 'late-night', phase: 'tributaries', content: "One more match. One more raid. One more level. Late-night gaming sessions have a momentum that's hard to break — and the cost shows up the next morning when you're running on fumes.", followUp: "What time did you finally stop, and how did you feel when you did?" },

  // Longing
  { category: 'gaming', tag: null, phase: 'longing', content: "Games give you what real life often doesn't — progress bars, clear goals, a sense of mastery, community. What were you actually looking for when you logged on?", followUp: "Which of those — progress, mastery, community, escape — is the one you need most right now?" },
  { category: 'gaming', tag: 'loneliness', phase: 'longing', content: "The longing underneath the gaming is often for belonging — a squad, a crew, people who show up. That need is completely valid. The question is whether the game is supplementing your real connections or replacing them.", followUp: "When was the last time you felt that sense of belonging offline?" },

  // Roadmap
  { category: 'gaming', tag: null, phase: 'roadmap', content: "Gaming isn't the enemy. The signal is when it stops being something you enjoy and starts being the only place you feel competent or connected. What would it look like to bring some of what gaming gives you into the rest of your life?", followUp: "What's one real-world goal that could give you the same sense of progress?" },
  { category: 'gaming', tag: null, phase: 'roadmap', content: "You don't have to quit gaming to have a life you're proud of. But you might need to build a life worth logging off for. What would that look like?", followUp: "What's one thing outside of gaming that you've been wanting to invest in?" },

  // Opening
  { category: 'gaming', tag: null, phase: 'opening', content: "You stepped away from the screen to be here. That's a choice, and it matters. Let's talk about what gaming has been looking like for you lately.", followUp: "How much time did you spend gaming today, and how do you feel about it?" },

  // Affirmation
  { category: 'gaming', tag: null, phase: 'affirmation', content: "Being honest about how much time you're spending — and why — is harder than any boss fight. You showed up for the real challenge today.", followUp: "" },
];
