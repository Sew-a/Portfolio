/**
 * Web Audio synth: a synthwave loop, a psychedelic drone, a dizzy hum and one-shot SFX.
 * Everything routes through one master gain so mute and dispose are clean.
 */

export type Sfx =
  | "bong" | "knock" | "swing" | "hit" | "boss_hit" | "dash" | "hurt" | "door" | "pickup"
  | "blip" | "toast" | "dialogue" | "click" | "fridge" | "window" | "flush" | "splash" | "sip" | "laptop"
  | "creak" | "alert" | "kill" | "combo" | "steam" | "explode" | "death" | "whoosh";

export type Surface = "wood" | "tile" | "neon";

/** Minimum gap between two plays of the same SFX, so cascades (five shadows spotting you at once) don't stack. */
const SFX_GAP = 0.05;

const BASS_SEQ = [55.0, 55.0, 65.41, 65.41, 73.42, 73.42, 87.31, 98.0];
const LEAD_SEQ = [220.0, 0, 261.63, 293.66, 0, 349.23, 329.63, 0, 220.0, 220.0, 0, 392.0, 349.23, 293.66, 261.63, 0];

interface DroneNodes {
  oscs: OscillatorNode[];
  gain: GainNode;
}

export class GameAudio {
  /** 0..1, stretches tempo and bends pitch. */
  highness = 0;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** The synthwave loop goes through here so it can get louder (Act 3) without touching SFX. */
  private musicBus: GainNode | null = null;
  private musicVolume = 1;
  private noise: AudioBuffer | null = null;

  private bpm = 130;
  private musicWanted = false;
  private step = 0;
  private nextNoteTime = 0;
  private timerId: number | null = null;

  private drone: DroneNodes | null = null;
  private screechTimer: number | null = null;
  private dizzy: DroneNodes | null = null;
  private hum: DroneNodes | null = null;
  private pee: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private muted = false;
  private lastSfx = new Map<string, number>();
  private stepFlip = false;

  /** Must be called from a user gesture (start button). */
  init() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.musicVolume;
    this.musicBus.connect(this.master);
    const size = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.musicBus && this.ctx) this.musicBus.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.3);
  }

  setTempo(bpm: number) {
    this.bpm = bpm;
  }

  /** Stops every sound but keeps the context (used when restarting an act). */
  silence() {
    this.stopMusic();
    this.stopDrone();
    this.stopDizzy();
    this.stopHum();
    this.stopPee();
    this.bpm = 130;
    this.setMusicVolume(1);
  }

  dispose() {
    this.silence();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }

  // ─── Music loop ─────────────────────────────────────────

  startMusic() {
    this.musicWanted = true;
    if (!this.ctx || this.timerId !== null || this.drone) return;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.schedule();
  }

  stopMusic() {
    this.musicWanted = false;
    this.pauseLoop();
  }

  private pauseLoop() {
    if (this.timerId !== null) window.clearTimeout(this.timerId);
    this.timerId = null;
  }

  private schedule = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextNoteTime < ctx.currentTime + 0.1) {
      this.playStep(this.step, this.nextNoteTime);
      const stepDuration = 60 / this.bpm / 2;
      this.nextNoteTime += stepDuration * (1 + this.highness * 0.35);
      this.step = (this.step + 1) % 16;
    }
    this.timerId = window.setTimeout(this.schedule, 25);
  };

  private playStep(step: number, t: number) {
    if (step % 4 === 0) this.kick(t);
    if (step % 8 === 4) this.snare(t);
    if (step % 2 === 1) this.hihat(t);
    this.bass(BASS_SEQ[step % BASS_SEQ.length], t);
    const lead = LEAD_SEQ[step];
    if (lead > 0 && Math.random() > 0.3) this.lead(lead * (1 + (Math.random() - 0.5) * 0.04 * this.highness), t);
  }

  private osc(type: OscillatorType, freq: number, t: number) {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    return o;
  }

  private env(t: number, peak: number, decay: number, dest: AudioNode = this.master!) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    g.connect(dest);
    return g;
  }

  private noiseSrc(t: number, dur: number) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.start(t);
    src.stop(t + dur);
    return src;
  }

  private kick(t: number) {
    const o = this.osc("sine", 150, t);
    o.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
    o.connect(this.env(t, 0.6, 0.3, this.musicBus!));
    o.start(t);
    o.stop(t + 0.3);
  }

  private snare(t: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1000;
    this.noiseSrc(t, 0.3).connect(f);
    f.connect(this.env(t, 0.3, 0.25, this.musicBus!));
    const snap = this.osc("triangle", 180, t);
    snap.connect(this.env(t, 0.4, 0.1, this.musicBus!));
    snap.start(t);
    snap.stop(t + 0.3);
  }

  private hihat(t: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7000;
    this.noiseSrc(t, 0.06).connect(f);
    f.connect(this.env(t, 0.12, 0.05, this.musicBus!));
  }

  private bass(freq: number, t: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(400 + (1 - this.highness) * 800, t);
    f.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    f.connect(this.env(t, 0.28, 0.25, this.musicBus!));
    for (const detune of [0, -1.5]) {
      const o = this.osc("sawtooth", freq + detune, t);
      if (this.highness > 0 && detune === 0) {
        const w = 4 * this.highness;
        o.frequency.linearRampToValueAtTime(freq + w, t + 0.1);
        o.frequency.linearRampToValueAtTime(freq - w, t + 0.2);
      }
      o.connect(f);
      o.start(t);
      o.stop(t + 0.25);
    }
  }

  private lead(freq: number, t: number) {
    const ctx = this.ctx!;
    const o = this.osc("triangle", freq, t);
    if (this.highness > 0.2) o.frequency.exponentialRampToValueAtTime(freq * (1 + this.highness * 0.5), t + 0.2);
    const g = this.env(t, 0.12, 0.3, this.musicBus!);
    const delay = ctx.createDelay();
    const fb = ctx.createGain();
    delay.delayTime.value = 0.18;
    fb.gain.setValueAtTime(0.35, t);
    fb.gain.setValueAtTime(0, t + 1.2); // let the echo die so nodes can be collected
    g.connect(delay);
    delay.connect(fb);
    fb.connect(this.musicBus!);
    fb.connect(delay);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.4);
  }

  // ─── Drones ─────────────────────────────────────────────

  private makeDrone(freqs: [number, OscillatorType][], lfoRate: number, lfoDepth: number, cutoff: number, level: number, fadeIn: number): DroneNodes {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    filter.connect(gain);
    gain.connect(this.master!);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(level, ctx.currentTime + fadeIn);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = lfoRate;
    lfoGain.gain.value = lfoDepth;
    lfo.connect(lfoGain);
    const oscs = freqs.map(([f, type]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      lfoGain.connect(o.frequency);
      o.connect(filter);
      o.start();
      return o;
    });
    lfo.start();
    oscs.push(lfo);
    return { oscs, gain };
  }

  private fadeOut(nodes: DroneNodes | null, time: number) {
    if (!nodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    nodes.gain.gain.cancelScheduledValues(t);
    nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, t);
    nodes.gain.gain.linearRampToValueAtTime(0, t + time);
    for (const o of nodes.oscs) o.stop(t + time + 0.05);
  }

  startDrone() {
    if (!this.ctx || this.drone) return;
    this.pauseLoop();
    this.drone = this.makeDrone([[45, "sawtooth"], [67.5, "triangle"]], 0.2, 4, 180, 0.45, 3);
    this.screechTimer = window.setInterval(() => {
      if (Math.random() > 0.4) this.screech();
    }, 4000);
  }

  stopDrone() {
    if (this.screechTimer !== null) window.clearInterval(this.screechTimer);
    this.screechTimer = null;
    this.fadeOut(this.drone, 1);
    this.drone = null;
    if (this.musicWanted) this.startMusic();
  }

  /** Fluorescent-light buzz with a slow flicker (Act 4, and quietly at home in Act 5). */
  startHum(level = 0.06) {
    if (!this.ctx || this.hum) return;
    this.hum = this.makeDrone([[120, "sawtooth"], [240, "square"]], 0.7, 3, 900, level, 2);
  }

  stopHum() {
    this.fadeOut(this.hum, 0.6);
    this.hum = null;
  }

  startDizzy() {
    if (!this.ctx || this.dizzy) return;
    this.dizzy = this.makeDrone([[80, "sine"]], 0.5, 10, 2000, 0.18, 1);
  }

  stopDizzy() {
    this.fadeOut(this.dizzy, 0.5);
    this.dizzy = null;
  }

  private screech() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = this.osc("sawtooth", 600 + Math.random() * 800, t);
    o.frequency.exponentialRampToValueAtTime(100 + Math.random() * 200, t + 1.5);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    o.connect(f);
    f.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + 1.6);
  }

  // ─── Pee loop ───────────────────────────────────────────

  startPee() {
    if (!this.ctx || this.pee) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 350;
    f.Q.value = 2;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.12;
    src.connect(f);
    f.connect(gain);
    gain.connect(this.master!);
    src.start();
    this.pee = { src, gain };
  }

  stopPee() {
    if (!this.pee || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.pee.gain.gain.setTargetAtTime(0, t, 0.04);
    this.pee.src.stop(t + 0.2);
    this.pee = null;
  }

  // ─── SFX ────────────────────────────────────────────────

  /** One footstep. Alternates feet with a slight pitch change; the floor sets the timbre. */
  footstep(surface: Surface) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    this.stepFlip = !this.stepFlip;
    const jitter = (this.stepFlip ? 1 : 0.88) * (0.95 + Math.random() * 0.1);
    const cfg = { wood: [380, 0.16, 0.07], tile: [1400, 0.09, 0.05], neon: [700, 0.1, 0.09] }[surface];
    this.burst("bandpass", cfg[0] * jitter, cfg[2], cfg[1], t, 1.2);
    const thump = this.osc("sine", (surface === "wood" ? 90 : 120) * jitter, t);
    thump.frequency.exponentialRampToValueAtTime(40, t + 0.06);
    thump.connect(this.env(t, surface === "neon" ? 0.05 : 0.12, 0.06));
    thump.start(t);
    thump.stop(t + 0.07);
  }

  /** Filtered noise burst, optionally sweeping the filter. */
  private burst(type: BiquadFilterType, freq: number, dur: number, vol: number, t: number, q = 1, freqEnd?: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    f.Q.value = q;
    this.noiseSrc(t, dur + 0.02).connect(f);
    f.connect(this.env(t, vol, dur));
  }

  /** Oscillator sweep from f0 to f1. */
  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, t: number) {
    const o = this.osc(type, f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    o.connect(this.env(t, vol, dur));
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  sfx(name: Sfx) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    if (t - (this.lastSfx.get(name) ?? -1) < SFX_GAP) return;
    this.lastSfx.set(name, t);
    switch (name) {
      case "blip":
        this.tone("square", 660, 880, 0.06, 0.06, t);
        break;
      case "click":
        this.tone("square", 1200, 900, 0.04, 0.06, t);
        break;
      case "toast":
        this.tone("sine", 900, 1300, 0.08, 0.05, t);
        break;
      case "dialogue":
        this.tone("triangle", 520, 520, 0.08, 0.1, t);
        this.tone("triangle", 780, 780, 0.12, 0.08, t + 0.08);
        break;
      case "laptop":
        for (let i = 0; i < 3; i++) this.tone("square", 1800, 1800, 0.02, 0.05, t + i * 0.07);
        this.tone("sine", 660, 990, 0.25, 0.08, t + 0.25);
        break;
      case "fridge":
        this.burst("lowpass", 300, 0.18, 0.4, t);
        this.tone("sine", 60, 60, 0.6, 0.08, t + 0.05);
        break;
      case "creak":
      case "window": {
        const o = this.osc("sawtooth", name === "window" ? 140 : 220, t);
        o.frequency.linearRampToValueAtTime(name === "window" ? 260 : 160, t + 0.4);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 900;
        f.Q.value = 6;
        o.connect(f);
        f.connect(this.env(t, 0.12, 0.45));
        o.start(t);
        o.stop(t + 0.46);
        if (name === "window") this.burst("highpass", 2000, 1.2, 0.06, t + 0.2);
        break;
      }
      case "flush":
        this.burst("bandpass", 1500, 1.4, 0.22, t, 0.8, 200);
        this.tone("sine", 300, 120, 1.2, 0.05, t);
        break;
      case "splash":
        for (let i = 0; i < 3; i++) this.burst("bandpass", 1800 - i * 300, 0.25, 0.18, t + i * 0.12, 1.5);
        break;
      case "sip":
        for (let i = 0; i < 3; i++) this.tone("sine", 260, 160, 0.09, 0.15, t + i * 0.22);
        break;
      case "alert":
        this.tone("square", 880, 880, 0.05, 0.08, t);
        this.tone("square", 1320, 1320, 0.08, 0.08, t + 0.06);
        break;
      case "kill":
        this.burst("lowpass", 900, 0.22, 0.45, t, 1, 120);
        this.tone("sawtooth", 180, 50, 0.2, 0.12, t);
        break;
      case "combo":
        this.tone("triangle", 660, 1320, 0.15, 0.1, t);
        break;
      case "steam":
        this.burst("highpass", 3000, 1.0, 0.18, t, 0.7);
        break;
      case "explode":
        this.burst("lowpass", 1200, 1.4, 0.9, t, 0.8, 60);
        this.tone("sine", 120, 30, 1.2, 0.4, t);
        break;
      case "death":
        this.tone("sawtooth", 330, 55, 1.4, 0.18, t);
        this.burst("lowpass", 500, 0.6, 0.4, t);
        break;
      case "whoosh":
        this.burst("bandpass", 300, 0.7, 0.2, t, 1.5, 3000);
        break;
      case "bong":
        for (let i = 0; i < 15; i++) {
          const bt = t + i * 0.08;
          const o = this.osc("sine", 200 + Math.random() * 150, bt);
          o.frequency.exponentialRampToValueAtTime(600 + Math.random() * 200, bt + 0.06);
          o.connect(this.env(bt, 0.18, 0.06));
          o.start(bt);
          o.stop(bt + 0.07);
        }
        break;
      case "knock":
        for (let i = 0; i < 3; i++) {
          const kt = t + i * 0.35;
          const o = this.osc("sine", 100, kt);
          o.frequency.exponentialRampToValueAtTime(10, kt + 0.12);
          o.connect(this.env(kt, 0.7, 0.12));
          o.start(kt);
          o.stop(kt + 0.15);
        }
        break;
      case "swing":
      case "dash": {
        const o = this.osc("triangle", name === "dash" ? 300 : 600, t);
        o.frequency.exponentialRampToValueAtTime(120, t + 0.15);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 1000;
        o.connect(f);
        f.connect(this.env(t, name === "dash" ? 0.2 : 0.35, 0.15));
        o.start(t);
        o.stop(t + 0.16);
        break;
      }
      case "hit":
      case "pickup": {
        const g = this.env(t, name === "pickup" ? 0.12 : 0.25, 0.25);
        for (const [type, f] of [["square", 880], ["sine", 1480]] as const) {
          const o = this.osc(type, name === "pickup" ? f * 1.5 : f, t);
          o.connect(g);
          o.start(t);
          o.stop(t + 0.26);
        }
        break;
      }
      case "hurt":
      case "boss_hit":
      case "door": {
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = name === "hurt" ? 400 : 150;
        this.noiseSrc(t, 0.45).connect(f);
        f.connect(this.env(t, name === "door" ? 0.5 : 0.8, 0.4));
        break;
      }
    }
  }
}
