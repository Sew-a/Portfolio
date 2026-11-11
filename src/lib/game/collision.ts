import type { Rect, Vec } from "@/src/lib/game/types";

export const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(bx - ax, by - ay);

/** Smallest absolute difference between two angles, in [0, π]. */
export function angleDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

export function circleHitsRect(x: number, y: number, r: number, rect: Rect): boolean {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

export function circleHitsRects(x: number, y: number, r: number, rects: Rect[]): boolean {
  for (const rect of rects) {
    if (circleHitsRect(x, y, r, rect)) return true;
  }
  return false;
}

/**
 * Moves a circle by (dx, dy), one axis at a time so it slides along walls.
 * Large moves are split into sub-steps so dashes and knockback never tunnel through walls.
 * Returns true if anything blocked the move.
 */
export function moveCircle(pos: Vec, dx: number, dy: number, r: number, rects: Rect[]): boolean {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (r * 0.5)));
  const sx = dx / steps;
  const sy = dy / steps;
  let blocked = false;
  for (let i = 0; i < steps; i++) {
    pos.x += sx;
    if (circleHitsRects(pos.x, pos.y, r, rects)) {
      pos.x -= sx;
      blocked = true;
    }
    pos.y += sy;
    if (circleHitsRects(pos.x, pos.y, r, rects)) {
      pos.y -= sy;
      blocked = true;
    }
  }
  return blocked;
}

/** Liang–Barsky segment vs axis-aligned rectangle. */
export function segmentHitsRect(x1: number, y1: number, x2: number, y2: number, rect: Rect): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - rect.x, rect.x + rect.w - x1, y1 - rect.y, rect.y + rect.h - y1];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

export function lineOfSight(a: Vec, b: Vec, rects: Rect[]): boolean {
  for (const rect of rects) {
    if (segmentHitsRect(a.x, a.y, b.x, b.y, rect)) return false;
  }
  return true;
}
