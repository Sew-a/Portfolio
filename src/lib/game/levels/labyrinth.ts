import { generateMaze, hasPassage, type Cell } from "@/src/lib/game/levels/maze";
import type { Level, Prop, Rect, Vec } from "@/src/lib/game/types";

/** Size of one maze cell and its walls, in px. */
const CELL = 112;
const WALL = 22;
const MARGIN = 40;
const COLS = 12;
const ROWS = 9;
const ENEMIES = 6;

export interface BackroomsLevel extends Level {
  /** Walking into this ends the act. */
  exit: Rect;
  exitCenter: Vec;
  enemySpawns: Vec[];
}

const centre = (c: Cell): Vec => ({ x: MARGIN + c.x * CELL + CELL / 2, y: MARGIN + c.y * CELL + CELL / 2 });

/**
 * Act 4: an endless-feeling office maze. Damp yellow walls, buzzing lights, a carpet that goes on
 * forever. One way out, a few loops, six shadows waiting along the right route.
 */
export function buildBackrooms(): BackroomsLevel {
  const maze = generateMaze(COLS, ROWS);
  const width = MARGIN * 2 + COLS * CELL;
  const height = MARGIN * 2 + ROWS * CELL;
  const half = WALL / 2;
  const walls: Rect[] = [
    { x: MARGIN - half, y: MARGIN - half, w: COLS * CELL + WALL, h: WALL },
    { x: MARGIN - half, y: MARGIN + ROWS * CELL - half, w: COLS * CELL + WALL, h: WALL },
    { x: MARGIN - half, y: MARGIN - half, w: WALL, h: ROWS * CELL + WALL },
    { x: MARGIN + COLS * CELL - half, y: MARGIN - half, w: WALL, h: ROWS * CELL + WALL },
  ];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const left = MARGIN + x * CELL;
      const top = MARGIN + y * CELL;
      if (x < COLS - 1 && !hasPassage(maze, { x, y }, "e")) walls.push({ x: left + CELL - half, y: top - half, w: WALL, h: CELL + WALL });
      if (y < ROWS - 1 && !hasPassage(maze, { x, y }, "s")) walls.push({ x: left - half, y: top + CELL - half, w: CELL + WALL, h: WALL });
    }
  }

  // Shadows along the real route, spread from a fifth of the way in to just before the exit.
  const enemySpawns: Vec[] = [];
  for (let i = 0; i < ENEMIES; i++) {
    const idx = Math.round(maze.path.length * (0.2 + (0.72 * i) / (ENEMIES - 1)));
    enemySpawns.push(centre(maze.path[Math.min(idx, maze.path.length - 2)]));
  }

  // Lonely leftovers from the party in some dead ends.
  const ODDITIES: Omit<Prop, "x" | "y">[] = [
    { sprite: "prop.chair", w: 22, h: 22, rot: 0.4, color: "#3f3f46" },
    { sprite: "prop.bottles", w: 18, h: 12, color: "#365314" },
    { sprite: "prop.guitar", w: 18, h: 52, rot: -0.6, color: "#b45309" },
    { sprite: "prop.pizza_box", w: 26, h: 26, rot: 0.2, color: "#d97706" },
    { sprite: "prop.floor_lamp", w: 20, h: 20, color: "#fde68a" },
    { sprite: "prop.ashtray", w: 12, h: 12, color: "#64748b" },
  ];
  const props: Prop[] = maze.deadEnds
    .filter((c) => c.x + c.y > 1 && !(c.x === maze.exit.x && c.y === maze.exit.y))
    .slice(0, ODDITIES.length)
    .map((c, i) => {
      const p = centre(c);
      const o = ODDITIES[i];
      return { ...o, x: p.x - o.w / 2, y: p.y - o.h / 2 };
    });

  const exitCenter = centre(maze.exit);
  props.push({ sprite: "prop.front_door_open", x: exitCenter.x - 24, y: exitCenter.y + CELL / 2 - 24, w: 48, h: 14, rot: Math.PI / 2, color: "#ffffff" });

  return {
    id: "labyrinth",
    width,
    height,
    wallGlow: "#e8d48a",
    wallFill: "#8f7f3c",
    playerStart: centre(maze.start),
    walls,
    floors: [{ x: MARGIN, y: MARGIN, w: COLS * CELL, h: ROWS * CELL, tile: "tile.backrooms", color: "#5c4f22", line: "#4e431c" }],
    props,
    hotspots: [],
    exit: { x: exitCenter.x - CELL / 3, y: exitCenter.y - CELL / 3, w: (CELL * 2) / 3, h: (CELL * 2) / 3 },
    exitCenter,
    enemySpawns,
  };
}

export function buildFinale(): Level {
  const T = 16;
  return {
    id: "finale",
    width: 800,
    height: 800,
    wallGlow: "#ef4444",
    playerStart: { x: 400, y: 620 },
    walls: [
      { x: 100 - T, y: 100 - T, w: 600 + T * 2, h: T },
      { x: 100 - T, y: 700, w: 600 + T * 2, h: T },
      { x: 100 - T, y: 100 - T, w: T, h: 600 + T * 2 },
      { x: 700, y: 100 - T, w: T, h: 600 + T * 2 },
    ],
    floors: [{ x: 100, y: 100, w: 600, h: 600, tile: "tile.labyrinth", color: "#0c0205", line: "#450a0a", dim: 0.5 }],
    props: [{ sprite: "prop.couch", x: 330, y: 246, w: 140, h: 58, rot: -Math.PI / 2, color: "#4c1d95", solid: true }],
    hotspots: [],
  };
}
