/** Logical canvas resolution. CSS scales it to fit the frame. */
export const VIEW_W = 800;
export const VIEW_H = 600;

/** Fixed simulation step (seconds). */
export const STEP = 1 / 60;
/** Never simulate more than this many steps per animation frame (tab was hidden, etc.). */
export const MAX_STEPS_PER_FRAME = 5;

export const ATLAS_JSON_URL = "/smoke-sim/atlas.json";
export const ATLAS_IMG_URL = "/smoke-sim/atlas.png";

export const SAVE_KEY = "smoke-sim:act";

export const PLAYER = {
  radius: 14,
  speed: 210,
  dizzySpeed: 125,
  dashSpeed: 860,
  dashTime: 0.16,
  dashCooldown: 0.8,
  maxHp: 5,
  iframes: 1,
  knockback: 260,
};

/** Knife stab: quick and short. */
export const MELEE = {
  cooldown: 0.22,
  swingTime: 0.12,
  range: 52,
  arc: 0.85,
};

export const SHADOW = {
  radius: 14,
  patrolSpeed: 55,
  chaseSpeed: 150,
  sight: 380,
  react: 0.35,
  attackRange: 78,
  windup: 0.42,
  lungeTime: 0.2,
  lungeSpeed: 520,
  recover: 0.55,
  alertRadius: 220,
  hp: 1,
};

/** Corridor 1 heavy: bigger, slower, two hits, long telegraphed swing. */
export const BRUTE: typeof SHADOW = {
  radius: 20,
  patrolSpeed: 40,
  chaseSpeed: 105,
  sight: 340,
  react: 0.5,
  attackRange: 92,
  windup: 0.65,
  lungeTime: 0.24,
  lungeSpeed: 430,
  recover: 0.8,
  alertRadius: 220,
  hp: 2,
};

export const BOSS = {
  radius: 34,
  maxHp: 6,
  speed: [80, 92, 112],
  kickRange: 115,
  kickRadius: 125,
  kickWindup: 0.6,
  kickCooldown: 1.6,
  steamWindup: 0.5,
  steamTime: 1.0,
  steamRange: 270,
  steamArc: 0.5,
  steamCooldown: 3.2,
};

export const COMBO_WINDOW = 2.5;
export const HITSTOP = 0.07;

export const SATISFACTION = {
  start: 80,
  drain: 0.3,
  smokyDrain: 1.1,
  angryDrain: 0.9,
};

export const PEE_RATE = 45;

/** How much being high slows you down in the house (fraction of speed at highness 1). */
export const HIGH_SLOWDOWN = 0.25;

export const PALETTE = {
  pink: "#ff007f",
  cyan: "#00f3ff",
  green: "#39ff14",
  yellow: "#fffb00",
  purple: "#bd00ff",
  blood: "#e11d48",
  spark: "#fbbf24",
  text: "#e0e0ff",
  player: "#38bdf8",
};
