export type Dir = "n" | "e" | "s" | "w";

const DELTA: Record<Dir, { dx: number; dy: number; opp: Dir }> = {
  n: { dx: 0, dy: -1, opp: "s" },
  e: { dx: 1, dy: 0, opp: "w" },
  s: { dx: 0, dy: 1, opp: "n" },
  w: { dx: -1, dy: 0, opp: "e" },
};

const DIR_LIST = Object.keys(DELTA) as Dir[];

export interface Cell {
  x: number;
  y: number;
}

export interface Maze {
  w: number;
  h: number;
  start: Cell;
  exit: Cell;
  /** Open passages, both directions stored: "x,y,dir". */
  passages: Set<string>;
  /** Cells from start to exit, inclusive. */
  path: Cell[];
  /** Cells with a single opening (good spots for eerie props). */
  deadEnds: Cell[];
}

const key = (c: Cell) => `${c.x},${c.y}`;
const edgeKey = (c: Cell, d: Dir) => `${c.x},${c.y},${d}`;
const step = (c: Cell, d: Dir): Cell => ({ x: c.x + DELTA[d].dx, y: c.y + DELTA[d].dy });

export const hasPassage = (m: Maze, c: Cell, d: Dir) => m.passages.has(edgeKey(c, d));

const shuffle = <T>(list: T[]) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/**
 * Random walk-through maze. A depth-first search carves a perfect maze, then `braid` of the dead
 * ends get knocked through so there are loops: easier to get out of, harder to feel sure about.
 * Start is top-left, exit bottom-right.
 */
export function generateMaze(w: number, h: number, braid = 0.35): Maze {
  const inside = (c: Cell) => c.x >= 0 && c.y >= 0 && c.x < w && c.y < h;
  const maze: Maze = { w, h, start: { x: 0, y: 0 }, exit: { x: w - 1, y: h - 1 }, passages: new Set(), path: [], deadEnds: [] };
  const open = (c: Cell, d: Dir) => {
    maze.passages.add(edgeKey(c, d));
    maze.passages.add(edgeKey(step(c, d), DELTA[d].opp));
  };
  const openings = (c: Cell) => DIR_LIST.filter((d) => hasPassage(maze, c, d));

  const seen = new Set([key(maze.start)]);
  const stack: Cell[] = [maze.start];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const d = shuffle([...DIR_LIST]).find((dir) => inside(step(cur, dir)) && !seen.has(key(step(cur, dir))));
    if (!d) {
      stack.pop();
      continue;
    }
    open(cur, d);
    seen.add(key(step(cur, d)));
    stack.push(step(cur, d));
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = { x, y };
      if (openings(c).length !== 1 || Math.random() > braid) continue;
      const wall = shuffle(DIR_LIST.filter((d) => inside(step(c, d)) && !hasPassage(maze, c, d)))[0];
      if (wall) open(c, wall);
    }
  }

  // Shortest route start → exit (breadth-first).
  const prev = new Map<string, Cell | null>([[key(maze.start), null]]);
  const queue: Cell[] = [maze.start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (key(cur) === key(maze.exit)) break;
    for (const d of openings(cur)) {
      const n = step(cur, d);
      if (prev.has(key(n))) continue;
      prev.set(key(n), cur);
      queue.push(n);
    }
  }
  for (let c: Cell | null = maze.exit; c; c = prev.get(key(c)) ?? null) maze.path.unshift(c);

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (openings({ x, y }).length === 1) maze.deadEnds.push({ x, y });
  return maze;
}
