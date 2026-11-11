import type { Engine } from "@/src/lib/game/engine";
import type { FriendId } from "@/src/lib/game/entities/friend";

export interface DialogueOption {
  text: string;
  run: (g: Engine) => void;
}

export interface Dialogue {
  speaker: string;
  portrait: string;
  text: string;
  options: DialogueOption[];
}

type Who = FriendId | "you" | "petrosian";

const WHO: Record<Who, [speaker: string, portrait: string]> = {
  vahe: ["Vahe", "vahe"],
  karen: ["Karen", "karen"],
  grish: ["Grish", "grish"],
  petrosian: ["Mr. Petrosian", "petrosian"],
  you: ["You", "player"],
};

export const say = (who: Who, text: string, options: DialogueOption[]): Dialogue => ({
  speaker: WHO[who][0],
  portrait: WHO[who][1],
  text,
  options,
});

/** A run of lines, each with a single "…" to continue, ending on `final` options. */
export function chain(lines: [Who, string][], final: DialogueOption[]): Dialogue {
  const [lastWho, lastText] = lines[lines.length - 1];
  let d = say(lastWho, lastText, final);
  for (let i = lines.length - 2; i >= 0; i--) {
    const next = d;
    d = say(lines[i][0], lines[i][1], [{ text: "…", run: (g) => g.openDialogue(next) }]);
  }
  return d;
}

const done = (fn?: (g: Engine) => void) => (g: Engine) => {
  fn?.(g);
};

// ─── Act 1 ─────────────────────────────────────────────────

export const CALL_AFTER_PEE = say("vahe", "(shouting from the zal) Bro! Did you fall in or what? Come to the zal, we're waiting for you!", [
  { text: "Coming!", run: done() },
  {
    text: "(Look in the mirror first.)",
    run: (g) =>
      g.openDialogue(
        say("you", "Same face as last weekend. Same night as last weekend. At least they're here.", [{ text: "…", run: done() }]),
      ),
  },
]);

const getHigh = (g: Engine, followUp: string) => {
  g.audio.sfx("bong");
  g.camera.addShake(15);
  g.player.highness = 0.5;
  g.flags.smoke = 0.6;
  g.puff(30);
  g.standUp();
  g.toast("You are getting high! Colours are coming back.");
  g.schedule(3, () => g.toast(followUp));
  g.advance();
};

export const COUCH_CONVO = say("vahe", "Finally, man! What took you so long? Grish rolled a fat joint, sit down and smoke!", [
  { text: "Hell yeah, let's get high.", run: (g) => getHigh(g, "Vahe: \"Damn, my mouth is dry as sandpaper. Bring some water, bro!\"") },
  { text: "Sure. What are we listening to?", run: (g) => getHigh(g, "Grish: \"Weed is dry. I need some water, please!\"") },
]);

const afterLore = (g: Engine, sat: number, toast: string) => {
  g.addSatisfaction(sat);
  g.standUp();
  g.toast(toast);
  g.schedule(3, () => g.toast("Vahe: \"Guys, look what I got from that shaman...\""));
  g.advance();
};

const LONELY_THREAD = chain(
  [
    ["karen", "...Bro, it's one in the morning. Don't start."],
    ["grish", "Nah, let him talk. I get it. Sometimes the party is louder than my head. That's why I come."],
    ["vahe", "You have us, man. Every weekend. Same couch."],
  ],
  [
    { text: "Yeah. Same couch.", run: (g) => afterLore(g, 10, "Nobody says anything for a while. It's not bad.") },
    { text: "Forget it. Pass the joint.", run: (g) => afterLore(g, 5, "Karen laughs. The moment's gone.") },
  ],
);

export const LORE_CONVO = say(
  "karen",
  "Man, did you guys hear about the neighbour downstairs? He says he hears 'clanking metal kettle noises' at night. Spooky.",
  [
    { text: "Probably just pipes. Pass the weed.", run: (g) => afterLore(g, 15, "Satisfaction increased! Conversation flows.") },
    { text: "Maybe it's a giant chaynik boss coming for us! Haha.", run: (g) => afterLore(g, 25, "Friends loved that joke!") },
    { text: "Do you guys ever feel alone? Even like this, all together?", run: (g) => g.openDialogue(LONELY_THREAD) },
  ],
);

export const MUSHROOM_CONVO = chain(
  [
    ["vahe", "Alright, boys, time to take it to the next level. I got these from a shaman in Dilijan. Everyone eat one!"],
    ["you", "(You eat it. It tastes like dirt and pennies.)"],
    ["karen", "...Is the rug breathing? Tell me the rug isn't breathing."],
    ["grish", "Everyone shut up. I can hear the fridge thinking."],
  ],
  [
    {
      text: "The walls are closer than before.",
      run: (g) => mushroomsKick(g, "The walls lean in to listen."),
    },
    {
      text: "I like it. Nobody needs anything from me right now.",
      run: (g) => mushroomsKick(g, "For a second, everything is soft."),
    },
  ],
);

function mushroomsKick(g: Engine, toast: string) {
  g.player.held = "none";
  g.player.highness = 1;
  g.player.dizziness = 0.5;
  g.flags.hallucinating = true;
  g.toast(toast);
  g.schedule(3.5, () => g.openDialogue(COFFEE_REQUEST));
  g.advance();
}

export const COFFEE_REQUEST = say(
  "grish",
  "Yo... I need a coffee to ground me. Can you make one? You're the only one who can still walk.",
  [
    {
      text: "On it.",
      run: (g) => {
        g.standUp();
        g.toast("Head to the kitchen.");
      },
    },
    {
      text: "Why is it always me?",
      run: (g) =>
        g.openDialogue(
          say("grish", "'Cause you always say yes, bro. That's your thing.", [
            {
              text: "...Yeah. That's my thing.",
              run: (g2) => {
                g2.standUp();
                g2.toast("Head to the kitchen.");
              },
            },
          ]),
        ),
    },
  ],
);

// ─── Act 2 ─────────────────────────────────────────────────

/** Played once each by the whisper tiles in corridor 2, in order. */
export const CORRIDOR_WHISPERS = [
  "Karen (whispering): \"...he always laughs the loudest. Have you noticed?\"",
  "You: \"The walls here are quiet. Quieter than the zal ever is.\"",
  "Grish (whispering): \"Call me if you need anything... You never call.\"",
  "You: \"Am I walking toward something, or away from them?\"",
];

// ─── Act 3 ─────────────────────────────────────────────────

export const VAHE_PANIC = say("vahe", "Guys. GUYS. The music is inside my teeth. Is it supposed to be inside my teeth?!", [
  { text: "Breathe, Vahe. You're okay. I'm here.", run: (g) => g.toast("Vahe grabs your sleeve for a second, then lets go.") },
  { text: "Turn it up!", run: (g) => g.toast("Vahe screams. Then laughs. Then screams again.") },
]);

export const KAREN_FOOD = say("karen", "I'm still hungry. Is there anything real in that fridge? Not snacks. FOOD.", [
  { text: "I'll find something.", run: done() },
  { text: "You just ate everything in the wardrobe.", run: (g) => g.toast("Karen: \"That was an hour ago. In mushroom time that's a week.\"") },
]);

export const NEIGHBOUR_CONVO = say(
  "petrosian",
  "Hey! What is all this smoke and loud synthwave? I'm trying to sleep, and my ceiling is literally shaking!",
  [
    {
      text: "Really sorry, Mr. Petrosian. We're turning it down right now.",
      run: (g) => {
        g.toast("Neighbour: \"Fine. Keep it down, or next time I call the police!\"");
        g.audio.setTempo(130);
        g.audio.setMusicVolume(1);
        g.advance();
      },
    },
    {
      text: "Mind your own business, old man! We're vibing here!",
      run: (g) => {
        g.toast("Neighbour: \"That's it! I'm calling the cops right now!\"");
        g.addSatisfaction(-40);
        g.flags.neighbourAngry = true;
        g.advance();
      },
    },
    {
      text: "Do you live alone, Mr. Petrosian?",
      run: (g) =>
        g.openDialogue(
          say("petrosian", "...Thirty years in this building. Yes. Alone. Turn it down, son. And go to sleep.", [
            {
              text: "(Close the door gently.)",
              run: (g2) => {
                g2.audio.setTempo(130);
                g2.audio.setMusicVolume(1);
                g2.advance();
              },
            },
          ]),
        ),
    },
  ],
);

/** What each friend says as they get up and leave you on the couch. */
export const LEAVE_LINES: Record<FriendId, string> = {
  vahe: "Vahe: \"I need air. The window's calling my name.\"",
  karen: "Karen: \"I'm checking the fridge again. Don't judge me.\"",
  grish: "Grish: \"My mom's calling... I'll be in the corridor.\"",
};

/** The three-beat monologue on the couch. `lonely` adds up across answers and picks the last line. */
export function lonelyMonologue(onEnd: (g: Engine, lonely: number) => void): Dialogue {
  let lonely = 0;
  const pick = (n: number, next: Dialogue | (() => void)) => (g: Engine) => {
    lonely += n;
    if (typeof next === "function") next();
    else g.openDialogue(next);
  };
  const beat3: Dialogue = say("you", "If I closed my eyes right now... would anyone even notice?", [
    { text: "Close your eyes.", run: (g) => onEnd(g, lonely + 1) },
    {
      text: "Call out to them.",
      run: (g) =>
        g.openDialogue(
          say("you", "\"Guys?\" ...The music swallows it. Nobody turns around.", [{ text: "Close your eyes.", run: (g2) => onEnd(g2, lonely + 2) }]),
        ),
    },
  ]);
  const beat2: Dialogue = say("you", "Every weekend it's the same. Noise, smoke, laughing, so I never have to hear myself think.", [
    { text: "It works, most nights.", run: pick(0, beat3) },
    { text: "I'm so tired of the noise.", run: pick(1, beat3) },
  ]);
  return say("you", "Funny. Three people in this flat, and the couch still feels empty.", [
    { text: "They'll come back.", run: pick(0, beat2) },
    { text: "They were never really here.", run: pick(2, beat2) },
    { text: "Maybe I'm the one who left.", run: pick(1, beat2) },
  ]);
}

export const LONELY_CLOSERS = [
  "You tell yourself they'll come back. The room goes dark anyway.",
  "The music keeps going without you. The room folds in on itself.",
  "Nobody notices. The couch swallows you whole.",
];

// ─── Act 4 / ending ────────────────────────────────────────

/** Drift in every so often while you wander the maze. */
export const BACKROOMS_LINES = [
  "You: \"The lights hum like the fridge at home.\"",
  "You: \"Same hallway. Same carpet. Did I just pass this?\"",
  "Somewhere far away, the party is still going. You can almost hear Vahe laughing.",
  "You: \"My own footprints. I've been here before.\"",
  "You: \"Nobody's looking for me in here.\"",
];

export const ENDING_LINE = "You: \"And then it was quiet. The kind of quiet I kept running from.\"";

// ─── Act 5: home ───────────────────────────────────────────

export const HOME_ARRIVAL = "You're home. The music has stopped. Nobody is laughing.";

/** The last scene on the couch. Ends the game; deliberately shows nothing, it just goes dark. */
export function finalMonologue(onEnd: (g: Engine) => void): Dialogue {
  return chain(
    [
      ["you", "It's finally quiet. No music. No one asking me for water, or coffee, or anything."],
      ["you", "No one's going to call. No one's going to knock."],
    ],
    [
      {
        text: "This is what I wanted.",
        run: (g) => g.openDialogue(say("you", "...Was it?", [{ text: "Close your eyes.", run: onEnd }])),
      },
      {
        text: "This isn't what I wanted.",
        run: (g) => g.openDialogue(say("you", "I just didn't want to be alone.", [{ text: "Close your eyes.", run: onEnd }])),
      },
    ],
  );
}

// ─── Friend chat (E on the couch when it isn't the objective) ─

type Chat = string | Dialogue;

const smallTalk = (who: FriendId, text: string, replies: [string, string][]): Dialogue =>
  say(
    who,
    text,
    replies.map(([reply, answer]) => ({ text: reply, run: (g: Engine) => g.toast(answer) })),
  );

export const FRIEND_CHAT: Record<1 | 3, Record<FriendId, Chat[]>> = {
  1: {
    vahe: [
      "Vahe: \"Best night of the month, I swear. Every month.\"",
      "Vahe: \"Don't tell Karen, but I saved the good stuff for later.\"",
      "Vahe: \"You good, man? You went quiet for a sec.\"",
      smallTalk("vahe", "Do you ever think we'll still do this when we're forty?", [
        ["Hope so.", "Vahe: \"Same couch. Worse knees.\""],
        ["Hope not.", "Vahe: \"...Yeah. Me neither, honestly.\""],
      ]),
      "Vahe: \"This playlist is a crime. Who made this? Oh. Me.\"",
      "Vahe: \"Bro, sit down already, you're making me nervous.\"",
    ],
    karen: [
      "Karen: \"If someone says 'just one more', I'm leaving. I'm not leaving.\"",
      "Karen: \"Snacks. That's all I'm going to say. Snacks.\"",
      smallTalk("karen", "You text back, like, never. You know that?", [
        ["Sorry. I'm bad at that.", "Karen: \"I know. I still text you.\""],
        ["I'm here now, aren't I?", "Karen: \"Physically. Sure.\""],
      ]),
      "Karen: \"This rug has seen things. Terrible things.\"",
      "Karen: \"Who keeps opening the window? Oh, right. You. Good.\"",
      "Karen: \"I like it when it's all of us. It's quieter in my head.\"",
    ],
    grish: [
      "Grish: \"I rolled it, so I get first hit. Those are the rules.\"",
      "Grish: \"My mom thinks I'm at the library. At 1 AM.\"",
      smallTalk("grish", "Real talk: when was the last time you were okay alone?", [
        ["I'm fine alone.", "Grish: \"Sure, bro. That's why you're here every weekend.\""],
        ["I don't remember.", "Grish nods slowly. \"Yeah. Me neither.\""],
      ]),
      "Grish: \"Shh. I'm listening to the bass. It's telling me secrets.\"",
      "Grish: \"Bring water. Not for me. For the vibe.\"",
      "Grish: \"You're the only one of us with a job. Respect.\"",
    ],
  },
  3: {
    vahe: [
      "Vahe: \"Was I gone? Were you gone? Somebody was gone.\"",
      "Vahe: \"My hands feel like they belong to someone nicer.\"",
      smallTalk("vahe", "Do you think we actually like each other, or we're just used to each other?", [
        ["Both. That's friendship.", "Vahe: \"Wow. Okay. Deep. I need water.\""],
        ["I don't know anymore.", "Vahe stares at the TV for a long time."],
      ]),
      "Vahe: \"The ceiling is doing that thing again.\"",
      "Vahe: \"Thanks for the coffee earlier. Did you make coffee? I feel like you did.\"",
      "Vahe: \"Stay close, okay? Just tonight.\"",
    ],
    karen: [
      "Karen: \"Is it morning? It feels like the end of something.\"",
      "Karen: \"I ate a whole pack of crackers and I'm still empty.\"",
      smallTalk("karen", "You looked really far away a minute ago. Where'd you go?", [
        ["A long corridor.", "Karen: \"...Okay, weirdo. Welcome back.\""],
        ["Nowhere. Just tired.", "Karen: \"You're always 'just tired'.\""],
      ]),
      "Karen: \"The neighbour is going to murder us. Lovingly.\"",
      "Karen: \"Turn it down a bit? My heart's doing the music too.\"",
      "Karen: \"We should do something in the daytime sometime. Like people.\"",
    ],
    grish: [
      "Grish: \"Bro. The kettle. I keep thinking about the kettle.\"",
      "Grish: \"My phone has 14 missed calls. All mom. All love.\"",
      smallTalk("grish", "If one of us stopped coming, how long until the others noticed?", [
        ["A day.", "Grish: \"Liar. A week, minimum.\""],
        ["I'd notice.", "Grish: \"...Yeah. You would. You notice everything.\""],
      ]),
      "Grish: \"I'm not high. The room is high. I'm the only sober thing here.\"",
      "Grish: \"Second joint hits different. Like a sad song.\"",
      "Grish: \"Don't fall asleep first, they'll draw on your face.\"",
    ],
  },
};

/** Lines for pressing E on something that isn't the current objective. */
export const FLAVOR: Record<string, string[]> = {
  toilet: ["You already went. Twice, probably."],
  sink: ["You splash some water. Refreshing, but not now."],
  fridge: ["Half a lemon, mustard, and a mystery jar."],
  stove: ["The kettle stares back at you."],
  laptop: ["A playlist called 'zal vibes vol. 3'."],
  window: ["The city hums outside. Everyone out there is with someone."],
  wardrobe: ["Clothes. And a suspicious amount of snacks."],
  front_door: ["Nobody's there. Yet."],
};
