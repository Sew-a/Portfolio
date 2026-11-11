import { moveCircle } from "@/src/lib/game/collision";
import type { Engine } from "@/src/lib/game/engine";
import type { Vec } from "@/src/lib/game/types";

export type FriendId = "vahe" | "karen" | "grish";
type FriendState = "sit" | "stand" | "walk" | "panic" | "flee" | "dead";

export const FRIEND_INFO: Record<FriendId, { name: string; color: string; accent: string }> = {
  vahe: { name: "Vahe", color: "#39ff14", accent: "#f59e0b" },
  karen: { name: "Karen", color: "#bd00ff", accent: "#10b981" },
  grish: { name: "Grish", color: "#ff007f", accent: "#f43f5e" },
};

const WALK_SPEED = 70;

export class Friend {
  readonly r = 15;
  state: FriendState = "sit";
  /** Sitting friends face the TV (north). */
  angle = -Math.PI / 2;
  /** Head-bob amplitude (px); raised when the music speeds up. */
  bobAmp = 0;
  animT = Math.random() * 3;

  private path: Vec[] = [];
  private onArrive: (() => void) | null = null;
  /** Where to look once the walk ends. */
  private faceAfter = 0;

  constructor(public id: FriendId, public x: number, public y: number) {}

  get name() {
    return FRIEND_INFO[this.id].name;
  }

  get alive() {
    return this.state !== "dead";
  }

  /**
   * Scripted walk through waypoints (no collision: paths are hand-placed through doorways).
   * Ends standing, facing `face`.
   */
  walk(path: Vec[], face: number, onArrive?: () => void) {
    this.path = [...path];
    this.faceAfter = face;
    this.onArrive = onArrive ?? null;
    this.bobAmp = 0;
    this.state = "walk";
  }

  update(g: Engine, dt: number) {
    if (!this.alive) return;
    this.animT += dt;
    if (this.state === "walk") return this.followPath(dt);
    if (this.state !== "flee") return;
    // Finale: back away from the player, jittering in panic.
    const p = g.player;
    const dx = this.x - p.x;
    const dy = this.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 260) {
      const speed = 70;
      this.angle = Math.atan2(-dy, -dx);
      moveCircle(this, (dx / d) * speed * dt + (Math.random() - 0.5) * 2, (dy / d) * speed * dt + (Math.random() - 0.5) * 2, this.r, g.blockers);
    }
  }

  private followPath(dt: number) {
    const next = this.path[0];
    if (!next) {
      this.state = "stand";
      this.angle = this.faceAfter;
      const cb = this.onArrive;
      this.onArrive = null;
      cb?.();
      return;
    }
    const dx = next.x - this.x;
    const dy = next.y - this.y;
    const d = Math.hypot(dx, dy);
    const stepLen = WALK_SPEED * dt;
    this.angle = Math.atan2(dy, dx);
    if (d <= stepLen) {
      this.x = next.x;
      this.y = next.y;
      this.path.shift();
    } else {
      this.x += (dx / d) * stepLen;
      this.y += (dy / d) * stepLen;
    }
  }
}
