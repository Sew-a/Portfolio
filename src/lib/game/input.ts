import { VIEW_H, VIEW_W } from "@/src/lib/game/constants";

const BLOCKED_DEFAULTS = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "F2"]);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Keyboard + mouse state. Keys use `KeyboardEvent.code` so WASD works on any layout.
 * Keyboard listens on window (the canvas never needs focus); mouse listens on the canvas only,
 * so clicks on HUD buttons never trigger attacks.
 */
export class Input {
  readonly mouse = { x: VIEW_W / 2, y: VIEW_H / 2 };
  /** When false (menus, dialogue handled by React) keys are not swallowed. */
  capture = false;

  private down = new Set<string>();
  private pressed = new Set<string>();
  private buttonsPressed = new Set<number>();
  private buttonsDown = new Set<number>();

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }

  isDown(code: string) {
    return this.down.has(code);
  }

  wasPressed(code: string) {
    return this.pressed.has(code);
  }

  clicked(button: number) {
    return this.buttonsPressed.has(button);
  }

  buttonDown(button: number) {
    return this.buttonsDown.has(button);
  }

  /** Clears one-shot presses. Called after a frame that ran at least one simulation step. */
  endFrame() {
    this.pressed.clear();
    this.buttonsPressed.clear();
  }

  reset() {
    this.down.clear();
    this.buttonsDown.clear();
    this.endFrame();
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (isTyping(e.target)) return;
    if (this.capture && BLOCKED_DEFAULTS.has(e.code)) e.preventDefault();
    if (!e.repeat) this.pressed.add(e.code);
    this.down.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.down.delete(e.code);
  };

  private onBlur = () => this.reset();

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    this.mouse.y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
  };

  private onMouseDown = (e: MouseEvent) => {
    this.onMouseMove(e);
    this.buttonsPressed.add(e.button);
    this.buttonsDown.add(e.button);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.buttonsDown.delete(e.button);
  };

  private onContextMenu = (e: MouseEvent) => e.preventDefault();
}
