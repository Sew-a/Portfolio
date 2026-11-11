import type { Engine } from "@/src/lib/game/engine";
import { COUCH_CONVO, KAREN_FOOD, LORE_CONVO, MUSHROOM_CONVO, NEIGHBOUR_CONVO, VAHE_PANIC } from "@/src/lib/game/story/dialogues";
import { finalScene, lonelinessScene } from "@/src/lib/game/story/scenes";

export type Act = 1 | 2 | 3 | 4 | 5;

export interface StepDef {
  id: string;
  act: Act;
  task: (g: Engine) => string;
  /** Hotspot that completes this step. Drives the objective arrow and the bright prompt. */
  target?: (g: Engine) => string | null;
  interact?: (g: Engine) => void;
}

const text = (s: string) => () => s;
const at = (id: string) => () => id;

/** Couch conversations seat you first, like the rest of the crew. */
const couchTalk = (g: Engine, d: Parameters<Engine["openDialogue"]>[0]) => {
  g.sitDown();
  g.openDialogue(d);
};

/** The whole story in order. Each act's first step is its checkpoint. */
export const STEPS: StepDef[] = [
  // ─── Act 1: the party ──────────────────────────────────
  { id: "piss", act: 1, task: text("Finish peeing (hold [E] at the toilet)"), target: at("toilet") },
  { id: "talk", act: 1, task: text("Go to the zal and smoke with the crew"), target: at("couch"), interact: (g) => couchTalk(g, COUCH_CONVO) },
  {
    id: "water",
    act: 1,
    task: text("Fetch cold water from the kitchen fridge"),
    target: at("fridge"),
    interact: (g) => {
      g.player.held = "water";
      g.openProp("fridge");
      g.audio.sfx("fridge");
      g.toast("Water fetched! Bring it to the couch.");
      g.advance();
    },
  },
  {
    id: "give_water",
    act: 1,
    task: text("Share the water (and take a sip yourself)"),
    target: at("couch"),
    interact: (g) => {
      g.player.held = "none";
      g.audio.sfx("sip");
      g.addSatisfaction(20);
      g.toast("Everyone drinks. You too. The smoke is getting thick, though...");
      g.advance();
    },
  },
  {
    id: "window",
    act: 1,
    task: text("Open the zal window to clear the smoke"),
    target: at("window"),
    interact: (g) => {
      g.flags.windowOpen = true;
      g.audio.sfx("window");
      g.flags.smoke = 0.15;
      g.toast("Window opened. Smoke is clearing!");
      g.advance();
    },
  },
  {
    id: "snacks",
    act: 1,
    task: text("Fetch snacks from the bedroom wardrobe"),
    target: at("wardrobe"),
    interact: (g) => {
      g.player.held = "snacks";
      g.openProp("wardrobe");
      g.audio.sfx("creak");
      g.toast("Snacks fetched! Take them to the couch.");
      g.advance();
    },
  },
  {
    id: "give_snacks",
    act: 1,
    task: text("Share the snacks"),
    target: at("couch"),
    interact: (g) => {
      g.player.held = "none";
      g.audio.sfx("pickup");
      g.addSatisfaction(15);
      g.toast("Snacks shared! Now play some music.");
      g.advance();
    },
  },
  {
    id: "music",
    act: 1,
    task: text("Play some synth tunes on the laptop"),
    target: at("laptop"),
    interact: (g) => {
      g.flags.music = true;
      g.audio.sfx("laptop");
      g.audio.startMusic();
      g.toast("Music is playing. Synth beats start!");
      g.advance();
    },
  },
  { id: "convo", act: 1, task: text("Hang out with the crew"), target: at("couch"), interact: (g) => couchTalk(g, LORE_CONVO) },
  {
    id: "mushrooms",
    act: 1,
    task: text("Eat Vahe's magical mushrooms"),
    target: at("couch"),
    interact: (g) => {
      g.player.held = "mushrooms";
      couchTalk(g, MUSHROOM_CONVO);
    },
  },
  // Completed by walking into the kitchen (see Engine.updateHouse).
  { id: "coffee", act: 1, task: text("Make Grish a coffee in the kitchen"), target: at("stove") },

  // ─── Act 2: the trip ───────────────────────────────────
  { id: "walk", act: 2, task: text("Walk the corridors") },
  { id: "choose", act: 2, task: text("Choose a corridor: 1 or 2") },
  {
    id: "corridor",
    act: 2,
    task: (g) => {
      if (g.corridor === 2) return "Walk corridor 2 to the end";
      const left = g.corridorEnemiesLeft();
      return left > 0 ? `Fight through corridor 1 (${left} left)` : "Go through the door";
    },
  },
  { id: "boss", act: 2, task: (g) => `Defeat the Giant Chaynik (${Math.ceil(g.boss?.hp ?? 0)} HP)` },

  // ─── Act 3: back to "reality" ──────────────────────────
  {
    id: "wash",
    act: 3,
    task: text("Wash your dizzy face at the bathroom sink"),
    target: at("sink"),
    interact: (g) => {
      g.player.dizziness = 0;
      g.audio.sfx("splash");
      g.audio.stopDizzy();
      g.toast("Face washed. Dizziness cleared!");
      g.advance();
    },
  },
  {
    id: "beer",
    act: 3,
    task: text("Grab a beer from the fridge"),
    target: at("fridge"),
    interact: (g) => {
      g.player.held = "beer";
      g.openProp("fridge");
      g.audio.sfx("fridge");
      g.schedule(0.5, () => g.audio.sfx("sip"));
      g.toast("Drinking beer... feeling warm.");
      g.addSatisfaction(15);
      g.advance();
    },
  },
  {
    id: "smoke_again",
    act: 3,
    task: text("Have a second smoke on the couch"),
    target: at("couch"),
    interact: (g) => {
      g.player.held = "joint";
      g.audio.sfx("bong");
      g.player.highness = 0.8;
      g.flags.smoke = 0.7;
      g.puff(20);
      g.addSatisfaction(10);
      g.toast("Smoked a joint. High again!");
      g.schedule(2, () => {
        if (g.player.held === "joint") g.player.held = "none";
      });
      g.advance();
    },
  },
  {
    id: "dance",
    act: 3,
    task: text("Crank the music up on the laptop"),
    target: at("laptop"),
    interact: (g) => {
      g.audio.sfx("laptop");
      g.toast("Dancing and headbanging to the beats!");
      g.audio.setTempo(155);
      g.audio.setMusicVolume(1.5);
      for (const f of g.friends) {
        f.bobAmp = 8;
        if (f.id === "vahe") f.state = "panic";
      }
      g.advance();
      g.schedule(1.5, () => g.openDialogue(VAHE_PANIC));
      g.schedule(5, () => g.knockOnWall());
      g.schedule(9, () => g.knockOnWall());
      g.schedule(11, () => g.openDialogue(KAREN_FOOD));
    },
  },
  {
    id: "food",
    act: 3,
    task: text("Find Karen some real food in the fridge"),
    target: at("fridge"),
    interact: (g) => {
      g.player.held = "food";
      g.openProp("fridge");
      g.audio.sfx("fridge");
      g.toast("Leftover dolma. Perfect.");
      g.advance();
    },
  },
  {
    id: "give_food",
    act: 3,
    task: text("Bring the food to Karen"),
    target: at("couch"),
    interact: (g) => {
      g.player.held = "none";
      g.audio.sfx("pickup");
      g.addSatisfaction(15);
      g.toast("Karen: \"You're an angel. A weird, quiet angel.\"");
      g.advance();
      g.schedule(2.5, () => {
        g.audio.sfx("knock");
        g.camera.addShake(8);
        g.openProp("front_door", 0);
        g.flags.knocked = true;
        g.toast("LOUD KNOCKING ON THE FRONT DOOR!");
      });
    },
  },
  {
    id: "neighbour",
    act: 3,
    task: (g) => (g.flags.knocked ? "Answer the front door" : "Somebody's coming..."),
    target: (g) => (g.flags.knocked ? "front_door" : null),
    interact: (g) => {
      g.audio.sfx("door");
      g.openProp("front_door");
      g.openDialogue(NEIGHBOUR_CONVO);
    },
  },
  {
    id: "couch_end",
    act: 3,
    task: text("Join the crew for one final joint"),
    target: at("couch"),
    interact: (g) => lonelinessScene(g),
  },

  // ─── Act 4: the maze ───────────────────────────────────
  { id: "maze", act: 4, task: text("Find a way out") },
  { id: "ending", act: 4, task: (g) => `Erase the illusion (${g.friends.filter((f) => f.alive).length} left)` },

  // ─── Act 5: home ───────────────────────────────────────
  { id: "home", act: 5, task: text("Sit down on the couch"), target: at("couch"), interact: (g) => finalScene(g) },
];

export const firstStepOfAct = (act: Act) => STEPS.findIndex((s) => s.act === act);
