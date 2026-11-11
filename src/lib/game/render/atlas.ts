export interface AtlasFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AtlasJson {
  frames: Record<string, AtlasFrame>;
  anims?: Record<string, string[]>;
}

/**
 * Sprite atlas rendered from Blender (`public/smoke-sim/`).
 * Every sprite faces +X; callers rotate at draw time. Missing atlas → `ready` stays false
 * and the renderer falls back to coloured shapes.
 */
export class Atlas {
  ready = false;
  private frames: Record<string, AtlasFrame> = {};
  private anims: Record<string, string[]> = {};
  private img: HTMLImageElement | null = null;
  private patterns = new Map<string, CanvasPattern | null>();

  async load(jsonUrl: string, imgUrl: string): Promise<void> {
    try {
      const res = await fetch(jsonUrl);
      if (!res.ok) return;
      const json = (await res.json()) as AtlasJson;
      const img = new Image();
      img.src = imgUrl;
      await img.decode();
      this.frames = json.frames ?? {};
      this.anims = json.anims ?? {};
      this.img = img;
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  has(name: string) {
    return this.ready && name in this.frames;
  }

  /** Frame name for an animation at time `t` (seconds), or null if the atlas lacks it. */
  animFrame(key: string, t: number, fps = 8, loop = true): string | null {
    if (!this.ready) return null;
    const list = this.anims[key];
    if (!list || list.length === 0) return this.has(`${key}.0`) ? `${key}.0` : null;
    const i = Math.floor(t * fps);
    return list[loop ? i % list.length : Math.min(i, list.length - 1)];
  }

  /** Draws a frame centred on (x, y). `size` is the target width; height keeps the aspect ratio. */
  draw(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, rot = 0, size?: number): boolean {
    const f = this.frames[name];
    if (!this.ready || !f || !this.img) return false;
    const w = size ?? f.w;
    const h = (w / f.w) * f.h;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(this.img, f.x, f.y, f.w, f.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  /**
   * Draws a frame stretched into a world rectangle (props). Sprites face +X, so a prop turned
   * roughly 90° swaps its draw size to keep filling the same footprint.
   */
  drawRect(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, w: number, h: number, rot = 0): boolean {
    const f = this.frames[name];
    if (!this.ready || !f || !this.img) return false;
    const turned = Math.abs(Math.sin(rot)) > Math.SQRT1_2;
    const dw = turned ? h : w;
    const dh = turned ? w : h;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(this.img, f.x, f.y, f.w, f.h, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    return true;
  }

  /** Repeating pattern for floor tiles. */
  pattern(ctx: CanvasRenderingContext2D, name: string): CanvasPattern | null {
    if (this.patterns.has(name)) return this.patterns.get(name) ?? null;
    const f = this.frames[name];
    let pattern: CanvasPattern | null = null;
    if (this.ready && f && this.img) {
      const tile = document.createElement("canvas");
      tile.width = f.w;
      tile.height = f.h;
      tile.getContext("2d")?.drawImage(this.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
      pattern = ctx.createPattern(tile, "repeat");
    }
    this.patterns.set(name, pattern);
    return pattern;
  }

  /** Data URL of a single frame (dialogue portraits in the React HUD). */
  frameDataUrl(name: string): string | null {
    const f = this.frames[name];
    if (!this.ready || !f || !this.img) return null;
    const c = document.createElement("canvas");
    c.width = f.w;
    c.height = f.h;
    c.getContext("2d")?.drawImage(this.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    return c.toDataURL();
  }
}
