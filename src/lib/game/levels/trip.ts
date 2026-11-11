import { PALETTE } from "@/src/lib/game/constants";
import type { EnemyKind } from "@/src/lib/game/entities/shadow";
import { parseGrid } from "@/src/lib/game/levels/shared";
import type { Level, Rect, Vec } from "@/src/lib/game/types";

const CELL = 40;

/*
 * # wall · P player · S shadow · R brute · B boss
 * 1 / 2  choice zones just past each corridor entrance
 * a / b  gates at the corridor entrances (open until you pick the other corridor)
 * W      whisper triggers in corridor 2
 * X / Y  arena doors at the end of corridor 1 / corridor 2
 */
const MAP = [
  "############################################",
  "###############.............##.....#.......#",
  "###############..S......#.R......R.#.......#",
  "###############...##....#..........X.......#",
  "###############.....S....S..##..#..X.......#",
  "###############.............##.....#.......#",
  "######################11######.S...#.......#",
  "######################aa######.....#.......#",
  "#############......#......####.....#.......#",
  "#......######......#......##########.......#",
  "#......######...S..#......##########.......#",
  "#.P.......................##########...B...#",
  "#.........................##########.......#",
  "#......######......#......##########.......#",
  "#......######......#......##########.......#",
  "#############......#......######...Y.......#",
  "######################bb########...Y.......#",
  "######################22########.S##.......#",
  "######################..########W.##.......#",
  "######################.W########..##.......#",
  "######################.....S..W...##.......#",
  "######################...W........##.......#",
  "####################################.......#",
  "############################################",
];

export type Corridor = 1 | 2;

export interface EnemySpawn extends Vec {
  kind: EnemyKind;
  corridor: Corridor | null;
}

export interface TripLevel extends Level {
  enemySpawns: EnemySpawn[];
  bossSpawn: Vec;
  /** Gate that seals each corridor's entrance when the *other* one is chosen. */
  gates: Record<Corridor, Rect[]>;
  /** Stepping into these picks a corridor. */
  choiceZones: Record<Corridor, Rect[]>;
  /** Arena door at the end of each corridor. */
  arenaDoors: Record<Corridor, Rect[]>;
  whispers: Rect[];
  /** Entering this rect starts the boss fight. */
  arenaTrigger: Rect;
}

const cellRect = (p: Vec): Rect => ({ x: p.x - CELL / 2, y: p.y - CELL / 2, w: CELL, h: CELL });

const inRect = (p: Vec, r: Rect) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;

/** Corridor regions in pixels (used to tag enemies). */
const REGION: Record<Corridor, Rect> = {
  1: { x: 15 * CELL, y: 1 * CELL, w: 20 * CELL, h: 8 * CELL },
  2: { x: 22 * CELL, y: 15 * CELL, w: 13 * CELL, h: 7 * CELL },
};

export function buildTrip(): TripLevel {
  const grid = parseGrid(MAP, CELL);
  const m = (ch: string) => grid.markers[ch] ?? [];
  const tag = (p: Vec): Corridor | null => (inRect(p, REGION[1]) ? 1 : inRect(p, REGION[2]) ? 2 : null);
  const sign1 = m("1")[0];
  const sign2 = m("2")[0];
  return {
    id: "trip",
    width: grid.width,
    height: grid.height,
    wallGlow: "#d946ef",
    playerStart: m("P")[0],
    walls: grid.walls,
    floors: [{ x: 0, y: 0, w: grid.width, h: grid.height, tile: "tile.trip", color: "#090514", line: "#4a044e", dim: 0.62 }],
    props: [
      // Neon signs over each corridor entrance, on the fork-room side.
      { sprite: "prop.sign_1", x: sign1.x + 6, y: sign1.y + 92, w: 28, h: 28, color: PALETTE.pink },
      { sprite: "prop.sign_2", x: sign2.x + 6, y: sign2.y - 120, w: 28, h: 28, color: PALETTE.cyan },
      { sprite: "prop.mushrooms", x: 90, y: 380, w: 30, h: 30, color: "#a21caf" },
      { sprite: "prop.mushrooms", x: 640, y: 120, w: 30, h: 30, color: "#a21caf" },
      { sprite: "prop.candle", x: 900, y: 820, w: 14, h: 14, color: PALETTE.yellow },
      { sprite: "prop.candle", x: 1290, y: 650, w: 14, h: 14, color: PALETTE.yellow },
      { sprite: "prop.plant", x: 520, y: 330, w: 34, h: 34, color: "#581c87", solid: true },
    ],
    hotspots: [],
    enemySpawns: [
      ...m("S").map((p) => ({ ...p, kind: "shadow" as const, corridor: tag(p) })),
      ...m("R").map((p) => ({ ...p, kind: "brute" as const, corridor: tag(p) })),
    ],
    bossSpawn: m("B")[0],
    gates: { 1: m("a").map(cellRect), 2: m("b").map(cellRect) },
    choiceZones: { 1: m("1").map(cellRect), 2: m("2").map(cellRect) },
    arenaDoors: { 1: m("X").map(cellRect), 2: m("Y").map(cellRect) },
    whispers: m("W").map(cellRect),
    arenaTrigger: { x: 36 * CELL + 20, y: CELL, w: 7 * CELL - 20, h: 22 * CELL },
  };
}
