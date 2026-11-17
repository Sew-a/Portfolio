import * as THREE from "three";
import type { RustyMood as Mood } from "@/src/lib/rusty/types";

// Must match the Screen quad's aspect in blender/build_robot.py (height = 0.8 x width).
const W = 256;
const H = 205;
const SCREEN_BG = '#f4ede4';
const INK = '#2b211c';

/** Rusty's screen face (ported from rusty-companion), drawn on a canvas each frame and used as a texture. */
export class Face {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private nextBlink = 2 + Math.random() * 4;
  private blinkUntil = 0;
  /** Eye direction in -1..1 (x right, y down), e.g. towards the mouse cursor. */
  private gx = 0;
  private gy = 0;

  setGaze(x: number, y: number): void {
    // Light smoothing so the eyes don't jitter.
    this.gx += (x - this.gx) * 0.3;
    this.gy += (y - this.gy) * 0.3;
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  draw(mood: Mood, t: number): void {
    const c = this.ctx;
    c.fillStyle = SCREEN_BG;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = INK;
    c.fillStyle = INK;
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    if (t > this.nextBlink) {
      this.blinkUntil = t + 0.12;
      this.nextBlink = t + 2 + Math.random() * 4;
    }
    const blinking = t < this.blinkUntil;
    const ex = 78; // eye x offset from centre
    const ey = 75;
    const cx = W / 2;

    switch (mood) {
      case 'happy':
        this.dotEyes(cx, ex, ey, blinking);
        this.smile(cx, 118, 62, 30);
        break;
      case 'researching': {
        // Reading the notepad (low, on his left = viewer's right); glances up now and then.
        const glance = Math.sin(t * 0.7) > 0.85;
        if (blinking) this.dotEyes(cx, ex, ey, true);
        else {
          const dx = glance ? 0 : 12;
          const dy = glance ? 0 : 14;
          this.dot(cx - ex + dx, ey + dy, 10);
          this.dot(cx + ex + dx, ey + dy, 10);
        }
        // Focused little mouth, pulled to one side.
        this.line(cx - 6, 134, cx + 22, 130);
        break;
      }
      case 'tired': {
        // Yawn: squeezed eyes and a big round mouth that opens and closes.
        this.squint(cx - ex, ey);
        this.squint(cx + ex, ey);
        const open = Math.sin(Math.min(1, t % 2.4 / 1.8) * Math.PI);
        c.beginPath();
        c.ellipse(cx, 132, 16 + 8 * open, 8 + 22 * open, 0, 0, Math.PI * 2);
        c.fill();
        break;
      }
      case 'resting':
        // Relaxed: heavy-lidded eyes, a small content smile.
        this.lidEyes(cx, ex, ey, blinking);
        this.smile(cx, 124, 30, 12);
        break;
      case 'dancing':
      case 'sipping':
        // Eyes closed with joy (upward arcs).
        this.joyEye(cx - ex, ey);
        this.joyEye(cx + ex, ey);
        if (mood === 'dancing') this.smile(cx, 116, 58, 34);
        else {
          c.beginPath();
          c.ellipse(cx, 132, 9, 7, 0, 0, Math.PI * 2);
          c.stroke();
        }
        break;
      case 'nudge':
        // Wide eyes at you, with an exclamation mark.
        this.ringEyes(cx, ex, ey, false);
        this.line(cx - 18, 134, cx + 18, 134);
        c.font = 'bold 50px Segoe UI, sans-serif';
        c.textAlign = 'center';
        c.fillText('!', W - 28, 56);
        break;
      case 'greet':
        this.dotEyes(cx, ex, ey, blinking);
        this.smile(cx, 115, 55, 32);
        break;
      case 'browsing':
        // Sketch 2: mischievous brows and a big grin.
        this.line(cx - ex - 22, ey - 32, cx - ex + 18, ey - 22);
        this.line(cx + ex + 22, ey - 32, cx + ex - 18, ey - 22);
        this.ringEyes(cx, ex, ey + 4, blinking);
        this.grin(cx, 118, 60, 34);
        break;
      case 'thinking': {
        const look = Math.sin(t * 1.5) * 8;
        this.dot(cx - ex + look, ey - 10, 10);
        this.dot(cx + ex + look, ey - 10, 10);
        this.line(cx - 24, 132, cx + 24, 132);
        break;
      }
      case 'working':
        this.line(cx - ex - 18, ey - 26, cx - ex + 18, ey - 20);
        this.line(cx + ex + 18, ey - 26, cx + ex - 18, ey - 20);
        this.dotEyes(cx, ex, ey, blinking);
        this.line(cx - 30, 130, cx + 30, 130);
        break;
      case 'permission':
        this.dot(cx - ex, ey, 14);
        this.dot(cx + ex, ey, 14);
        c.beginPath();
        c.arc(cx, 132, 14, 0, Math.PI * 2);
        c.stroke();
        c.font = 'bold 48px Segoe UI, sans-serif';
        c.textAlign = 'center';
        c.fillText('?', W - 30, 54);
        break;
      case 'talking': {
        this.dotEyes(cx, ex, ey, blinking);
        const open = 0.3 + 0.7 * Math.abs(Math.sin(t * 9) * Math.sin(t * 4.3));
        c.beginPath();
        c.ellipse(cx, 128, 30, 4 + 18 * open, 0, 0, Math.PI * 2);
        c.fill();
        break;
      }
      case 'error':
        // Sketch 3: sad, wobbly mouth.
        this.dot(cx - ex, ey, 10);
        this.dot(cx + ex, ey, 10);
        this.wavyMouth(cx, 135, t);
        break;
      case 'sleep':
        // Sketch 4: closed eyes, small "o" mouth.
        this.closedEye(cx - ex, ey);
        this.closedEye(cx + ex, ey);
        c.beginPath();
        c.ellipse(cx, 132, 10, 13, 0, 0, Math.PI * 2);
        c.stroke();
        if (mood === 'sleep') {
          c.font = 'bold 26px Segoe UI, sans-serif';
          c.textAlign = 'center';
          c.fillText('z', W - 40, 50 - (t * 6) % 12);
        }
        break;
      case 'idle':
      default:
        // Flat-front sketch: dot eyes, flat mouth with small upturned ticks at both ends.
        this.dotEyes(cx, ex, ey, blinking);
        this.tickedMouth(cx, 128, 34);
        break;
    }
    this.texture.needsUpdate = true;
  }

  private line(x1: number, y1: number, x2: number, y2: number): void {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }

  private dot(x: number, y: number, r: number): void {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  private dotEyes(cx: number, ex: number, ey: number, blinking: boolean): void {
    cx += this.gx * 12;
    ey += this.gy * 9;
    if (blinking) {
      this.line(cx - ex - 12, ey, cx - ex + 12, ey);
      this.line(cx + ex - 12, ey, cx + ex + 12, ey);
    } else {
      this.dot(cx - ex, ey, 11);
      this.dot(cx + ex, ey, 11);
    }
  }

  private ringEyes(cx: number, ex: number, ey: number, blinking: boolean): void {
    if (blinking) return this.dotEyes(cx, ex, ey, true);
    const c = this.ctx;
    for (const x of [cx - ex, cx + ex]) {
      c.beginPath();
      c.arc(x, ey, 13, 0, Math.PI * 2);
      c.stroke();
      this.dot(x + this.gx * 6, ey + this.gy * 6, 5);
    }
  }

  /** Squeezed-shut eye (a yawn): a short flat line with a slight downward hook at the outside. */
  private squint(x: number, y: number): void {
    this.line(x - 15, y + 2, x + 15, y + 2);
  }

  /** Happy closed eye: an upward arc (^). */
  private joyEye(x: number, y: number): void {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y + 8, 16, 1.15 * Math.PI, 1.85 * Math.PI);
    c.stroke();
  }

  /** Round eyes with heavy upper lids (relaxed). */
  private lidEyes(cx: number, ex: number, ey: number, blinking: boolean): void {
    if (blinking) return this.dotEyes(cx, ex, ey, true);
    const c = this.ctx;
    for (const x of [cx - ex, cx + ex]) {
      c.beginPath();
      c.arc(x, ey + 3, 11, 0, Math.PI);
      c.fill();
      this.line(x - 15, ey + 2, x + 15, ey + 2);
    }
  }

  private closedEye(x: number, y: number): void {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y - 8, 18, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
  }

  /** Smile with small dimple ticks at the corners (as in the waving sketch). */
  private smile(cx: number, y: number, w: number, depth: number): void {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(cx - w, y);
    c.quadraticCurveTo(cx, y + depth * 2, cx + w, y);
    c.stroke();
    c.lineWidth = 5;
    this.line(cx - w - 6, y - 8, cx - w + 4, y + 4);
    this.line(cx + w + 6, y - 8, cx + w - 4, y + 4);
    c.lineWidth = 7;
  }

  /** Flat mouth whose ends curl up slightly. */
  private tickedMouth(cx: number, y: number, w: number): void {
    const c = this.ctx;
    this.line(cx - w, y, cx + w, y);
    c.lineWidth = 5;
    this.line(cx - w - 8, y - 7, cx - w, y);
    this.line(cx + w + 8, y - 7, cx + w, y);
    c.lineWidth = 7;
  }

  private grin(cx: number, y: number, w: number, depth: number): void {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(cx - w, y);
    c.quadraticCurveTo(cx, y + depth * 2, cx + w, y);
    c.closePath();
    c.fill();
  }

  private wavyMouth(cx: number, y: number, t: number): void {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i <= 20; i++) {
      const x = cx - 40 + i * 4;
      const yy = y + Math.sin(i * 0.9 + t * 4) * 5 + (Math.abs(i - 10) < 6 ? -6 : 0);
      if (i === 0) c.moveTo(x, yy);
      else c.lineTo(x, yy);
    }
    c.stroke();
  }
}
