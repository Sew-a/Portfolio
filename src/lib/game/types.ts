export interface Vec {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LevelId = "house" | "trip" | "labyrinth" | "finale";

/** Static decoration. Drawn from the atlas (`sprite`) or as a coloured block. */
export interface Prop {
  /** Set on props that open (fridge, wardrobe, window, door); drawn as `${sprite}_open` while open. */
  id?: string;
  sprite: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  /** Blocks movement. */
  solid?: boolean;
  color: string;
}

/** Something the player can press E on. */
export interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  r: number;
}

export interface FloorRegion extends Rect {
  tile: string;
  color: string;
  line?: string;
  /** 0..1 black overlay on top of the tile, to keep busy tiles from competing with walls. */
  dim?: number;
}

export interface Level {
  id: LevelId;
  width: number;
  height: number;
  walls: Rect[];
  floors: FloorRegion[];
  props: Prop[];
  hotspots: Hotspot[];
  playerStart: Vec;
  wallGlow: string;
  /** Solid wall colour, used instead of the atlas wall tile (Act 4's yellow wallpaper). */
  wallFill?: string;
}

// ─── UI bridge ─────────────────────────────────────────────

export type Screen = "start" | "playing" | "paused" | "gameover" | "result" | "complete";

export interface TaskView {
  id: string;
  text: string;
  done: boolean;
  active: boolean;
}

export interface DialogueView {
  speaker: string;
  portrait: string;
  text: string;
  options: string[];
}

export interface ActResultView {
  title: string;
  time: number;
  kills: number;
  bestCombo: number;
  hitsTaken: number;
  score: number;
  grade: string;
}

export interface GameUiState {
  screen: Screen;
  act: number;
  satisfaction: number | null;
  health: { hp: number; max: number } | null;
  boss: number | null;
  tasks: TaskView[];
  dialogue: DialogueView | null;
  gameOverReason: string;
  result: ActResultView | null;
  score: number;
  combo: number;
  muted: boolean;
}

/** What the engine needs from the UI layer. Implemented by the game store. */
export interface GameUi {
  patch(state: Partial<GameUiState>): void;
  toast(text: string): void;
}
