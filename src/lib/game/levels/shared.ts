import type { Rect } from "@/src/lib/game/types";

export const WALL = 12;

/** A wall along a horizontal or vertical line, `WALL` px thick, centred on the line. */
export function seg(x1: number, y1: number, x2: number, y2: number): Rect {
  const half = WALL / 2;
  if (y1 === y2) return { x: Math.min(x1, x2) - half, y: y1 - half, w: Math.abs(x2 - x1) + WALL, h: WALL };
  return { x: x1 - half, y: Math.min(y1, y2) - half, w: WALL, h: Math.abs(y2 - y1) + WALL };
}

export interface GridResult {
  walls: Rect[];
  /** Cells for each marker character, as centre points. */
  markers: Record<string, { x: number; y: number }[]>;
  /** Rects of `D` cells (doors that open later). */
  doors: Rect[];
  width: number;
  height: number;
}

/**
 * Parses an ASCII map: `#` wall, `D` locked door, `.` floor, any other char is a floor marker.
 * Horizontal runs of `#` merge into one rect to keep collision cheap.
 */
export function parseGrid(rows: string[], cell: number): GridResult {
  const walls: Rect[] = [];
  const doors: Rect[] = [];
  const markers: GridResult["markers"] = {};
  rows.forEach((row, r) => {
    let runStart = -1;
    for (let c = 0; c <= row.length; c++) {
      const ch = row[c];
      if (ch === "#") {
        if (runStart < 0) runStart = c;
        continue;
      }
      if (runStart >= 0) {
        walls.push({ x: runStart * cell, y: r * cell, w: (c - runStart) * cell, h: cell });
        runStart = -1;
      }
      if (ch === undefined || ch === ".") continue;
      if (ch === "D") {
        doors.push({ x: c * cell, y: r * cell, w: cell, h: cell });
        continue;
      }
      (markers[ch] ??= []).push({ x: c * cell + cell / 2, y: r * cell + cell / 2 });
    }
  });
  return { walls: mergeVertical(walls), doors, markers, width: rows[0].length * cell, height: rows.length * cell };
}

/** Joins rects that share x/width and touch vertically, so wall columns draw as one block. */
function mergeVertical(rects: Rect[]): Rect[] {
  const out: Rect[] = [];
  const sorted = [...rects].sort((a, b) => a.x - b.x || a.w - b.w || a.y - b.y);
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && last.x === r.x && last.w === r.w && last.y + last.h === r.y) last.h += r.h;
    else out.push({ ...r });
  }
  return out;
}
