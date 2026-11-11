import { VIEW_H, VIEW_W } from "@/src/lib/game/constants";
import type { Vec } from "@/src/lib/game/types";

export class Camera {
  x = 0;
  y = 0;
  angle = 0;
  shake = 0;
  /** Final offsets used for drawing this frame (includes shake). */
  drawX = 0;
  drawY = 0;

  snap(target: Vec, width: number, height: number) {
    this.x = this.clampX(target.x - VIEW_W / 2, width);
    this.y = this.clampY(target.y - VIEW_H / 2, height);
    this.shake = 0;
  }

  addShake(amount: number) {
    this.shake = Math.max(this.shake, amount);
  }

  update(dt: number, target: Vec, width: number, height: number, wobble: number, time: number) {
    const k = 1 - Math.exp(-dt * 8);
    this.x += (this.clampX(target.x - VIEW_W / 2, width) - this.x) * k;
    this.y += (this.clampY(target.y - VIEW_H / 2, height) - this.y) * k;
    this.angle = Math.sin(time * 2) * wobble;
    this.shake *= Math.exp(-dt * 7);
    if (this.shake < 0.2) this.shake = 0;
    this.drawX = this.x + (Math.random() - 0.5) * this.shake;
    this.drawY = this.y + (Math.random() - 0.5) * this.shake;
  }

  /** Screen → world (ignores the small wobble rotation, which is fine for aiming). */
  toWorld(sx: number, sy: number): Vec {
    return { x: sx + this.drawX, y: sy + this.drawY };
  }

  private clampX(x: number, width: number) {
    const pad = 40;
    if (width + pad * 2 <= VIEW_W) return (width - VIEW_W) / 2;
    return Math.max(-pad, Math.min(x, width - VIEW_W + pad));
  }

  private clampY(y: number, height: number) {
    const pad = 40;
    if (height + pad * 2 <= VIEW_H) return (height - VIEW_H) / 2;
    return Math.max(-pad, Math.min(y, height - VIEW_H + pad));
  }
}
