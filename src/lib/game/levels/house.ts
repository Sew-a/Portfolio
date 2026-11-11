import { seg } from "@/src/lib/game/levels/shared";
import type { Level } from "@/src/lib/game/types";

// Sprites face +X; these turn them toward the room.
const FACE_UP = -Math.PI / 2;
const FACE_DOWN = Math.PI / 2;
/** Bed sprite has its pillows on the left, so this puts them against the top wall. */
const UP_TO_WALL = Math.PI / 2;

/** The apartment: bedroom (top-left), zal (top-right), corridor, bathroom, kitchen (bottom). */
export function buildHouse(): Level {
  return {
    id: "house",
    width: 800,
    height: 800,
    wallGlow: "#6366f1",
    playerStart: { x: 330, y: 660 },
    walls: [
      seg(20, 20, 780, 20),
      seg(20, 20, 20, 780),
      seg(780, 20, 780, 780),
      seg(20, 780, 780, 780),
      // bedroom/zal | corridor/bathroom/kitchen, doors at x 80–140 and 540–620
      seg(20, 450, 80, 450),
      seg(140, 450, 540, 450),
      seg(620, 450, 780, 450),
      // bedroom | zal, archway y 250–320
      seg(300, 20, 300, 250),
      seg(300, 320, 300, 450),
      // corridor | bathroom, door y 520–590
      seg(240, 450, 240, 520),
      seg(240, 590, 240, 780),
      // bathroom | kitchen, door y 600–670
      seg(480, 450, 480, 600),
      seg(480, 670, 480, 780),
    ],
    floors: [
      { x: 20, y: 20, w: 280, h: 430, tile: "tile.wood", color: "#2d1b10", line: "#1e0f07" },
      { x: 300, y: 20, w: 480, h: 430, tile: "tile.wood", color: "#3f2516", line: "#1e0f07" },
      { x: 20, y: 450, w: 220, h: 330, tile: "tile.wood", color: "#24160d", line: "#140a05" },
      { x: 240, y: 450, w: 240, h: 330, tile: "tile.bath", color: "#0f172a", line: "#334155" },
      { x: 480, y: 450, w: 300, h: 330, tile: "tile.checker", color: "#020617", line: "#1e1b4b" },
    ],
    props: [
      { sprite: "prop.rug", x: 470, y: 270, w: 200, h: 120, color: "#3b0764" },
      { sprite: "prop.bed", x: 40, y: 34, w: 112, h: 156, rot: UP_TO_WALL, color: "#475569", solid: true },
      { id: "wardrobe", sprite: "prop.wardrobe", x: 186, y: 28, w: 100, h: 48, rot: FACE_DOWN, color: "#78350f", solid: true },
      { sprite: "prop.plant", x: 30, y: 400, w: 34, h: 34, color: "#166534", solid: true },
      { sprite: "prop.couch", x: 480, y: 194, w: 160, h: 64, rot: FACE_UP, color: "#4c1d95", solid: true },
      { sprite: "prop.table", x: 520, y: 112, w: 84, h: 52, rot: FACE_DOWN, color: "#5b21b6", solid: true },
      { sprite: "prop.tv", x: 524, y: 27, w: 76, h: 24, rot: FACE_DOWN, color: "#000000", solid: true },
      { sprite: "prop.table", x: 384, y: 108, w: 72, h: 46, rot: FACE_DOWN, color: "#312e81", solid: true },
      { sprite: "prop.laptop", x: 402, y: 118, w: 36, h: 26, color: "#00f3ff" },
      { sprite: "prop.plant", x: 735, y: 400, w: 34, h: 34, color: "#166534", solid: true },
      { id: "window", sprite: "prop.window", x: 768, y: 240, w: 12, h: 80, color: "#ff007f" },
      { id: "front_door", sprite: "prop.front_door", x: 20, y: 690, w: 10, h: 60, color: "#10b981" },
      { sprite: "prop.sink", x: 256, y: 458, w: 40, h: 38, rot: FACE_DOWN, color: "#cbd5e1", solid: true },
      { sprite: "prop.toilet", x: 342, y: 718, w: 36, h: 54, rot: FACE_UP, color: "#e0e0ff", solid: true },
      { id: "fridge", sprite: "prop.fridge", x: 718, y: 714, w: 56, h: 60, rot: FACE_UP, color: "#1e293b", solid: true },
      { sprite: "prop.stove", x: 656, y: 716, w: 56, h: 58, rot: FACE_UP, color: "#7c2d12", solid: true },

      // Bedroom
      { sprite: "prop.nightstand", x: 156, y: 36, w: 24, h: 24, color: "#5b3a1e", solid: true },
      { sprite: "prop.dresser", x: 28, y: 222, w: 28, h: 62, color: "#6b4423", solid: true },
      { sprite: "prop.desk", x: 28, y: 300, w: 36, h: 72, color: "#4a3426", solid: true },
      { sprite: "prop.chair", x: 68, y: 324, w: 22, h: 22, rot: Math.PI, color: "#1f2937" },
      { sprite: "prop.bookshelf", x: 264, y: 112, w: 30, h: 82, rot: Math.PI, color: "#3f2a1a", solid: true },
      { sprite: "prop.floor_lamp", x: 266, y: 206, w: 20, h: 20, color: "#fde68a" },
      { sprite: "prop.guitar", x: 196, y: 318, w: 18, h: 52, rot: 0.35, color: "#b45309" },
      { sprite: "prop.bottles", x: 120, y: 238, w: 18, h: 12, rot: 0.6, color: "#365314" },

      // Zal
      { sprite: "prop.speaker", x: 496, y: 30, w: 20, h: 20, color: "#111827", solid: true },
      { sprite: "prop.speaker", x: 608, y: 30, w: 20, h: 20, color: "#111827", solid: true },
      { sprite: "prop.bookshelf", x: 312, y: 28, w: 82, h: 30, rot: FACE_DOWN, color: "#3f2a1a", solid: true },
      { sprite: "prop.chair", x: 410, y: 160, w: 22, h: 22, rot: FACE_UP, color: "#1f2937" },
      { sprite: "prop.armchair", x: 676, y: 196, w: 42, h: 42, rot: Math.PI, color: "#6d28d9", solid: true },
      { sprite: "prop.floor_lamp", x: 700, y: 34, w: 20, h: 20, color: "#fde68a" },
      { sprite: "prop.pizza_box", x: 604, y: 296, w: 26, h: 26, rot: 0.3, color: "#d97706" },
      { sprite: "prop.ashtray", x: 552, y: 130, w: 12, h: 12, color: "#64748b" },
      { sprite: "prop.bottles", x: 652, y: 268, w: 18, h: 12, rot: -0.4, color: "#365314" },
      { sprite: "prop.guitar", x: 330, y: 360, w: 18, h: 52, rot: -0.5, color: "#b45309" },

      // Corridor
      { sprite: "prop.shoe_rack", x: 28, y: 596, w: 16, h: 52, color: "#44403c", solid: true },
      { sprite: "prop.coat_rack", x: 30, y: 650, w: 20, h: 20, color: "#57534e", solid: true },
      { sprite: "prop.bookshelf", x: 204, y: 612, w: 30, h: 82, rot: Math.PI, color: "#3f2a1a", solid: true },
      { sprite: "prop.plant", x: 198, y: 458, w: 30, h: 30, color: "#166534", solid: true },
      { sprite: "prop.trash", x: 210, y: 750, w: 16, h: 16, color: "#374151" },

      // Bathroom
      { sprite: "prop.bathtub", x: 426, y: 458, w: 46, h: 92, rot: Math.PI, color: "#e2e8f0", solid: true },
      { sprite: "prop.cabinet", x: 314, y: 458, w: 42, h: 20, rot: FACE_DOWN, color: "#94a3b8", solid: true },
      { sprite: "prop.washer", x: 250, y: 738, w: 32, h: 32, rot: FACE_UP, color: "#cbd5e1", solid: true },
      { sprite: "prop.trash", x: 446, y: 752, w: 16, h: 16, color: "#374151" },

      // Kitchen
      { sprite: "prop.counter", x: 556, y: 744, w: 92, h: 30, rot: FACE_UP, color: "#57534e", solid: true },
      { sprite: "prop.counter", x: 744, y: 470, w: 30, h: 92, rot: Math.PI, color: "#57534e", solid: true },
      { sprite: "prop.dining_table", x: 594, y: 562, w: 72, h: 52, rot: FACE_DOWN, color: "#78350f", solid: true },
      { sprite: "prop.chair", x: 568, y: 577, w: 22, h: 22, color: "#1f2937" },
      { sprite: "prop.chair", x: 670, y: 577, w: 22, h: 22, rot: Math.PI, color: "#1f2937" },
      { sprite: "prop.bottles", x: 620, y: 580, w: 18, h: 12, color: "#365314" },
      { sprite: "prop.trash", x: 492, y: 754, w: 16, h: 16, color: "#374151" },
    ],
    hotspots: [
      { id: "toilet", name: "Toilet", x: 360, y: 740, r: 52 },
      { id: "sink", name: "Sink", x: 278, y: 480, r: 48 },
      { id: "fridge", name: "Fridge", x: 745, y: 728, r: 56 },
      { id: "stove", name: "Stove & kettle", x: 686, y: 735, r: 52 },
      { id: "couch", name: "Couch & crew", x: 560, y: 218, r: 70 },
      { id: "laptop", name: "Laptop", x: 420, y: 132, r: 50 },
      { id: "window", name: "Zal window", x: 772, y: 280, r: 50 },
      { id: "wardrobe", name: "Wardrobe", x: 236, y: 92, r: 52 },
      { id: "front_door", name: "Front door", x: 26, y: 720, r: 46 },
    ],
  };
}

export const COUCH_SEATS = {
  vahe: { x: 504, y: 214 },
  karen: { x: 544, y: 214 },
  grish: { x: 584, y: 214 },
};

/** The player's spot at the right end of the couch, and where he stands up to. */
export const PLAYER_SEAT = { x: 622, y: 214 };
export const PLAYER_STAND = { x: 622, y: 284 };

/** Crossing into this rect during the coffee step triggers the blackout. */
export const KITCHEN = { x: 486, y: 456, w: 288, h: 318 };

/** Interior wall spots the Act 3 knocks come from. */
export const KNOCK_SPOTS = [
  { x: 300, y: 120 },
  { x: 160, y: 450 },
  { x: 780, y: 360 },
];

/** Act 3 loneliness scene: where each friend wanders off to (waypoints through doorways). */
export const WANDER_PATHS = {
  vahe: { path: [{ x: 504, y: 280 }, { x: 700, y: 300 }, { x: 740, y: 280 }], face: 0 },
  karen: { path: [{ x: 544, y: 290 }, { x: 580, y: 420 }, { x: 580, y: 500 }, { x: 720, y: 520 }, { x: 716, y: 660 }], face: Math.PI / 2 },
  grish: { path: [{ x: 584, y: 290 }, { x: 330, y: 290 }, { x: 280, y: 285 }, { x: 200, y: 330 }, { x: 110, y: 430 }, { x: 110, y: 520 }], face: Math.PI / 2 },
};
