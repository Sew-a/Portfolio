import { angleDiff, dist, lineOfSight, moveCircle } from "@/src/lib/game/collision";
import { BRUTE, SHADOW } from "@/src/lib/game/constants";
import type { Engine } from "@/src/lib/game/engine";
import type { Vec } from "@/src/lib/game/types";

type ShadowState = "patrol" | "react" | "chase" | "windup" | "lunge" | "recover" | "stunned" | "dead";

const FACES = ["vahe", "karen", "grish"] as const;

export type EnemyKind = "shadow" | "brute";
const STATS = { shadow: SHADOW, brute: BRUTE };

/**
 * Trip enemy: patrols, spots you on line of sight, chases, telegraphs a lunge.
 * Shadows die in one stab; brutes take two and hit harder-to-dodge swings.
 */
export class Shadow {
  readonly r: number;
  readonly stats: typeof SHADOW;
  hp: number;
  /** Seconds of white flash after a non-lethal hit. */
  hurtFlash = 0;
  /** Which Act 2 corridor this enemy belongs to (null = shared area). */
  corridor: 1 | 2 | null = null;
  state: ShadowState = "patrol";
  angle = Math.random() * Math.PI * 2;
  animT = Math.random();
  face: (typeof FACES)[number];

  private t = 0;
  private home: Vec;
  private target: Vec;
  private lastSeen: Vec | null = null;
  private lungeAngle = 0;
  private lungeHit = false;

  constructor(public x: number, public y: number, index: number, public kind: EnemyKind = "shadow") {
    this.stats = STATS[kind];
    this.r = this.stats.radius;
    this.hp = this.stats.hp;
    this.home = { x, y };
    this.target = { x, y };
    this.face = FACES[index % FACES.length];
  }

  get alive() {
    return this.state !== "dead";
  }

  get stunned() {
    return this.state === "stunned";
  }

  /** 0..1 while winding up, for the telegraph flash. */
  get windup() {
    return this.state === "windup" ? 1 - this.t / this.stats.windup : 0;
  }

  get reacting() {
    return this.state === "react";
  }

  alert(x: number, y: number) {
    if (this.state === "patrol") {
      this.state = "react";
      this.t = this.stats.react;
      this.lastSeen = { x, y };
    }
  }

  stun(duration: number) {
    if (!this.alive) return;
    this.state = "stunned";
    this.t = duration;
  }

  kill() {
    this.state = "dead";
  }

  /** Returns true if this hit killed it. */
  hit(fromAngle: number, g: Engine): boolean {
    this.hp -= 1;
    if (this.hp <= 0) {
      this.kill();
      return true;
    }
    this.hurtFlash = 0.15;
    moveCircle(this, Math.cos(fromAngle) * 26, Math.sin(fromAngle) * 26, this.r, g.blockers);
    this.stun(0.35);
    return false;
  }

  update(g: Engine, dt: number) {
    if (!this.alive) return;
    this.animT += dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    const S = this.stats;
    const p = g.player;
    const d = dist(this.x, this.y, p.x, p.y);
    const toPlayer = Math.atan2(p.y - this.y, p.x - this.x);
    // Furniture is low: only walls block sight.
    const sees = d < S.sight && lineOfSight(this, p, g.level.walls);

    switch (this.state) {
      case "patrol": {
        if (sees && (d < 140 || angleDiff(this.angle, toPlayer) < 1.4)) {
          this.alert(p.x, p.y);
          g.audio.sfx("alert");
          g.alertShadows(this.x, this.y, p.x, p.y);
          break;
        }
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const len = Math.hypot(dx, dy);
        if (len < 6) {
          const a = Math.random() * Math.PI * 2;
          this.target = { x: this.home.x + Math.cos(a) * 70, y: this.home.y + Math.sin(a) * 70 };
          break;
        }
        this.angle = Math.atan2(dy, dx);
        if (moveCircle(this, (dx / len) * S.patrolSpeed * dt, (dy / len) * S.patrolSpeed * dt, this.r, g.blockers)) {
          this.target = { ...this.home };
        }
        break;
      }
      case "react":
        this.angle = toPlayer;
        this.t -= dt;
        if (this.t <= 0) this.state = "chase";
        break;
      case "chase": {
        if (sees) this.lastSeen = { x: p.x, y: p.y };
        if (sees && d < S.attackRange) {
          this.state = "windup";
          this.t = S.windup;
          break;
        }
        const goal = this.lastSeen ?? { x: p.x, y: p.y };
        const dx = goal.x - this.x;
        const dy = goal.y - this.y;
        const len = Math.hypot(dx, dy);
        if (len < 8) {
          if (!sees) {
            this.state = "patrol";
            this.home = { x: this.x, y: this.y };
            this.target = { ...this.home };
          }
          break;
        }
        this.angle = Math.atan2(dy, dx);
        moveCircle(this, (dx / len) * S.chaseSpeed * dt, (dy / len) * S.chaseSpeed * dt, this.r, g.blockers);
        break;
      }
      case "windup":
        if (this.t > 0.12) this.angle = toPlayer;
        this.t -= dt;
        if (this.t <= 0) {
          this.state = "lunge";
          this.t = S.lungeTime;
          this.lungeAngle = this.angle;
          this.lungeHit = false;
        }
        break;
      case "lunge":
        moveCircle(this, Math.cos(this.lungeAngle) * S.lungeSpeed * dt, Math.sin(this.lungeAngle) * S.lungeSpeed * dt, this.r, g.blockers);
        if (!this.lungeHit && dist(this.x, this.y, p.x, p.y) < this.r + p.r + 6) {
          this.lungeHit = true;
          g.hurtPlayer(this.x, this.y, "The shadows of your friends pulled you under.");
        }
        this.t -= dt;
        if (this.t <= 0) {
          this.state = "recover";
          this.t = S.recover;
        }
        break;
      case "recover":
      case "stunned":
        this.t -= dt;
        if (this.t <= 0) this.state = "chase";
        break;
    }
  }
}
