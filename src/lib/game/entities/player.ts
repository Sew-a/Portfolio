import { PLAYER } from "@/src/lib/game/constants";

export type Held = "none" | "water" | "snacks" | "coffee" | "beer" | "food" | "mushrooms" | "joint";

export class Player {
  x = 0;
  y = 0;
  readonly r = PLAYER.radius;
  angle = 0;
  hp = PLAYER.maxHp;
  maxHp = PLAYER.maxHp;

  /** Holding the knife. */
  armed = false;
  /** Sitting on the couch (scripted scenes); movement is locked while true. */
  seated = false;
  held: Held = "none";

  iframes = 0;
  dashT = 0;
  dashCd = 0;
  dashDx = 0;
  dashDy = 0;
  attackCd = 0;
  swingT = 0;
  walkT = 0;
  moving = false;
  peeing = false;
  pissLevel = 100;

  /** 0..1 visual/handling effects. */
  dizziness = 0;
  highness = 0;

  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.hp = this.maxHp;
    this.iframes = 0;
    this.dashT = 0;
    this.dashCd = 0;
    this.attackCd = 0;
    this.swingT = 0;
    this.peeing = false;
    this.seated = false;
  }

  get dashing() {
    return this.dashT > 0;
  }

  get vulnerable() {
    return this.iframes <= 0 && this.dashT <= 0;
  }

  tickTimers(dt: number) {
    this.iframes = Math.max(0, this.iframes - dt);
    this.dashT = Math.max(0, this.dashT - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.swingT = Math.max(0, this.swingT - dt);
  }
}
