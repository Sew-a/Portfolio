import { PALETTE } from "@/src/lib/game/constants";

type ParticleKind = "spark" | "smoke";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  kind: ParticleKind;
}

const MAX_PARTICLES = 600;

/** Short-lived particles. Velocities are px/s, lifetimes are seconds. */
export class Particles {
  private list: Particle[] = [];

  clear() {
    this.list.length = 0;
  }

  add(x: number, y: number, vx: number, vy: number, color: string, size: number, life: number, kind: ParticleKind = "spark") {
    if (this.list.length >= MAX_PARTICLES) this.list.shift();
    this.list.push({ x, y, vx, vy, size, life, maxLife: life, color, kind });
  }

  burst(x: number, y: number, count: number, color: string, speed: number, size: number, life: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.add(x, y, Math.cos(a) * v, Math.sin(a) * v, color, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.6));
    }
  }

  cone(x: number, y: number, angle: number, spread: number, count: number, color: string, speed: number, size: number, life: number) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.5 + Math.random() * 0.5);
      this.add(x, y, Math.cos(a) * v, Math.sin(a) * v, color, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.6));
    }
  }

  smoke(x: number, y: number, vx: number, vy: number, color = "rgba(170, 200, 170, 0.25)") {
    this.add(x, y, vx, vy, color, 12 + Math.random() * 14, 2.5 + Math.random() * 1.5, "smoke");
  }

  update(dt: number) {
    const drag = Math.exp(-dt * 1.2);
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.kind === "smoke") {
        p.size += 14 * dt;
        p.vx *= drag;
        p.vy *= drag;
      } else {
        p.vx *= Math.exp(-dt * 3);
        p.vy *= Math.exp(-dt * 3);
      }
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      if (p.kind === "smoke") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }
}

/** Persistent floor stains (blood, scorch) baked into an offscreen canvas per level. */
export class Decals {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  reset(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
  }

  splat(x: number, y: number, size: number, color: string = PALETTE.blood) {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * size;
      const s = 3 + Math.random() * size * 0.45;
      ctx.fillRect(Math.round(x + Math.cos(a) * d - s / 2), Math.round(y + Math.sin(a) * d - s / 2), s, s);
    }
    ctx.globalAlpha = 1;
  }

  /** A faint shoe print, so you can tell where you've already walked. `left` alternates feet. */
  footprint(x: number, y: number, angle: number, left: boolean) {
    const ctx = this.ctx;
    if (!ctx) return;
    const side = left ? -5 : 5;
    ctx.save();
    ctx.translate(x + Math.cos(angle + Math.PI / 2) * side, y + Math.sin(angle + Math.PI / 2) * side);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(20, 14, 4, 0.35)";
    ctx.fillRect(-5, -2.5, 10, 5);
    ctx.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.canvas) ctx.drawImage(this.canvas, 0, 0);
  }
}
