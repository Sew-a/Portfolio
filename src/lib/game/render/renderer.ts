import { BOSS, MELEE, PALETTE, VIEW_H, VIEW_W } from "@/src/lib/game/constants";
import { FRIEND_INFO, type Friend } from "@/src/lib/game/entities/friend";
import type { Shadow } from "@/src/lib/game/entities/shadow";
import type { Engine } from "@/src/lib/game/engine";
import type { BackroomsLevel } from "@/src/lib/game/levels/labyrinth";
import type { FloorRegion, Prop } from "@/src/lib/game/types";

const BG = "#05050a";

export function render(g: Engine, ctx: CanvasRenderingContext2D) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.save();
  ctx.translate(VIEW_W / 2, VIEW_H / 2);
  ctx.rotate(g.camera.angle);
  ctx.translate(-VIEW_W / 2 - Math.round(g.camera.drawX), -VIEW_H / 2 - Math.round(g.camera.drawY));

  g.level.floors.forEach((f) => drawFloor(g, ctx, f));
  g.decals.draw(ctx);
  g.level.props.forEach((p) => drawProp(g, ctx, p));
  drawWalls(g, ctx);
  drawHotspots(g, ctx);

  for (const f of g.friends) drawFriend(g, ctx, f);
  for (const s of g.shadows) if (!s.alive) drawShadow(g, ctx, s);
  for (const s of g.shadows) if (s.alive) drawShadow(g, ctx, s);
  drawBoss(g, ctx);
  drawPlayer(g, ctx);
  g.particles.draw(ctx);
  drawPrompt(g, ctx);
  ctx.restore();

  drawEdgeShadows(g, ctx);
  drawDarkness(g, ctx);
  drawObjectiveArrow(g, ctx);
  drawExitGlow(g, ctx);
  drawPeeMeter(g, ctx);
  drawBanner(g, ctx);
  if (g.fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${g.fadeAlpha})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

// ─── World ─────────────────────────────────────────────────

function drawFloor(g: Engine, ctx: CanvasRenderingContext2D, f: FloorRegion) {
  const pattern = g.atlas.pattern(ctx, f.tile);
  ctx.fillStyle = pattern ?? f.color;
  ctx.fillRect(f.x, f.y, f.w, f.h);
  if (pattern && f.dim) {
    ctx.fillStyle = `rgba(3, 2, 8, ${f.dim})`;
    ctx.fillRect(f.x, f.y, f.w, f.h);
  }
  if (pattern || !f.line) return;
  ctx.strokeStyle = f.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const step = f.tile === "tile.wood" ? 40 : 32;
  for (let x = f.x + step; x < f.x + f.w; x += step) {
    ctx.moveTo(x + 0.5, f.y);
    ctx.lineTo(x + 0.5, f.y + f.h);
  }
  if (f.tile !== "tile.wood") {
    for (let y = f.y + step; y < f.y + f.h; y += step) {
      ctx.moveTo(f.x, y + 0.5);
      ctx.lineTo(f.x + f.w, y + 0.5);
    }
  }
  ctx.stroke();
  if (f.tile === "tile.checker") {
    ctx.fillStyle = f.line;
    for (let x = f.x; x < f.x + f.w; x += step) {
      for (let y = f.y; y < f.y + f.h; y += step) {
        if ((Math.floor(x / step) + Math.floor(y / step)) % 2 === 0) ctx.fillRect(x, y, step, step);
      }
    }
  }
}

function drawProp(g: Engine, ctx: CanvasRenderingContext2D, p: Prop) {
  let color = p.color;
  const open = (!!p.id && g.openProps.has(p.id)) || (p.id === "window" && g.flags.windowOpen);
  if (open) color = p.id === "window" ? PALETTE.cyan : "#fef3c7";
  // After the mushrooms, furniture breathes a little.
  const wobble = g.flags.hallucinating && p.solid ? Math.sin(g.time * 2 + p.x * 0.05) * 0.04 : 0;
  const rot = (p.rot ?? 0) + wobble;
  const sprite = open && g.atlas.has(`${p.sprite}_open`) ? `${p.sprite}_open` : p.sprite;
  if (g.atlas.drawRect(ctx, sprite, p.x, p.y, p.w, p.h, rot)) return;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  // Fallback blocks already match the footprint; only small decorative tilts apply.
  if (p.rot && Math.abs(Math.sin(p.rot)) < Math.SQRT1_2) ctx.rotate(p.rot);
  ctx.fillStyle = color;
  ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-p.w / 2 + 1, -p.h / 2 + 1, p.w - 2, p.h - 2);
  if (p.sprite.startsWith("prop.door_neon") || p.sprite === "prop.painting" || p.sprite === "prop.window") {
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  }
  ctx.restore();
}

function drawWalls(g: Engine, ctx: CanvasRenderingContext2D) {
  const pattern = g.level.wallFill ? null : g.atlas.pattern(ctx, "tile.wall");
  ctx.fillStyle = g.level.wallFill ?? pattern ?? "#0a0a18";
  for (const w of g.level.walls) ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.save();
  ctx.strokeStyle = g.level.wallGlow;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 8;
  ctx.shadowColor = g.level.wallGlow;
  for (const w of g.level.walls) ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  ctx.restore();

  // Shut gates and arena doors in the trip: pulsing neon bars across the opening.
  const closed = g.closedTripDoors();
  if (closed.length) {
    ctx.save();
    ctx.fillStyle = PALETTE.pink;
    ctx.globalAlpha = 0.55 + Math.sin(g.time * 6) * 0.25;
    ctx.shadowBlur = 16;
    ctx.shadowColor = PALETTE.pink;
    for (const d of closed) ctx.fillRect(d.x + 4, d.y + 4, d.w - 8, d.h - 8);
    ctx.restore();
  }
}

function drawHotspots(g: Engine, ctx: CanvasRenderingContext2D) {
  for (const h of g.level.hotspots) {
    const relevant = g.isRelevant(h.id);
    ctx.save();
    if (relevant) {
      const pulse = (Math.sin(g.time * 5) + 1) / 2;
      ctx.strokeStyle = PALETTE.yellow;
      ctx.globalAlpha = 0.35 + pulse * 0.45;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 14 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = PALETTE.yellow;
      ctx.shadowBlur = 10;
      ctx.shadowColor = PALETTE.yellow;
      ctx.fillRect(h.x - 3, h.y - 3, 6, 6);
    } else {
      ctx.fillStyle = "rgba(224, 224, 255, 0.25)";
      ctx.fillRect(h.x - 2, h.y - 2, 4, 4);
    }
    ctx.restore();
  }
}

function drawPrompt(g: Engine, ctx: CanvasRenderingContext2D) {
  const h = g.nearHotspot();
  if (!h || g.transitioning) return;
  const relevant = g.isRelevant(h.id);
  const label = g.promptLabel(h);
  ctx.save();
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  const w = ctx.measureText(label).width + 12;
  ctx.fillStyle = "rgba(5, 5, 10, 0.75)";
  ctx.fillRect(h.x - w / 2, h.y - 36, w, 16);
  ctx.fillStyle = relevant ? PALETTE.yellow : "rgba(224, 224, 255, 0.6)";
  ctx.fillText(label, h.x, h.y - 24);
  ctx.restore();
}

// ─── Characters ────────────────────────────────────────────

function sprite(g: Engine, ctx: CanvasRenderingContext2D, key: string, t: number, x: number, y: number, angle: number, size: number, fps = 8, loop = true) {
  const name = g.atlas.animFrame(key, t, fps, loop);
  return !!name && g.atlas.draw(ctx, name, x, y, angle, size);
}

function corpse(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-16, -12, 32, 24);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(10, -7, 14, 14);
  ctx.restore();
}

function drawFriend(g: Engine, ctx: CanvasRenderingContext2D, f: Friend) {
  const info = FRIEND_INFO[f.id];
  if (!f.alive) {
    if (!sprite(g, ctx, `${f.id}.dead`, 0, f.x, f.y, f.angle, 64)) corpse(ctx, f.x, f.y, f.angle, info.color);
    return;
  }
  const panic = f.state === "panic" || f.state === "flee";
  const bob = Math.sin(f.animT * (g.flags.music ? 9 : 3)) * f.bobAmp;
  const shake = panic ? Math.sin(f.animT * 50) * 2 : 0;
  const x = f.x + shake;
  const y = f.y + bob * 0.4;
  const anim = f.state === "flee" || f.state === "walk" ? "walk" : f.state === "stand" ? "idle" : panic ? "panic" : "sit";
  if (sprite(g, ctx, `${f.id}.${anim}`, f.animT, x, y, f.angle, 64)) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(f.angle);
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(4, -18, 8, 8);
  ctx.fillRect(4, 10, 8, 8);
  ctx.fillStyle = info.color;
  ctx.fillRect(-15, -15, 30, 30);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(-8, -8, 16, 16);
  ctx.fillStyle = info.accent;
  ctx.fillRect(-10, -9, 6, 18);
  ctx.restore();
}

function drawShadow(g: Engine, ctx: CanvasRenderingContext2D, s: Shadow) {
  if (!s.alive) {
    if (!sprite(g, ctx, `${s.kind}.dead`, 0, s.x, s.y, s.angle, s.kind === "brute" ? 80 : 64)) corpse(ctx, s.x, s.y, s.angle, "#1e1b4b");
    return;
  }
  const flash = s.windup > 0 && Math.floor(s.windup * 12) % 2 === 0;
  const anim = s.state === "lunge" || s.state === "windup" ? "attack" : s.state === "patrol" || s.state === "chase" ? "walk" : "idle";
  ctx.save();
  if (s.stunned) ctx.globalAlpha = 0.6 + Math.sin(g.time * 20) * 0.2;
  if (s.hurtFlash > 0) ctx.filter = "brightness(2.5)";
  const size = s.kind === "brute" ? 80 : 64;
  const drawn = sprite(g, ctx, `${s.kind}.${anim}`, s.animT, s.x, s.y, s.angle, size, s.kind === "brute" ? 7 : 10, anim !== "attack");
  if (!drawn) {
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = s.kind === "brute" ? "rgba(239, 68, 68, 0.25)" : "rgba(189, 0, 255, 0.25)";
    ctx.fillRect(-s.r - 8, -s.r - 8, s.r * 2 + 16, s.r * 2 + 16);
    ctx.fillStyle = flash ? "#f43f5e" : "#1e1b4b";
    ctx.fillRect(-s.r, -s.r, s.r * 2, s.r * 2);
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(5, -6, 4, 4);
    ctx.fillRect(5, 2, 4, 4);
    const arm = s.state === "lunge" ? 14 : 6;
    ctx.fillStyle = "#0f0a2a";
    ctx.fillRect(s.r - 4, -14, arm, 6);
    ctx.fillRect(s.r - 4, 8, arm, 6);
  } else if (flash) {
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(244, 63, 94, 0.5)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#c084fc";
  ctx.fillText(s.kind === "brute" ? "???" : s.face.toUpperCase(), s.x, s.y + s.r + 14);
  if (s.reacting) {
    ctx.fillStyle = PALETTE.yellow;
    ctx.font = "bold 18px monospace";
    ctx.fillText("!", s.x, s.y - 24);
  }
  if (s.stunned) {
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillText("✶", s.x + Math.cos(g.time * 8) * 10, s.y - 22);
  }
  ctx.restore();
}

function drawBoss(g: Engine, ctx: CanvasRenderingContext2D) {
  const b = g.boss;
  if (!b) return;
  if (!b.alive) {
    if (!sprite(g, ctx, "boss.dead", 0, b.x, b.y, b.angle, 128)) corpse(ctx, b.x, b.y, b.angle, "#475569");
    return;
  }

  // Telegraphs
  if (b.kickCharge > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 100, 0, 0.9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(b.x, b.y, BOSS.kickRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 100, 0, 0.18)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, BOSS.kickRadius * b.kickCharge, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (b.steamCharge > 0 || b.steaming) {
    ctx.save();
    ctx.fillStyle = b.steaming ? "rgba(244, 63, 94, 0.12)" : `rgba(244, 63, 94, ${0.08 + b.steamCharge * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.arc(b.x, b.y, BOSS.steamRange, b.aim - BOSS.steamArc, b.aim + BOSS.steamArc);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const anim = b.kickCharge > 0 ? "kick" : b.steaming || b.steamCharge > 0 ? "steam" : "walk";
  ctx.save();
  if (b.hurtFlash > 0) ctx.filter = "brightness(2.5)";
  const drawn = sprite(g, ctx, `boss.${anim}`, b.animT, b.x, b.y, b.angle, 128, 8, anim === "walk");
  if (!drawn) {
    const pulse = Math.sin(g.time * 10) * 6;
    ctx.translate(b.x, b.y);
    ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
    ctx.fillRect(-b.r - 10 - pulse, -b.r - 10 - pulse, (b.r + 10 + pulse) * 2, (b.r + 10 + pulse) * 2);
    ctx.rotate(b.angle);
    ctx.fillStyle = b.hurtFlash > 0 ? "#ffffff" : "#475569";
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 4;
    ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
    ctx.strokeRect(-b.r, -b.r, b.r * 2, b.r * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-b.r - 15, -10, 15, 20);
    ctx.fillRect(b.r, -8, 25, 12);
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(b.r - 16, -14, 6, 6);
    ctx.fillRect(b.r - 16, 8, 6, 6);
  }
  ctx.restore();
}

function drawPlayer(g: Engine, ctx: CanvasRenderingContext2D) {
  const p = g.player;
  if (p.iframes > 0 && Math.floor(p.iframes * 15) % 2 === 0) return;
  if (p.seated && sprite(g, ctx, "player.sit", 0, p.x, p.y, p.angle, 64)) return;
  const anim = p.swingT > 0 ? "attack" : p.moving ? "walk" : "idle";
  const t = p.swingT > 0 ? MELEE.swingTime - p.swingT : p.walkT;
  if (sprite(g, ctx, `player.${anim}`, t, p.x, p.y, p.angle, 64, anim === "attack" ? 20 : 10, anim !== "attack")) {
    drawHeldOverlay(g, ctx);
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  const bob = p.moving ? Math.sin(p.walkT * 20) * 4 : 0;
  const swing = p.swingT > 0 ? 10 : 0;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(10 + swing, -12 + bob, 6, 6);
  ctx.fillRect(10 + swing, 8 - bob, 6, 6);
  ctx.fillStyle = PALETTE.player;
  ctx.shadowBlur = 8;
  ctx.shadowColor = PALETTE.player;
  ctx.fillRect(-15, -15, 30, 30);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(-7, -7, 14, 14);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(12, -2, 5, 4);
  ctx.restore();
  drawHeldOverlay(g, ctx);
}

const HELD_COLORS: Record<string, string> = {
  water: "#06b6d4",
  snacks: "#f43f5e",
  coffee: "#f59e0b",
  beer: "#a16207",
  food: "#84cc16",
  mushrooms: "#a21caf",
  joint: "#e5e7eb",
};

/** Atlas sprite for a held item when it isn't `prop.<item>` (coffee is drawn as a cup). */
const HELD_SPRITE: Record<string, string> = { coffee: "prop.cup" };

function drawHeldOverlay(g: Engine, ctx: CanvasRenderingContext2D) {
  const p = g.player;
  const hx = p.x + Math.cos(p.angle) * 18 + Math.cos(p.angle + Math.PI / 2) * 9;
  const hy = p.y + Math.sin(p.angle) * 18 + Math.sin(p.angle + Math.PI / 2) * 9;
  if (p.armed) {
    // Knife: thrusts forward on a stab.
    const reach = p.swingT > 0 ? 12 : 0;
    const kx = hx + Math.cos(p.angle) * (reach + 4);
    const ky = hy + Math.sin(p.angle) * (reach + 4);
    if (!g.atlas.draw(ctx, "prop.knife", kx, ky, p.angle, 22)) {
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(p.angle);
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(-9, -2, 7, 4);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(-2, -1.5, 13, 3);
      ctx.restore();
    }
    return;
  }
  if (p.held === "none" || p.seated) return;
  if (!g.atlas.draw(ctx, HELD_SPRITE[p.held] ?? `prop.${p.held}`, hx, hy, p.angle, 14)) {
    ctx.fillStyle = HELD_COLORS[p.held];
    ctx.fillRect(hx - 4, hy - 4, 8, 9);
  }
}

// ─── Screen space ──────────────────────────────────────────

function drawObjectiveArrow(g: Engine, ctx: CanvasRenderingContext2D) {
  const target = g.objectiveTarget();
  if (!target || g.screen !== "playing" || g.transitioning) return;
  const sx = target.x - g.camera.drawX;
  const sy = target.y - g.camera.drawY;
  const margin = 36;
  const onScreen = sx > margin && sx < VIEW_W - margin && sy > margin && sy < VIEW_H - margin;
  const near = Math.hypot(target.x - g.player.x, target.y - g.player.y) < 220;
  if (onScreen && near) return;
  const px = g.player.x - g.camera.drawX;
  const py = g.player.y - g.camera.drawY;
  const a = Math.atan2(sy - py, sx - px);
  let ax: number;
  let ay: number;
  if (onScreen) {
    ax = px + Math.cos(a) * 46;
    ay = py + Math.sin(a) * 46;
  } else {
    ax = Math.max(margin, Math.min(VIEW_W - margin, sx));
    ay = Math.max(margin, Math.min(VIEW_H - margin, sy));
  }
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(a);
  ctx.globalAlpha = 0.65 + Math.sin(g.time * 6) * 0.25;
  ctx.fillStyle = PALETTE.yellow;
  ctx.shadowBlur = 10;
  ctx.shadowColor = PALETTE.yellow;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-6, -7);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPeeMeter(g: Engine, ctx: CanvasRenderingContext2D) {
  if (g.step.id !== "piss" || g.screen !== "playing") return;
  const w = 160;
  const x = (VIEW_W - w) / 2;
  const y = VIEW_H - 40;
  ctx.save();
  ctx.fillStyle = "rgba(5, 5, 10, 0.8)";
  ctx.fillRect(x - 2, y - 2, w + 4, 14);
  ctx.fillStyle = "#eab308";
  ctx.fillRect(x, y, (w * g.player.pissLevel) / 100, 10);
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.text;
  ctx.fillText("BLADDER", VIEW_W / 2, y - 6);
  ctx.restore();
}

function drawBanner(g: Engine, ctx: CanvasRenderingContext2D) {
  const b = g.banner;
  if (!b || g.screen !== "playing") return;
  const alpha = Math.min(1, b.t / 0.6) * Math.min(1, (2.5 - b.t) / 0.4 + 0.2);
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
  ctx.fillRect(0, VIEW_H / 2 - 34, VIEW_W, 68);
  ctx.font = "bold 30px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.pink;
  ctx.shadowBlur = 16;
  ctx.shadowColor = PALETTE.pink;
  ctx.fillText(b.text, VIEW_W / 2, VIEW_H / 2);
  ctx.restore();
}

/** Post-mushroom: dark figures flicker at the edges of your vision. */
function drawEdgeShadows(g: Engine, ctx: CanvasRenderingContext2D) {
  if (!g.flags.hallucinating || g.level.id !== "house") return;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const phase = g.time * 0.7 + i * 2.1;
    const alpha = Math.max(0, Math.sin(phase * 1.3)) * 0.35;
    if (alpha < 0.02) continue;
    const side = i % 2 === 0 ? 18 : VIEW_W - 18;
    const y = VIEW_H * (0.25 + 0.5 * ((Math.sin(phase * 0.37 + i) + 1) / 2));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#05010a";
    ctx.beginPath();
    ctx.ellipse(side, y, 16, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(side - 6, y - 20, 3, 3);
    ctx.fillRect(side + 3, y - 20, 3, 3);
  }
  ctx.restore();
}

/** Corridor 2: you only see a circle around yourself. */
function drawDarkness(g: Engine, ctx: CanvasRenderingContext2D) {
  if (!g.flags.dark) return;
  const px = g.player.x - g.camera.drawX;
  const py = g.player.y - g.camera.drawY;
  // The maze's lights buzz and occasionally stutter.
  const stutter = g.level.id === "labyrinth" && Math.sin(g.time * 1.7) > 0.97 ? 0.75 : 1;
  const radius = (g.flags.darkRadius + Math.sin(g.time * 7) * 4 + Math.sin(g.time * 13) * 3) * stutter;
  const grad = ctx.createRadialGradient(px, py, radius * 0.35, px, py, radius);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.94)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

/** Maze: the exit leaks a cold white light through the dark once you're getting close. */
function drawExitGlow(g: Engine, ctx: CanvasRenderingContext2D) {
  if (g.level.id !== "labyrinth") return;
  const exit = (g.level as BackroomsLevel).exitCenter;
  const d = Math.hypot(exit.x - g.player.x, exit.y - g.player.y);
  const strength = Math.max(0, 1 - d / 520);
  if (strength <= 0) return;
  const sx = exit.x - g.camera.drawX;
  const sy = exit.y - g.camera.drawY;
  const r = 70 + strength * 60;
  const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
  grad.addColorStop(0, `rgba(220, 240, 255, ${0.55 * strength})`);
  grad.addColorStop(1, "rgba(220, 240, 255, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  ctx.restore();
}
