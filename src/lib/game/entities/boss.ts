import { angleDiff, dist, lineOfSight, moveCircle } from "@/src/lib/game/collision";
import { BOSS, PALETTE } from "@/src/lib/game/constants";
import type { Engine } from "@/src/lib/game/engine";

type BossState = "chase" | "kickWind" | "steamWind" | "steam" | "stunned" | "dead";

/** The Giant Chaynik. Three phases by HP: chase + kick, then steam, then everything faster. */
export class Boss {
  readonly r = BOSS.radius;
  hp = BOSS.maxHp;
  state: BossState = "chase";
  angle = Math.PI;
  aim = 0;
  animT = 0;
  hurtFlash = 0;

  private t = 0;
  private kickCd = 1;
  private steamCd = 2;
  private steamHit = false;

  constructor(public x: number, public y: number) {}

  get alive() {
    return this.state !== "dead";
  }

  get phase() {
    const ratio = this.hp / BOSS.maxHp;
    return ratio > 2 / 3 ? 0 : ratio > 1 / 3 ? 1 : 2;
  }

  /** 0..1 telegraph progress for the renderer. */
  get kickCharge() {
    return this.state === "kickWind" ? 1 - this.t / this.kickWindup : 0;
  }

  get steamCharge() {
    return this.state === "steamWind" ? 1 - this.t / BOSS.steamWindup : 0;
  }

  get steaming() {
    return this.state === "steam";
  }

  private get kickWindup() {
    return BOSS.kickWindup * (this.phase === 2 ? 0.7 : 1);
  }

  damage(amount: number, stun = 0) {
    if (!this.alive) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hurtFlash = 0.12;
    if (this.hp <= 0) {
      this.state = "dead";
      return;
    }
    if (stun > 0) {
      this.state = "stunned";
      this.t = stun;
    }
  }

  update(g: Engine, dt: number) {
    if (!this.alive) return;
    this.animT += dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    const p = g.player;
    const d = dist(this.x, this.y, p.x, p.y);
    const toPlayer = Math.atan2(p.y - this.y, p.x - this.x);
    const cdScale = this.phase === 2 ? 0.7 : 1;

    switch (this.state) {
      case "chase": {
        this.kickCd -= dt;
        this.steamCd -= dt;
        this.angle = toPlayer;
        if (d < BOSS.kickRange && this.kickCd <= 0) {
          this.state = "kickWind";
          this.t = this.kickWindup;
          break;
        }
        if (this.phase >= 1 && this.steamCd <= 0 && d < BOSS.steamRange && lineOfSight(this, p, g.blockers)) {
          this.state = "steamWind";
          this.t = BOSS.steamWindup;
          this.aim = toPlayer;
          break;
        }
        if (d > this.r + p.r) {
          const speed = BOSS.speed[this.phase];
          moveCircle(this, Math.cos(toPlayer) * speed * dt, Math.sin(toPlayer) * speed * dt, this.r, g.blockers);
        }
        break;
      }
      case "kickWind":
        this.t -= dt;
        if (this.t <= 0) {
          g.audio.sfx("boss_hit");
          g.camera.addShake(18);
          for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            g.particles.add(this.x, this.y, Math.cos(a) * 320, Math.sin(a) * 320, "rgba(255, 100, 0, 0.85)", 5, 0.4);
          }
          if (d < BOSS.kickRadius) g.hurtPlayer(this.x, this.y, "Beaten to death by the Giant Chaynik.");
          this.kickCd = BOSS.kickCooldown * cdScale;
          this.state = "chase";
        }
        break;
      case "steamWind": {
        // Tracks you slowly while charging, so a sidestep at the last moment dodges it.
        const diff = Math.atan2(Math.sin(toPlayer - this.aim), Math.cos(toPlayer - this.aim));
        this.aim += Math.max(-dt * 1.5, Math.min(dt * 1.5, diff));
        this.angle = this.aim;
        this.t -= dt;
        if (this.t <= 0) {
          this.state = "steam";
          g.audio.sfx("steam");
          this.t = BOSS.steamTime;
          this.steamHit = false;
        }
        break;
      }
      case "steam": {
        const sx = this.x + Math.cos(this.aim) * (this.r + 18);
        const sy = this.y + Math.sin(this.aim) * (this.r + 18);
        g.particles.cone(sx, sy, this.aim, BOSS.steamArc * 1.6, 4, "rgba(244, 63, 94, 0.55)", 420, 9, 0.55);
        if (!this.steamHit && d < BOSS.steamRange && angleDiff(this.aim, toPlayer) < BOSS.steamArc && lineOfSight(this, p, g.blockers)) {
          this.steamHit = true;
          g.hurtPlayer(sx, sy, "Scalded by the Giant Chaynik's steam.");
        }
        this.t -= dt;
        if (this.t <= 0) {
          this.steamCd = BOSS.steamCooldown * cdScale;
          this.state = "chase";
        }
        break;
      }
      case "stunned":
        this.t -= dt;
        if (Math.random() < 0.3) g.particles.add(this.x, this.y - this.r, (Math.random() - 0.5) * 60, -60, PALETTE.yellow, 3, 0.4);
        if (this.t <= 0) this.state = "chase";
        break;
    }
  }
}
