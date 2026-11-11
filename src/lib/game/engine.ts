import { Atlas } from "@/src/lib/game/render/atlas";
import { GameAudio, type Surface } from "@/src/lib/game/audio";
import { Camera } from "@/src/lib/game/camera";
import { angleDiff, circleHitsRect, circleHitsRects, dist, lineOfSight, moveCircle } from "@/src/lib/game/collision";
import {
  ATLAS_IMG_URL,
  ATLAS_JSON_URL,
  BOSS,
  COMBO_WINDOW,
  HIGH_SLOWDOWN,
  HITSTOP,
  MAX_STEPS_PER_FRAME,
  MELEE,
  PALETTE,
  PEE_RATE,
  PLAYER,
  SATISFACTION,
  STEP,
  VIEW_H,
  VIEW_W,
} from "@/src/lib/game/constants";
import { Boss } from "@/src/lib/game/entities/boss";
import { Friend, type FriendId } from "@/src/lib/game/entities/friend";
import { Player } from "@/src/lib/game/entities/player";
import { Shadow } from "@/src/lib/game/entities/shadow";
import { Input } from "@/src/lib/game/input";
import { buildHouse, COUCH_SEATS, KITCHEN, KNOCK_SPOTS, PLAYER_SEAT, PLAYER_STAND } from "@/src/lib/game/levels/house";
import { buildBackrooms, buildFinale, type BackroomsLevel } from "@/src/lib/game/levels/labyrinth";
import { buildTrip, type Corridor, type TripLevel } from "@/src/lib/game/levels/trip";
import { Decals, Particles } from "@/src/lib/game/particles";
import { render } from "@/src/lib/game/render/renderer";
import { clearSave, loadSave, writeSave } from "@/src/lib/game/save";
import {
  CALL_AFTER_PEE,
  CORRIDOR_WHISPERS,
  ENDING_LINE,
  FLAVOR,
  FRIEND_CHAT,
  BACKROOMS_LINES,
  HOME_ARRIVAL,
  type Dialogue,
} from "@/src/lib/game/story/dialogues";
import { firstStepOfAct, STEPS, type Act, type StepDef } from "@/src/lib/game/story/steps";
import type { ActResultView, GameUi, GameUiState, Hotspot, Level, Rect, Screen, TaskView } from "@/src/lib/game/types";

type Section = "start" | "boss" | "finale";

interface Timer {
  t: number;
  fn: () => void;
}

const ACT_TITLES: Record<Act, string> = {
  1: "ACT I — THE PARTY",
  2: "ACT II — THE TRIP",
  3: "ACT III — REALITY?",
  4: "ACT IV — NO WAY OUT",
  5: "ACT V — HOME",
};

/** Where the bodies are in Act 5: the spots they wandered off to in Act 3. */
const HOME_BODIES: { id: FriendId; x: number; y: number; angle: number }[] = [
  { id: "vahe", x: 730, y: 300, angle: 0.4 },
  { id: "karen", x: 700, y: 650, angle: 2.1 },
  { id: "grish", x: 110, y: 540, angle: -1.2 },
];

/** The fork room in the trip map; walking into it finishes the "walk" step. */
const FORK_ROOM: Rect = { x: 20 * 40, y: 8 * 40, w: 6 * 40, h: 8 * 40 };

const newFlags = () => ({
  windowOpen: false,
  music: false,
  smoke: 0,
  neighbourAngry: false,
  knocked: false,
  /** Post-mushroom wobble and edge shadows. */
  hallucinating: false,
  /** Visibility circle (corridor 2 and the maze). */
  dark: false,
  darkRadius: 150,
});

const newStats = () => ({ time: 0, kills: 0, combo: 0, bestCombo: 0, lastKill: -99, score: 0, hitsTaken: 0 });

/**
 * Owns the simulation, rendering and audio for the game. React mounts it on a canvas,
 * forwards button clicks to its public methods, and reads HUD state through `GameUi`.
 */
export class Engine {
  readonly ctx: CanvasRenderingContext2D;
  readonly input: Input;
  readonly camera = new Camera();
  readonly audio = new GameAudio();
  readonly particles = new Particles();
  readonly decals = new Decals();
  readonly atlas = new Atlas();
  readonly player = new Player();

  level: Level = buildHouse();
  blockers: Rect[] = [];
  shadows: Shadow[] = [];
  boss: Boss | null = null;
  friends: Friend[] = [];

  stepIndex = 0;
  act: Act = 1;
  flags = newFlags();
  satisfaction = SATISFACTION.start;
  stats = newStats();
  /** Act 2 corridor the player picked (null until the fork). */
  corridor: Corridor | null = null;
  time = 0;
  screen: Screen = "start";

  /** 0..1 black overlay for transitions. */
  fadeAlpha = 0;
  banner: { text: string; t: number } | null = null;
  /** Prop ids currently drawn open, with seconds left (Infinity = stays open). */
  openProps = new Map<string, number>();

  private dialogue: Dialogue | null = null;
  private timers: Timer[] = [];
  private fade: { dir: -1 | 0 | 1; cb: (() => void) | null; hold: number } = { dir: 0, cb: null, hold: 0 };
  private hitstop = 0;
  private section: Section = "start";
  private arenaOpen = false;
  private whispered = new Set<number>();
  private chatIndex: Record<FriendId, number> = { vahe: 0, karen: 0, grish: 0 };
  private afterResult: (() => void) | null = null;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private filter = "";
  private portraits = new Map<string, string | null>();
  private uiCache: Record<string, string> = {};
  private uiSyncT = 0;
  private stepDist = 0;
  private footLeft = false;
  private ambientT = 0;
  /** Final fade: once set, the screen goes black and stays black. */
  private endingDark = false;

  constructor(private canvas: HTMLCanvasElement, private ui: GameUi) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not supported");
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    this.input = new Input(canvas);
    this.loadLevel(buildHouse());
    this.spawnCouchFriends();
    void this.atlas.load(ATLAS_JSON_URL, ATLAS_IMG_URL);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  // ─── Public API (called from React) ─────────────────────

  savedAct(): number {
    return loadSave();
  }

  startNew() {
    clearSave();
    this.begin(1);
  }

  continueSaved() {
    this.begin(Math.min(5, Math.max(1, loadSave())) as Act);
  }

  togglePause() {
    if (this.screen === "playing") this.setScreen("paused");
    else if (this.screen === "paused") this.setScreen("playing");
  }

  restartCheckpoint() {
    this.audio.init();
    this.dialogue = null;
    this.ui.patch({ dialogue: null });
    this.setScreen("playing");
    this.startAct(this.act, this.section);
  }

  quitToMenu() {
    this.audio.silence();
    this.dialogue = null;
    this.ui.patch({ dialogue: null, result: null });
    this.setScreen("start");
  }

  choose(index: number) {
    const d = this.dialogue;
    const option = d?.options[index];
    if (!option) return;
    this.dialogue = null;
    this.ui.patch({ dialogue: null });
    this.audio.sfx("click");
    option.run(this);
  }

  continueResult() {
    const next = this.afterResult;
    this.afterResult = null;
    this.ui.patch({ result: null });
    if (!next) return;
    this.setScreen("playing");
    next();
  }

  setMuted(muted: boolean) {
    this.audio.setMuted(muted);
    this.ui.patch({ muted });
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    this.audio.dispose();
    this.canvas.style.filter = "";
  }

  // ─── Helpers used by story steps, scenes and entities ───

  get step(): StepDef {
    return STEPS[this.stepIndex];
  }

  advance() {
    if (this.stepIndex < STEPS.length - 1) this.stepIndex++;
    this.syncTasks(true);
  }

  toast(text: string) {
    this.ui.toast(text);
    this.audio.sfx("toast");
  }

  addSatisfaction(delta: number) {
    this.satisfaction = Math.max(0, Math.min(100, this.satisfaction + delta));
  }

  schedule(seconds: number, fn: () => void) {
    this.timers.push({ t: seconds, fn });
  }

  openDialogue(d: Dialogue) {
    this.dialogue = d;
    this.player.peeing = false;
    this.audio.sfx("dialogue");
    this.ui.patch({
      dialogue: { speaker: d.speaker, portrait: this.portrait(d.portrait) ?? "", text: d.text, options: d.options.map((o) => o.text) },
    });
  }

  /** Fade to black, run `fn`, fade back in. Ignored while another transition runs. */
  transition(fn: () => void, hold = 0.4) {
    if (this.fade.dir !== 0) return;
    this.fade = { dir: 1, cb: fn, hold };
    this.audio.sfx("whoosh");
  }

  get transitioning() {
    return this.fade.dir !== 0;
  }

  /** Draws a prop with its `_open` sprite for `seconds` (0 = until closed by the next call; default 1.2 s). */
  openProp(id: string, seconds = 1.2) {
    this.openProps.set(id, seconds <= 0 ? Infinity : seconds);
  }

  /** Seat the player on the couch for a conversation or scene. Movement locks until `standUp`. */
  sitDown() {
    const p = this.player;
    if (this.level.id !== "house") return;
    p.seated = true;
    p.x = PLAYER_SEAT.x;
    p.y = PLAYER_SEAT.y;
    p.angle = -Math.PI / 2;
    p.moving = false;
  }

  standUp() {
    const p = this.player;
    if (!p.seated) return;
    p.seated = false;
    p.x = PLAYER_STAND.x;
    p.y = PLAYER_STAND.y;
  }

  /** Act 3: a knock from inside a wall, before the real one at the front door. */
  knockOnWall() {
    const spot = KNOCK_SPOTS[Math.floor(Math.random() * KNOCK_SPOTS.length)];
    this.audio.sfx("knock");
    this.camera.addShake(6);
    this.particles.burst(spot.x, spot.y, 10, "rgba(200, 200, 255, 0.5)", 90, 3, 0.5);
    this.toast("Knock... knock... from inside the wall?");
  }

  puff(count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.smoke(500 + Math.random() * 150, 170 + Math.random() * 110, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, "rgba(180, 220, 180, 0.4)");
    }
  }

  corridorEnemiesLeft() {
    return this.shadows.filter((s) => s.alive && s.corridor === this.corridor).length;
  }

  alertShadows(x: number, y: number, px: number, py: number) {
    for (const s of this.shadows) {
      if (s.alive && dist(s.x, s.y, x, y) < s.stats.alertRadius) s.alert(px, py);
    }
  }

  hurtPlayer(fromX: number, fromY: number, reason: string) {
    const p = this.player;
    if (!p.vulnerable || this.screen !== "playing") return;
    p.hp -= 1;
    p.iframes = PLAYER.iframes;
    this.stats.hitsTaken++;
    const a = Math.atan2(p.y - fromY, p.x - fromX);
    moveCircle(p, Math.cos(a) * PLAYER.knockback * 0.25, Math.sin(a) * PLAYER.knockback * 0.25, p.r, this.blockers);
    this.particles.burst(p.x, p.y, 14, PALETTE.blood, 220, 4, 0.5);
    this.decals.splat(p.x, p.y, 14);
    this.camera.addShake(14);
    this.hitstop = HITSTOP * 1.5;
    this.audio.sfx("hurt");
    if (p.hp <= 0) this.gameOver(reason);
  }

  // ─── Acts ───────────────────────────────────────────────

  private begin(act: Act) {
    this.audio.init();
    this.stats = newStats();
    this.setScreen("playing");
    this.startAct(act);
  }

  startAct(act: Act, section: Section = "start") {
    this.act = act;
    this.section = section;
    this.stepIndex = firstStepOfAct(act);
    this.timers = [];
    this.dialogue = null;
    this.ui.patch({ dialogue: null });
    this.particles.clear();
    this.openProps.clear();
    this.shadows = [];
    this.boss = null;
    this.friends = [];
    this.afterResult = null;
    this.corridor = null;
    this.whispered.clear();
    this.endingDark = false;
    this.fadeAlpha = 0;
    this.audio.silence();
    const p = this.player;
    p.held = "none";
    p.armed = false;
    p.highness = 0;
    p.dizziness = 0;
    p.pissLevel = 100;
    writeSave(act);

    if (act === 1) {
      this.flags = newFlags();
      this.satisfaction = SATISFACTION.start;
      this.loadLevel(buildHouse());
      this.spawnCouchFriends();
    } else if (act === 2) {
      this.flags = newFlags();
      if (section === "start") this.stats = newStats();
      const trip = buildTrip();
      this.loadLevel(trip);
      p.armed = true;
      p.highness = 0.6;
      this.audio.startDrone();
      if (section === "boss") {
        p.x = trip.arenaTrigger.x + 40;
        p.y = trip.arenaTrigger.y + trip.arenaTrigger.h / 2;
        this.startBoss();
      } else {
        this.arenaOpen = false;
        this.shadows = trip.enemySpawns.map((s, i) => {
          const e = new Shadow(s.x, s.y, i, s.kind);
          e.corridor = s.corridor;
          return e;
        });
        this.toast("THE MUSHROOMS HAVE TAKEN OVER. A knife is in your hand.");
      }
    } else if (act === 3) {
      this.flags = { ...newFlags(), windowOpen: true, music: true };
      this.satisfaction = Math.max(this.satisfaction, 60);
      this.loadLevel(buildHouse());
      p.x = 640;
      p.y = 650;
      p.held = "coffee";
      p.dizziness = 1;
      p.highness = 0.25;
      this.spawnCouchFriends();
      this.audio.startMusic();
      this.audio.startDizzy();
      this.toast("Illusion defeated... you're back in the kitchen, coffee in hand. Your head is spinning.");
    } else if (act === 4) {
      this.flags = newFlags();
      if (section === "start") this.stats = newStats();
      if (section === "finale") {
        this.audio.startDrone();
        this.startFinale();
      } else {
        const maze = buildBackrooms();
        this.loadLevel(maze);
        p.armed = true;
        this.flags.dark = true;
        this.flags.darkRadius = 210;
        this.shadows = maze.enemySpawns.map((sp, i) => new Shadow(sp.x, sp.y, i));
        this.ambientT = 12;
        this.audio.startHum();
        this.toast("You wake up on damp carpet. Yellow walls. Buzzing lights. Find a way out.");
      }
    } else {
      this.flags = newFlags();
      this.loadLevel(buildHouse());
      p.x = 60;
      p.y = 720;
      p.armed = true;
      this.friends = HOME_BODIES.map((b) => {
        const f = new Friend(b.id, b.x, b.y);
        f.state = "dead";
        f.angle = b.angle;
        this.decals.splat(b.x, b.y, 24);
        return f;
      });
      this.audio.startHum(0.025);
      this.toast(HOME_ARRIVAL);
    }

    this.player.hp = this.player.maxHp;
    this.banner = { text: ACT_TITLES[act], t: 2.5 };
    this.syncTasks(true);
    this.syncUi(true);
  }

  private loadLevel(level: Level) {
    this.level = level;
    this.blockers = [...level.walls, ...level.props.filter((p) => p.solid)];
    if (level.id === "trip") {
      const trip = level as TripLevel;
      // Both arena doors start shut; corridor gates start open.
      this.blockers.push(...trip.arenaDoors[1], ...trip.arenaDoors[2]);
    }
    this.player.reset(level.playerStart.x, level.playerStart.y);
    this.decals.reset(level.width, level.height);
    this.camera.snap(this.player, level.width, level.height);
  }

  private spawnCouchFriends() {
    this.friends = (Object.keys(COUCH_SEATS) as FriendId[]).map((id) => new Friend(id, COUCH_SEATS[id].x, COUCH_SEATS[id].y));
  }

  private get trip() {
    return this.level as TripLevel;
  }

  private unblock(rects: Rect[]) {
    this.blockers = this.blockers.filter((b) => !rects.includes(b));
  }

  private block(rects: Rect[]) {
    for (const r of rects) if (!this.blockers.includes(r)) this.blockers.push(r);
  }

  /** Doors/gates of the trip that are currently shut (renderer draws them as neon bars). */
  closedTripDoors(): Rect[] {
    if (this.level.id !== "trip") return [];
    const t = this.trip;
    return [...t.gates[1], ...t.gates[2], ...t.arenaDoors[1], ...t.arenaDoors[2]].filter((r) => this.blockers.includes(r));
  }

  private chooseCorridor(c: Corridor) {
    const other: Corridor = c === 1 ? 2 : 1;
    this.corridor = c;
    this.block(this.trip.gates[other]);
    this.audio.sfx("door");
    this.camera.addShake(10);
    if (c === 2) {
      this.flags.dark = true;
      this.unblock(this.trip.arenaDoors[2]);
      this.toast("Corridor 2. The lights die behind you. It's very quiet.");
    } else {
      this.toast("Corridor 1. Something big is breathing in there.");
    }
    this.advance();
  }

  private startBoss() {
    const trip = this.trip;
    this.section = "boss";
    this.flags.dark = false;
    this.block([...trip.arenaDoors[1], ...trip.arenaDoors[2]]);
    this.stepIndex = STEPS.findIndex((s) => s.id === "boss");
    this.boss = new Boss(trip.bossSpawn.x, trip.bossSpawn.y);
    this.camera.addShake(20);
    this.toast("BOSS: THE GIANT CHAYNIK");
    this.syncTasks(true);
  }

  private startFinale() {
    this.section = "finale";
    this.flags.dark = false;
    this.stepIndex = STEPS.findIndex((s) => s.id === "ending");
    this.loadLevel(buildFinale());
    this.player.armed = true;
    this.friends = [new Friend("vahe", 340, 380), new Friend("karen", 400, 340), new Friend("grish", 460, 380)];
    for (const f of this.friends) f.state = "flee";
    this.toast("A way out. They're waiting for you at the end of it.");
    this.syncTasks(true);
  }

  private showResult(title: string, then: () => void) {
    const s = this.stats;
    const points = s.score - s.hitsTaken * 250 - Math.floor(s.time) * 4;
    const grade = points > 2600 ? "S" : points > 1800 ? "A" : points > 1000 ? "B" : points > 400 ? "C" : "D";
    const result: ActResultView = {
      title,
      time: s.time,
      kills: s.kills,
      bestCombo: s.bestCombo,
      hitsTaken: s.hitsTaken,
      score: s.score,
      grade,
    };
    this.afterResult = then;
    this.audio.silence();
    this.ui.patch({ result });
    this.setScreen("result");
  }

  private gameOver(reason: string) {
    this.audio.silence();
    this.audio.sfx("death");
    this.player.peeing = false;
    this.ui.patch({ gameOverReason: reason });
    this.setScreen("gameover");
  }

  private complete() {
    clearSave();
    this.audio.silence();
    this.setScreen("complete");
  }

  private setScreen(screen: Screen) {
    this.screen = screen;
    this.input.capture = screen === "playing";
    if (screen !== "playing") this.audio.stopPee();
    this.ui.patch({ screen });
  }

  // ─── Main loop ──────────────────────────────────────────

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.25, (now - this.last) / 1000);
    this.last = now;
    this.handleMetaKeys();

    if (this.screen === "playing") {
      this.acc += dt;
      let steps = 0;
      while (this.acc >= STEP && steps < MAX_STEPS_PER_FRAME) {
        this.update(STEP);
        this.acc -= STEP;
        steps++;
      }
      if (steps >= MAX_STEPS_PER_FRAME) this.acc = 0;
      if (steps > 0) this.input.endFrame();
    } else {
      this.acc = 0;
      this.input.endFrame();
    }

    render(this, this.ctx);
    this.applyFilter();
  };

  private handleMetaKeys() {
    const i = this.input;
    if (i.wasPressed("Escape") && !this.dialogue) this.togglePause();
    if (this.screen === "gameover" && i.wasPressed("KeyR")) this.restartCheckpoint();
    if (this.screen === "playing" && this.dialogue) {
      ["Digit1", "Digit2", "Digit3"].forEach((code, idx) => {
        if (i.wasPressed(code)) this.choose(idx);
      });
    }
    if (import.meta.env.DEV && this.screen === "playing" && i.wasPressed("F2")) this.debugSkip();
  }

  private update(dt: number) {
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }
    this.time += dt;
    this.updateFade(dt);
    if (this.banner) {
      this.banner.t -= dt;
      if (this.banner.t <= 0) this.banner = null;
    }
    for (const [id, t] of [...this.openProps]) {
      if (t === Infinity) continue;
      if (t - dt <= 0) this.openProps.delete(id);
      else this.openProps.set(id, t - dt);
    }

    const due = this.timers.filter((t) => (t.t -= dt) <= 0);
    this.timers = this.timers.filter((t) => t.t > 0);
    due.forEach((t) => t.fn());

    if (!this.dialogue && this.fade.dir === 0 && this.screen === "playing") this.gameplay(dt);
    else this.audio.stopPee();
    // Scripted friend walks keep going during dialogue (the couch scene).
    if (this.dialogue) for (const f of this.friends) if (f.state === "walk") f.update(this, dt);

    this.particles.update(dt);
    const p = this.player;
    this.camera.update(dt, p, this.level.width, this.level.height, p.highness * 0.04 + p.dizziness * 0.05, this.time);
    this.audio.highness = p.highness;
    this.syncUi(false, dt);
  }

  private updateFade(dt: number) {
    if (this.endingDark) {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + dt / 2.5);
      return;
    }
    const f = this.fade;
    if (f.dir === 1) {
      this.fadeAlpha = Math.min(1, this.fadeAlpha + dt / 0.6);
      if (this.fadeAlpha >= 1) {
        f.hold -= dt;
        if (f.hold <= 0) {
          const cb = f.cb;
          f.cb = null;
          f.dir = -1;
          cb?.();
        }
      }
    } else if (f.dir === -1) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt / 0.6);
      if (this.fadeAlpha <= 0) f.dir = 0;
    }
  }

  private gameplay(dt: number) {
    const p = this.player;
    const input = this.input;
    p.tickTimers(dt);
    this.stats.time += dt;

    if (!p.seated) {
      const aim = this.camera.toWorld(input.mouse.x, input.mouse.y);
      p.angle = Math.atan2(aim.y - p.y, aim.x - p.x);
      this.move(dt);
    }

    this.updatePee(dt);

    if (input.wasPressed("KeyE") && this.step.id !== "piss" && !p.seated) this.interact();

    if (this.combat && input.clicked(0)) this.attack();

    for (const s of this.shadows) s.update(this, dt);
    this.separateShadows();
    if (this.boss) this.updateBoss(dt);
    for (const f of this.friends) f.update(this, dt);

    if (this.act === 2 && !this.boss) this.updateTrip();
    if (this.level.id === "labyrinth") this.updateMaze(dt);
    if (this.act === 1 || this.act === 3) this.updateHouse(dt);
    if (this.section === "finale" && this.friends.length && this.friends.every((f) => !f.alive) && !this.afterResult) {
      this.afterResult = () => undefined;
      this.toast(ENDING_LINE);
      this.schedule(2.5, () => this.showResult("THE ILLUSION IS ERASED", () => this.transition(() => this.startAct(5), 1.5)));
    }
  }

  /** Acts where you hold the knife and can use it. */
  get combat() {
    return this.act === 2 || this.act === 4;
  }

  /** Act 5: fade to black and end the game. */
  endInDarkness() {
    this.endingDark = true;
    this.schedule(4, () => this.complete());
  }

  private move(dt: number) {
    const p = this.player;
    const input = this.input;
    let mx = 0;
    let my = 0;
    if (input.isDown("KeyW") || input.isDown("ArrowUp")) my -= 1;
    if (input.isDown("KeyS") || input.isDown("ArrowDown")) my += 1;
    if (input.isDown("KeyA") || input.isDown("ArrowLeft")) mx -= 1;
    if (input.isDown("KeyD") || input.isDown("ArrowRight")) mx += 1;
    p.moving = mx !== 0 || my !== 0;

    if (input.wasPressed("Space") && p.dashCd <= 0) {
      const len = Math.hypot(mx, my);
      p.dashDx = len ? mx / len : Math.cos(p.angle);
      p.dashDy = len ? my / len : Math.sin(p.angle);
      p.dashT = PLAYER.dashTime;
      p.dashCd = PLAYER.dashCooldown;
      this.audio.sfx("dash");
    }

    if (p.dashing) {
      moveCircle(p, p.dashDx * PLAYER.dashSpeed * dt, p.dashDy * PLAYER.dashSpeed * dt, p.r, this.blockers);
      this.particles.add(p.x, p.y, 0, 0, "rgba(56, 189, 248, 0.35)", 18, 0.15);
      return;
    }
    if (!p.moving || p.peeing) return;

    let speed = p.dizziness > 0.3 ? PLAYER.dizzySpeed : PLAYER.speed;
    // Weed makes you slow in the house.
    if (this.level.id === "house") speed *= 1 - HIGH_SLOWDOWN * Math.min(1, p.highness);
    const len = Math.hypot(mx, my);
    let vx = (mx / len) * speed;
    let vy = (my / len) * speed;
    if (p.dizziness > 0.4) {
      vx += Math.sin(this.time * 5) * 50 * p.dizziness;
      vy += Math.cos(this.time * 5) * 50 * p.dizziness;
    }
    const bx = p.x;
    const by = p.y;
    moveCircle(p, vx * dt, vy * dt, p.r, this.blockers);
    p.walkT += dt;
    this.stepDist += Math.hypot(p.x - bx, p.y - by);
    if (this.stepDist > (p.dizziness > 0.3 ? 30 : 40)) {
      this.stepDist = 0;
      this.audio.footstep(this.surfaceAt(p.x, p.y));
      if (this.level.id === "labyrinth") {
        this.footLeft = !this.footLeft;
        this.decals.footprint(p.x, p.y, Math.atan2(vy, vx), this.footLeft);
      }
    }
  }

  private updatePee(dt: number) {
    const p = this.player;
    if (this.step.id !== "piss") return;
    const toilet = this.level.hotspots.find((h) => h.id === "toilet");
    const near = !!toilet && dist(p.x, p.y, toilet.x, toilet.y) < toilet.r;
    if (toilet && near && this.input.isDown("KeyE")) {
      if (!p.peeing) this.audio.startPee();
      p.peeing = true;
      p.angle = Math.atan2(toilet.y - p.y, toilet.x - p.x);
      p.pissLevel = Math.max(0, p.pissLevel - PEE_RATE * dt);
      if (Math.random() < 0.6) {
        this.particles.add(p.x + Math.cos(p.angle) * 12, p.y + Math.sin(p.angle) * 12, Math.cos(p.angle) * 120 + (Math.random() - 0.5) * 60, Math.sin(p.angle) * 120 + (Math.random() - 0.5) * 60, "#eab308", 2, 0.3);
      }
      if (p.pissLevel <= 0) {
        p.peeing = false;
        this.audio.stopPee();
        this.audio.sfx("flush");
        this.advance();
        this.schedule(0.8, () => this.openDialogue(CALL_AFTER_PEE));
      }
    } else {
      if (p.peeing) this.audio.stopPee();
      p.peeing = false;
      if (this.input.wasPressed("KeyE") && !near) this.toast("Get to the toilet first.");
    }
  }

  private surfaceAt(x: number, y: number): Surface {
    const floor = this.level.floors.find((f) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h);
    if (floor?.tile === "tile.wood") return "wood";
    if (floor?.tile === "tile.bath" || floor?.tile === "tile.checker") return "tile";
    return "neon";
  }

  private nearestHotspot(): Hotspot | null {
    const p = this.player;
    let best: Hotspot | null = null;
    let bestD = Infinity;
    for (const h of this.level.hotspots) {
      const d = dist(p.x, p.y, h.x, h.y);
      if (d < h.r && d < bestD) {
        best = h;
        bestD = d;
      }
    }
    return best;
  }

  /** Hotspots the current step cares about (bright prompt + objective arrow). */
  isRelevant(id: string) {
    return this.step.target?.(this) === id;
  }

  objectiveTarget(): Hotspot | null {
    const id = this.step.target?.(this);
    if (!id) return null;
    return this.level.hotspots.find((h) => h.id === id) ?? null;
  }

  nearHotspot(): Hotspot | null {
    return this.screen === "playing" && !this.dialogue && !this.player.seated ? this.nearestHotspot() : null;
  }

  /** Label for the E prompt over a hotspot. */
  promptLabel(h: Hotspot): string {
    if (this.step.id === "piss" && h.id === "toilet") return "[hold E] Pee";
    if (h.id === "couch" && !this.isRelevant("couch") && this.canChat()) return "[E] Talk";
    return `[E] ${h.name}`;
  }

  private canChat() {
    return (this.act === 1 || this.act === 3) && this.step.id !== "piss" && this.friends.some((f) => f.state === "sit" || f.state === "panic");
  }

  private interact() {
    const h = this.nearestHotspot();
    if (!h) return;
    this.audio.sfx("blip");
    if (this.isRelevant(h.id)) {
      this.step.interact?.(this);
      return;
    }
    if (h.id === "couch" && this.canChat()) {
      this.chat();
      return;
    }
    const lines = FLAVOR[h.id];
    if (lines) this.toast(lines[Math.floor(Math.random() * lines.length)]);
  }

  /** Small talk with the friend sitting nearest to you. Lines cycle so nothing repeats too soon. */
  private chat() {
    const p = this.player;
    const friend = [...this.friends].sort((a, b) => dist(a.x, a.y, p.x, p.y) - dist(b.x, b.y, p.x, p.y))[0];
    const pool = FRIEND_CHAT[this.act as 1 | 3][friend.id];
    const line = pool[this.chatIndex[friend.id] % pool.length];
    this.chatIndex[friend.id]++;
    if (typeof line === "string") this.toast(line);
    else this.openDialogue(line);
  }

  // ─── Combat ─────────────────────────────────────────────

  private attack() {
    const p = this.player;
    if (p.attackCd > 0 || !p.armed) return;
    p.attackCd = MELEE.cooldown;
    p.swingT = MELEE.swingTime;
    this.audio.sfx("swing");
    this.camera.addShake(3);
    const tipX = p.x + Math.cos(p.angle) * 24;
    const tipY = p.y + Math.sin(p.angle) * 24;
    this.particles.cone(tipX, tipY, p.angle, 0.5, 5, this.section === "finale" ? "#ff4444" : "#e2e8f0", 260, 2, 0.15);

    const inArc = (x: number, y: number, r: number) => {
      const d = dist(p.x, p.y, x, y);
      return d < MELEE.range + r && angleDiff(p.angle, Math.atan2(y - p.y, x - p.x)) < MELEE.arc && lineOfSight(p, { x, y }, this.level.walls);
    };

    let hit = false;
    for (const s of this.shadows) {
      if (!s.alive || !inArc(s.x, s.y, s.r)) continue;
      hit = true;
      if (s.hit(p.angle, this)) this.onShadowKilled(s);
      else {
        this.audio.sfx("hit");
        this.particles.burst(s.x, s.y, 10, PALETTE.purple, 200, 3, 0.3);
      }
    }
    const b = this.boss;
    if (b && b.alive && inArc(b.x, b.y, b.r)) {
      hit = true;
      b.damage(1);
      this.audio.sfx("hit");
      this.particles.burst(b.x, b.y, 16, PALETTE.spark, 300, 3, 0.4);
      this.camera.addShake(10);
      if (!b.alive) this.bossDefeated();
    }
    for (const f of this.friends) {
      if (!f.alive || !inArc(f.x, f.y, f.r)) continue;
      hit = true;
      f.state = "dead";
      this.registerKill(f.x, f.y, 300);
      this.toast(`You killed ${f.name}.`);
    }
    if (hit) this.hitstop = HITSTOP;
  }

  private onShadowKilled(s: Shadow) {
    this.registerKill(s.x, s.y, s.kind === "brute" ? 250 : 100);
    this.syncTasks(true);
  }

  private registerKill(x: number, y: number, points: number) {
    const st = this.stats;
    st.combo = this.time - st.lastKill < COMBO_WINDOW ? st.combo + 1 : 1;
    st.lastKill = this.time;
    st.bestCombo = Math.max(st.bestCombo, st.combo);
    st.kills++;
    st.score += points * st.combo;
    this.audio.sfx("kill");
    if (st.combo > 1) this.audio.sfx("combo");
    this.particles.burst(x, y, 22, PALETTE.blood, 260, 5, 0.6);
    this.decals.splat(x, y, 22);
    this.camera.addShake(12);
  }

  private separateShadows() {
    const list = this.shadows.filter((s) => s.alive);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const d = dist(a.x, a.y, b.x, b.y);
        const min = a.r + b.r;
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          const nx = (b.x - a.x) / d;
          const ny = (b.y - a.y) / d;
          moveCircle(a, -nx * push, -ny * push, a.r, this.blockers);
          moveCircle(b, nx * push, ny * push, b.r, this.blockers);
        }
      }
    }
  }

  private updateBoss(dt: number) {
    const b = this.boss!;
    b.update(this, dt);
    // Body contact hurts too.
    if (b.alive && dist(b.x, b.y, this.player.x, this.player.y) < b.r + this.player.r - 4) {
      this.hurtPlayer(b.x, b.y, "Crushed under the Giant Chaynik.");
    }
  }

  private bossDefeated() {
    const b = this.boss!;
    this.particles.burst(b.x, b.y, 80, PALETTE.spark, 420, 5, 0.9);
    this.decals.splat(b.x, b.y, 40, "#475569");
    this.camera.addShake(30);
    this.audio.sfx("explode");
    this.stats.score += 2000;
    this.toast("The lights go out. The music stops.");
    this.schedule(2, () => this.showResult("THE TRIP IS OVER", () => this.transition(() => this.startAct(3), 0.6)));
  }

  private updateTrip() {
    const p = this.player;
    const trip = this.trip;
    const id = this.step.id;
    if (id === "walk" && circleHitsRect(p.x, p.y, p.r, FORK_ROOM)) {
      this.toast("Two corridors. One sounds loud. One sounds empty.");
      this.advance();
    }
    if (id === "walk" || id === "choose") {
      for (const c of [1, 2] as Corridor[]) {
        if (trip.choiceZones[c].some((z) => circleHitsRect(p.x, p.y, p.r, z))) {
          if (id === "walk") this.advance();
          this.chooseCorridor(c);
          break;
        }
      }
    }
    if (this.corridor === 1 && !this.arenaOpen && this.corridorEnemiesLeft() === 0) {
      this.arenaOpen = true;
      this.unblock(trip.arenaDoors[1]);
      this.audio.sfx("door");
      this.camera.addShake(10);
      this.toast("A door grinds open at the end of the corridor...");
      this.syncTasks(true);
    }
    if (this.corridor === 2) {
      trip.whispers.forEach((w, i) => {
        if (!this.whispered.has(i) && circleHitsRect(p.x, p.y, p.r, w)) {
          this.whispered.add(i);
          this.toast(CORRIDOR_WHISPERS[this.whispered.size - 1] ?? CORRIDOR_WHISPERS[0]);
        }
      });
    }
    if (circleHitsRect(p.x, p.y, p.r, trip.arenaTrigger)) {
      const doors = [...trip.arenaDoors[1], ...trip.arenaDoors[2]];
      if (circleHitsRects(p.x, p.y, p.r, doors)) p.x += 40;
      this.startBoss();
    }
  }

  private updateMaze(dt: number) {
    const maze = this.level as BackroomsLevel;
    const p = this.player;
    if (circleHitsRect(p.x, p.y, p.r, maze.exit) && !this.transitioning) {
      this.toast("A door. Daylight? No... the zal.");
      this.transition(() => this.startFinale(), 1);
      return;
    }
    this.ambientT -= dt;
    if (this.ambientT <= 0) {
      this.ambientT = 20 + Math.random() * 10;
      this.toast(BACKROOMS_LINES[Math.floor(Math.random() * BACKROOMS_LINES.length)]);
    }
  }

  private updateHouse(dt: number) {
    const f = this.flags;
    const p = this.player;
    if (this.step.id === "coffee" && !p.seated && circleHitsRect(p.x, p.y, p.r, KITCHEN) && !this.transitioning) {
      this.toast("You step into the kitchen... who turned off the lights?");
      this.camera.addShake(30);
      this.transition(() => this.startAct(2), 1.2);
      return;
    }
    if (this.step.id !== "piss" && !p.seated) {
      let drain = SATISFACTION.drain;
      if (f.smoke > 0.3 && !f.windowOpen) drain += SATISFACTION.smokyDrain;
      if (f.neighbourAngry) drain += SATISFACTION.angryDrain;
      this.addSatisfaction(-drain * dt);
    }
    if (f.smoke > 0.05) {
      if (f.windowOpen) f.smoke = Math.max(0, f.smoke - 0.02 * dt);
      if (Math.random() < f.smoke * 0.15) {
        this.particles.smoke(400 + Math.random() * 360, 60 + Math.random() * 360, f.windowOpen ? 60 : (Math.random() - 0.5) * 12, f.windowOpen ? -10 : (Math.random() - 0.5) * 12);
      }
    }
    for (const fr of this.friends) {
      if (fr.state === "sit" && f.music && fr.bobAmp === 0) fr.bobAmp = 3;
    }
    if (this.satisfaction <= 0) this.gameOver("Your friends got bored and left. The party is over.");
  }

  private debugSkip() {
    this.toast("DEV: skipped step");
    this.dialogue = null;
    this.ui.patch({ dialogue: null });
    this.standUp();
    const id = this.step.id;
    if (id === "coffee") return this.startAct(2);
    if (id === "walk") this.advance();
    if (id === "walk" || id === "choose") return this.chooseCorridor(1);
    if (id === "corridor") {
      this.shadows.forEach((s) => s.kill());
      this.startBoss();
      return;
    }
    if (id === "boss") {
      this.boss?.damage(99);
      if (this.boss && !this.boss.alive) this.bossDefeated();
      return;
    }
    if (id === "couch_end") return this.startAct(4);
    if (id === "maze") return this.startFinale();
    if (id === "home") return this.endInDarkness();
    if (id === "ending") {
      this.friends.forEach((f) => (f.state = "dead"));
      return;
    }
    if (id === "give_food") this.flags.knocked = true;
    if (id === "water" || id === "snacks" || id === "food") this.player.held = id;
    this.advance();
  }

  // ─── UI sync ────────────────────────────────────────────

  private portrait(id: string): string | null {
    if (!this.portraits.has(id) || this.portraits.get(id) === null) {
      this.portraits.set(id, this.atlas.frameDataUrl(`portrait.${id}`));
    }
    return this.portraits.get(id) ?? null;
  }

  private syncTasks(force: boolean) {
    const current = this.step;
    const tasks: TaskView[] = STEPS.map((s, i) => ({ s, i }))
      .filter(({ s }) => s.act === current.act)
      .map(({ s, i }) => ({ id: s.id, text: s.task(this), done: i < this.stepIndex, active: i === this.stepIndex }));
    const key = JSON.stringify(tasks);
    if (force || key !== this.uiCache.tasks) {
      this.uiCache.tasks = key;
      this.ui.patch({ tasks });
    }
  }

  private syncUi(force: boolean, dt = 0) {
    this.uiSyncT -= dt;
    if (!force && this.uiSyncT > 0) return;
    this.uiSyncT = 0.1;
    const house = this.act === 1 || this.act === 3;
    const combat = this.combat;
    const next = {
      act: this.act,
      satisfaction: house ? Math.round(this.satisfaction) : null,
      health: combat ? { hp: this.player.hp, max: this.player.maxHp } : null,
      boss: this.boss && this.boss.alive ? Math.round((this.boss.hp / BOSS.maxHp) * 100) / 100 : null,
      score: this.stats.score,
      combo: this.time - this.stats.lastKill < COMBO_WINDOW ? this.stats.combo : 0,
    };
    const changed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(next)) {
      const s = JSON.stringify(v);
      if (force || this.uiCache[k] !== s) {
        this.uiCache[k] = s;
        changed[k] = v;
      }
    }
    if (Object.keys(changed).length) this.ui.patch(changed as Partial<GameUiState>);
    this.syncTasks(false);
  }

  /**
   * House: starts grey and dim (sober is dull), colour floods back as you get high, and the
   * mushrooms add a hue drift. Trip: strong hue drift. Dizzy: slight blur.
   */
  private applyFilter() {
    const p = this.player;
    const q = (n: number) => Math.round(n * 20) / 20;
    const parts: string[] = [];
    if (this.screen === "playing" || this.screen === "paused") {
      if (this.act === 5) {
        parts.push("saturate(0.12)", "brightness(0.7)", "contrast(1.1)");
      } else if (this.level.id === "labyrinth") {
        parts.push("saturate(0.85)", "contrast(1.08)");
      } else if (this.level.id === "house") {
        const h = Math.min(1, p.highness);
        parts.push(`saturate(${q(0.3 + h * 1.1)})`, `brightness(${q(0.78 + h * 0.3)})`);
        if (h >= 0.9 || this.flags.hallucinating) parts.push(`hue-rotate(${Math.round((60 * Math.sin(this.time * 0.6)) / 4) * 4}deg)`);
      } else if (this.level.id === "trip" && p.highness > 0.05) {
        parts.push(`hue-rotate(${Math.round((p.highness * 160 * Math.sin(this.time * 0.8)) / 4) * 4}deg)`, "contrast(1.1)", "saturate(1.3)");
      }
      if (p.dizziness > 0.05) parts.push("blur(0.8px)");
    }
    const filter = parts.join(" ");
    if (filter !== this.filter) {
      this.filter = filter;
      this.canvas.style.filter = filter;
    }
  }
}
